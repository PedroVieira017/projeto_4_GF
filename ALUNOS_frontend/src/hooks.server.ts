process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import JWESession from '$lib/server/jwe_session';
import { PUBLIC_API_URL } from '$env/static/public';
import { error, redirect, type Handle, type HandleServerError } from '@sveltejs/kit';

type InfoUtili = {
	id_utilizador: string;
	nome: string;
	email: string;
	jwt_api?: string;
};

const dados_login = {
	id_utilizador: 'dev',
	pass: '12345',
	email: 'dev@ipvc.pt',
	nome: 'Pedro Rodrigues Vieira',
	uo: 'ESTG',
	num: '90000'
};

export const handleError: HandleServerError = ({ event, error: err }) => {
	// redirects
	// @ts-ignore (SvelteKit error types vary)
	if ((err as any)?.status == 307) {
		// @ts-ignore
		redirect(307, (err as any).location);
	}

	// @ts-ignore
	if ((err as any)?.status == 404) {
		return {
			message: 'A página que procura não existe!',
			code: '404'
		};
	}

	console.log((err as any)?.message, (err as any)?.stack, (err as any)?.status);
	console.log('==== ERRO =====');
	console.log(err);
	console.log('==== EVENTO =====');
	console.log(event);
	console.log('==== ======== =====');
	console.log('Data-hora: ' + new Date());
	console.log('==== FIM ERRO =====\n');

	return {
		message:
			'Ocorreu um erro. Poderão estar a ser feitas atualizações. Se o problema persistir, contacte os SI.',
		code: '500'
	};
};

/**
 * Rotas acessíveis sem login
 */
const rotas_publicas: string[] = [];

/**
 * Rotas não acessíveis com login
 */
const rotas_bloqueadas_com_login: string[] = ['/sem_login', '/login'];

async function loginNaAPI(): Promise<string> {
	try {
		const res = await fetch(PUBLIC_API_URL + 'auth/signIn', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id_utilizador: dados_login.id_utilizador,
				password: dados_login.pass
			})
		});

		const item = await res.json().catch(() => null);

		if (!item || typeof item.access_token !== 'string') {
			console.log(item);
			throw error(500, { message: 'Problema a obter a Token da API.' });
		}

		return item.access_token;
	} catch (e) {
		throw error(500, {
			message: 'Problema no acesso à API! Provavelmente estão a ser realizadas atualizações.'
		});
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	// Ignorar assets como /favicon.ico (route id null)
	if (event.route?.id === null) {
		return await resolve(event);
	}

	if (!event.url.pathname.startsWith('/ch/')) console.log(event.url.pathname);

	// helper: definir locals sempre com formato consistente
	const setInfoUtili = (jwt_api?: string) => {
		const info: InfoUtili = {
			id_utilizador: dados_login.id_utilizador,
			nome: dados_login.nome,
			email: dados_login.email
		};
		if (jwt_api) info.jwt_api = jwt_api;

		// @ts-ignore
		event.locals.info_utili = info;
	};

	const jwecookie = event.cookies.get('AuthorizationToken');

	if (jwecookie) {
		const parts = jwecookie.split(' ');
		const token = parts.length > 1 ? parts[1] : '';

		const jwt = await new JWESession().decrypJWE(token);

		if (jwt?.payload && !jwt?.errcode) {
			// login válido
			setInfoUtili();

			// @ts-ignore
			event.locals.on_p_key = jwt.payload?.on_user_key;

			if (!rotas_publicas.includes(event.url.pathname) && !event.url.pathname.startsWith('/ch/')) {
				// se não existir jwt_api, pedir
				if (!jwt.payload?.jwt_api) {
					console.log('[!] Requesting API KEY');
					jwt.payload.jwt_api = await loginNaAPI();

					// atualizar cookie
					event.cookies.set(
						'AuthorizationToken',
						'Bearer ' + (await new JWESession().createJWE(jwt.payload)),
						{ path: '/' }
					);
				}

				setInfoUtili(jwt.payload?.jwt_api);
			}
		} else {
			// cookie inválida -> gerar nova e fazer login API
			event.cookies.delete('AuthorizationToken', { path: '/' });

			const dados = {
				id_utilizador: dados_login.id_utilizador,
				email: dados_login.email,
				nome: dados_login.nome,
				num: dados_login.num,
				uo: dados_login.uo
			};

			const jwe = await new JWESession().createJWE(dados);
			const jwt2 = await new JWESession().decrypJWE(jwe);

			if (!jwt2?.payload) {
				throw error(500, { message: 'Sessão inválida (payload nulo).' });
			}

			jwt2.payload.jwt_api = await loginNaAPI();

			event.cookies.set(
				'AuthorizationToken',
				'Bearer ' + (await new JWESession().createJWE(jwt2.payload)),
				{ path: '/' }
			);

			setInfoUtili(jwt2.payload.jwt_api);
		}
	} else {
		// não tem JWE -> criar e login
		const dados = {
			id_utilizador: dados_login.id_utilizador,
			email: dados_login.email,
			nome: dados_login.nome,
			num: dados_login.num,
			uo: dados_login.uo
		};

		const jwe = await new JWESession().createJWE(dados);
		const jwt = await new JWESession().decrypJWE(jwe);

		if (!jwt?.payload) {
			throw error(500, { message: 'Sessão inválida (payload nulo).' });
		}

		jwt.payload.jwt_api = await loginNaAPI();

		event.cookies.set(
			'AuthorizationToken',
			'Bearer ' + (await new JWESession().createJWE(jwt.payload)),
			{ path: '/' }
		);

		setInfoUtili(jwt.payload.jwt_api);
	}

	// ✅ IMPORTANTE: permitir ler o header "content-type" nas loads (resolve o teu erro)
	return await resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-type'
	});
};

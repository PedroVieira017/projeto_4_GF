import { json } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

function getDisplayEmail(username, email) {
	const placeholder = username ? `${username}@ipvc.pt` : '';
	if (!email || email === placeholder) return '-';
	return email;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, fetch, params }) {
	const res = await fetch(`${base}admin/formacoes/${params.id}/participantes`, {
		headers: {
			// @ts-ignore
			Authorization: `Bearer ${locals?.info_utili?.jwt_api}`,
			'Content-Type': 'application/json'
		}
	});

	const data = await res.json().catch(() => []);
	const mapped = Array.isArray(data)
		? data.map((item) => ({
				id: item?.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR?.username ?? String(item?.user_id ?? ''),
				participacao_id: item?.id ?? null,
				nome: item?.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR?.nome ?? '',
				email: getDisplayEmail(
					item?.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR?.username ?? '',
					item?.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR?.email ?? ''
				),
				uo: item?.UTILIZADOR_PARTICIPACAO_user_idToUTILIZADOR?.uo ?? '',
				estado: item?.estado ?? '',
				certificado_disponivel: Boolean(item?.certificadoDisponivel),
				certificado_nome: item?.certificadoNome ?? ''
			}))
		: [];

	return json(mapped, { status: res.status });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, fetch, params, request }) {
	const body = await request.json().catch(() => ({}));

	const res = await fetch(`${base}admin/formacoes/${params.id}/participantes`, {
		method: 'POST',
		headers: {
			// @ts-ignore
			Authorization: `Bearer ${locals?.info_utili?.jwt_api}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const data = await res.json().catch(() => null);
	return json(data, { status: res.status });
}

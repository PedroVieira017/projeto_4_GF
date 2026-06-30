import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, params, fetch }) {
	const headers = {
		// @ts-ignore
		Authorization: `Bearer ${locals?.info_utili?.jwt_api}`,
		'Content-Type': 'application/json'
	};

	const acao = await fetch(`${base}admin/formacoes/${params.id}`, { headers })
		.then((r) => r.json())
		.catch(() => null);

	const tipos_formacao = await fetch(`${base}admin/tipos-formacao`, { headers })
		.then((r) => r.json())
		.catch(() => []);

	const logotipos_certificado = await fetch(`${base}admin/formacoes/certificados/logotipos`, { headers })
		.then((r) => r.json())
		.catch(() => []);

	return { acao, tipos_formacao, logotipos_certificado };
}

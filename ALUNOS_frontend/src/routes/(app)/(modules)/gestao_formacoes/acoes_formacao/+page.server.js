import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const headers = {
		// @ts-ignore
		Authorization: 'Bearer ' + locals?.info_utili?.jwt_api,
		'Content-Type': 'application/json'
	};

	const acoes = await fetch(PUBLIC_API_URL + 'admin/formacoes', { headers })
		.then((r) => r.json())
		.catch(() => []);

	const tipos_formacao = await fetch(PUBLIC_API_URL + 'admin/tipos-formacao', { headers })
		.then((r) => r.json())
		.catch(() => []);

	return { acoes, tipos_formacao };
}

import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const headers = {
		// @ts-ignore
		Authorization: 'Bearer ' + locals?.info_utili?.jwt_api,
		'Content-Type': 'application/json'
	};

	const participantes = await fetch(PUBLIC_API_URL + 'admin/participantes', { headers })
		.then((r) => r.json())
		.catch(() => []);

	return { participantes };
}

import { PUBLIC_API_URL } from '$env/static/public';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const headers = {
		// @ts-ignore
		Authorization: 'Bearer ' + locals?.info_utili?.jwt_api,
		'Content-Type': 'application/json'
	};

	const email = locals?.info_utili?.email;
	const username = locals?.info_utili?.id_utilizador;
	const query = email
		? `?email=${encodeURIComponent(email)}`
		: username
			? `?username=${encodeURIComponent(username)}`
			: '';

	const formacoes = await fetch(PUBLIC_API_URL + `admin/minhas-formacoes${query}`, { headers })
		.then((r) => r.json())
		.catch(() => []);

	return { formacoes };
}

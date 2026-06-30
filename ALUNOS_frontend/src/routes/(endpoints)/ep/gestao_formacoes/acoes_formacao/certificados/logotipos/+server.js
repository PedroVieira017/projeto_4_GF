import { json } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, fetch }) {
	const res = await fetch(`${base}admin/formacoes/certificados/logotipos`, {
		headers: {
			// @ts-ignore
			Authorization: `Bearer ${locals?.info_utili?.jwt_api}`,
			'Content-Type': 'application/json'
		}
	});

	const data = await res.json().catch(() => []);
	return json(data, { status: res.status });
}

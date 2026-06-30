import { json } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, fetch }) {
	const res = await fetch(`${base}admin/tipos-formacao`, {
		headers: {
			// @ts-ignore
			Authorization: `Bearer ${locals?.info_utili?.jwt_api}`,
			'Content-Type': 'application/json'
		}
	});

	const data = await res.json().catch(() => null);
	return json(data, { status: res.status });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ locals, fetch, request }) {
	const body = await request.json().catch(() => ({}));

	const res = await fetch(`${base}admin/tipos-formacao`, {
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

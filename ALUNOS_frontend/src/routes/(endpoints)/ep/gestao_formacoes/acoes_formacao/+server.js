import { json } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, fetch }) {
	const res = await fetch(`${base}admin/formacoes`, {
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
	const contentType = request.headers.get('content-type') ?? '';
	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		if (!formData.get('userEmail') && locals?.info_utili?.email) {
			formData.set('userEmail', locals?.info_utili?.email);
		}
		if (!formData.get('username') && locals?.info_utili?.id_utilizador) {
			formData.set('username', locals?.info_utili?.id_utilizador);
		}
		const res = await fetch(`${base}admin/formacoes`, {
			method: 'POST',
			headers: {
				// @ts-ignore
				Authorization: `Bearer ${locals?.info_utili?.jwt_api}`
			},
			body: formData
		});

		const data = await res.json().catch(() => null);
		return json(data, { status: res.status });
	}

	const body = await request.json().catch(() => ({}));
	const payload = {
		...body,
		userEmail: body.userEmail ?? locals?.info_utili?.email,
		username: body.username ?? locals?.info_utili?.id_utilizador
	};

	const res = await fetch(`${base}admin/formacoes`, {
		method: 'POST',
		headers: {
			// @ts-ignore
			Authorization: `Bearer ${locals?.info_utili?.jwt_api}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json().catch(() => null);
	return json(data, { status: res.status });
}

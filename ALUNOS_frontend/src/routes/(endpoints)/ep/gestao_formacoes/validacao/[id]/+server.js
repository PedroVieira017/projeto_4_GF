import { json } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ locals, fetch, params, request }) {
	const body = await request.json().catch(() => ({}));
	const validadoPor = locals?.info_utili?.id_utilizador;
	const payload =
		validadoPor && /^\d+$/.test(validadoPor)
			? { ...body, validado_por_user_id: validadoPor }
			: body;

	const res = await fetch(`${base}admin/validacoes/${params.id}`, {
		method: 'PATCH',
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

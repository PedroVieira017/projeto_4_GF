import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, fetch, params, url }) {
	const download = url.searchParams.get('download');
	const queryParams = new URLSearchParams();
	if (download) queryParams.set('download', download);
	if (locals?.info_utili?.email) queryParams.set('email', locals.info_utili.email);
	if (locals?.info_utili?.id_utilizador) queryParams.set('username', locals.info_utili.id_utilizador);
	const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
	const res = await fetch(`${base}admin/minhas-formacoes/certificado/${params.id}${query}`, {
		headers: {
			// @ts-ignore
			Authorization: `Bearer ${locals?.info_utili?.jwt_api}`
		}
	});

	return new Response(res.body, {
		status: res.status,
		headers: res.headers
	});
}

import { PUBLIC_API_URL } from '$env/static/public';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals, fetch, params, url }) {
	const download = url.searchParams.get('download');
	const query = download ? `?download=${encodeURIComponent(download)}` : '';
	const res = await fetch(
		`${base}admin/formacoes/${params.id}/participantes/${params.participacaoId}/certificado${query}`,
		{
			headers: {
				// @ts-ignore
				Authorization: `Bearer ${locals?.info_utili?.jwt_api}`
			}
		}
	);

	return new Response(res.body, {
		status: res.status,
		headers: res.headers
	});
}

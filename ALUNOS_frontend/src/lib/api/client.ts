import { PUBLIC_API_URL } from '$env/static/public';

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function apiFetch<T>(
	fetchFn: FetchLike,
	path: string,
	init: RequestInit = {}
): Promise<T> {
	const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;
	const url = `${base}${path.startsWith('/') ? path.slice(1) : path}`;

	const res = await fetchFn(url, {
		...init,
		headers: {
			...(init.headers ?? {}),
			'Content-Type': 'application/json'
		}
	});

	// ler body como texto 1x (serve para erro e para json)
	const text = await res.text();

	if (!res.ok) {
		throw new Error(`API ${res.status} ${res.statusText} - ${text}`);
	}

	// se vier vazio, devolve null
	if (!text) return null as T;

	try {
		return JSON.parse(text) as T;
	} catch {
		// se não for JSON, devolve texto (casos raros)
		return text as unknown as T;
	}
}

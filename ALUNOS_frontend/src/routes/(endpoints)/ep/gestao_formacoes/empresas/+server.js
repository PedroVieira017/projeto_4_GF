// @ts-nocheck
import { json } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

const base = PUBLIC_API_URL?.endsWith('/') ? PUBLIC_API_URL : `${PUBLIC_API_URL}/`;
const fallbackEmpresas = Array.from({ length: 15 }, (_, index) => ({
	id: index + 1,
	status: 'APPROVED',
	origin: 'JOBPORTAL',
	designation: `TESTE${index + 1}`,
	nif: String(990000000 + index)
}));

function toPositiveInt(value, fallback) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
	return Math.trunc(parsed);
}

function buildTargetUrl(rawUrl, page, pageSize, search) {
	const target = new URL(rawUrl);
	target.searchParams.set('page', String(page));
	target.searchParams.set('pageSize', String(pageSize));
	if (search) {
		target.searchParams.set('search', search);
		target.searchParams.set('q', search);
	} else {
		target.searchParams.delete('search');
		target.searchParams.delete('q');
	}
	return target.toString();
}

function normalizePayload(payload, page, pageSize) {
	const rawData = Array.isArray(payload)
		? payload
		: Array.isArray(payload?.data)
			? payload.data
			: Array.isArray(payload?.items)
				? payload.items
				: [];

	const data = rawData
		.map((item) => ({
			id: item?.id ?? item?.codigo ?? item?.entityId ?? item?.nif ?? null,
			status: item?.status ?? null,
			origin: item?.origin ?? item?.origem ?? null,
			designation: item?.designation ?? item?.designacao ?? item?.nome ?? '',
			nif: item?.nif ?? null
		}))
		.filter((item) => item.designation);

	const link = payload?.link && typeof payload.link === 'object'
		? payload.link
		: {
			total: data.length,
			page,
			pageSize,
			totalPages: 1
		};

	return {
		status: payload?.status ?? 'success',
		link,
		data,
		errors: Array.isArray(payload?.errors) ? payload.errors : []
	};
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals, fetch }) {
	const page = toPositiveInt(url.searchParams.get('page'), 1);
	const pageSize = toPositiveInt(url.searchParams.get('pageSize'), 200);
	const search = (url.searchParams.get('search') ?? '').trim();

	const configuredWs = (env.PRIVATE_EMPRESAS_WS_URL ?? '').trim();
	const wsCandidates = [];

	if (configuredWs) wsCandidates.push(configuredWs);
	wsCandidates.push(`${base}admin/entidades`);
	wsCandidates.push(`${base}admin/empresas`);

	const headers = {
		'Content-Type': 'application/json'
	};
	// @ts-ignore
	if (locals?.info_utili?.jwt_api) {
		// @ts-ignore
		headers.Authorization = `Bearer ${locals.info_utili.jwt_api}`;
	}

	let lastError = 'Não foi possível obter a lista de empresas.';

	for (const wsUrl of wsCandidates) {
		const targetUrl = buildTargetUrl(wsUrl, page, pageSize, search);
		try {
			const res = await fetch(targetUrl, { headers });
			const text = await res.text();
			const payload = text ? JSON.parse(text) : {};

			if (!res.ok) {
				lastError = payload?.message || payload?.error || `Erro ${res.status}`;
				continue;
			}

			return json(normalizePayload(payload, page, pageSize), { status: 200 });
		} catch (error) {
			lastError = error instanceof Error ? error.message : String(error);
		}
	}

	// Fallback temporário para evitar bloqueio local quando o WS real ainda não está configurado.
	// Substituir por PRIVATE_EMPRESAS_WS_URL assim que o endpoint oficial for disponibilizado.
	if (!configuredWs) {
		const filtered = search
			? fallbackEmpresas.filter((empresa) =>
				String(empresa.designation ?? '').toLowerCase().includes(search.toLowerCase())
			)
			: fallbackEmpresas;
		const total = filtered.length;
		const start = (page - 1) * pageSize;
		const data = filtered.slice(start, start + pageSize);
		return json(
			{
				status: 'success',
				link: {
					total,
					page,
					pageSize,
					totalPages: total > 0 ? Math.ceil(total / pageSize) : 1
				},
				data,
				errors: []
			},
			{ status: 200 }
		);
	}

	return json(
		{
			status: 'error',
			link: {
				total: 0,
				page,
				pageSize,
				totalPages: 0
			},
			data: [],
			errors: [lastError]
		},
		{ status: 502 }
	);
}

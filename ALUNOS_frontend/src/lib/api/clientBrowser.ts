import { apiFetch } from '$lib/api/client';

export function apiFetchBrowser<T>(path: string, init?: RequestInit) {
  return apiFetch<T>(fetch, path, init);
}

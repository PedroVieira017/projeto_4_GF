import { setupTranslations } from './translations';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	setupTranslations();
	return {};
}

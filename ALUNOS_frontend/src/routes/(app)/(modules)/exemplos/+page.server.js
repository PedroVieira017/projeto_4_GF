import { setupTranslations } from "./translations";

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies}) {
    setupTranslations();

    return {}
}
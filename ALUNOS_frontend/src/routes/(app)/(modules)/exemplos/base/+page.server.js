import { setupTranslations } from "./translations";

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies}) {
    setupTranslations();

    return {
        texto: "Exemplo de dados passados pelo data prop"
    }
}
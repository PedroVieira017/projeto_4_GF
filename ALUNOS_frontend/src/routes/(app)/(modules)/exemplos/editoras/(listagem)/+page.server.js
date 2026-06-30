import { PUBLIC_API_URL } from "$env/static/public";
import { setupTranslations } from "./translations";

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies, params, locals, depends}) {
    setupTranslations();
	depends("exemplos:editoras")

	const editoras = await fetch(PUBLIC_API_URL + `exemplos/editoras`, {
		headers: {
			// @ts-ignore
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
			'Content-Type': 'application/json',

		}
	}).then(d => d.json())

    return {
        editoras: editoras
    }
}
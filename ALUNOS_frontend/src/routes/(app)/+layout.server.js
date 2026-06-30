import { PUBLIC_API_URL, PUBLIC_CAMINHO_SVELTEKIT, PUBLIC_ON_MAIN_URL_BASE } from '$env/static/public';
import { encryptUrlOnV2 } from '$lib/server/sv_uteis';
import { awaitJsImports } from '$lib/stores/awaitJsImports';
import { locale } from '$lib/translations/translations';

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ depends, locals, cookies }) => {
    //
    // AREAS
    //
    /*const aside = await fetch(PUBLIC_API_URL + "dashnotifications", {
        method: "POST",
        headers: {
            // @ts-ignore
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // @ts-ignore
            id_utilizador: locals?.info_utili.id_utilizador,
            lang: locale.get()
        })
    }).then(d => d.json())*/
    /** * @type {[]} */
    const aside = [];

    return {
        aside: aside,
    }

}
import { PUBLIC_API_URL, PUBLIC_ON_MAIN_URL_BASE } from '$env/static/public';
import { encryptUrlOnV2 } from '$lib/server/sv_uteis';
import { locale } from '$lib/translations/translations';
import { fail } from '@sveltejs/kit';
import { setupTranslations } from "./translations";

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ depends, locals, cookies }) => {
    setupTranslations();
    //
    // MODULOS
    //
    return {

    }

}
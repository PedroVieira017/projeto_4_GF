import JWESession from '$lib/server/jwe_session';
import { makeid } from '$lib/server/sv_uteis';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
    login: async ({ cookies, request, url }) => {
        redirect(307, "/login");
    }
};
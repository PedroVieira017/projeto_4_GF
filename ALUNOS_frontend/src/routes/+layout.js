import { addTranslations, setLocale, setRoute } from '$lib/translations/translations';

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ data }) => {
    // @ts-ignore
    const { i18n, translations } = data;
    const { locale, route } = i18n;

    addTranslations(translations);

    await setRoute(route);
    await setLocale(locale);

    return {
        i18n,
        urls_internas: data?.urls_internas,
        info_utilizador: data?.info_utilizador
    };
}
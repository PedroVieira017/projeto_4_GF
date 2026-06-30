import { ON_PUBLICKEY_URL_ENCRYPT } from '$env/static/private';
import { encryptUrl } from '$lib/server/sv_uteis';
import { locales, loadTranslations, translations, defaultLocale } from '$lib/translations/translations';

/** @type {import('@sveltejs/kit').ServerLoad} */
export const load = async ({ url, cookies, request, locals }) => {
  // URLs internas
  const urls_internas = {
    CSS_gridIcon: encryptUrl("./static/internal/css/grid_icons.css", ON_PUBLICKEY_URL_ENCRYPT),
    CSS_global: encryptUrl("./static/internal/css/global.css", ON_PUBLICKEY_URL_ENCRYPT),
    CSS_forms: encryptUrl("./static/internal/css/forms.css", ON_PUBLICKEY_URL_ENCRYPT),
    CSS_module: encryptUrl("./static/internal/css/module.css", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_apple: encryptUrl("./static/internal/images/favicon/apple-touch-icon.png", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_32: encryptUrl("./static/internal/images/favicon/favicon-32x32.png", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_16: encryptUrl("./static/internal/images/favicon/favicon-16x16.png", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_MANIFEST: encryptUrl("./static/internal/images/favicon/site.webmanifest", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_MASKICON: encryptUrl("./static/internal/images/favicon/safari-pinned-tab.svg", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_ICON: encryptUrl("./static/internal/images/favicon/favicon.ico", ON_PUBLICKEY_URL_ENCRYPT),
    FAVICON_BROWSERCONFIG: encryptUrl("./static/internal/images/favicon/browserconfig.xml", ON_PUBLICKEY_URL_ENCRYPT)
  }

  // i18n
  const { pathname } = url;
  let locale = (cookies.get('onipvc_lang') || "").toLowerCase() || defaultLocale || 'pt';
  if (!locale) {
    locale = `${`${request.headers.get('accept-language')}`.match(/[a-zA-Z]+?(?=-|_|,|;)/)}`.toLowerCase();
  }
  const supportedLocales = locales.get().map((l) => l.toLowerCase());
  if (!supportedLocales.includes(locale)) {
    locale = defaultLocale;
  }
  await loadTranslations(locale, pathname);

  return {
    i18n: { locale, route: pathname },
    translations: translations.get(),
    urls_internas: urls_internas,
    info_utilizador: locals.info_utili
  };
};
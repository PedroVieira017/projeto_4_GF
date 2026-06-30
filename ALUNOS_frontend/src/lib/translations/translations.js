import i18n from 'sveltekit-i18n';
import { dev } from '$app/environment';
import lang from './langs.json';

export const defaultLocale = 'pt';
const fallbackLocale = defaultLocale;

// neste ficheiro, indicar no array traduções de componentes fixos (nav, sidebar, etc...)
// traduções específicas de cada página são definidas na rota da mesma, e carregadas no +page.js load()
let arr_locales = [
  {
      locale: 'pt',
      key: 'default',
      loader: async () => (await import('./pt/default.json')).default,
  }, {
      locale: 'en',
      key: 'default',
      loader: async () => (await import('./en/default.json')).default,
  }, {
    locale: 'pt',
    key: 'aside',
    loader: async () => (await import('./pt/aside.json')).default,
  }, {
      locale: 'en',
      key: 'aside',
      loader: async () => (await import('./en/aside.json')).default,
  }, {
      locale: 'pt',
      key: 'nav',
      loader: async () => (await import('./pt/navbar.json')).default,
  }, {
      locale: 'en',
      key: 'nav',
      loader: async () => (await import('./en/navbar.json')).default,
  }, {
    locale: 'pt',
    key: 'sidebar_dyn',
    loader: async () => (await import('./pt/sidebar.json')).default,
  }, {
      locale: 'en',
      key: 'sidebar_dyn',
      loader: async () => (await import('./en/sidebar.json')).default,
  }, {
    locale: 'pt',
    key: 'sidebar',
    loader: async () => (await import('./pt/sidebar.json')).default,
  }, {
      locale: 'en',
      key: 'sidebar',
      loader: async () => (await import('./en/sidebar.json')).default,
  },
  {
    locale: 'pt',
    key: 'modal',
    loader: async () => (await import('./pt/modal.json')).default,
  }, {
    locale: 'en',
    key: 'modal',
    loader: async () => (await import('./en/modal.json')).default,
  }, {
        locale: 'pt',
        key: 'select',
        loader: async () => (await import('./pt/select.json')).default,
  }, {
    locale: 'en',
    key: 'select',
    loader: async () => (await import('./en/select.json')).default,
  }
];

/** @type {import('sveltekit-i18n').Config} */
export const config = {
  preprocess: "preserveArrays",
  log: {
    level: dev ? 'warn' : 'error',
  },
  translations: {
    en: { lang },
    pt: { lang },
  },
  loaders: arr_locales,
  fallbackLocale: fallbackLocale,
  fallbackValue: "Loading translation..."
};

/**
 * Função para adicionar locale e respetivas traduções dinâmicamente.
 * (deixada de usar em favorecimento da função da biblioteca "addTranslations" que recebe objeto "locale{key{chave-traducao}}")
 * ((motivo: inconsistente - timming de carregamento))
 * @param {{ locale: string; key: string; routes: string[]; loader: () => Promise<{ title: string; text: string; }>; } | { locale: string; key: string; loader: () => Promise<{ dropdown: { titulo: string; passwchange: string; pinchange: string; terminarsessao: string; }; }>; routes?: undefined; }} locale
 */
export function addLocale(locale){
  let igual_encontrado = arr_locales.find(function(el){
    return el.key == locale.key && el.locale == locale.locale
  });
  if(!igual_encontrado)
    // @ts-ignore
    arr_locales.push(locale)
}

export const { t, loading, locales, locale, translations, loadTranslations, addTranslations, setLocale, setRoute } = new i18n(config);


loading.subscribe(($loading) => $loading);

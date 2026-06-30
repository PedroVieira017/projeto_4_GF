import { setupTranslations } from './translations';

/** @type {import('./$types').PageLoad} */
export function load({ params, fetch, data }) {
    setupTranslations();

    // devolução de dados, acessível no +page.js na variável 'data' (data prop)
    return {
        produto: {
            data: fetch("https://dummyjson.com/product/" + params.id, {}).then(d => d.json())
        }
    };
}
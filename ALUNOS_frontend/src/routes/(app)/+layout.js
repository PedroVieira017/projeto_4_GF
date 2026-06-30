/** @type {import('./$types').LayoutLoad} */
export async function load({fetch, depends, parent, data}) {
    // carregar informação dinâmica para o layout aqui (opções sidebar, aside, ...)
    const data_p = await parent()

    return {
        titulo_pagina: "",
        // @ts-ignore
        sidebar_modulos: data.sidebar_modulos,
        sidebar_areas: data.sidebar_areas,
        aside: data.aside
    };
}
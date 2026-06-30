import { PUBLIC_API_URL } from "$env/static/public";
import { fail } from "@sveltejs/kit";
import { setupTranslations } from "./translations";
import { validaContribuinte } from "$lib/uteis";
import {extname} from 'path'

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies, params, locals, depends}) {
    setupTranslations();

    return {}
}


/** @type {import('./$types').Actions} */
export const actions = {
	submissao: async ({cookies, request, locals}) => {
        const body = await request.formData();
		return await submicao_dados_final(cookies, request, body, locals)
	}
};

/**
 * @param {import("@sveltejs/kit").Cookies} cookies
 * @param {Request} request
 * @param {App.Locals} locals
 * @param {FormData} body
 */
async function submicao_dados_final(cookies, request, body, locals){
    const data = body;
    const designacao = data.get('designacao');
    const nif = data.get('nif');
    const logotipo = data.get('logotipo');

    /** @type {any} */
    let erros = {}
    
    if(!designacao) erros["erro_designacao"] = "Preenchimento Obrigatório.";
    if(!nif) erros["erro_nif"] = "Preenchimento Obrigatório.";
    if(!logotipo) erros["erro_ficheiro"] = "Preenchimento Obrigatório.";

    if(Object.keys(erros).length){
        return fail(400, erros)
    }

    // @ts-ignore
    if(logotipo.size > 1 * 1024 * 1024){
        erros["erro_ficheiro"] = "Ficheiro demasiado grande. Max 1MB.";
    }
    // @ts-ignore
    if(![".jpg"].includes(extname(logotipo?.name).toLowerCase())){
        erros["erro_ficheiro"] = "Ficheiro não suportado. Apenas .jpg";
    }

    // @ts-ignore
    if(!validaContribuinte(nif)) erros["erro_nif"] = "NIF inválido!";

    if(Object.keys(erros).length){
        return fail(400, erros)
    }

    
    let formData = new FormData()
    // @ts-ignore
    formData.append("logo", logotipo);
    // @ts-ignore
    formData.append("designacao", designacao);
    // @ts-ignore
    formData.append("nif", nif);


    const doc = await fetch(PUBLIC_API_URL + `exemplos/editoras`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
            //'Content-Type': 'application/json'
        },
        body: formData
    }).then(d => d.json()).catch(() => {
        return fail(400, {err_default: "Erro a editar a editora."})
    })

    if(doc.hasOwnProperty("error") || (doc.hasOwnProperty("statusCode") && doc.statusCode != 200)){
        return fail(400, {err_default: "Erro a editar a editora."})
    }

    return {
        success: true
    }
}
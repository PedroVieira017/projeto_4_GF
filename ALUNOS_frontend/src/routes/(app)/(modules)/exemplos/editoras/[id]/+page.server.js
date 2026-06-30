import { PUBLIC_API_URL } from "$env/static/public";
import { fail } from "@sveltejs/kit";
import { setupTranslations } from "./translations";
import { validaContribuinte } from "$lib/uteis";

/** @type {import('./$types').PageServerLoad} */
export async function load({cookies, params, locals, depends}) {
    setupTranslations();

    let id_editora = params.id
    const editora = await fetch(PUBLIC_API_URL + `exemplos/editoras/${id_editora}`, {
        headers: {
            // @ts-ignore
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
            'Content-Type': 'application/json'
        }
    }).then(d => d.json())

    return {
        editora: editora
    }
}


/** @type {import('./$types').Actions} */
export const actions = {
	submissao: async ({cookies, request, locals, params}) => {
        const body = await request.formData();
		return await submicao_dados_final(cookies, request, body, locals, params)
	}
};

/**
 * @param {import("@sveltejs/kit").Cookies} cookies
 * @param {Request} request
 * @param {App.Locals} locals
 * @param {FormData} body
 * @param {import("./$types").RouteParams} params
 */
async function submicao_dados_final(cookies, request, body, locals, params){
    const data = body;
    const designacao = data.get('designacao');
    const nif = data.get('nif');

    /** @type {any} */
    let erros = {}
    
    if(!designacao) erros["erro_designacao"] = "Preenchimento Obrigatório.";
    if(!nif) erros["erro_nif"] = "Preenchimento Obrigatório.";

    if(Object.keys(erros).length){
        return fail(400, erros)
    }

    // @ts-ignore
    if(!validaContribuinte(nif)) erros["erro_nif"] = "NIF inválido!";

    if(Object.keys(erros).length){
        return fail(400, erros)
    }

    // montar objeto e submeter API para criar   
    const dados_enviar = {
        nif: nif,
        designacao: designacao,
    };

    const doc = await fetch(PUBLIC_API_URL + `exemplos/editoras/${params.id}`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados_enviar)
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
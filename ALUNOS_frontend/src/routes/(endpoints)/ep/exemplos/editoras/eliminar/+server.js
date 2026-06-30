import { PUBLIC_API_URL } from "$env/static/public";
import { json } from "@sveltejs/kit";

export async function GET({url, cookies, fetch, locals}) {
    let id_editora = url.searchParams.get("id_editora");
    if(!id_editora){
        return json({error: 400, message: "Dados em falta.", ec: 1}, {status: 400});
    }


    const res = await fetch(PUBLIC_API_URL + `exemplos/editoras/${id_editora}`, {
        method: "DELETE",
        headers: {
            // @ts-ignore
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
            'Content-Type': 'application/json'
        }
    }).then(d => d.json()).catch(erro => {return {status: false, erro: erro}})

    if(res.hasOwnProperty("status") && !res.status){
        return json({error: 400, message: "Erro a eliminar.", ec: 3}, {status: 400});
    }
    if(res.hasOwnProperty("statusCode") && res.statusCode != 200){
        return json({error: 400, message: "Erro a eliminar.", ec: 3}, {status: 400});
    }

    return json(res);
}
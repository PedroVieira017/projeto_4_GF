import { PUBLIC_API_URL } from "$env/static/public";
import { checkPermissaoRotas } from "$lib/server/sv_uteis";
import { json } from "@sveltejs/kit";

export async function OPTIONS() {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
    })
}

export async function GET({url, cookies, fetch, locals, request }) {
    // para aceder a esta rota, é necessária uma das seguintes permissões:
    let headers = request.headers;
    let KEY = "vP00UVajIN9DCighu7a6KY1HyGuGpFtIfnr1PRdPndXhfyKlroWOYwfyc5Fsdj1v";
    if(headers.get("api-key") != KEY){
        return json({error: 400, message: "API KEY inválida."}, {status: 400});
    }

    let cd_letivo = url.searchParams.get("cd_letivo");

    if(!cd_letivo){
        return json({error: 400, message: "Dados em falta."}, {status: 400});
    }

    const anos = await fetch(PUBLIC_API_URL + `docentes/docentesCdLetivo?cd_letivo=${cd_letivo}`, {
        headers: {
            // @ts-ignore
            "api-key": "vP00UVajIN9DCighu7a6KY1HyGuGpFtIfnr1PRdPndXhfyKlroWOYwfyc5Fsdj1v",
            'Content-Type': 'application/json'
        }
    }).then(d => d.json())

    console.log(anos)

    return new Response(JSON.stringify(anos), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Content-type": "application/json"
        }
     })

    //return json(anos);
}
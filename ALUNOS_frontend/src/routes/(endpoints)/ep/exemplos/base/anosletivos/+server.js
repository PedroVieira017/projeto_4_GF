import { PUBLIC_API_URL } from "$env/static/public";
import { checkPermissaoRotas } from "$lib/server/sv_uteis";
import { json } from "@sveltejs/kit";

export async function GET({url, cookies, fetch, locals}) {
    // para aceder a esta rota, é necessária uma das seguintes permissões:
    const permissoes_acesso_rota = ["/exemplos/base"];
    if(!checkPermissaoRotas(permissoes_acesso_rota, locals.info_utili.permissoes_rota)){
        return json({error: 401, message: "Não autorizado a aceder a este endpoint"}, {status: 401});
    }

    const anos = await fetch(PUBLIC_API_URL + "exemplos/outras/getAnosLetivos", {
        headers: {
            // @ts-ignore
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
            'Content-Type': 'application/json'
        }
    }).then(d => d.json())

    return json(anos);
}
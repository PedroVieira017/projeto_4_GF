import { PUBLIC_API_URL } from "$env/static/public";

export async function GET({url, params, cookies, fetch, locals}) {
    const id = params.id;

    
    const response = await fetch(PUBLIC_API_URL + `exemplos/editoras/logotipo/${id}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + (locals?.info_utili.jwt_api),
        }
    });
    
    return new Response(response.body, response);
}
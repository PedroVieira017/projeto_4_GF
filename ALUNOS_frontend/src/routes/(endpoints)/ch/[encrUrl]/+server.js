import { ON_PUBLICKEY_URL_ENCRYPT } from '$env/static/private';
import { readFileSync } from 'fs';
import { decryptUrl, encryptUrl } from '$lib/server/sv_uteis.js';

// @ts-ignore
export function GET({params}) {
    var originalText = decryptUrl(params.encrUrl, ON_PUBLICKEY_URL_ENCRYPT);

    const extension = originalText.split(".").pop()?.toLowerCase()
    let file_contents;
    let headers;
    switch(extension){
        case "css":
            file_contents = readFileSync(originalText, {encoding: 'utf-8'});
            headers = new Headers({
                "Content-Type": "text/css",
            });
            // encriptar urls embebidas nos ficheiros internos
            file_contents = file_contents.replace("./internal/images/bg_logos.png", encryptUrl("./static/internal/images/bg_logos.png", ON_PUBLICKEY_URL_ENCRYPT));
            break;
        case "png":
            file_contents = readFileSync(originalText);
            headers = new Headers({
                "Content-Type": "image/png",
            });
            break;
        case "js":
            file_contents = readFileSync(originalText);
            headers = new Headers({
                "Content-Type": "text/javascript",
            });
            break;

        default:
            file_contents = readFileSync(originalText, {encoding: 'utf-8'});
            headers = new Headers({
                "Content-Type": "text/plain",
            });
            break;
    }
    
    
	return new Response(file_contents, {headers: headers});
}

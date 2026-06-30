import { DO_PERMISSION_CHECKS } from "$env/static/private";
import CryptoJS from "crypto-js";
import { MAPEAMENTO_PERMISSOES } from "./userPermissionsMap";
/**
 * @param {number} length
 */
export function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

/**
 * @param {string} url
 * @param {any} key
 */
export function encryptUrl(url, key){
    let encrurl = CryptoJS.AES.encrypt(url, key).toString();
    encrurl = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrurl));
    return "/ch/" + encrurl;
}

/**
 * @param {string} url
 * @param {any} key
 */
export function decryptUrl(url, key){
    const encodedWord = CryptoJS.enc.Base64.parse(url);
    const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
    var bytes  = CryptoJS.AES.decrypt(decoded, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * @param {string} str
 * @param {any} key
 */
export function encryptStrAES(str, key){
    let encrypted = CryptoJS.AES.encrypt(str, key).toString();
    encrypted = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
    return encrypted;
}

/**
 * @param {string} url
 * @param {any} key
 */
export function encryptUrlOnV2(url, key){
    const enc_key = CryptoJS.SHA256(key);
    const enc_iv = CryptoJS.lib.WordArray.random(16)
    let url_encr = CryptoJS.AES.encrypt(url, enc_key, { 
        iv: enc_iv, 
        mode: CryptoJS.mode.CTR 
    }) + "::" + enc_iv.toString();
    
    url_encr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(url_encr + "|" + CryptoJS.HmacSHA256(url_encr, key).toString(CryptoJS.enc.Hex)))

    return url_encr;
}

/**
 * @param {string[]} ids_permissoes
 */
export function getRotasFromIds(ids_permissoes){
    /** * @type {string[]} */
    let rotas = [];
    ids_permissoes.forEach(function(id){
        // obter do mapeamento
        // @ts-ignore
        let rotas_mapeamento = MAPEAMENTO_PERMISSOES.hasOwnProperty(id) ? MAPEAMENTO_PERMISSOES[id] : [];
        //if(!rotas_mapeamento || !rotas_mapeamento.length) console.log("ID_SEM_ROTAS_ASSOCIADAS - getRotasFromIds() - sv_uteis.js - " + id)
        rotas.push(...rotas_mapeamento);
    })
    return rotas;
}

/**
 * @param {string} rota
 * @param {any[]} permissoes
 */
export function checkPermissaoRota(rota, permissoes){
    if(DO_PERMISSION_CHECKS == "0") return true;
    return permissoes.some(function(pr){
        if(!pr) return;
        pr = pr.replaceAll("/", "\\/")
        pr = pr.replaceAll("{", "\\")
        pr = pr.replaceAll("}", "")
        return new RegExp(pr + "$").test(rota);
    })
}
/**
 * @param {any[]} rotas
 * @param {any[]} permissoes
 */
export function checkPermissaoRotas(rotas, permissoes){
    if(DO_PERMISSION_CHECKS == "0") return true;
    return rotas.some(function(rota) {
        return permissoes.some(function(pr){
            if(!pr) return;
            pr = pr.replaceAll("/", "\\/")
            pr = pr.replaceAll("{", "\\")
            pr = pr.replaceAll("}", "")
            return new RegExp(pr + "$").test(rota);
        })
    })
}

/**
 * @param {number} num
 */
export function converteDecimalParaHHhMM(num){
    if(!num) return "-";
    var segundos = +num*3600;
    var horas = Math.floor(segundos/3600);
    segundos -= horas*3600;
    var minutos = Math.floor(segundos/60);
    return `${horas}h${("" + minutos).padStart(2, '0')}`;
}
// @ts-nocheck
import { addTranslations, locale } from '$lib/translations/translations';

/**
 * @param {any[]|false|null} modulos
 */
export function setupTranslations(modulos){
    // carregar dinamicamente traduções obitdas da BD
    let obj_trad = {
        "en": {
            "aside_dyn": {}
        },
        "pt": {
            "aside_dyn": {}
        }
    }

    if(Array.isArray(modulos)){
        modulos.forEach(function(md){
            // adiciona como chave e valor o texto a apresentar
            // - assim facilmente se referência a tradução a ser usada
            // - - como chave deve ser utilizada a tradução de uma das linguas apenas!
            
            /*obj_trad.en.aside_dyn[md.pt.replace(" ", "_")] = md.en;
            obj_trad.pt.aside_dyn[md.pt.replace(" ", "_")] = md.pt;
            md.opcs?.forEach(function(op){
                obj_trad.en.aside_dyn[op.pt.replace(" ", "_")] = op.en;
                obj_trad.pt.aside_dyn[op.pt.replace(" ", "_")] = op.pt;
            })*/

            obj_trad[locale.get()].aside_dyn["aside_area_" + md.designacao.replace(" ", "_")] = md.designacao;
            md.entradas?.forEach(function(op){
                obj_trad[locale.get()].aside_dyn["aside_opc" + op.opt.replace(" ", "_")] = op.opt;
            })
        })
        addTranslations(obj_trad)
    }
}
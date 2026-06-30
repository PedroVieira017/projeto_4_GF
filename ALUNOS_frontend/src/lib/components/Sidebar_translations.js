// @ts-nocheck
import { addTranslations, locale } from '$lib/translations/translations';

export function setupTranslations(modulos, areas){
    // carregar dinamicamente traduções obitdas da BD
    let obj_trad = {
        "en": {
            "sidebar_dyn": {}
        },
        "pt": {
            "sidebar_dyn": {}
        }
    }

    /*modulos.forEach(function(md){
        // @ts-ignore
        obj_trad.en.sidebar_dyn[md.pt.replace(" ", "_")] = md.en;
        // @ts-ignore
        obj_trad.pt.sidebar_dyn[md.pt.replace(" ", "_")] = md.pt;
    })*/
    if(Array.isArray(modulos))
        modulos.forEach(function(md){
            obj_trad[locale.get()].sidebar_dyn["mod_" + md.id_modulo] = md.descricao
        })
    
    if(Array.isArray(areas)){
        /*areas.forEach(function(md){
            // @ts-ignore
            obj_trad.en.sidebar_dyn[md.pt.replace(" ", "_")] = md.en;
            // @ts-ignore
            obj_trad.pt.sidebar_dyn[md.pt.replace(" ", "_")] = md.pt;
            md.subareas?.forEach(function(/** @type {{ pt: string; en: any; }} */ /* op){
                // @ts-ignore
                obj_trad.en.sidebar_dyn[op.pt.replace(" ", "_")] = op.en;
                // @ts-ignore
                obj_trad.pt.sidebar_dyn[op.pt.replace(" ", "_")] = op.pt;
            })
        })*/

        areas.forEach(function(ar){
            obj_trad[locale.get()].sidebar_dyn["area_" + ar.id_area] = ar.designacao || ar.modulo
            ar.objetos?.forEach(function(obj){
                obj_trad[locale.get()].sidebar_dyn["obj_" + obj.id_objeto] = obj.descricao || "-"
            });
        })
    }

    addTranslations(obj_trad)
}
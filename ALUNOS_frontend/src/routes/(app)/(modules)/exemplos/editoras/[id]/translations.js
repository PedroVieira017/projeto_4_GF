import { addTranslations } from '$lib/translations/translations';
import * as pt from './pt.json';
import * as en from './en.json';

export function setupTranslations(){
    // adicionar ficheiros de traduções associado a esta rota/página
    addTranslations({"pt": pt})
    addTranslations({"en": en})
}
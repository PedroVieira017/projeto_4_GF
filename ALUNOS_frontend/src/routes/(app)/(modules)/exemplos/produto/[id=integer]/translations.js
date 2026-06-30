import { addTranslations } from '$lib/translations/translations';
import * as en from './en.json';
import * as pt from './pt.json';

export function setupTranslations() {
    // adicionar ficheiros de traduções associado a esta rota/página
    addTranslations({"en": en.en})
    addTranslations({"pt": pt.pt})
}
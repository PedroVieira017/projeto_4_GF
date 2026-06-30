import { addTranslations } from '$lib/translations/translations';
import * as pt from './pt.json';
import * as en from './en.json';

export function setupTranslations() {
	addTranslations({ pt });
	addTranslations({ en });
}

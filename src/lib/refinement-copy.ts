import messages from '@/data/refinement-copy.json';
import type { Locale } from './i18n-locales';
export type RefinementKey = keyof typeof messages.tr;
export function refinement(locale:Locale,key:RefinementKey):string { return messages[locale][key]; }

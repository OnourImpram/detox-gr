import copy from '@/data/refinement-copy.json';
import type { Locale } from './i18n-locales';
export type RefinementKey = keyof typeof copy.tr;
export function r(locale: Locale, key: RefinementKey, vars: Record<string, string | number> = {}): string {
  return copy[locale][key].replace(/\{(\w+)\}/g, (match, name: string) => vars[name] === undefined ? match : String(vars[name]));
}

import { isLocale, type Locale } from "./i18n-locales";
import { changeLocaleSearch } from "./locale-navigation";
export type LangSearch = { lang?: Locale };
export function parseLang(search: Record<string, unknown>): LangSearch {
  return { lang: typeof search.lang === "string" && isLocale(search.lang) ? search.lang : undefined };
}
export function applyLang<T extends Record<string, unknown>>(previous: T, locale: Locale): T & { lang: Locale } {
  return changeLocaleSearch(previous, locale);
}
export function langParam(locale: Locale): LangSearch { return { lang: locale }; }

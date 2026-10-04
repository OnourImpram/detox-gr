import { isLocale, type Locale } from "./i18n-locales";

export type LangSearch = { lang?: Locale };

export function parseLang(s: Record<string, unknown>): LangSearch {
  return { lang: typeof s.lang === "string" && isLocale(s.lang) ? s.lang : undefined };
}

export function applyLang<T extends Record<string, unknown>>(prev: T, locale: Locale): T {
  const next = { ...prev } as T & { lang?: Locale };
  if (locale === "tr") delete next.lang;
  else next.lang = locale;
  return next;
}

export function langParam(locale: Locale): LangSearch {
  return locale === "tr" ? {} : { lang: locale };
}

export const LOCALES = [
  { code: "tr", native: "Türkçe", html: "tr" },
  { code: "el", native: "Ελληνικά", html: "el" },
  { code: "en", native: "English", html: "en" },
  { code: "de", native: "Deutsch", html: "de" },
  { code: "fr", native: "Français", html: "fr" },
  { code: "it", native: "Italiano", html: "it" },
  { code: "es", native: "Español", html: "es" },
  { code: "nl", native: "Nederlands", html: "nl" },
  { code: "pl", native: "Polski", html: "pl" },
  { code: "no", native: "Norsk", html: "nb" },
  { code: "bg", native: "Български", html: "bg" },
  { code: "ro", native: "Română", html: "ro" },
  { code: "sv", native: "Svenska", html: "sv" },
  { code: "da", native: "Dansk", html: "da" },
  { code: "fi", native: "Suomi", html: "fi" },
  { code: "pt", native: "Português", html: "pt" },
  { code: "hu", native: "Magyar", html: "hu" },
  { code: "cs", native: "Čeština", html: "cs" },
  { code: "hr", native: "Hrvatski", html: "hr" },
  { code: "sk", native: "Slovenčina", html: "sk" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

const SET = new Set<string>(LOCALES.map((l) => l.code));

export function isLocale(v: string): v is Locale {
  return SET.has(v);
}

export function localeMeta(code: Locale) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "tr";
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of list) {
    const base = raw.toLowerCase().split("-")[0];
    if (base === "nb" || base === "nn") return "no";
    if (isLocale(base)) return base;
  }
  return "tr";
}

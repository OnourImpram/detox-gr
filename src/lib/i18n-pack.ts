import { translateLabel } from "./label-translation";
import type { Locale } from "./i18n-locales";

/**
 * Dil paketi: o dilin üretilmiş UI metinleri + ürün adı sözlüğü (kaynak → çeviri, en uzun eşleşme önce).
 * Tek yığın yerine dil başına modül: kök rota loader'ı yalnız aktif dili yükler (scripts/i18n-paket-uret.mts üretir).
 * TR paket kullanmaz (kaynak dil); EN yalnız sözlük taşır (UI tabanı fill(tr,en)'den gelir).
 */
export type Pack = { ui: Record<string, string>; glossary: [string, string][] };

const PACKS: Partial<Record<Locale, Pack>> = {};

// Dinamik import tablosu — Vite her dili ayrı chunk yapar; tr için yükleyici yok.
const LOADERS: Partial<Record<Locale, () => Promise<{ default: Pack }>>> = {
  el: () => import("./i18n-gen/el"),
  en: () => import("./i18n-gen/en"),
  de: () => import("./i18n-gen/de"),
  fr: () => import("./i18n-gen/fr"),
  it: () => import("./i18n-gen/it"),
  es: () => import("./i18n-gen/es"),
  nl: () => import("./i18n-gen/nl"),
  pl: () => import("./i18n-gen/pl"),
  no: () => import("./i18n-gen/no"),
  bg: () => import("./i18n-gen/bg"),
  ro: () => import("./i18n-gen/ro"),
  sv: () => import("./i18n-gen/sv"),
  da: () => import("./i18n-gen/da"),
  fi: () => import("./i18n-gen/fi"),
  pt: () => import("./i18n-gen/pt"),
  hu: () => import("./i18n-gen/hu"),
  cs: () => import("./i18n-gen/cs"),
  hr: () => import("./i18n-gen/hr"),
  sk: () => import("./i18n-gen/sk"),
};

/** Sunucuda ve istemci gezinmesinde: paketi yükle ve kaydet. Kayıtlıysa anında döner. */
export async function loadPack(locale: Locale): Promise<Pack | null> {
  const loader = LOADERS[locale];
  if (!loader) return null;
  if (!PACKS[locale]) PACKS[locale] = (await loader()).default;
  return PACKS[locale]!;
}

/** İstemci hidrasyonunda: loader verisiyle gelen paketi çocuklar render edilmeden önce kaydet. */
export function registerPack(locale: Locale, pack: Pack | null) {
  if (pack && !PACKS[locale]) PACKS[locale] = pack;
}

export function pack(locale: Locale): Pack | undefined {
  return PACKS[locale];
}

/** Ürün adı/açıklama çevirisi: sözlük satırlarında en uzun eşleşme; eşleşmeyen karakter olduğu gibi geçer. */
export function translatePhrase(text: string, locale: Locale): string {
  if (locale === "tr") return text;
  const rows = PACKS[locale]?.glossary;
  if (!rows) return text;
  return translateLabel(text, rows);
}

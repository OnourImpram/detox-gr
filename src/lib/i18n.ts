import { contextProductName, displaySourceLabel } from "./product-name-context";
import { featuredName } from "./featured-names";
import type { CategoryId, Product } from "./catalog";
import { MESSAGES } from "./i18n-messages";
import { pack, translatePhrase } from "./i18n-pack";
import { UI } from "./i18n-ui";
import { LOCALES, detectLocale, isLocale, localeMeta, type Locale } from "./i18n-locales";
import type { CountryCode } from "./markets";

export { LOCALES, detectLocale, isLocale, localeMeta, type Locale };

export function t(locale: Locale, key: string, vars?: Record<string, string | number>) {
  const table = MESSAGES[key];
  // Öncelik: el yazımı overlay (UI) → dil paketi (Flash çevirisi, loader yükler) → fill(tr,en) tabanı
  let s = UI[key]?.[locale] ?? pack(locale)?.ui[key] ?? table?.[locale] ?? table?.en ?? table?.tr ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export function countryName(code: CountryCode, locale: Locale) {
  const tag = localeMeta(locale).html;
  try {
    return new Intl.DisplayNames([tag], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function languageLabel(code: Locale, inLocale: Locale) {
  const tag = localeMeta(inLocale).html;
  try {
    return new Intl.DisplayNames([tag], { type: "language" }).of(localeMeta(code).html) ?? code;
  } catch {
    return localeMeta(code).native;
  }
}

export function categoryTitle(id: CategoryId, locale: Locale) {
  return t(locale, `cat.${id}`);
}

export function categoryBlurb(id: CategoryId, locale: Locale) {
  return t(locale, `cat.${id}.blurb`);
}

export function productName(product: Product, locale: Locale) {
  const approved = product.info?.localized?.[locale]?.name;
  if (approved?.trim()) return approved;
  const contextName = contextProductName(product.sourceId, locale);
  if (contextName && !product.info?.nameTr && !product.info?.nameEn) return contextName;
  const sourceName = product.info?.nameTr || displaySourceLabel(product.sourceId, product.name);
  if (locale === "tr") return sourceName;
  if (locale === "en" && product.info?.nameEn?.trim()) return product.info.nameEn;
  return featuredName(product.sourceId, locale) ?? translatePhrase(sourceName, locale);
}

export function productBlurb(product: Product, locale: Locale) {
  if (locale === "tr") return product.blurb;
  const out = translatePhrase(product.blurb, locale);
  // Sözlük cümleyi (tam) çeviremediyse TR metin EN/EL sayfaya sızıyordu (red team RT-C-07): nötr genel açıklama
  return looksTurkish(out) ? t(locale, "product.blurbGeneric") : out;
}

/** Sözlük çevirisinden sonra metinde Türkçeye özgü harf kaldıysa çeviri yarımdır (ğ ş ı İ: 20 dilin başka hiçbirinde yok). */
export function looksTurkish(text: string) {
  return /[ğşıİ]/.test(text);
}

export function classLabel(klass: Product["klass"], locale: Locale) {
  return t(locale, `product.${klass === "food" ? "food" : klass === "cosmetic" ? "cosmetic" : "other"}`);
}

export function packLabel(kind: Product["kind"], locale: Locale) {
  return t(locale, `product.${kind === "glass" ? "glass" : kind === "liquid" ? "liquid" : "dry"}`);
}

const UNIT_KEY: Record<string, string> = {
  kg: "unit.kg",
  adet: "unit.adet",
  "şişe": "unit.sise",
  paket: "unit.paket",
  kavanoz: "unit.kavanoz",
  tüp: "unit.tup",
  "30 kapsül": "unit.kapsul",
};

export function unitLabel(unit: string, locale: Locale) {
  const key = UNIT_KEY[unit];
  return key ? t(locale, key) : unit;
}

export function etaText(country: CountryCode, locale: Locale) {
  if (country === "GR") return t(locale, "eta.gr");
  if (country === "NO") return t(locale, "eta.no");
  if (country === "CY" || country === "MT") return t(locale, "eta.island");
  return t(locale, "eta.eu");
}

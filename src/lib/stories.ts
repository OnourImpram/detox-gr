import { PRODUCTS, isHouseNamed, productBySlug } from "./catalog";
import type { Locale } from "./i18n-locales";
import { translatePhrase } from "./i18n-pack";

export type Bilingual = { tr: string; en: string };

export type ProductStory = {
  title: Bilingual;
  body: Bilingual;
  note?: Bilingual;
};

function s(tr: string, en: string): Bilingual {
  return { tr, en };
}

export function loc(locale: Locale, copy: Bilingual) {
  const base = locale === "tr" ? copy.tr : copy.en;
  if (locale === "tr") return base;
  return translatePhrase(base, locale);
}

export { isHouseNamed };

export const HOUSE_NAMED = new Set(PRODUCTS.filter((p) => p.houseNamed).map((p) => p.slug));

export function productStory(slug: string): ProductStory | null {
  const product = productBySlug(slug);
  if (!product?.storyBody) return null;
  return {
    title: s(product.storyTitle || product.name, product.storyTitle || product.name),
    body: s(product.storyBody, product.storyBody),
  };
}

import { productBySlug } from "./catalog";

/** Price-list names that look like treatment claims. Do not invent medical copy. */
const DISEASE_RE = /basur|sedef|egzema|sivilce|akne|pişik|pisik|sinüzit|sinuzit|tırnak mantarı|tirnak mantari|saç egzema|sac egzema/i;

export function isDiseaseNamed(slug: string) {
  const product = productBySlug(slug);
  return Boolean(product && DISEASE_RE.test(product.name));
}

export function isWatchNamed(slug: string) {
  if (isDiseaseNamed(slug)) return true;
  const product = productBySlug(slug);
  return Boolean(product && /narcissa|zeolit|zeolite|lotus|ahisultan/i.test(product.name));
}

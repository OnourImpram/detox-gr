import { type Currency } from "./markets";
import { localeMeta, type Locale } from "./i18n-locales";

export function formatMoney(
  eur: number | null | undefined,
  _currency: Currency = "EUR",
  locale: Locale | string = "tr",
) {
  if (eur == null) return "—";
  const html = localeMeta((locale as Locale) || "tr").html;
  return new Intl.NumberFormat(html, {
    style: "currency",
    currency: "EUR",
  }).format(eur);
}

export function formatListed(
  eur: number | null | undefined,
  unit: string,
  currency: Currency = "EUR",
  locale: Locale | string = "tr",
) {
  if (eur == null) return "—";
  const money = formatMoney(eur, currency, locale);
  if (unit === "kg") return `${money} / kg`;
  return `${money}`;
}

export function unitPrice(eur: number | null | undefined, grams: number | null, currency: Currency, locale: Locale | string = "tr") {
  if (eur == null || !grams) return null;
  const per100 = (eur / grams) * 100;
  return `${formatMoney(per100, currency, locale)} / 100 g`;
}

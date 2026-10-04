import { productBySlug, type Product } from "./catalog";
import { COUNTRIES, type CountryCode } from "./markets";
import { hasFood, shippingEur, type CartLine } from "./shipping";

export type QuoteItem = { slug: string; qty: number };

export type QuoteOk = {
  ok: true;
  lines: CartLine[];
  goodsEur: number;
  shipEur: number;
  totalEur: number;
  country: CountryCode;
};

export type QuoteErr = {
  ok: false;
  error: "empty" | "country" | "norway_food" | "no_price" | "unknown";
};

export function isCountry(code: string): code is CountryCode {
  return COUNTRIES.some((c) => c.code === code);
}

export function quoteCart(items: QuoteItem[], country: string): QuoteOk | QuoteErr {
  if (!isCountry(country)) return { ok: false, error: "country" };
  if (!items.length) return { ok: false, error: "empty" };

  const lines: CartLine[] = [];
  for (const item of items) {
    const qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) return { ok: false, error: "unknown" };
    const product = productBySlug(item.slug);
    if (!product) return { ok: false, error: "unknown" };
    if (product.priceEur == null) return { ok: false, error: "no_price" };
    const existing = lines.find((l) => l.product.slug === product.slug);
    if (existing) existing.qty = Math.min(20, existing.qty + qty);
    else lines.push({ product, qty });
  }
  if (!lines.length) return { ok: false, error: "empty" };
  if (country === "NO" && hasFood(lines)) return { ok: false, error: "norway_food" };

  const goodsEur = Math.round(lines.reduce((s, l) => s + (l.product.priceEur ?? 0) * l.qty, 0) * 100) / 100;
  const shipEur = shippingEur(country, lines);
  const totalEur = Math.round((goodsEur + shipEur) * 100) / 100;
  return { ok: true, lines, goodsEur, shipEur, totalEur, country };
}

export function stripeCountryCodes(): CountryCode[] {
  return COUNTRIES.map((c) => c.code);
}

export function productLabel(product: Product) {
  return product.name.slice(0, 120);
}

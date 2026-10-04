import { productBySlug, type Product } from "./catalog";
import { COUNTRIES, type CountryCode } from "./markets";
import { hasFood, shippingEur, type CartLine } from "./shipping";
import { MAX_CART_LINES, MAX_ITEM_QUANTITY, saleBlockers, validateQuantity } from "./commerce-policy";

export type QuoteItem = { slug: string; qty: number };
export type QuoteOk = { ok: true; lines: CartLine[]; goodsEur: number; shipEur: number; totalEur: number; country: CountryCode };
export type QuoteErr = { ok: false; error: "empty" | "country" | "norway_food" | "no_price" | "unknown" };
export function isCountry(code: string): code is CountryCode { return COUNTRIES.some((c) => c.code === code); }

export function quoteCart(items: QuoteItem[], country: string): QuoteOk | QuoteErr {
  if (!isCountry(country)) return { ok: false, error: "country" };
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "empty" };
  if (items.length > MAX_CART_LINES) return { ok: false, error: "unknown" };
  const lines: CartLine[] = [];
  for (const item of items) {
    if (!item || typeof item.slug !== "string" || !validateQuantity(item.qty)) return { ok: false, error: "unknown" };
    const product = productBySlug(item.slug);
    if (!product) return { ok: false, error: "unknown" };
    if (product.priceEur == null || !Number.isFinite(product.priceEur) || product.priceEur <= 0) return { ok: false, error: "no_price" };
    const existing = lines.find((line) => line.product.slug === product.slug);
    const quantity = item.qty + (existing?.qty ?? 0);
    if (quantity > MAX_ITEM_QUANTITY) return { ok: false, error: "unknown" };
    if (existing) existing.qty = quantity;
    else lines.push({ product, qty: quantity });
  }
  if (country === "NO" && hasFood(lines)) return { ok: false, error: "norway_food" };
  for (const line of lines) {
    if (saleBlockers(line.product, country, line.qty).length > 0) return { ok: false, error: "unknown" };
  }
  const goodsEur = lines.reduce((sum, line) => sum + Math.round((line.product.priceEur ?? 0) * 100) * line.qty, 0) / 100;
  // Preview estimate only. Shopify determines its own authoritative tax and delivery total.
  const shipEur = shippingEur(country, lines);
  return { ok: true, lines, goodsEur, shipEur, totalEur: Math.round((goodsEur + shipEur) * 100) / 100, country };
}
export function stripeCountryCodes(): CountryCode[] { return COUNTRIES.map((c) => c.code); }
export function productLabel(product: Product) { return product.name.slice(0, 120); }

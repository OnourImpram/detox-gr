import { lineAmountCents, normalizeListQuantity, validListQuantity } from "./list-quantity";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CountryCode } from "./markets";
import { countryByCode } from "./markets";
import { PRODUCTS, SKU_BY_ID, productBySlug, type Product } from "./catalog";
import { type CartLine } from "./shipping";
import { type Locale } from "./i18n-locales";
import { sanitizeCart, sanitizePersistedShop } from "./cart-storage";
import { MAX_CART_LINES, MAX_ITEM_QUANTITY } from "./commerce-policy";

export type CartEntry = { slug: string; qty: number };
export type AddResult = "ok" | "unknown" | "no_price" | "norway_food" | "quantity";
// Kept only for the legacy, non-transactional receipt route. Personal history is never persisted.
export type Order = { id: string; createdAt: string; country: CountryCode; name: string; email: string; address: string; city: string; postal: string; items: CartEntry[]; goodsEur: number; shipEur: number; totalEur: number };
type State = {
  country: CountryCode; locale: Locale; cart: CartEntry[]; note: string; orders: Order[]; ready: boolean;
  setNote: (value: string) => void; setReady: (value: boolean) => void;
  setCountry: (country: CountryCode) => void; setLocale: (locale: Locale) => void;
  add: (slug: string, qty?: number, allowUnpriced?: boolean) => AddResult; setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void; clear: () => void;
};
const WEIGHT_SLUGS = new Set(PRODUCTS.filter(product => product.unit === "kg").map(product => product.slug));
const KNOWN_SLUGS = new Set(PRODUCTS.map(product => product.slug));
export function linesFrom(cart: CartEntry[]): CartLine[] {
  return sanitizeCart(cart, KNOWN_SLUGS, WEIGHT_SLUGS).flatMap(line => {
    const product = productBySlug(line.slug);
    return product ? [{ product, qty: line.qty }] : [];
  });
}
export function goodsEur(cart: CartEntry[]) {
  return linesFrom(cart).reduce((sum, line) => sum + (lineAmountCents(line.product.priceEur, line.qty) ?? 0), 0) / 100;
}
export const useShop = create<State>()(persist((set, get) => ({
  country: "GR", locale: "tr", cart: [], note: "", orders: [], ready: false,
  setNote: (value) => set({ note: value.slice(0, 300) }),
  setReady: (ready) => set({ ready }),
  setCountry: (country) => set({ country: sanitizePersistedShop({ country }).country }),
  setLocale: (locale) => set({ locale }),
  add: (slug, qty = 1, allowUnpriced = false) => {
    const product = productBySlug(slug);
    if (!product) return "unknown";
    if (!allowUnpriced && (product.priceEur == null || product.priceEur <= 0)) return "no_price";
    if (get().country === "NO" && product.klass === "food") return "norway_food";
    if (!validListQuantity(qty, product.unit)) return "quantity";
    const cart = sanitizeCart(get().cart, KNOWN_SLUGS, WEIGHT_SLUGS);
    const index = cart.findIndex(line => line.slug === slug);
    if (index < 0 && cart.length >= MAX_CART_LINES) return "quantity";
    const total = qty + (index >= 0 ? cart[index].qty : 0);
    if (total > MAX_ITEM_QUANTITY) return "quantity";
    if (index >= 0) cart[index] = { slug, qty: total };
    else cart.push({ slug, qty });
    set({ cart });
    return "ok";
  },
  setQty: (slug, qty) => {
    const safe = normalizeListQuantity(qty, productBySlug(slug)?.unit ?? "ürün");
    set({ cart: get().cart.map(line => line.slug === slug ? { slug, qty: safe } : line) });
  },
  remove: (slug) => set({ cart: get().cart.filter(line => line.slug !== slug) }),
  clear: () => set({ cart: [], note: "", orders: [] }),
}), {
  // Reuse the old key so rehydration actively overwrites its personal data rather than abandoning it.
  name: "detoks-gr-shop-v4",
  skipHydration: true,
  partialize: (state) => sanitizePersistedShop(state, KNOWN_SLUGS, WEIGHT_SLUGS),
  merge: (persisted, current) => ({ ...current, ...sanitizePersistedShop(persisted, KNOWN_SLUGS, WEIGHT_SLUGS), orders: [], note: "" }),
}));
let booted = false;
export function bootShop() {
  if (typeof window === "undefined" || booted) return;
  booted = true;
  const done = () => useShop.getState().setReady(true);
  // setReady also persists the sanitised state, purging the old v4 payload immediately.
  const result = useShop.persist.rehydrate();
  if (result && typeof result.then === "function") void result.then(done).catch(done);
  else done();
}
export function useCurrency() { return countryByCode(useShop(state => state.country)).currency; }
export function countItems(cart: CartEntry[]) { return sanitizeCart(cart, KNOWN_SLUGS, WEIGHT_SLUGS).length; }
export function related(product: Product, count = 4) {
  return PRODUCTS.filter(item => item.category === product.category && item.slug !== product.slug)
    .sort((a, b) => Number(!SKU_BY_ID[a.sourceId]) - Number(!SKU_BY_ID[b.sourceId]) || Number(!a.houseNamed) - Number(!b.houseNamed))
    .slice(0, count);
}

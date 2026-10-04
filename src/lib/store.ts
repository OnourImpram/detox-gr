import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CountryCode } from "./markets";
import { countryByCode } from "./markets";
import { PRODUCTS, SKU_BY_ID, productBySlug, type Product } from "./catalog";
import { shippingEur, hasFood, type CartLine } from "./shipping";
import { type Locale } from "./i18n-locales";

export type CartEntry = { slug: string; qty: number };

export type Order = {
  id: string;
  createdAt: string;
  country: CountryCode;
  name: string;
  email: string;
  address: string;
  city: string;
  postal: string;
  items: CartEntry[];
  goodsEur: number;
  shipEur: number;
  totalEur: number;
};

type State = {
  country: CountryCode;
  locale: Locale;
  cart: CartEntry[];
  /** Hediye/sipariş notu — Shopify'da cart note, Stripe'ta metadata (red team RT-A-12). */
  note: string;
  setNote: (v: string) => void;
  orders: Order[];
  ready: boolean;
  setReady: (v: boolean) => void;
  setCountry: (c: CountryCode) => void;
  setLocale: (l: Locale) => void;
  /** Sepete ekler; başarısızlıkta nedenini döner — sessiz kalmaz (red team RT-A-01). */
  add: (slug: string, qty?: number) => AddResult;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  placeOrder: (input: {
    name: string;
    email: string;
    address: string;
    city: string;
    postal: string;
  }) => Order | null;
};

export type AddResult = "ok" | "unknown" | "no_price" | "norway_food";

export function linesFrom(cart: CartEntry[]): CartLine[] {
  return cart
    .map((c) => {
      const product = productBySlug(c.slug);
      if (!product) return null;
      return { product, qty: c.qty };
    })
    .filter(Boolean) as CartLine[];
}

export function goodsEur(cart: CartEntry[]) {
  return linesFrom(cart).reduce((s, l) => s + (l.product.priceEur ?? 0) * l.qty, 0);
}

export const useShop = create<State>()(
  persist(
    (set, get) => ({
      country: "GR",
      locale: "tr",
      cart: [],
      note: "",
      setNote: (v) => set({ note: v.slice(0, 300) }),
      orders: [],
      ready: false,
      setReady: (ready) => set({ ready }),
      setCountry: (country) => set({ country }),
      setLocale: (locale) => set({ locale }),
      add: (slug, qty = 1) => {
        const product = productBySlug(slug);
        if (!product) return "unknown";
        if (product.priceEur == null) return "no_price";
        if (get().country === "NO" && product.klass === "food") return "norway_food";
        const cart = [...get().cart];
        const i = cart.findIndex((c) => c.slug === slug);
        if (i >= 0) cart[i] = { slug, qty: cart[i].qty + qty };
        else cart.push({ slug, qty });
        set({ cart });
        return "ok";
      },
      setQty: (slug, qty) => {
        // Boş/0 giriş satırı silmez (kaymak kıyası deneyim-03: adet kutusunu silip yeniden yazan müşteri ürünü kaybediyordu); silme yalnız remove()
        if (!Number.isFinite(qty) || qty < 1) {
          set({ cart: get().cart.map((c) => (c.slug === slug ? { ...c, qty: 1 } : c)) });
          return;
        }
        set({
          cart: get().cart.map((c) => (c.slug === slug ? { ...c, qty } : c)),
        });
      },
      remove: (slug) => set({ cart: get().cart.filter((c) => c.slug !== slug) }),
      clear: () => set({ cart: [], note: "" }),
      placeOrder: (input) => {
        const { cart, country } = get();
        if (cart.length === 0) return null;
        const lines = linesFrom(cart);
        if (country === "NO" && hasFood(lines)) return null;
        const goods = goodsEur(cart);
        const ship = shippingEur(country, lines);
        const order: Order = {
          id: `DT-${Date.now().toString(36).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          country,
          ...input,
          items: cart,
          goodsEur: goods,
          shipEur: ship,
          totalEur: Math.round((goods + ship) * 100) / 100,
        };
        set({ orders: [order, ...get().orders], cart: [] });
        return order;
      },
    }),
    {
      name: "detoks-gr-shop-v4",
      skipHydration: true,
      partialize: (s) => ({
        country: s.country,
        cart: s.cart,
        note: s.note,
        orders: s.orders,
      }),
      merge: (persisted, current) => {
        const p = { ...(persisted as Partial<State> | undefined) };
        delete (p as { locale?: unknown }).locale;
        return { ...current, ...p };
      },
    },
  ),
);

export function bootShop() {
  const done = () => useShop.getState().setReady(true);
  const result = useShop.persist.rehydrate();
  if (result && typeof result.then === "function") void result.then(done);
  else done();
}

export function useCurrency() {
  return countryByCode(useShop((s) => s.country)).currency;
}

export function countItems(cart: CartEntry[]) {
  return cart.reduce((s, c) => s + c.qty, 0);
}

export function related(product: Product, n = 4) {
  const pool = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug);
  const ranked = [...pool].sort((a, b) => {
    const ae = SKU_BY_ID[a.sourceId] ? 0 : 1;
    const be = SKU_BY_ID[b.sourceId] ? 0 : 1;
    if (ae !== be) return ae - be;
    const ah = a.houseNamed ? 0 : 1;
    const bh = b.houseNamed ? 0 : 1;
    return ah - bh;
  });
  return ranked.slice(0, n);
}

// Shopify Storefront Cart API — saf yardımcılar (katalog importu YOK; node --test ile doğrulanır).
// Akış: cartCreate(lines, buyerIdentity, note) → cart.checkoutUrl → müşteri Shopify hosted checkout'a gider;
// sipariş Shopify admin'e düşer, Taha taşıyıcı seçer ve etiket basar (kapalı karar: her ödeme Shopify'dan).

export type ShopifyConfig = { domain: string; token: string; version: string };

export type CartLineInput = { merchandiseId: string; quantity: number };

export const CART_CREATE = /* GraphQL */ `
mutation detoksCartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart { id checkoutUrl }
    userErrors { field message }
  }
}`;

export const VARIANT_BY_SKU = /* GraphQL */ `
query detoksVariantBySku($q: String!) {
  products(first: 1, query: $q) {
    nodes { variants(first: 10) { nodes { id sku availableForSale } } }
  }
}`;

/** Ortamdan yapılandırma; üçü de yoksa null (Stripe yedeğine düşülür). */
export function readShopifyConfig(env: Record<string, string | undefined> = process.env): ShopifyConfig | null {
  const domain = env.SHOPIFY_STORE_DOMAIN?.trim();
  const token = env.SHOPIFY_STOREFRONT_TOKEN?.trim();
  if (!domain || !token) return null;
  return { domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""), token, version: env.SHOPIFY_API_VERSION?.trim() || "2025-07" };
}

export function buildCartInput(opts: {
  lines: CartLineInput[];
  countryCode: string;
  email?: string;
  note?: string;
  locale?: string;
  attributes?: Record<string, string>;
}) {
  const attrs = Object.entries(opts.attributes ?? {}).map(([key, value]) => ({ key, value: value.slice(0, 250) }));
  if (opts.locale) attrs.push({ key: "locale", value: opts.locale });
  return {
    lines: opts.lines.map((l) => ({ merchandiseId: l.merchandiseId, quantity: Math.max(1, Math.min(20, Math.floor(l.quantity))) })),
    buyerIdentity: { countryCode: opts.countryCode, ...(opts.email ? { email: opts.email } : {}) },
    ...(opts.note ? { note: opts.note.slice(0, 300) } : {}),
    ...(attrs.length ? { attributes: attrs } : {}),
  };
}

type Fetch = typeof fetch;

export async function storefrontRequest<T>(cfg: ShopifyConfig, query: string, variables: unknown, fetchImpl: Fetch = fetch): Promise<T> {
  const res = await fetchImpl(`https://${cfg.domain}/api/${cfg.version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": cfg.token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`storefront ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new Error("storefront: veri yok");
  return json.data;
}

export type CartCreateData = { cartCreate: { cart: { id: string; checkoutUrl: string } | null; userErrors: { field: string[] | null; message: string }[] } };

/** cartCreate cevabını çözer: checkoutUrl ya da hata metni. */
export function parseCartCreate(data: CartCreateData): { ok: true; url: string; cartId: string } | { ok: false; error: string } {
  const errs = data.cartCreate.userErrors;
  if (errs?.length) return { ok: false, error: errs.map((e) => e.message).join("; ") };
  const cart = data.cartCreate.cart;
  if (!cart?.checkoutUrl) return { ok: false, error: "checkoutUrl yok" };
  return { ok: true, url: cart.checkoutUrl, cartId: cart.id };
}

/** Bir SKU için (source_record_id, Shopify'a SKU olarak aktarılır) varyant kimliğini Storefront'tan bulur. */
export async function variantIdBySku(cfg: ShopifyConfig, sku: string, fetchImpl: Fetch = fetch): Promise<string | null> {
  type D = { products: { nodes: { variants: { nodes: { id: string; sku: string | null; availableForSale: boolean }[] } }[] } };
  const data = await storefrontRequest<D>(cfg, VARIANT_BY_SKU, { q: `sku:${sku}` }, fetchImpl);
  for (const p of data.products.nodes) {
    const hit = p.variants.nodes.find((v) => v.sku === sku);
    if (hit) return hit.id;
  }
  return null;
}

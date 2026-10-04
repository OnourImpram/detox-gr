// node --experimental-strip-types --test src/lib/shopify-cart.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCartInput, parseCartCreate, readShopifyConfig, storefrontRequest, variantIdBySku, CART_CREATE } from "./shopify-cart.ts";

const cfg = { domain: "detoks.myshopify.com", token: "tok", version: "2025-07" };

test("readShopifyConfig: env yoksa null, varsa alan adı temizlenir", () => {
  assert.equal(readShopifyConfig({}), null);
  assert.equal(readShopifyConfig({ SHOPIFY_STORE_DOMAIN: "x.myshopify.com" }), null);
  assert.deepEqual(readShopifyConfig({ SHOPIFY_STORE_DOMAIN: "https://x.myshopify.com/", SHOPIFY_STOREFRONT_TOKEN: "t" }),
    { domain: "x.myshopify.com", token: "t", version: "2025-07" });
});

test("buildCartInput: adet 1..20'ye sıkıştırılır, not 300'e kesilir, locale attribute olur", () => {
  const input = buildCartInput({
    lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 99 }, { merchandiseId: "gid://shopify/ProductVariant/2", quantity: 0 }],
    countryCode: "DE", email: "a@b.de", note: "x".repeat(400), locale: "de",
  });
  assert.deepEqual(input.lines.map((l) => l.quantity), [20, 1]);
  assert.equal(input.note?.length, 300);
  assert.deepEqual(input.buyerIdentity, { countryCode: "DE", email: "a@b.de" });
  assert.deepEqual(input.attributes, [{ key: "locale", value: "de" }]);
});

test("parseCartCreate: userErrors → hata; checkoutUrl → ok", () => {
  assert.deepEqual(parseCartCreate({ cartCreate: { cart: null, userErrors: [{ field: null, message: "kötü" }] } }), { ok: false, error: "kötü" });
  assert.deepEqual(parseCartCreate({ cartCreate: { cart: { id: "c1", checkoutUrl: "https://x/checkout" }, userErrors: [] } }),
    { ok: true, url: "https://x/checkout", cartId: "c1" });
});

test("storefrontRequest: doğru uç nokta + başlık; GraphQL errors fırlatır", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fakeFetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ data: { cartCreate: { cart: { id: "c", checkoutUrl: "https://c/x" }, userErrors: [] } } }), { status: 200 });
  }) as unknown as typeof fetch;
  const data = await storefrontRequest(cfg, CART_CREATE, { input: {} }, fakeFetch);
  assert.equal(calls[0].url, "https://detoks.myshopify.com/api/2025-07/graphql.json");
  assert.equal((calls[0].init.headers as Record<string, string>)["X-Shopify-Storefront-Access-Token"], "tok");
  assert.ok(data);
  const errFetch = (async () => new Response(JSON.stringify({ errors: [{ message: "Throttled" }] }), { status: 200 })) as unknown as typeof fetch;
  await assert.rejects(() => storefrontRequest(cfg, CART_CREATE, {}, errFetch), /Throttled/);
  const httpFetch = (async () => new Response("no", { status: 500 })) as unknown as typeof fetch;
  await assert.rejects(() => storefrontRequest(cfg, CART_CREATE, {}, httpFetch), /storefront 500/);
});

test("variantIdBySku: SKU eşleşen varyantı döner, yoksa null", async () => {
  const mk = (nodes: unknown[]) => (async () => new Response(JSON.stringify({ data: { products: { nodes } } }))) as unknown as typeof fetch;
  const hit = await variantIdBySku(cfg, "DT117", mk([{ variants: { nodes: [{ id: "gid://v/9", sku: "DT117", availableForSale: true }] } }]));
  assert.equal(hit, "gid://v/9");
  const miss = await variantIdBySku(cfg, "DT117", mk([{ variants: { nodes: [{ id: "gid://v/9", sku: "DT118", availableForSale: true }] } }]));
  assert.equal(miss, null);
});

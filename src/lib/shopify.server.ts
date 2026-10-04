// Shopify hosted checkout. Missing configuration fails closed, never falls back to Stripe.
// Varyant eşlemesi: src/data/shopify-varyant.json (sourceId → gid) → yoksa Storefront'ta SKU araması (SKU = source_record_id).
import varyantRaw from "@/data/shopify-varyant.json";
import { quoteCart, type QuoteItem } from "./quote";
import { buildCartInput, parseCartCreate, readShopifyConfig, storefrontRequest, variantIdBySku, CART_CREATE, type CartCreateData } from "./shopify-cart";

const VARYANT = varyantRaw as Record<string, string>;

export function shopifyConfigured() {
  return readShopifyConfig() !== null;
}

export async function createShopifyCheckout(input: {
  items: QuoteItem[];
  country: string;
  locale: string;
  email: string;
  note?: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const cfg = readShopifyConfig();
  if (!cfg) return { ok: false, error: "unconfigured" };
  // Aynı sunucu kuralları: fiyatsız ürün, Norveç+gıda, bilinmeyen slug, adet sınırı (red team RT-C-01/04 sınıfı)
  const quote = quoteCart(input.items, input.country);
  if (!quote.ok) return quote;

  const lines: { merchandiseId: string; quantity: number }[] = [];
  for (const l of quote.lines) {
    const id = VARYANT[l.product.sourceId] && !VARYANT[l.product.sourceId].startsWith("_")
      ? VARYANT[l.product.sourceId]
      : await variantIdBySku(cfg, l.product.sourceId);
    if (!id) return { ok: false, error: "unknown" }; // Shopify'a aktarılmamış ürün: satışa çıkmaz
    lines.push({ merchandiseId: id, quantity: l.qty });
  }
  const variables = {
    input: buildCartInput({
      lines,
      countryCode: quote.country,
      email: input.email,
      note: input.note,
      locale: input.locale,
      attributes: { kaynak: "detoks.gr", slugs: quote.lines.map((l) => `${l.product.slug}:${l.qty}`).join(",") },
    }),
  };
  try {
    const data = await storefrontRequest<CartCreateData>(cfg, CART_CREATE, variables);
    const parsed = parseCartCreate(data);
    if (!parsed.ok) return { ok: false, error: "session" };
    return { ok: true, url: parsed.url };
  } catch {
    return { ok: false, error: "session" };
  }
}

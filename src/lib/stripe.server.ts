import Stripe from "stripe";
import { productLabel, quoteCart, stripeCountryCodes, type QuoteItem } from "./quote";

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// İzinli origin listesi: SITE_ORIGINS env'i (virgülle), yoksa yalnız yerel geliştirme. Her HTTPS origin'i kabul etmek
// saldırganın kendi alanına dönen gerçek Stripe oturumu üretmesine izin veriyordu (red team RT-C-02).
function originAllowed(origin: string) {
  try {
    const url = new URL(origin);
    const allowed = (process.env.SITE_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (allowed.length) return allowed.includes(url.origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export async function createStripeCheckout(input: {
  items: QuoteItem[];
  country: string;
  origin: string;
  locale: string;
  email: string;
  name: string;
  note?: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!originAllowed(input.origin)) return { ok: false, error: "origin" };
  const quote = quoteCart(input.items, input.country);
  if (!quote.ok) return quote;

  const stripe = stripeClient();
  if (!stripe) return { ok: false, error: "unconfigured" };

  // Checkout dili müşterinin dili; dönüş URL'leri de aynı dile döner (red team RT-C-03: EN/EL müşteri TR sayfaya düşüyordu)
  const STRIPE_LOCALES = ["tr", "en", "el", "de", "fr", "it", "es", "nl", "pl", "sv", "da", "fi", "pt", "hu", "cs", "ro", "bg", "hr", "sk"];
  const locale = (STRIPE_LOCALES.includes(input.locale) ? input.locale : "auto") as Stripe.Checkout.SessionCreateParams.Locale;
  const langQuery = input.locale === "tr" ? "" : `lang=${encodeURIComponent(input.locale)}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${input.origin}/odeme/basarili?session_id={CHECKOUT_SESSION_ID}${langQuery ? `&${langQuery}` : ""}`,
    cancel_url: `${input.origin}/odeme/iptal${langQuery ? `?${langQuery}` : ""}`,
    customer_email: input.email,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    shipping_address_collection: {
      allowed_countries: stripeCountryCodes() as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection["allowed_countries"],
    },
    locale,
    payment_method_types: ["card"],
    line_items: quote.lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: "eur",
        unit_amount: Math.round((l.product.priceEur ?? 0) * 100),
        product_data: {
          name: productLabel(l.product),
          metadata: { sku: l.product.sourceId, slug: l.product.slug },
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Math.round(quote.shipEur * 100), currency: "eur" },
          display_name: "Estimated shipping from Komotini",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 12 },
          },
        },
      },
    ],
    metadata: {
      country: quote.country,
      name: input.name.slice(0, 80),
      note: (input.note ?? "").slice(0, 300),
      slugs: quote.lines.map((l) => `${l.product.slug}:${l.qty}`).join(",").slice(0, 500),
    },
  });

  if (!session.url) return { ok: false, error: "session" };
  return { ok: true, url: session.url };
}

export async function readStripeCheckout(sessionId: string) {
  const stripe = stripeClient();
  if (!stripe) return { ok: false as const, error: "unconfigured" as const };
  if (!sessionId.startsWith("cs_")) return { ok: false as const, error: "session" as const };
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  return {
    ok: true as const,
    paid: session.payment_status === "paid",
    email: session.customer_email ?? session.customer_details?.email ?? "",
    amountEur: (session.amount_total ?? 0) / 100,
    currency: session.currency ?? "eur",
    id: session.id,
    name: session.customer_details?.name ?? session.metadata?.name ?? "",
  };
}

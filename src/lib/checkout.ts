import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const startSchema = z.object({
  items: z.array(z.object({ slug: z.string().min(1).max(80), qty: z.number().int().min(1).max(20) })).min(1).max(40),
  country: z.string().min(2).max(2),
  origin: z.string().url().max(200),
  locale: z.string().min(2).max(5),
  email: z.string().email().max(120),
  name: z.string().min(2).max(80),
  note: z.string().max(300).optional(),
});

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) => startSchema.parse(d))
  .handler(async ({ data }) => {
    // Shopify yapılandırılmışsa hosted checkout (kapalı karar); değilse geçici Stripe. Arayüz değişmez: {ok,url}.
    const { shopifyConfigured, createShopifyCheckout } = await import("./shopify.server");
    if (shopifyConfigured()) return createShopifyCheckout(data);
    const { createStripeCheckout } = await import("./stripe.server");
    return createStripeCheckout(data);
  });

export const readCheckout = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ sessionId: z.string().min(8).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { readStripeCheckout } = await import("./stripe.server");
    return readStripeCheckout(data.sessionId);
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import commerceConfig from "@/data/commerce-config.json";
import { allowedCheckoutOrigin, launchBlockers } from "./commerce-policy";
import { isLocale } from "./i18n-locales";

const startSchema = z.object({
  items: z.array(z.object({ slug: z.string().min(1).max(80), qty: z.number().int().min(1).max(20) })).min(1).max(40),
  country: z.string().regex(/^[A-Z]{2}$/),
  origin: z.string().url().max(200),
  locale: z.string().refine(isLocale),
  email: z.string().email().max(120),
  name: z.string().min(2).max(80),
  note: z.string().max(300).optional(),
});

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => startSchema.parse(input))
  .handler(async ({ data }) => {
    if (launchBlockers(commerceConfig).length > 0) return { ok: false as const, error: "unconfigured" };
    if (!commerceConfig.enabledCountries.includes(data.country as never)) return { ok: false as const, error: "country" };
    if (!allowedCheckoutOrigin(data.origin, process.env.SITE_ORIGINS ?? "", process.env.NODE_ENV === "development")) {
      return { ok: false as const, error: "origin" };
    }
    // A missing Shopify connection never silently falls back to another live provider.
    const { shopifyConfigured, createShopifyCheckout } = await import("./shopify.server");
    if (!shopifyConfigured()) return { ok: false as const, error: "unconfigured" };
    return createShopifyCheckout(data);
  });

/** Legacy receipt lookup only. New production checkouts use Shopify. */
export const readCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ sessionId: z.string().regex(/^cs_(?:test_|live_)?[A-Za-z0-9_]{8,180}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { readStripeCheckout } = await import("./stripe.server");
    return readStripeCheckout(data.sessionId);
  });

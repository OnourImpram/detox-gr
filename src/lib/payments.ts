import { createServerFn } from "@tanstack/react-start";
import { useLoaderData } from "@tanstack/react-router";

/**
 * Ödeme açık mı? Sunucuda hesaplanır (Shopify env ya da Stripe anahtarı), kök loader'la her sayfaya gelir.
 * Müşteri kopyası "ödeme açıksa … değilse …" diye koşul anlatmaz; duruma göre tek cümle basar (kaymak kıyası deneyim-05/icerik-11).
 */
export const getPaymentsEnabled = createServerFn({ method: "GET" }).handler(async () => {
  const { shopifyConfigured } = await import("./shopify.server");
  return shopifyConfigured() || Boolean(process.env.STRIPE_SECRET_KEY);
});

export function usePaymentsEnabled(): boolean {
  const data = useLoaderData({ from: "__root__" }) as { payments?: boolean } | undefined;
  return Boolean(data?.payments);
}

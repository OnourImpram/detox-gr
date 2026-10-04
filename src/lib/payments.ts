import { createServerFn } from "@tanstack/react-start";
import { useLoaderData } from "@tanstack/react-router";
import commerceConfig from "@/data/commerce-config.json";
import { launchBlockers } from "./commerce-policy";

/** Credentials are connectivity, not authorization to launch a shop. */
export const getPaymentsEnabled = createServerFn({ method: "GET" }).handler(async () => {
  if (launchBlockers(commerceConfig).length > 0) return false;
  const { shopifyConfigured } = await import("./shopify.server");
  return shopifyConfigured();
});

export function usePaymentsEnabled(): boolean {
  const data = useLoaderData({ from: "__root__" }) as { payments?: boolean } | undefined;
  return data?.payments === true;
}

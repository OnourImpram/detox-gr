import { useHydrated } from '@tanstack/react-router';
import { pageOrigin } from './seo';
import { storefrontHref } from './storefront-href';
/** Hydration-safe. A customer message must not contain an unusable /p/... relative URL. */
export function useStorefrontHref(path: string): string {
  const hydrated = useHydrated();
  const origin = hydrated && typeof window !== 'undefined' ? window.location.origin : pageOrigin();
  return storefrontHref(origin, import.meta.env.BASE_URL, path);
}

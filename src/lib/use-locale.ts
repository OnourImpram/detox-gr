import { useRouterState } from "@tanstack/react-router";
import { localeFromSearch } from "./seo";
import type { Locale } from "./i18n-locales";

/**
 * Aktif dil: URL'deki ?lang'dan, sunucuda ve istemcide aynı. Eskiden bileşenler useShop(s => s.locale) okuyordu;
 * store sunucuda hiç set edilmediği için SSR gövdesi her dilde Türkçe basılıyordu (kaymak kıyası deneyim-01/icerik-05).
 * Store'daki locale kalır (kalıcılık/para birimi); gövde metni buradan.
 */
export function useLocale(): Locale {
  const lang = useRouterState({ select: (s) => (s.location.search as { lang?: unknown }).lang });
  return localeFromSearch({ lang });
}

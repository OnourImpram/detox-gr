import { isLocale, type Locale } from "./i18n-locales.ts";

/**
 * Accept-Language başlığından desteklenen en iyi dili seçer (q ağırlıklı, en yüksek q önce).
 * Sunucuda kök loader kullanır: kaymak kıyası deneyim-02 — Almanya'dan gelen ziyaretçi Türkçe sayfaya düşüyordu.
 * İstemcide yönlendirme denendi ve hidrasyon metin uyuşmazlığı verdi (React #418, ölçüldü) — karar sunucuda verilir.
 */
export function bestLocale(acceptLanguage: string | undefined | null): Locale | null {
  if (!acceptLanguage) return null;
  const items = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((x) => x.tag && Number.isFinite(x.q) && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of items) {
    if (tag === "*") return null;
    const base = tag.split("-")[0];
    if (base === "nb" || base === "nn") return "no";
    if (isLocale(base)) return base;
  }
  return null;
}

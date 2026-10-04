import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";
import { productName, t } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";

/**
 * Filtrelenebilir + sıralanabilir ürün ızgarası. Hem /shop "Tümü" hem /shop/$category kullanır:
 * kaymak kıyası deneyim-08 — 226 ürünün tek listesi yoktu, "Tümü" yalnız 8 vitrin ürünü gösteriyordu.
 * 8 üründen azsa arama/sıralama çubuğu basılmaz (gereksiz krom).
 */
export function UrunListesi({ products, className = "" }: { products: Product[]; className?: string }) {
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"name" | "priceAsc" | "priceDesc">("name");
  const list = useMemo(() => {
    const tr = locale === "tr" ? "tr-TR" : undefined;
    const needle = q.trim().toLocaleLowerCase(tr);
    const filtered = needle
      ? products.filter(
          (p) =>
            productName(p, locale).toLocaleLowerCase(tr).includes(needle) ||
            p.name.toLocaleLowerCase("tr-TR").includes(needle),
        )
      : products;
    return [...filtered].sort((a, b) => {
      if (sort === "name") return productName(a, locale).localeCompare(productName(b, locale), locale);
      const pa = a.priceEur ?? Number.POSITIVE_INFINITY;
      const pb = b.priceEur ?? Number.POSITIVE_INFINITY;
      return sort === "priceAsc" ? pa - pb : pb - pa;
    });
  }, [products, q, sort, locale]);

  return (
    <div className={className}>
      {products.length > 8 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 border border-border bg-raised px-3">
            <span className="sr-only">{t(locale, "shop.filter")}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(locale, "shop.filter")}
              className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-faint"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="sr-only">{t(locale, "shop.sort")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-11 border border-border bg-raised px-3 text-sm text-fg"
            >
              <option value="name">{t(locale, "shop.sortName")}</option>
              <option value="priceAsc">{t(locale, "shop.sortPriceAsc")}</option>
              <option value="priceDesc">{t(locale, "shop.sortPriceDesc")}</option>
            </select>
          </label>
          <p className="micro text-faint" aria-live="polite">
            {t(locale, "shop.count", { n: list.length })}
          </p>
        </div>
      )}
      {list.length > 0 ? (
        <div className="mt-10 grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 max-w-xl border border-border bg-raised p-6 sm:p-8">
          <p className="text-lg text-muted">{t(locale, "shop.empty")}</p>
          <button type="button" onClick={() => setQ("")} className="mt-4 text-sm text-primary underline underline-offset-4">
            {t(locale, "shop.clearFilter")}
          </button>
        </div>
      )}
    </div>
  );
}

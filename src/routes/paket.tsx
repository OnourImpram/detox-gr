import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PRODUCTS, imageFor, productBySourceId } from "@/lib/catalog";
import { productName, t } from "@/lib/i18n";
import { langParam } from "@/lib/lang-search";
import { formatListed, formatMoney } from "@/lib/money";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";
import { useCurrency, useShop } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/paket")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.gift.title"),
      description: t(locale, "seo.gift.desc"),
      path: "/paket",
      locale,
      origin: pageOrigin(),
    });
  },
  component: Bundle,
});

const SETS: { key: "gift.set.table" | "gift.set.tea" | "gift.set.bath"; ids: string[] }[] = [
  { key: "gift.set.table", ids: ["DT117", "DT157", "DT102"] },
  { key: "gift.set.tea", ids: ["DT234", "DT235", "DT128"] },
  { key: "gift.set.bath", ids: ["DT049", "DT028", "DT021"] },
];

function slugsOf(ids: string[]) {
  return ids.map(productBySourceId).filter(Boolean).map((p) => p!.slug);
}

const SET_SLUGS = SETS.flatMap((s) => slugsOf(s.ids));
const POOL_CATS = ["lokum", "soap", "spice", "honey", "nuts", "pantry", "care"] as const;
const POOL = [
  ...PRODUCTS.filter((p) => SET_SLUGS.includes(p.slug)),
  ...PRODUCTS.filter((p) => POOL_CATS.includes(p.category as (typeof POOL_CATS)[number]) && !SET_SLUGS.includes(p.slug)),
].slice(0, 30);

function Bundle() {
  const [picked, setPicked] = useState<string[]>([]);
  const add = useShop((s) => s.add);
  const locale = useLocale();
  const currency = useCurrency();
  const navigate = useNavigate();
  const items = useMemo(() => POOL.filter((p) => picked.includes(p.slug)), [picked]);
  const total = items.reduce((s, p) => s + (p.priceEur ?? 0), 0);
  const knownGrams = items.reduce((s, p) => s + (p.grams ?? 0), 0);
  const gramsUnknown = items.some((p) => p.grams == null);

  function toggle(slug: string) {
    setPicked((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  return (
    <section className="px-[6vw] py-10">
      <h1 className="text-4xl">{t(locale, "gift.title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t(locale, "gift.lead")}</p>
      <p className="mt-3 max-w-xl text-xs text-faint">{t(locale, "gift.setNote")}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {SETS.map((set) => (
          <button
            key={set.key}
            type="button"
            onClick={() => setPicked(slugsOf(set.ids))}
            className="min-h-11 border border-border px-3 text-sm hover:border-primary"
          >
            {t(locale, set.key)}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm tabular-nums">
        {t(locale, "gift.stats", {
          n: items.length,
          g: gramsUnknown ? "—" : knownGrams,
          price: formatMoney(total, currency),
        })}
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POOL.map((p) => {
          const on = picked.includes(p.slug);
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggle(p.slug)}
              className={`flex min-h-20 items-center gap-3 border p-3 text-left ${on ? "border-primary bg-raised text-fg" : "border-border"}`}
            >
              <Pic src={imageFor(p)} alt="" sizes="56px" loading="lazy" decoding="async" className="size-14 bg-ink object-contain" />
              <span>
                <span className="block font-display">{productName(p, locale)}</span>
                <span className="text-sm tabular-nums">{formatListed(p.priceEur, p.unit, currency, locale)}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Button
        variant="primary"
        className="mt-8"
        disabled={picked.length === 0}
        onClick={() => {
          // Eklenemeyenler sessizce düşmesin: Norveç+gıda ya da fiyatsız ürün ayrı bildirilir (red team RT-A-01)
          const results = picked.map((s) => add(s, 1));
          const okCount = results.filter((r) => r === "ok").length;
          if (results.some((r) => r === "norway_food")) toast(t(locale, "cart.norwayBlock"));
          if (results.some((r) => r === "no_price")) toast(t(locale, "product.netUnknown"));
          if (okCount === 0) return;
          toast(t(locale, "product.added"));
          void navigate({ to: "/sepet", search: langParam(locale) });
        }}
      >
        {t(locale, "gift.add")}
      </Button>
    </section>
  );
}

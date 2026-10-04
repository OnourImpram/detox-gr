import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { t } from "@/lib/i18n";
import { PHOTO } from "@/lib/photos";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";
import { useCurrency } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { shippingEur } from "@/lib/shipping";
import { PRODUCTS } from "@/lib/catalog";

export const Route = createFileRoute("/teslimat")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.ship.title"),
      description: t(locale, "seo.ship.desc"),
      path: "/teslimat",
      locale,
      origin: pageOrigin(),
      image: PHOTO.shop,
    });
  },
  component: Shipping,
});

function Shipping() {
  const locale = useLocale();
  const currency = useCurrency();
  // Tahmini ücret tablosu: sepetteki hesapla aynı fonksiyon, 1 kg kuru paket / 1 kg cam paket örneği (red team RT-B-10).
  // Taşıyıcı tarifesi Taha'dan gelince shipping.ts güncellenir; tablo otomatik değişir.
  const dry = PRODUCTS.find((p) => p.kind === "dry" && p.priceEur != null);
  const glass = PRODUCTS.find((p) => p.kind === "glass" && p.priceEur != null);
  const ornek = (country: "GR" | "DE" | "CY" | "NO", kind: "dry" | "glass") => {
    const p = kind === "dry" ? dry : glass;
    return p ? formatMoney(shippingEur(country, [{ product: { ...p, grams: 1000 }, qty: 1 }]), currency) : "—";
  };
  const satirlar: { key: string; c: "GR" | "DE" | "CY" | "NO" }[] = [
    { key: "ship.zoneGr", c: "GR" },
    { key: "ship.zoneEu", c: "DE" },
    { key: "ship.zoneIsland", c: "CY" },
    { key: "ship.zoneNo", c: "NO" },
  ];
  return (
    <section className="mx-auto max-w-2xl px-[6vw] py-14">
      <p className="kicker">{t(locale, "ship.kicker")}</p>
      <h1 className="mt-3 text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "ship.title")}</h1>
      <p className="mt-4 text-muted">{t(locale, "ship.lead")}</p>
      <Pic src={PHOTO.shop} alt={t(locale, "photo.shop")} sizes="(min-width: 768px) 42rem, 100vw" loading="lazy" decoding="async" className="mt-8 w-full rounded-[6px] object-cover" />
      <ul className="mt-10 space-y-5">
        {(["ship.l1", "ship.l2", "ship.l3", "ship.l4", "ship.l5"] as const).map((key) => (
          <li key={key} className="border-l border-rule pl-4 text-muted">
            {t(locale, key)}
          </li>
        ))}
      </ul>
      <h2 className="mt-12 text-2xl">{t(locale, "ship.tableTitle")}</h2>
      <p className="mt-2 text-sm text-muted">{t(locale, "ship.tableNote")}</p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left micro text-faint">
            <th className="py-2 font-normal">{t(locale, "ship.zone")}</th>
            <th className="py-2 font-normal">{t(locale, "ship.dry")}</th>
            <th className="py-2 font-normal">{t(locale, "ship.glass")}</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((r) => (
            <tr key={r.key} className="hairline-soft border-t">
              <td className="py-3">{t(locale, r.key)}</td>
              <td className="py-3 tabular-nums">{ornek(r.c, "dry")}</td>
              <td className="py-3 tabular-nums">{ornek(r.c, "glass")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

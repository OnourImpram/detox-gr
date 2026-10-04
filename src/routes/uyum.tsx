import { createFileRoute, notFound } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { HELD_PRODUCTS, PRODUCTS as VITRIN } from "@/lib/catalog";

// İç uyum tablosu: vitrindekiler + yayını bekletilenler. Yalnız geliştirme/önizlemede açılır; yayında 404
// (red team RT-B-01/07: hastalık adlı ürün listesi ve boş denetim sütunları herkese açıktı).
const PRODUCTS = [...VITRIN, ...HELD_PRODUCTS];
import { isDiseaseNamed, isWatchNamed } from "@/lib/claims";
import { t } from "@/lib/i18n";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/uyum")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: `${t(locale, "uyum.title")} | Detoks.gr`,
      description: t(locale, "uyum.lead"),
      path: "/uyum",
      locale,
      origin: pageOrigin(),
      noindex: true,
    });
  },
  loader: () => {
    if (!import.meta.env.DEV && import.meta.env.VITE_ONIZLEME !== "1") throw notFound();
  },
  component: Compliance,
});

function csvEscape(s: string) {
  return `"${s.replaceAll('"', '""')}"`;
}

function downloadCsv() {
  const header = [
    "slug",
    "list_name_tr",
    "category",
    "unit",
    "price_eur",
    "net_g",
    "ingredients_inci",
    "allergen",
    "origin",
    "manufacturer",
    "flag",
  ];
  const rows = PRODUCTS.map((p) =>
    [
      p.slug,
      p.name,
      p.category,
      p.unit,
      p.priceEur == null ? "" : p.priceEur.toFixed(2),
      "",
      "",
      "",
      "",
      "",
      isDiseaseNamed(p.slug) ? "disease_name" : isWatchNamed(p.slug) ? "review" : "",
    ]
      .map((c) => csvEscape(String(c)))
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "detoks-gr-p1-sku-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Compliance() {
  const locale = useLocale();
  const flagged = PRODUCTS.filter((p) => isWatchNamed(p.slug));
  return (
    <section className="px-[6vw] py-14">
      <p className="text-xs tracking-[0.18em] text-patina uppercase">{t(locale, "uyum.kicker")}</p>
      <h1 className="mt-2 max-w-[20ch] text-[clamp(2.2rem,5vw,3.6rem)]">{t(locale, "uyum.title")}</h1>
      <p className="mt-4 max-w-2xl text-muted">{t(locale, "uyum.lead")}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted">{t(locale, "uyum.need")}</p>
      <button
        type="button"
        onClick={downloadCsv}
        className="mt-6 min-h-11 border border-border px-4 text-sm hover:border-primary"
      >
        {t(locale, "uyum.csv")}
      </button>

      <h2 className="mt-14 text-2xl">{t(locale, "uyum.flag")}</h2>
      <ul className="mt-4 max-w-2xl space-y-2 text-sm">
        {flagged.map((p) => (
          <li key={p.slug} className="border-l border-rule pl-3">
            <span className="font-mono text-xs text-faint">{p.slug}</span>
            <span className="mx-2">·</span>
            {p.name}
            <span className="ml-2 text-primary">
              {isDiseaseNamed(p.slug) ? t(locale, "uyum.flag") : t(locale, "uyum.watch")}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-12 overflow-x-auto">
        <table className="min-w-[72rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-faint">
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.slug")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.name")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.unit")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.price")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.grams")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.ing")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.all")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.origin")}</th>
              <th className="py-2 pr-3 font-medium">{t(locale, "uyum.col.mfr")}</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.slug} className="border-b border-border/60">
                <td className="py-2 pr-3 font-mono text-xs">{p.slug}</td>
                <td className="py-2 pr-3">{p.name}</td>
                <td className="py-2 pr-3">{p.unit}</td>
                <td className="py-2 pr-3 tabular-nums">{p.priceEur == null ? "" : p.priceEur.toFixed(2)}</td>
                <td className="py-2 pr-3 text-faint">—</td>
                <td className="py-2 pr-3 text-faint">—</td>
                <td className="py-2 pr-3 text-faint">—</td>
                <td className="py-2 pr-3 text-faint">—</td>
                <td className="py-2 pr-3 text-faint">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { LocaleLink } from "@/components/locale-link";
import { productBySlug } from "@/lib/catalog";
import { countryName, productName, t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { countryByCode } from "@/lib/markets";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";
import { useShop } from "@/lib/store";

export const Route = createFileRoute("/siparis/$id")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: `${t(locale, "order.received")} | ${BRAND}`,
      description: t(locale, "order.missing"),
      path: `/siparis/${match.params.id}`,
      locale,
      origin: pageOrigin(),
      noindex: true,
    });
  },
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const locale = useLocale();
  const order = useShop((s) => s.orders.find((o) => o.id === id));
  if (!order) {
    return (
      <section className="px-[6vw] py-16">
        <h1 className="text-4xl">{t(locale, "order.missing")}</h1>
        <LocaleLink to="/" className="mt-4 inline-block text-primary">
          {t(locale, "order.home")}
        </LocaleLink>
      </section>
    );
  }
  const currency = countryByCode(order.country).currency;
  const pName = (slug: string) => {
    const p = productBySlug(slug);
    return p ? productName(p, locale) : slug;
  };
  return (
    <section className="px-[6vw] py-12">
      <p className="text-xs tracking-[0.18em] text-patina uppercase">{t(locale, "order.received")}</p>
      <h1 className="mt-2 text-4xl">{order.id}</h1>
      <p className="mt-3 text-muted">
        {t(locale, "order.note", { name: order.name, country: countryName(order.country, locale) })}
      </p>
      <p className="mt-2 text-sm text-muted">{t(locale, "order.preview")}</p>
      <ul className="mt-8 max-w-lg space-y-2">
        {order.items.map((i) => {
          const p = productBySlug(i.slug);
          return (
            <li key={i.slug} className="flex justify-between gap-4 text-sm">
              <span>
                {pName(i.slug)} × {i.qty}
              </span>
              <span className="tabular-nums">{p ? formatMoney((p.priceEur ?? 0) * i.qty, currency) : ""}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 font-medium tabular-nums">{t(locale, "order.total", { total: formatMoney(order.totalEur, currency) })}</p>
      <LocaleLink to="/shop" className="mt-8 inline-block text-primary">
        {t(locale, "order.continue")}
      </LocaleLink>
    </section>
  );
}

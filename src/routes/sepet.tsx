import { createFileRoute } from "@tanstack/react-router";
import { usePaymentsEnabled } from "@/lib/payments";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { LocaleLink } from "@/components/locale-link";
import { Button } from "@/components/ui/button";
import { imageFor } from "@/lib/catalog";
import { etaText, productName, t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { hasFood, hasCosmetic, shippingEur } from "@/lib/shipping";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";
import { goodsEur, linesFrom, useCurrency, useShop } from "@/lib/store";
import { SHOP_WHATSAPP } from "@/lib/shop-facts";

export const Route = createFileRoute("/sepet")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: `${t(locale, "cart.title")} | ${BRAND}`,
      description: t(locale, "cart.emptyLeadClosed"),
      path: "/sepet",
      locale,
      origin: pageOrigin(),
      noindex: true,
    });
  },
  component: CartPage,
});

function CartPage() {
  const cart = useShop((s) => s.cart);
  const country = useShop((s) => s.country);
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.remove);
  const note = useShop((s) => s.note);
  const setNote = useShop((s) => s.setNote);
  const currency = useCurrency();
  const lines = linesFrom(cart);
  const goods = goodsEur(cart);
  const ship = shippingEur(country, lines);
  const total = goods + ship;

  if (cart.length === 0) {
    return (
      <section className="shell-x section-y">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-10 text-patina"
          aria-hidden="true"
        >
          <path d="M4.5 9.5h15l-1.3 9.2a2 2 0 0 1-2 1.8H7.8a2 2 0 0 1-2-1.8L4.5 9.5Z" />
          <path d="M8.5 11V7a3.5 3.5 0 0 1 7 0v4" />
        </svg>
        <p className="kicker mt-6">{t(locale, "cart.title")}</p>
        <h1 className="mt-3 text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "cart.emptyTitle")}</h1>
        <p className="mt-4 max-w-[46ch] text-muted">{t(locale, payments ? "cart.emptyLeadOpen" : "cart.emptyLeadClosed")}</p>
        <Button asChild variant="primary" className="mt-8">
          <LocaleLink to="/shop">{t(locale, "cart.back")}</LocaleLink>
        </Button>
      </section>
    );
  }

  return (
    <section className="shell-x section-y">
      <h1 className="text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "cart.title")}</h1>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <ul className="space-y-4">
          {lines.map((l) => {
            const lineTotal = (l.product.priceEur ?? 0) * l.qty;
            return (
              <li
                key={l.product.slug}
                className="flex flex-wrap items-center gap-4 rounded-[6px] border border-border bg-raised p-4"
              >
                <LocaleLink to="/p/$slug" params={{ slug: l.product.slug }} className="focus-inset shrink-0">
                  <Pic
                    src={imageFor(l.product)}
                    alt=""
                    sizes="96px"
                    loading="lazy"
                    decoding="async"
                    className="img-in size-20 rounded-[4px] border border-border bg-ink object-contain p-1.5 sm:size-24"
                  />
                </LocaleLink>
                <div className="min-w-0 flex-1 basis-48">
                  <LocaleLink
                    to="/p/$slug"
                    params={{ slug: l.product.slug }}
                    className="font-display text-lg leading-snug transition-colors hover:text-primary"
                  >
                    {productName(l.product, locale)}
                  </LocaleLink>
                  <p className="mt-1 text-sm text-muted tabular-nums">
                    {formatMoney(l.product.priceEur, currency)}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => setQty(l.product.slug, Number(e.target.value))}
                      className="h-11 w-16 rounded-[4px] border border-border bg-bg px-2 tabular-nums"
                      aria-label={t(locale, "product.qty")}
                    />
                    <button
                      type="button"
                      className="min-h-11 px-2 text-sm text-primary transition-colors hover:text-primary-hover"
                      onClick={() => remove(l.product.slug)}
                    >
                      {t(locale, "cart.remove")}
                    </button>
                  </div>
                </div>
                <p className="ml-auto text-lg font-semibold text-primary tabular-nums">
                  {formatMoney(lineTotal, currency)}
                </p>
              </li>
            );
          })}
        </ul>
        <aside className="h-fit rounded-[6px] border border-border bg-raised p-6 text-fg lg:sticky lg:top-24">
          <h2 className="font-display text-2xl">{t(locale, "cart.summary")}</h2>
          <p className="mt-2 text-sm text-muted">{etaText(country, locale)}</p>
          <dl className="mt-5 space-y-3 text-sm" aria-live="polite">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">{t(locale, "cart.goods")}</dt>
              <dd className="tabular-nums">{formatMoney(goods, currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">{t(locale, "cart.ship")}</dt>
              <dd className="tabular-nums">{formatMoney(ship, currency)}</dd>
            </div>
            <div className="hairline-soft flex items-baseline justify-between gap-4 border-t pt-4 text-base font-semibold">
              <dt>{t(locale, "cart.total")}</dt>
              <dd className="text-primary tabular-nums">{formatMoney(total, currency)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">{t(locale, "cart.shipNote")}</p>
          {/* Hediye / sipariş notu: diasporanın "anneme gönder" senaryosu (red team RT-A-12); Shopify'da cart note olur */}
          <label className="mt-5 block text-sm text-muted">
            {t(locale, "cart.note")}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder={t(locale, "cart.notePlaceholder")}
              className="mt-2 w-full rounded-[4px] border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint"
            />
          </label>
          {country === "NO" && hasCosmetic(lines) && !hasFood(lines) && (
            <p className="mt-3 text-xs text-muted">{t(locale, "cart.norwayCosmetic")}</p>
          )}
          {country === "NO" && hasFood(lines) ? (
            <p className="mt-6 border border-border bg-bg px-4 py-3 text-sm leading-relaxed text-muted">
              {t(locale, "cart.norwayBlock")}
            </p>
          ) : payments ? (
            <Button asChild variant="primary" className="mt-6 w-full">
              <LocaleLink to="/odeme">{t(locale, "cart.checkout")}</LocaleLink>
            </Button>
          ) : null}
          {/* Sepeti WhatsApp'la gönder: ödeme kapalıyken ve WhatsApp'çı kitle için ikinci yol (red team RT-A-13) */}
          <Button asChild variant="outline" className="mt-3 w-full">
            <a
              href={`${SHOP_WHATSAPP}?text=${encodeURIComponent(
                lines.map((l) => `${l.qty} × ${productName(l.product, locale)}`).join("\n") + `\n${pageOrigin()}/sepet`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, "cart.whatsapp")}
            </a>
          </Button>
        </aside>
      </div>
    </section>
  );
}

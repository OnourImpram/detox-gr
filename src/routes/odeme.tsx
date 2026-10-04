import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { useState } from "react";
import { LocaleLink } from "@/components/locale-link";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/lib/checkout";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { hasCosmetic, hasFood } from "@/lib/shipping";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";
import { goodsEur, linesFrom, useCurrency, useShop } from "@/lib/store";
import { shippingEur } from "@/lib/shipping";

export const Route = createFileRoute("/odeme")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: `${t(locale, "checkout.title")} | ${BRAND}`,
      description: t(locale, "checkout.lead"),
      path: "/odeme",
      locale,
      origin: pageOrigin(),
      noindex: true,
    });
  },
  component: Checkout,
});

function Checkout() {
  const cart = useShop((s) => s.cart);
  const note = useShop((s) => s.note);
  const country = useShop((s) => s.country);
  const locale = useLocale();
  const currency = useCurrency();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lines = linesFrom(cart);
  const goods = goodsEur(cart);
  const ship = shippingEur(country, lines);
  const norwayFood = country === "NO" && hasFood(lines);
  const missingPrice = lines.some((l) => l.product.priceEur == null);

  if (cart.length === 0) {
    return (
      <section className="px-[6vw] py-16">
        <h1 className="text-4xl">{t(locale, "cart.emptyTitle")}</h1>
        <LocaleLink to="/shop" className="mt-4 inline-block text-primary">
          {t(locale, "cart.back")}
        </LocaleLink>
      </section>
    );
  }

  async function pay() {
    setError(null);
    setBusy(true);
    try {
      const result = await startCheckout({
        data: {
          items: cart.map((c) => ({ slug: c.slug, qty: c.qty })),
          country,
          origin: window.location.origin,
          locale,
          email,
          name,
          note: note || undefined,
        },
      });
      if (!result.ok) {
        setError(t(locale, `checkout.err.${result.error}`));
        return;
      }
      window.location.href = result.url;
    } catch {
      setError(t(locale, "checkout.err.session"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="px-[6vw] py-10">
      <p className="kicker">{t(locale, "checkout.title")}</p>
      <h1 className="mt-3 text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "checkout.title")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t(locale, "checkout.lead")}</p>
      <p className="mt-2 max-w-xl text-sm text-muted">{t(locale, "checkout.methods")}</p>
      <p className="mt-2 max-w-xl text-sm text-muted">{t(locale, "cart.shipNote")}</p>
      {country === "NO" && !norwayFood && hasCosmetic(lines) && (
        <p className="mt-2 max-w-xl text-sm text-muted">{t(locale, "cart.norwayCosmetic")}</p>
      )}
      {norwayFood ? (
        <p className="mt-8 max-w-xl text-sm">{t(locale, "cart.norwayBlock")}</p>
      ) : missingPrice ? (
        <p className="mt-8 max-w-xl text-sm">{t(locale, "checkout.err.no_price")}</p>
      ) : (
        <form
          className="mt-8 max-w-lg space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void pay();
          }}
        >
          <label className="block text-sm">
            {t(locale, "checkout.name")}
            <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full border border-border bg-bg px-3" />
          </label>
          <label className="block text-sm">
            {t(locale, "checkout.email")}
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11 w-full border border-border bg-bg px-3" />
          </label>
          <p className="text-sm text-muted">{t(locale, "checkout.addressOnStripe")}</p>
          <p className="text-sm tabular-nums">
            {t(locale, "checkout.total", { total: formatMoney(goods + ship, currency, locale) })}
          </p>
          {error && <p className="text-sm text-primary">{error}</p>}
          <Button type="submit" variant="primary" disabled={busy} className="w-full">
            {busy ? t(locale, "checkout.wait") : t(locale, "checkout.submit")}
          </Button>
        </form>
      )}
    </section>
  );
}

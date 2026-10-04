import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useLocale } from "@/lib/use-locale";
import { usePaymentsEnabled } from "@/lib/payments";
import { LocaleLink } from "@/components/locale-link";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/lib/checkout";
import { t } from "@/lib/i18n";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";
import { linesFrom, useShop } from "@/lib/store";
import { saleBlockers } from "@/lib/commerce-policy";
import { ux } from "@/lib/storefront-copy";
export const Route = createFileRoute("/odeme")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({ title: `${t(locale, "checkout.title")} | ${BRAND}`, description: t(locale, "checkout.lead"), path: "/odeme", locale, origin: pageOrigin(), noindex: true });
  }, component: CheckoutLayout,
});
function CheckoutLayout() {
  const child = useRouterState({ select: state => state.matches.some(match => match.routeId === "/odeme/basarili" || match.routeId === "/odeme/iptal") });
  return child ? <Outlet /> : <Checkout />;
}
function Checkout() {
  const cart = useShop(state => state.cart);
  const note = useShop(state => state.note);
  const country = useShop(state => state.country);
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lines = linesFrom(cart);
  const eligible = lines.length > 0 && lines.every(line => saleBlockers(line.product, country, line.qty).length === 0);
  async function pay() {
    if (busy || !payments || !eligible) return;
    setError(null); setBusy(true);
    try {
      const result = await startCheckout({ data: { items: cart, country, origin: window.location.origin, locale, email, name, note: note || undefined } });
      if (!result.ok) { setError(t(locale, `checkout.err.${result.error}`)); return; }
      const next = new URL(result.url);
      if (next.protocol !== "https:") throw new Error("Invalid checkout URL");
      window.location.assign(next.href);
    } catch { setError(t(locale, "checkout.err.session")); }
    finally { setBusy(false); }
  }
  return <section className="dt-container dt-checkout"><p className="kicker"><LockKeyhole size={17} aria-hidden="true" />Shopify Checkout</p><h1>{t(locale, "checkout.title")}</h1>
    {!payments || !eligible ? <><p className="dt-notice">{ux(locale, payments ? "pendingSale" : "previewBody")}</p><Button asChild variant="outline"><LocaleLink to="/sepet">{payments ? t(locale, "nav.cart") : ux(locale, "selection")}</LocaleLink></Button></> : <form onSubmit={event => { event.preventDefault(); void pay(); }} className="dt-checkout__form">
      <label>{t(locale, "checkout.name")}<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>
      <label>{t(locale, "checkout.email")}<input required type="email" maxLength={120} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
      <p>Shopify Checkout</p>
      {error && <p role="alert" className="dt-notice">{error}</p>}
      <Button type="submit" variant="primary" disabled={busy}>{busy ? t(locale, "checkout.wait") : t(locale, "cart.checkout")}<ArrowRight size={17} aria-hidden="true" /></Button>
    </form>}
  </section>;
}

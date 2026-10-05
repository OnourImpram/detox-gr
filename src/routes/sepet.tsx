import { useStorefrontHref } from "@/lib/use-storefront-href";
import { useState, useEffect } from "react";
import { QuantityPicker } from "@/components/quantity-picker";
import { lineAmountCents } from "@/lib/list-quantity";
import { refinement } from "@/lib/refinement-copy";
import { mediaCopy } from "@/lib/media-copy";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MessageCircle, ShoppingBag, Trash2, Copy, Check } from "lucide-react";
import { usePaymentsEnabled } from "@/lib/payments";
import { useLocale } from "@/lib/use-locale";
import { ProductMedia } from "@/components/product-media";
import { LocaleLink } from "@/components/locale-link";
import { Button } from "@/components/ui/button";
import { countryName, productName, t } from "@/lib/i18n";
import { formatMoney, formatListed } from "@/lib/money";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";
import { goodsEur, linesFrom, useCurrency, useShop } from "@/lib/store";
import { saleBlockers } from "@/lib/commerce-policy";
import { ux } from "@/lib/storefront-copy";
import { SHOP_WHATSAPP } from "@/lib/shop-facts";
export const Route = createFileRoute("/sepet")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({ title: `${ux(locale, "selection")} | ${BRAND}`, description: ux(locale, "previewBody"), path: "/sepet", locale, origin: pageOrigin(), noindex: true });
  }, component: CartPage,
});
function CartPage() {
  const cart = useShop(state => state.cart);
  const country = useShop(state => state.country);
  const setQty = useShop(state => state.setQty);
  const remove = useShop(state => state.remove);
  const note = useShop(state => state.note);
  const setNote = useShop(state => state.setNote);
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  const currency = useCurrency();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showText, setShowText] = useState(false);
  const lines = linesFrom(cart);
  const goods = goodsEur(cart);
  const canBuy = payments && lines.length > 0 && lines.every(line => saleBlockers(line.product, country, line.qty).length === 0);
  const unpriced = lines.some(line => line.product.priceEur === null);
  const number = new Intl.NumberFormat(locale === "no" ? "nb" : locale);
  function requested(qty: number, unit: string) { return unit === "kg" ? `${number.format(qty < 1 ? qty*1000 : qty)} ${qty < 1 ? "g" : "kg"}` : `${qty} ${refinement(locale,"pieces")}`; }
  const title = payments ? t(locale, "cart.title") : ux(locale, "selection");
  // A local cart URL cannot transfer the list to the shop. Include actual lines instead.
  // Clicking opens the customer's own messaging app. It does not send a message automatically.
  const shareUrl = useStorefrontHref(`/shop?lang=${locale}`);
  const inquiry = `${title}\n${countryName(country, locale)}\n\n${lines.map(line => `${requested(line.qty,line.product.unit)} × ${productName(line.product, locale)} (${line.product.sourceId})`).join("\n")}\n${note ? `\n${note}\n` : ""}\n${shareUrl}`;
  useEffect(() => {setCopied(false);}, [inquiry]);
  async function copyList() {
    try { await navigator.clipboard.writeText(inquiry); setCopied(true); setCopyError(false); }
    catch { setShowText(true); setCopyError(true); }
  }
  return <section className="dt-container dt-cart">
    <LocaleLink to="/shop" className="dt-text-link"><ArrowLeft size={17} aria-hidden="true" />{t(locale, "cart.back")}</LocaleLink>
    <h1>{title}</h1>
    {lines.length === 0 ? <div className="dt-empty"><ShoppingBag size={34} aria-hidden="true" /><p>{t(locale, "cart.emptyTitle")}</p><Button asChild variant="primary"><LocaleLink to="/shop">{t(locale, "home.cta")}<ArrowRight size={17} aria-hidden="true" /></LocaleLink></Button></div> : <div className="dt-cart__layout">
      <ul className="dt-cart__lines">{lines.map(line => <li className="dt-cart-line" key={line.product.sourceId}>
        <LocaleLink to="/p/$slug" params={{ slug: line.product.slug }} className="dt-cart-line__image"><ProductMedia product={line.product} sizes="96px" caption={false} compact /></LocaleLink>
        <div className="dt-cart-line__body"><LocaleLink to="/p/$slug" params={{ slug: line.product.slug }} className="dt-cart-line__title">{productName(line.product, locale)}</LocaleLink><p>{line.product.sourceId}</p><p>{line.product.priceEur === null ? mediaCopy(locale,"askPrice") : formatListed(line.product.priceEur, line.product.unit, currency, locale)}</p><div className="dt-cart-line__controls"><QuantityPicker value={line.qty} unit={line.product.unit} name={productName(line.product,locale)} compact onChange={value => {setQty(line.product.slug,value);setCopied(false);}} /><button type="button" onClick={() => remove(line.product.slug)}><Trash2 size={16} aria-hidden="true" />{t(locale, "cart.remove")}</button></div></div>
        <p className="dt-cart-line__total">{line.product.priceEur === null ? mediaCopy(locale,"askPrice") : formatMoney((lineAmountCents(line.product.priceEur,line.qty) ?? 0)/100,currency,locale)}</p>
      </li>)}</ul>
      <aside className="dt-cart__summary"><h2>{t(locale, "cart.summary")}</h2><dl><div><dt>{refinement(locale,"subtotal")}</dt><dd>{formatMoney(goods, currency, locale)}</dd></div><div><dt>{t(locale, "nav.country")}</dt><dd>{countryName(country, locale)}</dd></div></dl>
        <p className="dt-price-note">{ux(locale, lines.every(line => line.product.info?.vatIncluded === true) ? "vatIncluded" : "referencePrice")}</p>
        {unpriced && <p className="rf-request-note">{refinement(locale,"unpriced")}</p>}
        <p className="rf-request-note">{refinement(locale,"requestNote")}</p>
        <label className="dt-note-label">{t(locale, "cart.note")}<textarea rows={3} maxLength={300} value={note} onChange={event => setNote(event.target.value)} placeholder={t(locale, "cart.notePlaceholder")} /></label>
        {payments && !canBuy && <p className="dt-notice">{ux(locale, "pendingSale")}</p>}
        {canBuy && <Button asChild variant="primary"><LocaleLink to="/odeme">{t(locale, "cart.checkout")}<ArrowRight size={17} aria-hidden="true" /></LocaleLink></Button>}
        <Button asChild variant="outline"><a href={`${SHOP_WHATSAPP}?text=${encodeURIComponent(inquiry)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />{t(locale, "product.askWhatsApp")}<span className="sr-only"> ({t(locale, "nav.external")})</span></a></Button>
        <div className="rf-list-tools"><button type="button" onClick={() => {void copyList();}}>{copied ? <Check size={16} aria-hidden="true"/> : <Copy size={16} aria-hidden="true"/>}{refinement(locale,copied?"copied":"copy")}</button><button type="button" aria-expanded={showText} onClick={()=>setShowText(value=>!value)}>{refinement(locale,"message")}</button></div>
        <p className="sr-only" role="status">{copied?refinement(locale,"copied"):""}</p>
        {copyError && <p role="status" className="rf-request-note">{refinement(locale,"copyError")}</p>}
        {showText && <textarea className="rf-message-text" readOnly rows={8} aria-label={refinement(locale,"message")} value={inquiry} onFocus={event=>event.target.select()}/>}
      </aside>
    </div>}
  </section>;
}

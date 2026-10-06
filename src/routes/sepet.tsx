import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePaymentsEnabled } from '@/lib/payments';
import { useLocale } from '@/lib/use-locale';
import { ProductMedia } from '@/components/product-media';
import { MessageActions } from '@/components/message-actions';
import { LocaleLink } from '@/components/locale-link';
import { Button } from '@/components/ui/button';
import { countryName, productName, t } from '@/lib/i18n';
import { formatMoney, formatListed } from '@/lib/money';
import { localeFromSearch, pageOrigin, seoHead, BRAND } from '@/lib/seo';
import { linesFrom, useCurrency, useShop } from '@/lib/store';
import { COUNTRIES } from '@/lib/markets';
import { saleBlockers, MAX_ITEM_QUANTITY } from '@/lib/commerce-policy';
import { requestLine, selectionSummary } from '@/lib/selection-request';
import { ux } from '@/lib/storefront-copy';
import { r } from '@/lib/refinement-copy';
import { mediaCopy } from '@/lib/media-copy';
export const Route = createFileRoute('/sepet')({
  head: ({ match }) => { const locale = localeFromSearch(match.search); return seoHead({ title: `${ux(locale, 'selection')} | ${BRAND}`, description: ux(locale, 'previewBody'), path: '/sepet', locale, origin: pageOrigin(), noindex: true }); }, component: CartPage,
});
function CartPage() {
  const cart = useShop(state => state.cart);
  const country = useShop(state => state.country);
  const setCountry = useShop(state => state.setCountry);
  const setQty = useShop(state => state.setQty);
  const remove = useShop(state => state.remove);
  const add = useShop(state => state.add);
  const note = useShop(state => state.note);
  const setNote = useShop(state => state.setNote);
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  const currency = useCurrency();
  const lines = linesFrom(cart);
  const summary = selectionSummary(lines.map(line => ({ priceEur: line.product.priceEur, qty: line.qty })));
  const canBuy = payments && lines.length > 0 && lines.every(line => saleBlockers(line.product, country, line.qty).length === 0);
  const title = payments ? t(locale, 'cart.title') : ux(locale, 'selection');
  const inquiry = `${title}\n${countryName(country, locale)} (${country})\n\n${lines.map(line => requestLine({ name: productName(line.product, locale), sourceId: line.product.sourceId, qty: line.qty, unit: line.product.unit })).join('\n')}${note ? `\n\n${note}` : ''}\n\n${pageOrigin()}/shop?lang=${locale}`;
  function removeLine(slug: string, qty: number, name: string) {
    remove(slug);
    toast(`${name}. ${t(locale, 'cart.remove')}`, { action: { label: r(locale, 'undo'), onClick: () => { const result = add(slug, qty); if (result !== 'ok') toast(t(locale, result === 'norway_food' ? 'cart.norwayBlock' : 'checkout.err.unknown')); } } });
  }
  return <section className="dt-container dt-cart">
    <LocaleLink to="/shop" className="dt-text-link"><ArrowLeft size={17} aria-hidden="true" />{t(locale, 'cart.back')}</LocaleLink><h1>{title}</h1>
    {!payments && <p className="customer-selection-note">{r(locale, 'selectionHelp')}</p>}
    {lines.length === 0 ? <div className="dt-empty"><ShoppingBag size={34} aria-hidden="true" /><p>{t(locale, 'cart.emptyTitle')}</p><Button asChild variant="primary"><LocaleLink to="/shop">{t(locale, 'home.cta')}<ArrowRight size={17} aria-hidden="true" /></LocaleLink></Button></div> : <div className="dt-cart__layout">
      <ul className="dt-cart__lines">{lines.map(line => <li className="dt-cart-line" key={line.product.sourceId}>
        <LocaleLink to="/p/$slug" params={{ slug: line.product.slug }} className="dt-cart-line__image"><ProductMedia product={line.product} sizes="96px" compact caption={false} /></LocaleLink>
        <div className="dt-cart-line__body"><LocaleLink to="/p/$slug" params={{ slug: line.product.slug }} className="dt-cart-line__title">{productName(line.product, locale)}</LocaleLink><p>{line.product.sourceId}</p><p>{line.product.priceEur === null ? mediaCopy(locale, 'askPrice') : formatListed(line.product.priceEur, line.product.unit, currency, locale)}</p>
          <div className="dt-cart-line__controls"><label><span>{r(locale, line.product.unit === 'kg' ? 'kg' : 'items')}</span><input type="number" inputMode="numeric" aria-label={`${r(locale, line.product.unit === 'kg' ? 'kg' : 'items')}. ${productName(line.product, locale)}`} min={1} max={MAX_ITEM_QUANTITY} step={1} value={line.qty} onChange={event => setQty(line.product.slug, Number(event.target.value))} /></label><button type="button" onClick={() => removeLine(line.product.slug, line.qty, productName(line.product, locale))}><Trash2 size={16} aria-hidden="true" />{t(locale, 'cart.remove')}</button></div>
        </div><p className="dt-cart-line__total">{line.product.priceEur === null ? mediaCopy(locale, 'askPrice') : formatMoney(line.product.priceEur * line.qty, currency, locale)}</p>
      </li>)}</ul>
      <aside className="dt-cart__summary"><h2>{t(locale, 'cart.summary')}</h2><dl><div><dt>{summary.unknownLines ? r(locale, 'partialTotal') : t(locale, 'cart.goods')}</dt><dd>{formatMoney(summary.knownTotal, currency, locale)}</dd></div></dl>
        <p className="dt-price-note">{ux(locale, lines.every(line => line.product.info?.vatIncluded === true) ? 'vatIncluded' : 'referencePrice')}</p>
        {summary.unknownLines > 0 && <p className="customer-unknown-price">{r(locale, 'unknownPrices', { n: summary.unknownLines })}</p>}
        <label className="customer-destination">{t(locale, 'nav.country')}<select value={country} onChange={event => setCountry(event.target.value as typeof country)}>{COUNTRIES.map(item => <option key={item.code} value={item.code}>{countryName(item.code, locale)}</option>)}</select></label>
        {country === 'NO' && lines.some(line => line.product.klass === 'food') && <p className="dt-notice">{t(locale, 'cart.norwayBlock')}</p>}
        <label className="dt-note-label">{t(locale, 'cart.note')}<textarea rows={3} maxLength={300} value={note} onChange={event => setNote(event.target.value)} placeholder={t(locale, 'cart.notePlaceholder')} /><small>{note.length} / 300</small></label>
        {payments && !canBuy && <p className="dt-notice">{ux(locale, 'pendingSale')}</p>}
        {canBuy && <Button asChild variant="primary"><LocaleLink to="/odeme">{t(locale, 'cart.checkout')}<ArrowRight size={17} aria-hidden="true" /></LocaleLink></Button>}
        <MessageActions message={inquiry} testId="selection-inquiry" />
      </aside>
    </div>}
  </section>;
}

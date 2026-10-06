import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { LocaleLink } from './locale-link';
import { ProductMedia } from './product-media';
import { useLocale } from '@/lib/use-locale';
import type { Product } from '@/lib/catalog';
import type { DiscoverySearch } from '@/lib/discovery';
import { categoryTitle, productName, t } from '@/lib/i18n';
import { formatListed } from '@/lib/money';
import { useShop } from '@/lib/store';
import { usePaymentsEnabled } from '@/lib/payments';
import { saleBlockers } from '@/lib/commerce-policy';
import { ux } from '@/lib/storefront-copy';
import { mediaCopy } from '@/lib/media-copy';

export function ProductCard({ product, discovery }: { product: Product; discovery?: DiscoverySearch }) {
  const locale = useLocale();
  const name = productName(product, locale);
  const payments = usePaymentsEnabled();
  const country = useShop(state => state.country);
  const count = useShop(state => state.cart.find(line => line.slug === product.slug)?.qty ?? 0);
  const add = useShop(state => state.add);
  const blocked = payments ? saleBlockers(product, country, count + 1).length > 0 : country === 'NO' && product.klass === 'food';
  function addOne() {
    const result = add(product.slug);
    toast(result === 'ok' ? ux(locale, 'listAdded') : t(locale, result === 'norway_food' ? 'cart.norwayBlock' : 'checkout.err.unknown'));
  }
  return <article className="dt-product-card v3-product-card" data-product-id={product.sourceId}>
    <LocaleLink to="/p/$slug" params={{ slug: product.slug }} search={discovery} className="dt-product-card__link" aria-label={`${name}. ${mediaCopy(locale, 'view')}`}>
      <ProductMedia product={product} sizes="(min-width: 1200px) 22vw, (min-width: 640px) 29vw, 44vw" />
      <div className="dt-product-card__body"><div className="v3-product-card__details"><p className="dt-product-card__shelf">{t(locale, product.houseNamed ? 'product.made' : 'product.picked')}</p><h3>{name}</h3><p className="dt-product-card__category">{categoryTitle(product.category, locale)}</p>{product.net && <p className="dt-product-card__quantity">{new Intl.NumberFormat(locale).format(product.net.value)} {product.net.unit}</p>}</div>
        <div className="v3-product-card__purchase"><div><p className="dt-product-card__price">{product.priceEur === null ? mediaCopy(locale, 'askPrice') : formatListed(product.priceEur, product.unit, 'EUR', locale)}</p>{product.priceEur !== null && <p className="dt-product-card__price-note">{ux(locale, product.publish && product.info?.vatIncluded === true ? 'vatIncluded' : 'referencePrice')}</p>}</div><ArrowUpRight size={18} aria-hidden="true" /></div>
      </div>
    </LocaleLink>
    <button className="customer-quick-add" type="button" onClick={addOne} disabled={blocked || count >= 20} aria-label={`${ux(locale, 'addToList')}. ${name}`} data-testid="quick-add">{count ? <><Check size={15} aria-hidden="true" /><span>{count}</span></> : <Plus size={18} aria-hidden="true" />}</button>
  </article>;
}

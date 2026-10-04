import { ArrowUpRight } from 'lucide-react';
import { LocaleLink } from './locale-link';
import { ProductMedia } from './product-media';
import { useLocale } from '@/lib/use-locale';
import type { Product } from '@/lib/catalog';
import { categoryTitle, productName, t } from '@/lib/i18n';
import { formatListed } from '@/lib/money';
import { ux } from '@/lib/storefront-copy';
import { mediaCopy } from '@/lib/media-copy';

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const name = productName(product, locale);
  return <article className="dt-product-card v3-product-card" data-product-id={product.sourceId}>
    <LocaleLink to="/p/$slug" params={{ slug: product.slug }} className="dt-product-card__link" aria-label={`${name}. ${mediaCopy(locale, 'view')}`}>
      <ProductMedia product={product} sizes="(min-width: 1200px) 22vw, (min-width: 640px) 29vw, 44vw" />
      <div className="dt-product-card__body">
        <div className="v3-product-card__details">
          <p className="dt-product-card__shelf">{t(locale, product.houseNamed ? 'product.made' : 'product.picked')}</p>
          <h3>{name}</h3>
          <p className="dt-product-card__category">{categoryTitle(product.category, locale)}</p>
          {product.net && <p className="dt-product-card__quantity">{new Intl.NumberFormat(locale).format(product.net.value)} {product.net.unit}</p>}
        </div>
        <div className="v3-product-card__purchase">
          <div><p className="dt-product-card__price">{product.priceEur === null ? mediaCopy(locale, 'askPrice') : formatListed(product.priceEur, product.unit, 'EUR', locale)}</p>
          {product.priceEur !== null && <p className="dt-product-card__price-note">{ux(locale, product.publish && product.info?.vatIncluded === true ? 'vatIncluded' : 'referencePrice')}</p>}</div>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
      </div>
    </LocaleLink>
  </article>;
}

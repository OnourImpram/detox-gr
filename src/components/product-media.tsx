import { useState } from 'react';
import { Camera } from 'lucide-react';
import { productMedia } from '@/lib/product-media';
import { assetUrl } from '@/lib/product-media-policy';
import { mediaCopy } from '@/lib/media-copy';
import { useLocale } from '@/lib/use-locale';
import { categoryTitle, productName } from '@/lib/i18n';
import type { Product } from '@/lib/catalog';

type Props = { product: Product; sizes?: string; priority?: boolean; className?: string; caption?: boolean; compact?: boolean };
export function ProductMedia({ product, sizes = '100vw', priority = false, className = '', caption = true, compact = false }: Props) {
  const locale = useLocale();
  const media = productMedia(product);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = media.src !== null && failedSrc === media.src;
  const kind = failed ? 'pending' : media.kind;
  const url = (path: string) => assetUrl(path, import.meta.env.BASE_URL);
  return <figure className={`v3-product-media ${className} ${compact ? 'is-compact' : ''}`} data-media-kind={kind} data-media-for={product.sourceId}>
    <div className="v3-product-media__surface">
      {media.src && !failed ? <img
        src={url(media.src)}
        srcSet={media.variants.length ? media.variants.map(variant => `${url(variant.src)} ${variant.width}w`).join(', ') : undefined}
        sizes={sizes} width={media.width} height={media.height}
        alt={`${productName(product, locale)}. ${mediaCopy(locale, kind)}.`}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async"
        onError={() => setFailedSrc(media.src)}
      /> : <div className="v3-product-media__pending" role="img" aria-label={mediaCopy(locale, 'pending')}>
        <Camera size={compact ? 21 : 30} strokeWidth={1} aria-hidden="true" />
        {!compact && <><span className="v3-product-media__category">{categoryTitle(product.category, locale)}</span><span>{mediaCopy(locale, 'pending')}</span><small>{product.sourceId}</small></>}
      </div>}
    </div>
    {caption && <figcaption>{mediaCopy(locale, kind)}</figcaption>}
  </figure>;
}

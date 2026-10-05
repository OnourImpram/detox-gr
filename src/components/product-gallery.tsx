import { useId, useState } from 'react';
import type { Product } from '@/lib/catalog';
import { productGallery } from '@/lib/product-media';
import { assetUrl } from '@/lib/product-media-policy';
import { useLocale } from '@/lib/use-locale';
import { mediaCopy } from '@/lib/media-copy';
import { sceneCopy } from '@/lib/scene-copy';
import { ProductMedia } from './product-media';

export function ProductGallery({ product }: { product: Product }) {
  const locale = useLocale();
  const items = productGallery(product);
  const [index, setIndex] = useState(0);
  const media = items[index] ?? items[0];
  const panel = useId();
  return <div className="dt-pdp__figure" data-testid="product-gallery">
    <div id={panel}><ProductMedia product={product} media={media} priority sizes="(min-width: 1024px) 48vw, 90vw" className="v3-pdp-media" /></div>
    {items.length > 1 && <div className="scene-thumbnails" role="group" aria-label={sceneCopy(locale,'alternatives')}>
      {items.map((item, i) => <button key={item.src ?? 'pending'} type="button" aria-pressed={media.src===item.src}
        aria-controls={panel} aria-label={`${sceneCopy(locale,'alternatives')}. ${i+1} / ${items.length}. ${mediaCopy(locale,item.kind)}`}
        onClick={() => setIndex(i)}>
        {item.src && <img src={assetUrl(item.variants[0]?.src ?? item.src,import.meta.env.BASE_URL)} alt="" width={120} height={90} loading="lazy" />}
        <span aria-hidden="true">{i+1}</span>
      </button>)}
    </div>}
    {media.kind !== 'verified' && <p className="v3-media-disclosure">{mediaCopy(locale,media.kind==='illustration'?'disclosure':media.kind==='reference'?'referenceDisclosure':'pendingBody')}</p>}
  </div>;
}

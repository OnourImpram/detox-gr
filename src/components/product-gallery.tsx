import { trapDialogTab } from '@/lib/dialog-focus';
import { useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { productGallery } from '@/lib/product-media';
import { assetUrl } from '@/lib/product-media-policy';
import { useLocale } from '@/lib/use-locale';
import { productName } from '@/lib/i18n';
import { mediaCopy } from '@/lib/media-copy';
import { sceneCopy } from '@/lib/scene-copy';
import { r } from '@/lib/refinement-copy';
import { ProductMedia } from './product-media';

export function ProductGallery({ product }: { product: Product }) {
  const locale = useLocale();
  const items = productGallery(product);
  const [index, setIndex] = useState(0);
  const media = items[index] ?? items[0];
  const panel = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  function close() { dialog.current?.close(); opener.current?.focus({ preventScroll: true }); }
  function move(delta: number) { setIndex(current => (current + delta + items.length) % items.length); }
  return <div className="dt-pdp__figure" data-testid="product-gallery">
    <div id={panel} className="customer-gallery-main"><ProductMedia product={product} media={media} priority sizes="(min-width: 1024px) 48vw, 90vw" className="v3-pdp-media" />{media.src && <button type="button" className="customer-zoom-button" ref={opener} onClick={() => dialog.current?.showModal()} aria-label={r(locale, 'zoom')}><Expand size={20} aria-hidden="true" /></button>}</div>
    {items.length > 1 && <div className="scene-thumbnails" role="group" aria-label={sceneCopy(locale, 'alternatives')}>{items.map((item, i) => <button key={item.src ?? 'pending'} type="button" aria-pressed={media.src === item.src} aria-controls={panel} aria-label={`${sceneCopy(locale, 'alternatives')}. ${i + 1} / ${items.length}. ${mediaCopy(locale, item.kind)}`} onClick={() => setIndex(i)}>{item.src && <img src={assetUrl(item.variants[0]?.src ?? item.src, import.meta.env.BASE_URL)} alt="" width={120} height={90} loading="lazy" />}<span aria-hidden="true">{i + 1}</span></button>)}</div>}
    {media.kind !== 'verified' && <p className="v3-media-disclosure">{mediaCopy(locale, media.kind === 'illustration' ? 'disclosure' : media.kind === 'reference' ? 'referenceDisclosure' : 'pendingBody')}</p>}
    <dialog ref={dialog} className="customer-zoom" aria-labelledby={`${panel}-title`} onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => { trapDialogTab(event); if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } }}>
      <header><h2 id={`${panel}-title`}>{productName(product, locale)}</h2><button type="button" onClick={close} aria-label={r(locale, 'close')}><X size={24} aria-hidden="true" /></button></header>
      <ProductMedia product={product} media={media} sizes="90vw" className="customer-zoom-media" />
      {items.length > 1 && <div className="customer-zoom-controls"><button type="button" onClick={() => move(-1)} aria-label={`${sceneCopy(locale, 'alternatives')}, ${index === 0 ? items.length : index}`}><ChevronLeft size={23} aria-hidden="true" /></button><span aria-live="polite">{index + 1} / {items.length}</span><button type="button" onClick={() => move(1)} aria-label={`${sceneCopy(locale, 'alternatives')}, ${(index + 1) % items.length + 1}`}><ChevronRight size={23} aria-hidden="true" /></button></div>}
    </dialog>
  </div>;
}

import { useEffect, useId, useRef, useState } from 'react';
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { productGallery } from '@/lib/product-media';
import { assetUrl } from '@/lib/product-media-policy';
import { useLocale } from '@/lib/use-locale';
import { mediaCopy } from '@/lib/media-copy';
import { sceneCopy } from '@/lib/scene-copy';
import { b } from '@/lib/brand-copy';
import { productName } from '@/lib/i18n';
import { ProductMedia } from './product-media';

export function ProductGallery({ product }: { product: Product }) {
  const locale = useLocale();
  const items = productGallery(product);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const media = items[index] ?? items[0];
  const panel = useId();
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (expanded && element && !element.open) element.showModal();
    if (!expanded && element?.open) element.close();
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [expanded]);
  const description = media.kind === 'illustration' ? 'disclosure' : media.kind === 'reference' ? 'referenceDisclosure' : 'pendingBody';
  function move(delta: number) { setIndex(value => (value + delta + items.length) % items.length); }
  return <div className="dt-pdp__figure" data-testid="product-gallery">
    <div id={panel} className="rf-product-image-wrap">
      <ProductMedia product={product} media={media} priority sizes="(min-width: 1024px) 48vw, 90vw" className="v3-pdp-media" />
      {media.src && <button ref={opener} type="button" className="rf-enlarge" aria-label={b(locale, 'archive.open')} aria-haspopup="dialog" onClick={() => setExpanded(true)}><Expand size={19} aria-hidden="true" /><span>{b(locale, 'archive.open')}</span></button>}
    </div>
    {items.length > 1 && <div className="scene-thumbnails" role="group" aria-label={sceneCopy(locale,'alternatives')}>
      {items.map((item, i) => <button key={item.src ?? 'pending'} type="button" aria-pressed={media.src===item.src}
        aria-controls={panel} aria-label={`${sceneCopy(locale,'alternatives')}. ${i+1} / ${items.length}. ${mediaCopy(locale,item.kind)}`}
        onClick={() => setIndex(i)}>
        {item.src && <img src={assetUrl(item.variants[0]?.src ?? item.src,import.meta.env.BASE_URL)} alt="" width={120} height={90} loading="lazy" />}
        <span aria-hidden="true">{i+1}</span>
      </button>)}
    </div>}
    {media.kind !== 'verified' && <p className="v3-media-disclosure">{mediaCopy(locale,description)}</p>}
    <dialog ref={dialog} className="rf-product-dialog" aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); setExpanded(false); }}
      onClose={() => { setExpanded(false); opener.current?.focus(); }}
      onClick={event => { if (event.target === dialog.current) setExpanded(false); }}
      onKeyDown={event => {
        if (event.key === 'Tab') {
          // Explicit boundary wrapping keeps focus in the viewer rather than browser chrome.
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (first && last && ((!event.shiftKey && document.activeElement === last) || (event.shiftKey && document.activeElement === first))) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
          }
        }
        if (items.length > 1 && ['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
      }}>
      {expanded && <div className="rf-product-dialog__body">
        <div className="rf-product-dialog__header"><h2 id={titleId}>{productName(product,locale)}</h2><button autoFocus type="button" className="rf-dialog-close" aria-label={b(locale,'archive.close')} onClick={() => setExpanded(false)}><X size={23} aria-hidden="true" /></button></div>
        <ProductMedia product={product} media={media} priority sizes="(min-width: 1440px) 1280px, 94vw" className="rf-product-full" />
        {items.length > 1 && <div className="rf-zoom-controls" role="group" aria-label={sceneCopy(locale,'alternatives')}>
          <button type="button" aria-label={`${sceneCopy(locale,'alternatives')}. ${(index-1+items.length)%items.length+1} / ${items.length}`} onClick={() => move(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
          <p aria-live="polite">{index+1} / {items.length}</p>
          <button type="button" aria-label={`${sceneCopy(locale,'alternatives')}. ${(index+1)%items.length+1} / ${items.length}`} onClick={() => move(1)}><ChevronRight size={22} aria-hidden="true" /></button>
        </div>}
        {media.kind !== 'verified' && <p className="v3-media-disclosure">{mediaCopy(locale,description)}</p>}
      </div>}
    </dialog>
  </div>;
}

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { X, Expand, ArrowDown } from 'lucide-react';
import { ARCHIVE_PHOTOS, PHOTO_GROUPS, type ArchivePhotoRecord, type PhotoGroup } from '@/lib/photo-archive';
import { ArchivePhoto } from '@/components/archive-photo';
import { EditorialHeader } from '@/components/editorial';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
import { Button } from '@/components/ui/button';
export const Route = createFileRoute('/raf')({
  head: ({ match }) => {const locale = localeFromSearch(match.search);return seoHead({ title: `${b(locale, 'archive.title')} | Detoks`, description: b(locale, 'archive.lead'), path: '/raf', locale, origin: pageOrigin() });},component: Archive,
});
function Archive() {
  const locale = useLocale();
  const [group, setGroup] = useState<PhotoGroup | 'all'>('all');
  const [limit, setLimit] = useState(24);
  const [selected, setSelected] = useState<ArchivePhotoRecord | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const matching = ARCHIVE_PHOTOS.filter(photo => group === 'all' || photo.group === group);
  useEffect(() => {
    const element = dialog.current;
    if (selected && element && !element.open) element.showModal();
    if (!selected && element?.open) element.close();
  }, [selected]);
  function close() { setSelected(null); opener.current?.focus(); }
  return <section className="ed-container ed-archive-page"><EditorialHeader title="archive.title" lead="archive.lead" kicker="photo.source" />
    <p className="ed-archive-note">{b(locale, 'archive.note')}</p>
    <fieldset className="ed-gallery-filter"><legend className="sr-only">{b(locale, 'archive.title')}</legend>{(['all',...PHOTO_GROUPS] as const).map(key => <button key={key} type="button" aria-pressed={group === key} onClick={() => {setGroup(key);setLimit(24);}}>{key === 'all' ? b(locale, 'archive.all') : b(locale, `group.${key}`)}</button>)}</fieldset>
    <p className="ed-gallery-counter" aria-live="polite">{b(locale, 'archive.counter', { shown: Math.min(limit,matching.length), total: matching.length })}</p>
    <div className="ed-gallery-grid">{matching.slice(0,limit).map(photo => <article key={photo.id} data-photo-id={photo.id}>
      <button type="button" aria-label={`${b(locale, 'archive.open')}. ${photo.original}`} onClick={event => {opener.current = event.currentTarget;setSelected(photo);}}><ArchivePhoto original={photo} caption={false} sizes="(min-width: 1200px) 25vw, (min-width: 640px) 33vw, 50vw" /><span className="ed-expand" aria-hidden="true"><Expand size={18} /></span></button>
      <div><h2>{b(locale, `group.${photo.group as PhotoGroup}`)}</h2><p>{photo.original.replace('.JPG','')}</p></div>
    </article>)}</div>
    {limit < matching.length && <div className="ed-more"><Button variant="outline" onClick={() => setLimit(value => value + 24)}>{b(locale, 'archive.more')}<ArrowDown size={17} aria-hidden="true" /></Button></div>}
    <dialog ref={dialog} className="ed-photo-dialog" onCancel={event => {event.preventDefault();close();}} onClose={() => {setSelected(null);opener.current?.focus();}} onClick={event => { if(event.target === dialog.current) close(); }} aria-labelledby="photo-dialog-title">
      {selected && <div><button autoFocus type="button" className="ed-dialog-close" aria-label={b(locale, 'archive.close')} onClick={close}><X size={24} aria-hidden="true" /></button><h2 id="photo-dialog-title">{b(locale, `group.${selected.group as PhotoGroup}`)} · {selected.original.replace('.JPG','')}</h2><ArchivePhoto original={selected} sizes="90vw" priority /><p>{b(locale, 'photo.pending')}</p></div>}
    </dialog>
  </section>;
}

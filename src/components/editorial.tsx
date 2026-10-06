import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { b, type BrandKey } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EDITORIAL_PHOTOS } from '@/lib/photo-archive';
import { ArchivePhoto } from './archive-photo';
import { LocaleLink } from './locale-link';
import { Button } from './ui/button';

export const JOURNAL = [
  { slug: 'etiketin-anlattiklari', key: 'note1', image: EDITORIAL_PHOTOS.seeds },
  { slug: 'dusunulmus-bir-hediye', key: 'note2', image: EDITORIAL_PHOTOS.rose },
  { slug: 'gumulcinede-bir-dukkan', key: 'note3', image: EDITORIAL_PHOTOS.star },
] as const;
export function EditorialHeader({ title, lead, kicker, image, visual }: { title: BrandKey; lead: BrandKey; kicker?: BrandKey; image?: string; visual?: ReactNode }) {
  const locale = useLocale();
  return <header className={`ed-page-header ${image || visual ? 'with-image' : ''}`}>
    <div>{kicker && <p className="ed-eyebrow">{b(locale, kicker)}</p>}<h1>{b(locale, title)}</h1><p className="ed-lead">{b(locale, lead)}</p></div>
    {visual ?? (image && <ArchivePhoto original={image} priority sizes="(min-width: 900px) 40vw, 100vw" />)}
  </header>;
}
export function ProcessSteps() {
  const locale = useLocale();
  return <section className="ed-process ed-container"><div className="ed-section-heading"><h2>{b(locale, 'process.title')}</h2></div>
    <ol>{(['one', 'two', 'three'] as const).map((step, index) => <li key={step}><span className="ed-step-number" aria-hidden="true">{index + 1}</span><div><h3>{b(locale, `process.${step}Title`)}</h3><p>{b(locale, `process.${step}Body`)}</p></div></li>)}</ol>
  </section>;
}
export function JournalCards({ heading = true, compact = false }: { heading?: boolean; compact?: boolean }) {
  const locale = useLocale();
  return <section className={`ed-journal ed-container ${compact ? "is-compact" : ""}`}>
    {heading && <div className="ed-section-heading"><div><h2>{b(locale, 'journal.title')}</h2><p>{b(locale, 'journal.lead')}</p></div><LocaleLink to="/notlar" className="ed-link">{b(locale, 'journal.back')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div>}
    <div className="ed-journal-grid">{JOURNAL.map(note => <article key={note.slug}><LocaleLink to="/notlar/$slug" params={{ slug: note.slug }}>
      {!compact && <ArchivePhoto original={note.image} sizes="(min-width: 900px) 30vw, 100vw" caption={false} />}
      <div className="ed-journal-copy"><h3>{b(locale, `${note.key}.title`)}</h3><p>{b(locale, `${note.key}.deck`)}</p><span className="ed-link">{b(locale, 'journal.read')}<ArrowUpRight size={17} aria-hidden="true" /></span></div>
    </LocaleLink></article>)}</div>
  </section>;
}
export function ContactCta() {
  const locale = useLocale();
  return <section className="ed-contact-cta ed-container"><div><p className="ed-eyebrow">Gümülcine · Κομοτηνή</p><h2>{b(locale, 'home.closeTitle')}</h2><p>{b(locale, 'home.closeBody')}</p></div><Button asChild variant="primary"><LocaleLink to="/iletisim">{b(locale, 'contact.write')}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink></Button></section>;
}

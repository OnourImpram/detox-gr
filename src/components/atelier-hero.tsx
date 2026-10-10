import { AktarHeroImage } from './aktar-hero-image';
import { mediaCopy } from '@/lib/media-copy';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ArchivePhoto } from './archive-photo';
import { LocaleLink } from './locale-link';
import { Button } from './ui/button';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EDITORIAL_PHOTOS as PHOTO } from '@/lib/photo-archive';

const specimens = [
  { photo: PHOTO.hero, label: 'group.seeds' },
  { photo: PHOTO.rose, label: 'group.flowers' },
  { photo: PHOTO.star, label: 'group.spices' },
] as const;

/** Approved composition first; the three owner-supplied photographs remain explicit alternatives. */
export function AtelierHero() {
  const locale = useLocale();
  const [selected, setSelected] = useState(0);
  return <section className="atelier-hero ed-container" aria-labelledby="atelier-title">
    <div className="atelier-hero__copy">
      <p className="atelier-place">Gümülcine <span aria-hidden="true">·</span> Κομοτηνή</p>
      <h1 id="atelier-title">{b(locale, 'hero.title')}</h1>
      <p className="ed-lead" id="aeo-lead">{b(locale, 'hero.lead')}</p>
      <div className="ed-actions"><Button asChild variant="primary"><LocaleLink to="/shop">{b(locale,'hero.cta')}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink></Button><LocaleLink to="/hikaye" className="atelier-quiet-link">{b(locale,'hero.secondary')}<ArrowRight size={17} aria-hidden="true" /></LocaleLink></div>
      <div className="atelier-owner"><span>Taha Hüseyinoğlu</span><span>Detoks Aktar</span></div>
    </div>
    <div className="atelier-specimen">
      <div className="atelier-specimen__frame" id="atelier-specimen-panel" aria-live="polite" data-hero-kind={selected === 0 ? 'illustration' : 'archive'}>
        {selected === 0 ? <AktarHeroImage /> : <ArchivePhoto key={specimens[selected - 1].photo} original={specimens[selected - 1].photo} priority caption={false} sizes="(min-width: 1100px) 43vw, (min-width: 768px) 50vw, 90vw" />}
        {selected > 0 && <span className="atelier-specimen__label">{b(locale, specimens[selected - 1].label)}</span>}
      </div>
      <div className="atelier-specimen__controls" role="group" aria-label={b(locale,'archive.title')}>
        <button type="button" aria-pressed={selected === 0} aria-controls="atelier-specimen-panel" onClick={() => setSelected(0)}><span className="atelier-specimen__dot" aria-hidden="true" />Detoks Aktar</button>
        {specimens.map((item,index) => <button key={item.photo} type="button" aria-pressed={selected===index+1} aria-controls="atelier-specimen-panel" onClick={()=>setSelected(index+1)}><span className="atelier-specimen__dot" aria-hidden="true" />{b(locale,item.label)}</button>)}
      </div>
      <div className="atelier-specimen__caption"><span>{selected === 0 ? mediaCopy(locale, 'disclosure') : b(locale,'hero.caption')}</span><LocaleLink to="/raf">{b(locale,'archive.title')}<ArrowUpRight size={15} aria-hidden="true" /></LocaleLink></div>
    </div>
  </section>;
}

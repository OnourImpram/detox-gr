import { ArrowRight } from 'lucide-react';
import { sceneById } from '@/lib/generated-scenes';
import { SceneFigure } from './scene-figure';
import { LocaleLink } from './locale-link';
import { categoryTitle, type Locale } from '@/lib/i18n';
import { sceneCopy } from '@/lib/scene-copy';
import { mediaCopy } from '@/lib/media-copy';
import { useLocale } from '@/lib/use-locale';
import { b } from '@/lib/brand-copy';

export function HomeSceneSections(){
  const locale=useLocale();
  return <><section className="ed-container scene-category-section"><div className="ed-section-heading"><div><p className="ed-eyebrow">Detoks Aktar</p><h2>{sceneCopy(locale,'title')}</h2><p>{mediaCopy(locale,'disclosure')}</p></div><LocaleLink to="/kompozisyonlar" className="ed-link">{sceneCopy(locale,'all')}<ArrowRight size={18} aria-hidden="true"/></LocaleLink></div>
    <div className="scene-category-grid">{([['spice','R3-10'],['nuts','R3-07'],['flour','R3-08']] as const).map(([category,id])=>{const scene=sceneById(id);return scene?<LocaleLink key={id} to="/shop/$category" params={{category}}><SceneFigure scene={scene} sizes="(min-width: 900px) 29vw, 90vw"/><h3>{categoryTitle(category,locale)}</h3></LocaleLink>:null;})}</div>
  </section><section className="ed-container scene-gift-bridge"><GiftScene locale={locale}/><div><p className="ed-eyebrow">Detoks Aktar</p><h2>{b(locale,'gift.title')}</h2><p>{b(locale,'gift.body')}</p><LocaleLink to="/paket" className="ed-link">{sceneCopy(locale,'gift')}<ArrowRight size={18} aria-hidden="true"/></LocaleLink></div></section></>;
}
export function GiftScene({locale,priority=false}:{locale:Locale;priority?:boolean}){
  const scene=sceneById('R3-09');return scene?<div><SceneFigure scene={scene} priority={priority} sizes="(min-width: 900px) 42vw, 90vw"/><p className="scene-concept-note">{sceneCopy(locale,'concept')}</p></div>:null;
}

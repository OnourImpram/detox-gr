import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Expand, X } from 'lucide-react';
import { GENERATED_SCENES } from '@/lib/generated-scenes';
import type { GeneratedScene } from '@/lib/generated-scenes-policy';
import { CATEGORIES, productBySourceId } from '@/lib/catalog';
import { useLocale } from '@/lib/use-locale';
import { categoryTitle, productName } from '@/lib/i18n';
import { sceneCopy } from '@/lib/scene-copy';
import { b } from '@/lib/brand-copy';
import { mediaCopy } from '@/lib/media-copy';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
import { SceneFigure } from '@/components/scene-figure';
import { sceneTitle } from '@/lib/scene-labels';
import { LocaleLink } from '@/components/locale-link';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/kompozisyonlar')({
  head:({match})=>{const locale=localeFromSearch(match.search);return seoHead({title:`${sceneCopy(locale,'title')} | Detoks`,description:mediaCopy(locale,'disclosure'),path:'/kompozisyonlar',locale,origin:pageOrigin(),noindex:true});},
  component:Compositions,
});
function Compositions(){
  const locale=useLocale();const [group,setGroup]=useState('all');const [limit,setLimit]=useState(12);
  const [selected,setSelected]=useState<GeneratedScene|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);const opener=useRef<HTMLButtonElement|null>(null);
  const matching=GENERATED_SCENES.filter(s=>group==='all'||s.category===group);
  useEffect(()=>{const el=dialog.current;if(selected&&el&&!el.open)el.showModal();if(!selected&&el?.open)el.close();},[selected]);
  const close=()=>{setSelected(null);opener.current?.focus();};
  return <section className="ed-container scene-collection" data-testid="composition-gallery">
    <nav className="scene-tabs"><LocaleLink to="/raf">{b(locale,'archive.title')}</LocaleLink><span aria-current="page">{sceneCopy(locale,'title')}</span></nav>
    <header className="ed-page-header"><div><p className="ed-eyebrow">Detoks Aktar</p><h1>{sceneCopy(locale,'title')}</h1><p className="ed-lead">{mediaCopy(locale,'disclosure')}</p></div></header>
    <fieldset className="ed-gallery-filter"><legend className="sr-only">{sceneCopy(locale,'title')}</legend>
      <button type="button" aria-pressed={group==='all'} onClick={()=>{setGroup('all');setLimit(12);}}>{sceneCopy(locale,'all')}</button>
      {CATEGORIES.filter(c=>GENERATED_SCENES.some(s=>s.category===c.id)).map(c=><button key={c.id} type="button" aria-pressed={group===c.id} onClick={()=>{setGroup(c.id);setLimit(12);}}>{categoryTitle(c.id,locale)}</button>)}
      <button type="button" aria-pressed={group==='gift'} onClick={()=>{setGroup('gift');setLimit(12);}}>{sceneCopy(locale,'gift')}</button>
    </fieldset>
    <p className="ed-gallery-counter" aria-live="polite">{b(locale,'archive.counter',{shown:Math.min(limit,matching.length),total:matching.length})}</p>
    <div className="scene-collection__grid">{matching.slice(0,limit).map(scene=><article key={scene.id} data-composition-id={scene.id}>
      <button className="scene-open" type="button" aria-label={`${b(locale,'archive.open')}. ${sceneTitle(scene,locale)}. ${scene.id}`} onClick={e=>{opener.current=e.currentTarget;setSelected(scene);}}><SceneFigure scene={scene} caption={false} sizes="(min-width: 1024px) 29vw, (min-width: 640px) 44vw, 92vw" /><span className="ed-expand" aria-hidden="true"><Expand size={18}/></span></button>
      <div className="scene-card-text"><p className="scene-card-caption">{mediaCopy(locale,'illustration')} · {scene.id}</p><h2>{sceneTitle(scene,locale)}</h2>
        {scene.sourceIds.length ? scene.sourceIds.map(id=>{const p=productBySourceId(id);return p?<LocaleLink key={id} to="/p/$slug" params={{slug:p.slug}} className="ed-link">{productName(p,locale)}<ArrowUpRight size={16} aria-hidden="true"/></LocaleLink>:null;}) : <p className="scene-concept-note">{sceneCopy(locale,'concept')}</p>}
      </div>
    </article>)}</div>
    {limit<matching.length&&<div className="ed-more"><Button variant="outline" onClick={()=>setLimit(value=>value+12)}>{b(locale,'archive.more')}<ArrowDown size={17} aria-hidden="true"/></Button></div>}
    <dialog ref={dialog} className="ed-photo-dialog" aria-labelledby="scene-dialog-title" onCancel={event=>{event.preventDefault();close();}} onClose={()=>{setSelected(null);opener.current?.focus();}} onClick={event=>{if(event.target===dialog.current)close();}}>
      {selected&&<div><button autoFocus type="button" className="ed-dialog-close" aria-label={b(locale,'archive.close')} onClick={close}><X size={24} aria-hidden="true"/></button><h2 id="scene-dialog-title">{sceneTitle(selected,locale)} · {selected.id}</h2><SceneFigure scene={selected} sizes="90vw" priority/><p>{mediaCopy(locale,'disclosure')}</p>{selected.sourceIds.length===0&&<p>{sceneCopy(locale,'concept')}</p>}</div>}
    </dialog>
  </section>;
}

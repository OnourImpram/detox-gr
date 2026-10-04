import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { useShop } from '@/lib/store';
import { EditorialHeader } from '@/components/editorial';
import { Button } from '@/components/ui/button';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route=createFileRoute('/yasal')({head:({match})=>{const locale=localeFromSearch(match.search);return seoHead({title:`${b(locale,'legal.title')} | Detoks`,description:b(locale,'legal.body'),path:'/yasal',locale,origin:pageOrigin()});},component:Legal});
function Legal(){const locale=useLocale();const [cleared,setCleared]=useState(false);
  function clear(){useShop.getState().clear();useShop.getState().setCountry('GR');useShop.persist.clearStorage();setCleared(true);}
  return <article className="ed-container ed-legal"><EditorialHeader title="legal.title" lead="legal.body" /><div className="ed-note-prose">{(['storage','external','sales'] as const).map(key=><section key={key}><h2>{b(locale,`legal.${key}Title`)}</h2><p>{b(locale,`legal.${key}Body`)}</p>{key==='storage'&&<><Button variant="outline" onClick={clear}>{b(locale,'legal.clear')}</Button><p aria-live="polite">{cleared?b(locale,'legal.cleared'):''}</p></>}</section>)}</div></article>;
}

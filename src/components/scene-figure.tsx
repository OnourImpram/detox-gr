import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useLocale } from '@/lib/use-locale';
import { assetUrl } from '@/lib/product-media-policy';
import { mediaCopy } from '@/lib/media-copy';
import { sceneTitle } from '@/lib/scene-labels';
import type { GeneratedScene } from '@/lib/generated-scenes-policy';

export function SceneFigure({ scene, sizes='100vw', priority=false, caption=true, className='' }:{scene:GeneratedScene;sizes?:string;priority?:boolean;caption?:boolean;className?:string}){
  const locale=useLocale();const [failed,setFailed]=useState<string|null>(null);
  const fallback=scene.variants.find(v=>v.width>=800) ?? scene.variants.at(-1)!;
  const url=(src:string)=>assetUrl(src,import.meta.env.BASE_URL);
  return <figure className={`scene-figure ${className}`} data-scene-id={scene.id} data-media-kind="illustration">
    <div className="scene-figure__surface">{failed!==scene.id ? <img src={url(fallback.src)}
      srcSet={scene.variants.map(v=>`${url(v.src)} ${v.width}w`).join(', ')} sizes={sizes}
      width={scene.width} height={scene.height} alt={`${sceneTitle(scene,locale)}. ${mediaCopy(locale,'illustration')}.`}
      loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" onError={()=>setFailed(scene.id)} />
      : <div className="scene-figure__error" role="img" aria-label={mediaCopy(locale,'pending')}><Camera aria-hidden="true" />{mediaCopy(locale,'pending')}</div>}</div>
    {caption && <figcaption>{mediaCopy(locale,'illustration')}</figcaption>}
  </figure>;
}

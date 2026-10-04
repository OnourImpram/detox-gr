import { createFileRoute } from '@tanstack/react-router';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EditorialHeader, ContactCta } from '@/components/editorial';
import { EDITORIAL_PHOTOS as PHOTO } from '@/lib/photo-archive';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route=createFileRoute('/teslimat')({head:({match})=>{const locale=localeFromSearch(match.search);return seoHead({title:`${b(locale,'delivery.title')} | Detoks`,description:b(locale,'delivery.body'),path:'/teslimat',locale,origin:pageOrigin()});},component:Delivery});
function Delivery(){const locale=useLocale();return <><section className="ed-container"><EditorialHeader title="delivery.title" lead="delivery.body" image={PHOTO.cinnamon} /><ol className="ed-delivery-steps">{(['one','two','three','four'] as const).map((step,i)=><li key={step}><span aria-hidden="true">{i+1}</span><p>{b(locale,`delivery.${step}`)}</p></li>)}</ol></section><ContactCta /></>;}

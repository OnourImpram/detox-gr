import { GiftScene } from '@/components/scene-sections';
import { createFileRoute } from '@tanstack/react-router';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EditorialHeader, JournalCards } from '@/components/editorial';
import { InquiryForm } from '@/components/inquiry-form';
import { ArchivePhoto } from '@/components/archive-photo';
import { EDITORIAL_PHOTOS as PHOTO } from '@/lib/photo-archive';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route=createFileRoute('/paket')({head:({match})=>{const locale=localeFromSearch(match.search);return seoHead({title:`${b(locale,'gift.title')} | Detoks`,description:b(locale,'gift.body'),path:'/paket',locale,origin:pageOrigin()});},component:Gifts});
function Gifts(){const locale=useLocale();return <><section className="ed-container"><EditorialHeader title="gift.title" lead="gift.body" visual={<GiftScene locale={locale} priority />} /><div className="ed-gift-directions">{(['one','two','three'] as const).map((key,i)=><article key={key}><ArchivePhoto original={[PHOTO.hero,PHOTO.cinnamon,PHOTO.flowers][i]} sizes="(min-width: 900px) 30vw, 100vw" caption={false} /><h2>{b(locale,`gift.${key}`)}</h2></article>)}</div><div className="ed-inquiry-wrap"><InquiryForm kind="gift" /></div></section><JournalCards /></>;}

import { createFileRoute } from '@tanstack/react-router';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EditorialHeader } from '@/components/editorial';
import { InquiryForm } from '@/components/inquiry-form';
import { EDITORIAL_PHOTOS as PHOTO } from '@/lib/photo-archive';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route=createFileRoute('/ticari')({head:({match})=>{const locale=localeFromSearch(match.search);return seoHead({title:`${b(locale,'trade.title')} | Detoks`,description:b(locale,'trade.body'),path:'/ticari',locale,origin:pageOrigin()});},component:Trade});
function Trade(){const locale=useLocale();return <section className="ed-container"><EditorialHeader title="trade.title" lead="trade.body" image={PHOTO.seeds} /><div className="ed-contact-layout"><div><h2>{b(locale,'process.threeTitle')}</h2><p className="ed-lead">{b(locale,'trade.need')}</p><p className="ed-form-note">{b(locale,'inquiry.intro')}</p></div><InquiryForm kind="trade" /></div></section>;}

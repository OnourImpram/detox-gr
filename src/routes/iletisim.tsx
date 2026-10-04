import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpRight, Phone } from 'lucide-react';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';
import { EditorialHeader } from '@/components/editorial';
import { InquiryForm } from '@/components/inquiry-form';
import { ShopFacts } from '@/components/shop-facts';
import { SHOP_PHONE_DISPLAY, SHOP_PHONE_TEL, SHOP_MAPS } from '@/lib/shop-facts';
import { localeFromSearch, pageOrigin, seoHead } from '@/lib/seo';
export const Route=createFileRoute('/iletisim')({head:({match})=>{const locale=localeFromSearch(match.search);return seoHead({title:`${b(locale,'contact.title')} | Detoks`,description:b(locale,'contact.lead'),path:'/iletisim',locale,origin:pageOrigin()});},component:Contact});
function Contact(){const locale=useLocale();return <section className="ed-container ed-contact-page"><EditorialHeader title="contact.title" lead="contact.lead" kicker="hero.kicker" /><div className="ed-contact-layout"><aside><h2>{b(locale,'contact.visit')}</h2><ShopFacts title="Detoks Aktar" /><p className="ed-form-note">{b(locale,'contact.hoursNote')}</p><a href={`tel:${SHOP_PHONE_TEL}`} className="ed-link"><Phone size={17} aria-hidden="true" />{SHOP_PHONE_DISPLAY}</a><a href={SHOP_MAPS} className="ed-link" target="_blank" rel="noopener noreferrer">{b(locale,'contact.visit')}<ArrowUpRight size={17} aria-hidden="true" /></a></aside><InquiryForm kind="contact" /></div></section>;}

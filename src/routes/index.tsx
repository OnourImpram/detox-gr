import { AtelierHero } from '@/components/atelier-hero';
import { HomeSceneSections } from '@/components/scene-sections';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ArchivePhoto } from '@/components/archive-photo';
import { LocaleLink } from '@/components/locale-link';
import { ProductCard } from '@/components/product-card';
import { JournalCards, ContactCta } from '@/components/editorial';
import { CATEGORIES, featured, productsByCategory } from '@/lib/catalog';
import { categoryTitle } from '@/lib/i18n';
import { b } from '@/lib/brand-copy';
import { EDITORIAL_PHOTOS as PHOTO } from '@/lib/photo-archive';
import { useLocale } from '@/lib/use-locale';
import { localeFromSearch, orgJsonLd, pageOrigin, personJsonLd, seoHead, websiteJsonLd } from '@/lib/seo';
export const Route = createFileRoute('/')({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search), origin = pageOrigin();
    return seoHead({ title: `Detoks.gr | ${b(locale, 'hero.title')}`, description: b(locale, 'hero.lead'), path: '/', locale, origin, image: '/og.jpg', jsonLd: [orgJsonLd(origin, locale), personJsonLd(origin), websiteJsonLd(origin, locale)] });
  }, component: Home,
});
function Home() {
  const locale = useLocale();
  const picks = featured();
  return <div className="ed-home">
    <AtelierHero />
    <nav className="ed-categories ed-container" aria-label={b(locale, 'process.oneTitle')}>{CATEGORIES.filter(category => productsByCategory(category.id).length > 0).map(category => <LocaleLink key={category.id} to="/shop/$category" params={{ category: category.id }}>{categoryTitle(category.id, locale)}<sup>{new Intl.NumberFormat(locale).format(productsByCategory(category.id).length)}</sup></LocaleLink>)}</nav>
    {picks.length > 0 && <section className="ed-featured ed-container"><div className="ed-section-heading"><div><h2>{b(locale, 'home.featured')}</h2><p>{b(locale, 'home.featuredBody')}</p></div><LocaleLink to="/shop" className="ed-link">{b(locale, 'hero.cta')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div><div className="dt-product-grid">{picks.slice(0,4).map(product => <ProductCard key={product.sourceId} product={product} />)}</div></section>}
    <section className="ed-shelves atelier-shelves ed-container">
      <div className="atelier-shelves__intro"><h2>{b(locale, 'shelves.title')}</h2><p>{b(locale, 'shelves.body')}</p><ArchivePhoto original={PHOTO.cinnamon} caption={false} sizes="(min-width: 900px) 38vw, 90vw" /></div>
      <div className="ed-shelf-grid">{(['own', 'selected'] as const).map((shelf, i) => <LocaleLink key={shelf} to="/shop" search={{ shelf: i === 0 ? 'house' : 'selected' }} className="ed-shelf"><div><h3>{b(locale, `shelves.${shelf}Title`)}</h3><p>{b(locale, `shelves.${shelf}Body`)}</p></div><ArrowUpRight size={24} aria-hidden="true" /></LocaleLink>)}</div>
    </section>
    <HomeSceneSections />
    <section className="ed-story-bridge ed-container"><ArchivePhoto original={PHOTO.cloves} caption={false} sizes="(min-width: 900px) 34vw, 90vw" /><div><p className="ed-eyebrow">Taha Hüseyinoğlu</p><h2>{b(locale, 'home.storyTitle')}</h2><p>{b(locale, 'home.storyBody')}</p><LocaleLink to="/hikaye" className="ed-link">{b(locale, 'hero.secondary')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink><LocaleLink to="/raf" className="customer-archive-link">{b(locale, 'archive.title')}<ArrowUpRight size={16} aria-hidden="true" /></LocaleLink></div></section>
    <JournalCards compact /><ContactCta />
  </div>;
}

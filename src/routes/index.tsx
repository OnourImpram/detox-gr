import { HomeSceneSections } from '@/components/scene-sections';
import { createFileRoute } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ArchivePhoto } from '@/components/archive-photo';
import { LocaleLink } from '@/components/locale-link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { JournalCards, ProcessSteps, ContactCta } from '@/components/editorial';
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
    <section className="ed-home-hero ed-container">
      <div className="ed-home-hero-copy"><p className="ed-eyebrow">{b(locale, 'hero.kicker')}</p><h1>{b(locale, 'hero.title')}</h1><p className="ed-lead" id="aeo-lead">{b(locale, 'hero.lead')}</p>
        <div className="ed-actions"><Button asChild variant="primary"><LocaleLink to="/shop">{b(locale, 'hero.cta')}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink></Button><LocaleLink to="/hikaye" className="ed-link">{b(locale, 'hero.secondary')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div>
        <div className="ed-founder-signature"><span aria-hidden="true" />Taha Hüseyinoğlu<small>Detoks Aktar</small></div>
      </div>
      <div className="ed-hero-photographs"><ArchivePhoto original={PHOTO.hero} priority className="ed-hero-main-photo" sizes="(min-width: 1024px) 44vw, 90vw" />
        <div className="ed-hero-photo-pair"><ArchivePhoto original={PHOTO.rose} className="ed-hero-rose" caption={false} sizes="(min-width: 1024px) 20vw, 45vw" /><ArchivePhoto original={PHOTO.star} className="ed-hero-star" caption={false} sizes="(min-width: 1024px) 20vw, 45vw" /></div>
        <LocaleLink to="/raf" className="ed-photo-index-link">{b(locale, 'archive.title')}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink>
      </div>
    </section>
    <nav className="ed-categories ed-container" aria-label={b(locale, 'process.oneTitle')}>{CATEGORIES.filter(category => productsByCategory(category.id).length > 0).map(category => <LocaleLink key={category.id} to="/shop/$category" params={{ category: category.id }}>{categoryTitle(category.id, locale)}<sup>{new Intl.NumberFormat(locale).format(productsByCategory(category.id).length)}</sup></LocaleLink>)}</nav>
    {picks.length > 0 && <section className="ed-featured ed-container"><div className="ed-section-heading"><div><p className="ed-eyebrow">Detoks Aktar</p><h2>{b(locale, 'home.featured')}</h2><p>{b(locale, 'home.featuredBody')}</p></div><LocaleLink to="/shop" className="ed-link">{b(locale, 'hero.cta')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div><div className="dt-product-grid">{picks.slice(0,4).map(product => <ProductCard key={product.sourceId} product={product} />)}</div></section>}
    <section className="ed-shelves ed-container"><div className="ed-section-heading"><div><p className="ed-eyebrow">Detoks Aktar</p><h2>{b(locale, 'shelves.title')}</h2></div><p>{b(locale, 'shelves.body')}</p></div><div className="ed-shelf-grid">
      {(['own', 'selected'] as const).map((shelf, i) => <LocaleLink key={shelf} to="/shop" search={{ shelf: i === 0 ? 'house' : 'selected' }} className="ed-shelf"><span className="ed-shelf-monogram" aria-hidden="true">{i === 0 ? 'T.' : 'D.'}</span><div><h3>{b(locale, `shelves.${shelf}Title`)}</h3><p>{b(locale, `shelves.${shelf}Body`)}</p></div><ArrowUpRight size={22} aria-hidden="true" /></LocaleLink>)}
    </div></section>
    <section className="ed-story-bridge ed-container"><ArchivePhoto original={PHOTO.cinnamon} sizes="(min-width: 900px) 40vw, 100vw" /><div><p className="ed-eyebrow">Taha Hüseyinoğlu</p><h2>{b(locale, 'home.storyTitle')}</h2><p>{b(locale, 'home.storyBody')}</p><LocaleLink to="/hikaye" className="ed-link">{b(locale, 'hero.secondary')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div></section>
    <section className="ed-archive-bridge"><div className="ed-container ed-section-heading"><div><p className="ed-eyebrow">{b(locale, 'photo.source')}</p><h2>{b(locale, 'home.archiveTitle')}</h2><p>{b(locale, 'home.archiveBody')}</p></div><LocaleLink to="/raf" className="ed-link">{b(locale, 'archive.all')}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div><div className="ed-archive-strip ed-container">{[PHOTO.rose, PHOTO.seeds, PHOTO.cloves, PHOTO.flowers].map(photo => <LocaleLink key={photo} to="/raf"><ArchivePhoto original={photo} sizes="(min-width: 900px) 22vw, 45vw" caption={false} /></LocaleLink>)}</div></section>
    <HomeSceneSections /><ProcessSteps /><JournalCards /><ContactCta />
  </div>;
}

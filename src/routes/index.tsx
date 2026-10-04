import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { LocaleLink } from "@/components/locale-link";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryImage, featured, productBySourceId, productsByCategory } from "@/lib/catalog";
import { categoryTitle, productName, t } from "@/lib/i18n";
import { ux } from "@/lib/storefront-copy";
import { formatListed } from "@/lib/money";
import { localeFromSearch, orgJsonLd, pageOrigin, personJsonLd, seoHead, websiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    const origin = pageOrigin();
    return seoHead({ title: t(locale, "seo.home.title"), description: ux(locale, "homeDescription"), path: "/", locale, origin, image: "/products/hero-cinematic.jpg", jsonLd: [orgJsonLd(origin, locale), personJsonLd(origin), websiteJsonLd(origin, locale)] });
  },
  component: Home,
});

function Home() {
  const locale = useLocale();
  const picks = featured();
  const vinegar = productBySourceId("DT117");
  const categories = CATEGORIES.filter((category) => productsByCategory(category.id).length > 0);
  return (
    <div className="dt-home">
      <section className="dt-hero shell-x">
        <div className="dt-hero__copy">
          <p className="kicker">{t(locale, "home.kicker")}</p>
          <h1 className="dt-hero__title">{t(locale, "home.lineA")} <em>{t(locale, "home.lineEm")}</em></h1>
          <p id="aeo-lead" className="dt-hero__lead">{ux(locale, "homeDescription")}</p>
          <div className="dt-hero__actions">
            <Button asChild variant="primary"><LocaleLink to="/shop">{t(locale, "home.cta")}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink></Button>
            <LocaleLink to="/hikaye" className="dt-text-link">{t(locale, "home.rose")}<ArrowRight size={16} aria-hidden="true" /></LocaleLink>
          </div>
          <div className="dt-hero__signature"><span aria-hidden="true" />Taha Hüseyinoğlu<span className="dt-hero__signature-place">{t(locale, "home.statM")}</span></div>
        </div>
        <figure className="dt-hero__still">
          <Pic src="/products/hero-cinematic.jpg" alt={t(locale, "home.heroCaption")} sizes="(min-width: 1024px) 48vw, 100vw" fetchPriority="high" decoding="async" />
          {vinegar && <LocaleLink to="/p/$slug" params={{ slug: vinegar.slug }} className="dt-hero__product">
            <span><span className="dt-hero__product-shelf">{t(locale, "product.made")}</span><strong>{productName(vinegar, locale)}</strong><small>{t(locale, "product.illustrative")}</small></span>
            <span className="dt-hero__product-price">{formatListed(vinegar.priceEur, vinegar.unit, "EUR", locale)}<small>{ux(locale, "referencePrice")}</small></span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </LocaleLink>}
          <figcaption>{t(locale, "home.heroCaption")}</figcaption>
        </figure>
      </section>

      <nav className="dt-category-index shell-x" aria-label={t(locale, "shop.collections")}>
        {categories.map((category) => <LocaleLink key={category.id} to="/shop/$category" params={{ category: category.id }}>
          {categoryTitle(category.id, locale)}<span>{new Intl.NumberFormat(locale).format(productsByCategory(category.id).length)}</span>
        </LocaleLink>)}
      </nav>

      {picks.length > 0 && <section className="dt-featured shell-x" aria-labelledby="featured-heading">
        <div className="dt-section-heading"><div><p className="kicker">{ux(locale, "featured")}</p><h2 id="featured-heading">{t(locale, "home.picks")}</h2></div><LocaleLink to="/shop" className="dt-text-link">{t(locale, "shop.all")}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div>
        <div className="dt-product-grid">{picks.slice(0, 4).map((product) => <ProductCard key={product.sourceId} product={product} />)}</div>
      </section>}

      <section className="dt-two-shelves shell-x" aria-labelledby="shelves-heading">
        <div className="dt-section-heading"><div><p className="kicker">Detoks Aktar</p><h2 id="shelves-heading">{t(locale, "home.splitTitle")}</h2></div></div>
        <div className="dt-two-shelves__grid">
          <LocaleLink to="/shop" search={{ shelf: "house" } as never} className="dt-shelf-story">
            <span className="dt-shelf-story__mark" aria-hidden="true">T.</span><div><p className="kicker">{t(locale, "product.made")}</p><h3>{t(locale, "home.splitOwn")}</h3><p>{t(locale, "home.splitOwnBody")}</p></div><ArrowUpRight size={25} aria-hidden="true" />
          </LocaleLink>
          <LocaleLink to="/shop" search={{ shelf: "selected" } as never} className="dt-shelf-story">
            <span className="dt-shelf-story__mark" aria-hidden="true">D.</span><div><p className="kicker">{t(locale, "product.picked")}</p><h3>{t(locale, "home.splitPick")}</h3><p>{t(locale, "home.splitPickBody")}</p></div><ArrowUpRight size={25} aria-hidden="true" />
          </LocaleLink>
        </div>
      </section>

      <section className="dt-founder shell-x" aria-labelledby="founder-heading">
        <figure className="dt-founder__image"><Pic src={categoryImage("pantry")} alt={t(locale, "photo.vinegar")} sizes="(min-width: 1024px) 40vw, 100vw" loading="lazy" decoding="async" /><figcaption>{t(locale, "photo.vinegar")}</figcaption></figure>
        <div className="dt-founder__copy"><p className="kicker">Taha Hüseyinoğlu</p><h2 id="founder-heading">{t(locale, "home.storyTitle")}</h2><p>{t(locale, "home.storyBody")}</p><LocaleLink to="/hikaye" className="dt-text-link">{t(locale, "home.storyCta")}<ArrowRight size={18} aria-hidden="true" /></LocaleLink></div>
      </section>

      <section className="dt-home-close shell-x"><p className="kicker">{t(locale, "home.statM")}</p><h2>{t(locale, "home.close")}</h2><p>{t(locale, "home.closeBody")}</p><Button asChild variant="primary"><LocaleLink to="/shop">{t(locale, "home.cta")}<ArrowUpRight size={18} aria-hidden="true" /></LocaleLink></Button></section>
    </div>
  );
}

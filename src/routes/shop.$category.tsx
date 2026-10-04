import { createFileRoute, notFound } from "@tanstack/react-router";
import { UrunListesi } from "@/components/urun-listesi";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { CategoryBar } from "@/components/category-bar";
import { LocaleLink } from "@/components/locale-link";
import { categoryById, categoryImage, productsByCategory, type CategoryId } from "@/lib/catalog";
import { categoryBlurb, categoryTitle, productName, t } from "@/lib/i18n";
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  localeFromSearch,
  pageOrigin,
  seoHead,
} from "@/lib/seo";

export const Route = createFileRoute("/shop/$category")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    const cat = categoryById(match.params.category);
    if (!cat) return {};
    const origin = pageOrigin();
    const title = t(locale, "seo.collection.title", { name: categoryTitle(cat.id, locale) });
    return seoHead({
      title,
      description: categoryBlurb(cat.id, locale),
      path: `/shop/${cat.id}`,
      locale,
      origin,
      jsonLd: [
        breadcrumbJsonLd(origin, locale, [
          { name: t(locale, "nav.shop"), path: "/shop" },
          { name: categoryTitle(cat.id, locale), path: `/shop/${cat.id}` },
        ]),
        collectionJsonLd(origin, locale, cat.id),
      ],
    });
  },
  component: Collection,
});

function Collection() {
  const { category } = Route.useParams();
  const cat = categoryById(category);
  if (!cat) throw notFound();
  const all = productsByCategory(category as CategoryId);
  const locale = useLocale();
  return (
    <section>
      <div className="relative min-h-[36vh] overflow-hidden">
        {/* [UNVERIFIED] fetchPriority React 19 prop'u — React 18'de fetchpriority olarak yazılmalı */}
        <Pic
          src={categoryImage(cat.id)}
          alt=""
          sizes="100vw"
          fetchPriority="high"
          decoding="async"
          className="img-in absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/10" />
        <div className="on-photo shell-x relative flex min-h-[36vh] flex-col justify-end py-12">
          <LocaleLink to="/shop" className="micro w-fit text-cream/85 transition-colors hover:text-primary">
            {t(locale, "shop.back")}
          </LocaleLink>
          <h1 className="mt-4 text-[clamp(2rem,6vw+0.4rem,4.2rem)] text-cream">
            {categoryTitle(cat.id, locale)}
          </h1>
          <p className="mt-3 max-w-[65ch] text-cream/85">{categoryBlurb(cat.id, locale)}</p>
          <p className="micro mt-4 text-patina">{t(locale, "shop.count", { n: all.length })}</p>
        </div>
      </div>
      <div className="shell-x pt-6">
        <CategoryBar active={cat.id} />
        <UrunListesi products={all} className="mt-8" />
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { UrunListesi } from "@/components/urun-listesi";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { LocaleLink } from "@/components/locale-link";
import { CategoryBar } from "@/components/category-bar";
import { PhotoChapter } from "@/components/photo-chapter";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  categoryImage,
  featured,
  PRODUCTS,
  productsByCategory,
  searchProducts,
} from "@/lib/catalog";
import { categoryTitle, productBlurb, productName, t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang-search";
import { PHOTO } from "@/lib/photos";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/shop/")({
  validateSearch: (s: Record<string, unknown>) => ({
    ...parseLang(s),
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.shop.title"),
      description: t(locale, "seo.shop.desc"),
      path: "/shop",
      locale,
      origin: pageOrigin(),
      image: PHOTO.tahaSoaps,
    });
  },
  component: Shop,
});

function Shop() {
  const { q } = Route.useSearch();
  const locale = useLocale();
  const picks = featured();
  const list = q
    ? searchProducts(q, (p) => [productName(p, locale), productBlurb(p, locale)])
    : null;

  return (
    <section>
      {!q && (
        <PhotoChapter src={PHOTO.tahaSoaps} altKey="photo.tahaSoaps" minClass="min-h-[52vh]" priority caption={false}>
          <h1 className="max-w-[12ch] text-[clamp(2rem,6vw+0.4rem,4.6rem)] text-cream">{t(locale, "shop.title")}</h1>
          <p className="mt-4 max-w-[48ch] text-cream/85">{t(locale, "shop.fullHint")}</p>
          <p className="micro mt-4 text-patina">{t(locale, "shop.count", { n: PRODUCTS.length })}</p>
        </PhotoChapter>
      )}
      {!q && (
        <div className="shell-x pt-6">
          <CategoryBar active="all" />
        </div>
      )}
      <div className="shell-x section-y">
        {q && (
          <>
            <h1 className="text-[clamp(2.2rem,5vw,3.4rem)]">{t(locale, "shop.title")}</h1>
            <p className="mt-3 max-w-[52ch] text-muted" aria-live="polite">
              {t(locale, "shop.results", { q, n: list?.length ?? 0 })}
            </p>
          </>
        )}

        {list ? (
          <>
            {list.length > 0 && (
              <div className="mt-10 grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}
            {list.length === 0 && (
              <div className="mt-10 max-w-xl border border-border bg-raised p-6 sm:p-8">
                <p className="text-lg text-muted">{t(locale, "shop.empty")}</p>
                <Button asChild variant="outline" className="mt-6">
                  <LocaleLink to="/shop">{t(locale, "shop.back")}</LocaleLink>
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <hr className="rule-line mt-12" aria-hidden="true" />
            <h2 className="mt-10 text-[clamp(1.8rem,3vw,2.4rem)]">{t(locale, "shop.vitrine")}</h2>
            <div className="mt-8 grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {picks.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            <hr className="rule-line mt-20" aria-hidden="true" />
            <h2 className="mt-10 text-[clamp(1.8rem,3vw,2.4rem)]">{t(locale, "shop.all")}</h2>
            <p className="mt-3 max-w-[52ch] text-muted">{t(locale, "shop.allLead")}</p>
            <UrunListesi products={PRODUCTS} className="mt-8" />
            <hr className="rule-line mt-20" aria-hidden="true" />
            <h2 className="mt-10 text-[clamp(1.8rem,3vw,2.4rem)]">{t(locale, "shop.collections")}</h2>
            <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.filter((c) => productsByCategory(c.id).length > 0).map((c) => {
                const n = productsByCategory(c.id).length;
                return (
                  <LocaleLink
                    key={c.id}
                    to="/shop/$category"
                    params={{ category: c.id }}
                    className="focus-inset group relative flex min-h-56 overflow-hidden bg-bg"
                  >
                    <Pic
                      src={categoryImage(c.id)}
                      alt=""
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      loading="lazy"
                      decoding="async"
                      className="img-in absolute inset-0 size-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
                    />
                    <span className="relative z-10 flex w-full flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/35 to-transparent p-5">
                      <span className="font-display text-2xl text-cream">{categoryTitle(c.id, locale)}</span>
                      <span className="micro mt-2 text-cream/85">{t(locale, "shop.count", { n })}</span>
                    </span>
                  </LocaleLink>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

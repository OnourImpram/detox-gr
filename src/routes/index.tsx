import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { LocaleLink } from "@/components/locale-link";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { CATEGORIES, featured, productBySourceId, productsByCategory } from "@/lib/catalog";
import { categoryTitle, t } from "@/lib/i18n";
import { localeFromSearch, orgJsonLd, pageOrigin, personJsonLd, seoHead, speakableHomeJsonLd, websiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    const origin = pageOrigin();
    return seoHead({
      title: t(locale, "seo.home.title"),
      description: t(locale, "seo.home.desc"),
      path: "/",
      locale,
      origin,
      image: "/products/hero-cinematic.jpg",
      jsonLd: [
        orgJsonLd(origin, locale),
        personJsonLd(origin),
        websiteJsonLd(origin, locale),
        speakableHomeJsonLd(origin, locale),
      ],
    });
  },
  component: Home,
});

const BENTO: { id: (typeof CATEGORIES)[number]["id"]; img: string; span: string }[] = [
  { id: "lokum", img: "/products/lokum.jpg", span: "lg:col-span-7 lg:row-span-2 min-h-[28rem]" },
  { id: "pantry", img: "/products/sku/elma-sirkesi-detoks.jpg", span: "lg:col-span-5 min-h-48" },
  { id: "spice", img: "/photos/taha-jars.jpg", span: "lg:col-span-5 min-h-48" },
  { id: "soap", img: "/products/sku/sabun-lavanta.jpg", span: "lg:col-span-4 min-h-64" },
  { id: "honey", img: "/products/still-life.jpg", span: "lg:col-span-4 min-h-64" },
  { id: "oil", img: "/products/night-shelf.jpg", span: "lg:col-span-4 min-h-64" },
];

function Home() {
  const picks = featured();
  const locale = useLocale();
  const vinegar = productBySourceId("DT117");

  return (
    <>
      <section className="relative min-h-[100dvh] overflow-hidden">
        <div className="hero-still hero-still-ken">
          <Pic
            src="/products/hero-cinematic.jpg"
            alt={t(locale, "home.heroCaption")}
            sizes="100vw"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/25 to-transparent sm:from-ink/20" />
        <div className="on-photo relative z-10 flex min-h-[100dvh] flex-col justify-end shell-x pt-32 pb-16 lg:pb-20">
          <p className="hero-enter kicker">{t(locale, "home.kicker")}</p>
          <h1 className="hero-enter hero-enter-2 mt-5 max-w-[20ch] text-[clamp(1.9rem,6.2vw+0.6rem,5.75rem)] leading-none text-cream lg:max-w-[56%]">
            {t(locale, "home.lineA")} <em>{t(locale, "home.lineEm")}</em>
          </h1>
          <p id="aeo-lead" className="hero-enter hero-enter-3 mt-6 max-w-[28ch] text-[1.35rem] leading-snug text-cream/90">
            {t(locale, "home.lead")}
          </p>
          {/* İlk ekranda "ne satıyor, nereye gönderiyor" — soğuk trafik 5 saniyede anlasın (red team RT-A-10 / RT-C #12) */}
          <p className="hero-enter hero-enter-3 mt-3 max-w-[44ch] text-sm leading-relaxed text-cream/75">
            {t(locale, "home.what")}
          </p>
          <div className="hero-enter hero-enter-4 mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <LocaleLink to="/shop">{t(locale, "home.cta")}</LocaleLink>
            </Button>
            <Button asChild variant="outline" className="w-full border-cream/40 text-cream hover:border-primary hover:text-primary sm:w-auto">
              <LocaleLink to="/hikaye">{t(locale, "home.rose")}</LocaleLink>
            </Button>
          </div>
          <p className="mt-10 max-w-[48ch] text-xs leading-relaxed text-cream/70">{t(locale, "home.heroCaption")}</p>
        </div>
        <div className="scroll-cue hidden sm:block" aria-hidden="true" />
      </section>

      <Reveal>
        <div className="bento">
          {BENTO.map((cell) => {
            const n = productsByCategory(cell.id).length;
            return (
              <LocaleLink
                key={cell.id}
                to="/shop/$category"
                params={{ category: cell.id }}
                className={`group relative overflow-hidden focus-inset ${cell.span}`}
              >
                <Pic
                  src={cell.img}
                  alt={categoryTitle(cell.id, locale)}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="img-in absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent transition-opacity duration-500 group-hover:opacity-70" />
                <span className="relative z-10 flex h-full flex-col justify-end p-6">
                  <span className="font-display text-3xl font-semibold text-cream [text-shadow:0_2px_18px_rgb(31_19_11/0.55)] lg:text-4xl">
                    {categoryTitle(cell.id, locale)}
                  </span>
                  <span className="micro mt-2 text-cream/75">{t(locale, "shop.count", { n })}</span>
                </span>
              </LocaleLink>
            );
          })}
        </div>
      </Reveal>

      <section className="relative min-h-[80dvh] overflow-hidden">
        <div className="hero-still hero-still-portrait">
          <Pic src="/photos/taha.jpg" alt={t(locale, "photo.taha")} sizes="100vw" loading="lazy" decoding="async" />
        </div>
        {/* Beyaz zeminli stüdyo karesi: natürmort scrim'i (35) krem metni AA altına düşürüyordu (ölçüm 3,34:1) → 92/72 */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/72 to-ink/30" />
        <div className="on-photo relative z-10 flex min-h-[80dvh] flex-col justify-end shell-x py-20">
          <h2 className="max-w-[16ch] text-[clamp(2rem,5.5vw+0.5rem,5rem)] text-cream">{t(locale, "home.storyTitle")}</h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-cream/85">{t(locale, "home.storyBody")}</p>
          <Button asChild variant="outline" className="mt-10 w-fit border-cream/40 text-cream hover:border-primary hover:text-primary">
            <LocaleLink to="/hikaye">{t(locale, "home.storyCta")}</LocaleLink>
          </Button>
        </div>
      </section>
      <p className="photo-credit shell-x">{t(locale, "photo.taha")}</p>

      {vinegar && (
        <>
          <section className="relative min-h-[75dvh] overflow-hidden">
            <div className="hero-still">
              <Pic src="/products/sku/elma-sirkesi-detoks.jpg" alt={t(locale, "home.appleTitle")} sizes="100vw" loading="lazy" decoding="async" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/82 via-ink/25 to-transparent" />
            <div className="on-photo relative z-10 flex min-h-[75dvh] flex-col justify-end shell-x py-20">
              <h2 className="max-w-[14ch] text-[clamp(2rem,5vw+0.6rem,4.6rem)] text-cream">{t(locale, "home.appleTitle")}</h2>
              <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-cream/85">{t(locale, "home.appleBody")}</p>
              <Button asChild variant="primary" className="mt-10 w-fit">
                <LocaleLink to="/p/$slug" params={{ slug: vinegar.slug }}>
                  {t(locale, "home.appleCta")}
                </LocaleLink>
              </Button>
            </div>
          </section>
          <p className="photo-credit shell-x">{t(locale, "photo.vinegar")}</p>
        </>
      )}

      <section className="grid lg:grid-cols-2">
        <LocaleLink to="/hikaye" className="group relative min-h-[70vh] overflow-hidden focus-inset">
          <Pic src="/photos/taha-jars.jpg" alt="" sizes="(min-width: 1024px) 50vw, 100vw" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10 transition-opacity duration-500 group-hover:opacity-75" />
          <div className="on-photo relative z-10 flex h-full min-h-[70vh] flex-col justify-end p-[6vw]">
            <h2 className="max-w-[12ch] text-[clamp(2rem,3.4vw,3.2rem)] text-cream">{t(locale, "home.splitOwn")}</h2>
            <p className="mt-4 max-w-[36ch] text-cream/85">{t(locale, "home.splitOwnBody")}</p>
          </div>
        </LocaleLink>
        <LocaleLink to="/shop" className="group relative min-h-[70vh] overflow-hidden focus-inset">
          <Pic src="/photos/herbs.jpg" alt="" sizes="(min-width: 1024px) 50vw, 100vw" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10 transition-opacity duration-500 group-hover:opacity-75" />
          <div className="on-photo relative z-10 flex h-full min-h-[70vh] flex-col justify-end p-[6vw]">
            <h2 className="max-w-[14ch] text-[clamp(2rem,3.4vw,3.2rem)] text-cream">{t(locale, "home.splitPick")}</h2>
            <p className="mt-4 max-w-[36ch] text-cream/85">{t(locale, "home.splitPickBody")}</p>
          </div>
        </LocaleLink>
      </section>

      <Reveal className="shell-x section-y">
        <hr className="rule-line" aria-hidden="true" />
        <h2 className="mt-10 max-w-[16ch] text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "home.picks")}</h2>
        <div className="mt-14 grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <Button asChild variant="outline" className="mt-14">
          <LocaleLink to="/shop">{t(locale, "home.cta")}</LocaleLink>
        </Button>
      </Reveal>

      <section className="relative min-h-[70dvh] overflow-hidden">
        <div className="hero-still">
          <Pic src="/photos/shop-front.jpg" alt={t(locale, "photo.shop")} sizes="100vw" loading="lazy" decoding="async" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/72 to-ink/30" />
        <div className="on-photo relative z-10 flex min-h-[70dvh] flex-col justify-end shell-x py-20">
          <h2 className="max-w-[14ch] text-[clamp(2rem,6vw+0.4rem,5rem)] text-cream">{t(locale, "home.close")}</h2>
          <p className="mt-6 max-w-[46ch] text-lg text-cream/85">{t(locale, "home.closeBody")}</p>
        </div>
      </section>
      <p className="photo-credit shell-x">{t(locale, "photo.shop")}</p>
    </>
  );
}

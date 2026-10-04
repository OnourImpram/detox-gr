import { createFileRoute } from "@tanstack/react-router";
import { usePaymentsEnabled } from "@/lib/payments";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { LocaleLink } from "@/components/locale-link";
import { PhotoChapter } from "@/components/photo-chapter";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/social-links";
import { t } from "@/lib/i18n";
import { PHOTO } from "@/lib/photos";
import { aboutJsonLd, faqJsonLd, localeFromSearch, pageOrigin, personJsonLd, seoHead } from "@/lib/seo";
import { SHOP_FACTS, SOCIAL } from "@/lib/social";

export const Route = createFileRoute("/hikaye")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.story.title"),
      description: t(locale, "seo.story.desc"),
      path: "/hikaye",
      locale,
      origin: pageOrigin(),
      image: PHOTO.taha,
      jsonLd: [
        aboutJsonLd(pageOrigin(), locale),
        personJsonLd(pageOrigin()),
        faqJsonLd(pageOrigin(), locale),
      ],
    });
  },
  component: Story,
});

const STRIP: { src: string; cap: string }[] = [
  { src: PHOTO.shop, cap: "photo.shop" },
  { src: PHOTO.tahaHoney, cap: "photo.honeyHold" },
  { src: PHOTO.tahaSoaps, cap: "photo.tahaSoaps" },
  { src: PHOTO.sage, cap: "photo.sage" },
  { src: PHOTO.soapsTable, cap: "photo.soaps" },
  { src: PHOTO.cream, cap: "photo.cream" },
];

function Story() {
  const locale = useLocale();
  const payments = usePaymentsEnabled();
  return (
    <section>
      <PhotoChapter src={PHOTO.taha} altKey="photo.taha" ken portrait minClass="min-h-[88dvh]" priority>
        <p className="kicker">{SHOP_FACTS.owner}</p>
        <h1 className="mt-5 max-w-[20ch] text-[clamp(1.9rem,6.2vw+0.6rem,5.75rem)] leading-none text-cream">
          {t(locale, "story.lineA")} <em>{t(locale, "story.lineEm")}</em>
        </h1>
        <p id="aeo-lead" className="mt-6 max-w-[36ch] text-xl text-cream/88">
          {t(locale, "story.axis")}
        </p>
        <Button asChild variant="outline" className="mt-8 w-fit border-cream/40 text-cream hover:border-primary hover:text-primary">
          <LocaleLink to="/shop">{t(locale, "home.cta")}</LocaleLink>
        </Button>
      </PhotoChapter>

      <div className="shell-x section-y">
        <div className="mx-auto max-w-[68ch]">
          <p className="prose-long text-muted">{t(locale, "story.p1")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.physio")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.p2")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.p3")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.p4")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.appleLimit")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.p5")}</p>
          <p className="prose-long mt-5 text-muted">{t(locale, "story.p6")}</p>
        </div>
      </div>

      <div className="grid gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {STRIP.map(({ src, cap }) => (
          <figure key={src} className="relative min-h-[42vh] overflow-hidden bg-bg">
            <Pic
              src={src}
              alt={t(locale, cap)}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              loading="lazy"
              decoding="async"
              className="img-in absolute inset-0 size-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-ink/85 p-4 text-xs text-cream">
              {t(locale, cap)}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="shell-x section-y">
        <div className="mx-auto max-w-[68ch]">
          <aside className="rounded-[6px] border border-border bg-raised p-6 sm:p-8">
            <p className="kicker">{t(locale, "story.draftKicker")}</p>
            <p className="mt-3 text-sm text-muted">{t(locale, "story.draftLead")}</p>
            <p className="prose-long mt-4 text-muted">{t(locale, "story.draft")}</p>
          </aside>

          <hr className="rule-line mt-16" aria-hidden="true" />

          <aside id="aeo-faq" className="mt-10">
            <h2>{t(locale, "faq.title")}</h2>
            <dl className="mt-6">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div key={n} className="hairline-soft border-t py-6 first:border-t-0 first:pt-0">
                  <dt className="font-medium text-cream">{t(locale, `faq.q${n}`)}</dt>
                  <dd className="mt-2 leading-relaxed text-muted">{t(locale, n === 2 ? (payments ? "faq.a2Open" : "faq.a2Closed") : `faq.a${n}`)}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <SocialLinks className="mt-12" />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary">
              <a href={SOCIAL.instagram.href} target="_blank" rel="me noopener noreferrer">
                Instagram {SOCIAL.instagram.handle}
              </a>
            </Button>
            <Button asChild variant="outline">
              <LocaleLink to="/shop">{t(locale, "home.cta")}</LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AcikMi } from "@/components/acik-mi";
import { useLocale } from "@/lib/use-locale";
import { Pic } from "@/components/pic";
import { ShopFacts } from "@/components/shop-facts";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { PHOTO } from "@/lib/photos";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";
import { SHOP_FACTS, SOCIAL } from "@/lib/social";

export const Route = createFileRoute("/iletisim")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.contact.title"),
      description: t(locale, "seo.contact.desc"),
      path: "/iletisim",
      locale,
      origin: pageOrigin(),
      image: PHOTO.shop,
    });
  },
  component: Contact,
});

function Contact() {
  const locale = useLocale();
  return (
    <section className="shell-x section-y">
      <div className="mx-auto max-w-3xl">
        <p className="kicker">{t(locale, "contact.kicker")}</p>
        <AcikMi className="mt-4 text-muted" />
      <h1 className="mt-3 text-[clamp(1.9rem,5vw,4rem)]">{t(locale, "contact.title")}</h1>
        <p className="mt-4 max-w-[52ch] text-muted">{t(locale, "contact.lead")}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <figure>
            <Pic
              src={PHOTO.shop}
              alt={t(locale, "photo.shop")}
              sizes="(min-width: 640px) 50vw, 100vw"
              loading="lazy"
              decoding="async"
              className="img-in aspect-[4/5] w-full rounded-[6px] border border-border bg-ink object-cover"
            />
            <figcaption className="photo-credit">{t(locale, "photo.shop")}</figcaption>
          </figure>
          <figure>
            <Pic
              src={PHOTO.taha}
              alt={t(locale, "photo.taha")}
              sizes="(min-width: 640px) 50vw, 100vw"
              loading="lazy"
              decoding="async"
              className="img-in aspect-[4/5] w-full rounded-[6px] border border-border bg-ink object-cover object-[50%_18%]"
            />
            <figcaption className="photo-credit">{t(locale, "photo.taha")}</figcaption>
          </figure>
        </div>
        <Button asChild variant="primary" className="mt-8">
          <a href={SOCIAL.instagram.href} target="_blank" rel="me noopener noreferrer">
            Instagram {SOCIAL.instagram.handle}
          </a>
        </Button>
        <hr className="rule-line mt-12" aria-hidden="true" />
        <dl className="mt-10 space-y-8 text-sm">
          <div>
            <dt className="micro text-faint">{t(locale, "contact.shop")}</dt>
            <dd className="mt-2 text-lg">{SHOP_FACTS.shop}</dd>
          </div>
          <div>
            <dt className="micro text-faint">{t(locale, "contact.owner")}</dt>
            <dd className="mt-2">{SHOP_FACTS.owner}</dd>
          </div>
          <div>
            <dt className="micro text-faint">{t(locale, "contact.address")}</dt>
            <dd className="mt-3">
              <ShopFacts />
            </dd>
          </div>
          <div>
            <dt className="micro text-faint">{t(locale, "contact.channels")}</dt>
            <dd className="mt-3">
              <SocialLinks />
            </dd>
          </div>
        </dl>
        <p className="mt-10 text-sm text-muted">{t(locale, "contact.missing")}</p>
      </div>
    </section>
  );
}

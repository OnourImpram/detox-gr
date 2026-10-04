import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/i18n";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";
import { SOCIAL } from "@/lib/social";
import { SocialLinks } from "@/components/social-links";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ticari")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: t(locale, "seo.trade.title"),
      description: t(locale, "seo.trade.desc"),
      path: "/ticari",
      locale,
      origin: pageOrigin(),
    });
  },
  component: Trade,
});

function Trade() {
  const locale = useLocale();
  return (
    <section className="mx-auto max-w-2xl px-[6vw] py-14">
      <p className="kicker">{t(locale, "footer.trade")}</p>
      <h1 className="mt-3 text-[clamp(1.9rem,5vw+0.5rem,4rem)]">{t(locale, "trade.title")}</h1>
      <p className="mt-4 max-w-[52ch] text-muted">{t(locale, "trade.lead")}</p>
      <p className="mt-6 max-w-[52ch] text-sm text-muted">{t(locale, "trade.noSend")}</p>
      <Button asChild variant="primary" className="mt-8">
        <a href={SOCIAL.instagram.href} target="_blank" rel="me noopener noreferrer">
          Instagram {SOCIAL.instagram.handle}
        </a>
      </Button>
      <SocialLinks className="mt-6" />
    </section>
  );
}

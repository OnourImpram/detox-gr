import { createFileRoute } from "@tanstack/react-router";
import { useLocale } from "@/lib/use-locale";
import { LocaleLink } from "@/components/locale-link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { localeFromSearch, pageOrigin, seoHead, BRAND } from "@/lib/seo";

export const Route = createFileRoute("/odeme/iptal")({
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({
      title: `${t(locale, "checkout.cancel")} | ${BRAND}`,
      description: t(locale, "checkout.cancelLead"),
      path: "/odeme/iptal",
      locale,
      origin: pageOrigin(),
      noindex: true,
    });
  },
  component: Cancelled,
});

function Cancelled() {
  const locale = useLocale();
  return (
    <section className="px-[6vw] py-16">
      <h1 className="text-4xl">{t(locale, "checkout.cancel")}</h1>
      <p className="mt-3 max-w-xl text-muted">{t(locale, "checkout.cancelLead")}</p>
      <Button asChild variant="primary" className="mt-8">
        <LocaleLink to="/odeme">{t(locale, "checkout.submit")}</LocaleLink>
      </Button>
    </section>
  );
}

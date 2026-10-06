import { createFileRoute } from "@tanstack/react-router";
import { ProductExplorer } from "@/components/product-explorer";
import { useLocale } from "@/lib/use-locale";
import { PRODUCTS } from "@/lib/catalog";
import { r } from "@/lib/refinement-copy";
import { t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang-search";
import { parseDiscoverySearch } from "@/lib/discovery";
import { localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>) => ({ ...parseLang(search), ...parseDiscoverySearch(search) }),
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    return seoHead({ title: t(locale, "seo.shop.title"), description: t(locale, "seo.shop.desc"), path: "/shop", locale, origin: pageOrigin() });
  },
  component: Shop,
});

function Shop() {
  const locale = useLocale();
  const search = Route.useSearch();
  return (
    <section className="dt-catalogue shell-x">
      <header className="dt-page-heading">
        <p className="kicker">{t(locale, "home.kicker")}</p>
        <h1>{search.q.trim() ? r(locale, "results") : t(locale, "shop.title")}</h1>
        <p>{t(locale, "shop.fullHint")}</p>
      </header>
      <ProductExplorer products={PRODUCTS} />
    </section>
  );
}

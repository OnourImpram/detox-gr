import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductExplorer } from "@/components/product-explorer";
import { LocaleLink } from "@/components/locale-link";
import { categoryById, productsByCategory } from "@/lib/catalog";
import { categoryBlurb, categoryTitle, t } from "@/lib/i18n";
import { parseLang } from "@/lib/lang-search";
import { parseDiscoverySearch } from "@/lib/discovery";
import { useLocale } from "@/lib/use-locale";
import { breadcrumbJsonLd, collectionJsonLd, localeFromSearch, pageOrigin, seoHead } from "@/lib/seo";
export const Route = createFileRoute("/shop/$category")({
  validateSearch: search => ({ ...parseLang(search), ...parseDiscoverySearch(search) }),
  loader: ({ params }) => { if (!categoryById(params.category)) throw notFound(); },
  head: ({ match }) => {
    const locale = localeFromSearch(match.search);
    const category = categoryById(match.params.category);
    if (!category) return {};
    const origin = pageOrigin();
    return seoHead({ title: t(locale, "seo.collection.title", { name: categoryTitle(category.id, locale) }), description: categoryBlurb(category.id, locale), path: `/shop/${category.id}`, locale, origin, jsonLd: [breadcrumbJsonLd(origin, locale, [{ name: t(locale, "nav.shop"), path: "/shop" }, { name: categoryTitle(category.id, locale), path: `/shop/${category.id}` }]), collectionJsonLd(origin, locale, category.id)] });
  },
  component: Collection,
});
function Collection() {
  const locale = useLocale();
  const { category: id } = Route.useParams();
  const category = categoryById(id);
  if (!category) throw notFound();
  return <section className="dt-container dt-shop"><header className="dt-shop__heading"><LocaleLink to="/shop" className="dt-text-link">{t(locale, "shop.back")}</LocaleLink><h1>{categoryTitle(category.id, locale)}</h1><p>{categoryBlurb(category.id, locale)}</p></header><ProductExplorer products={productsByCategory(category.id)} fixedCategory={category.id} /></section>;
}

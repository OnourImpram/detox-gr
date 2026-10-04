import { useEffect, useId, useState, type FormEvent } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ArrowDown, X } from "lucide-react";
import { CATEGORIES, featured, type Product } from "@/lib/catalog";
import { categoryTitle, localeMeta, productBlurb, productName, t } from "@/lib/i18n";
import { discoverProducts, parseDiscoverySearch, visiblePage, type DiscoverySearch } from "@/lib/discovery";
import { useLocale } from "@/lib/use-locale";
import { ux } from "@/lib/storefront-copy";
import { ProductCard } from "./product-card";
import { Button } from "./ui/button";

export function ProductExplorer({ products, fixedCategory }: { products: Product[]; fixedCategory?: string }) {
  const locale = useLocale();
  const navigate = useNavigate();
  const raw = useRouterState({ select: (state) => state.location.search }) as Record<string, unknown>;
  const filters = parseDiscoverySearch(raw);
  const [draft, setDraft] = useState(filters.q);
  const id = useId();
  useEffect(() => { setDraft(filters.q); }, [filters.q]);

  const selected = discoverProducts(products, { ...filters, q: draft, category: fixedCategory ?? filters.category }, {
    locale: localeMeta(locale).html,
    text: (product) => [productName(product, locale), productBlurb(product, locale)],
    name: (product) => productName(product, locale),
    featuredIds: featured().map((product) => product.sourceId),
  });
  const page = visiblePage(selected, draft === filters.q ? filters.page : 1);
  const availableCategories = CATEGORIES.filter((category) => products.some((product) => product.category === category.id));
  const active = draft.trim() !== "" || filters.shelf !== "all" || (!fixedCategory && filters.category !== "all") || filters.sort !== "featured";

  function update(delta: Partial<DiscoverySearch>) {
    void navigate({
      search: ((previous: Record<string, unknown>) => ({
        ...previous,
        ...parseDiscoverySearch({ ...previous, q: draft, page: 1, ...delta }),
      })) as never,
      replace: true,
      resetScroll: false,
    });
  }
  function submit(event: FormEvent) { event.preventDefault(); update({ q: draft }); }
  function reset() { setDraft(""); update({ q: "", shelf: "all", category: "all", sort: "featured", page: 1 }); }

  return (
    <div className="dt-explorer" data-testid="product-explorer">
      <div className="dt-explorer__toolbar">
        <form onSubmit={submit} role="search" className="dt-explorer__search">
          <label htmlFor={`${id}-search`}>{t(locale, "nav.search")}</label>
          <div className="dt-search-field">
            <Search aria-hidden="true" size={18} />
            <input id={`${id}-search`} type="search" autoComplete="off" maxLength={120} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t(locale, "shop.filter")} />
            <button type="submit" aria-label={t(locale, "nav.search")}><Search aria-hidden="true" size={18} /></button>
          </div>
        </form>
        {!fixedCategory && (
          <label className="dt-explorer__select">{ux(locale, "category")}
            <select value={filters.category} onChange={(event) => update({ category: event.target.value })}>
              <option value="all">{t(locale, "shop.all")}</option>
              {availableCategories.map((category) => <option key={category.id} value={category.id}>{categoryTitle(category.id, locale)}</option>)}
            </select>
          </label>
        )}
        <label className="dt-explorer__select">{t(locale, "shop.sort")}
          <select value={filters.sort} onChange={(event) => update({ sort: event.target.value as DiscoverySearch["sort"] })}>
            <option value="featured">{ux(locale, "featured")}</option>
            <option value="name">{t(locale, "shop.sortName")}</option>
            <option value="price-asc">{t(locale, "shop.sortPriceAsc")}</option>
            <option value="price-desc">{t(locale, "shop.sortPriceDesc")}</option>
          </select>
        </label>
      </div>
      <div className="dt-explorer__controls">
        <fieldset className="dt-shelf-filter">
          <legend className="sr-only">{ux(locale, "shelf")}</legend>
          {([['all', t(locale, 'home.all')], ['house', t(locale, 'home.chOwn')], ['selected', t(locale, 'home.chPick')]] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filters.shelf === value} onClick={() => update({ shelf: value })}>{label}</button>
          ))}
        </fieldset>
        {active && <button type="button" className="dt-clear" onClick={reset}><X size={16} aria-hidden="true" />{ux(locale, "reset")}</button>}
      </div>
      <p className="dt-explorer__count" aria-live="polite" aria-atomic="true">
        {draft.trim() ? t(locale, "shop.results", { q: draft.trim(), n: selected.length }) : t(locale, "shop.count", { n: selected.length })}
      </p>
      {page.items.length > 0 ? (
        <div className="dt-product-grid" data-testid="product-grid">
          {page.items.map((product) => <ProductCard key={product.sourceId} product={product} />)}
        </div>
      ) : (
        <div className="dt-empty"><Search size={28} aria-hidden="true" /><h2>{t(locale, "shop.empty")}</h2><Button variant="outline" onClick={reset}>{ux(locale, "reset")}</Button></div>
      )}
      <div className="dt-pagination">
        <p>{ux(locale, "shown", { shown: page.shown, total: page.total })}</p>
        {page.hasMore && <Button variant="outline" onClick={() => update({ page: (draft === filters.q ? filters.page : 1) + 1 })}>{ux(locale, "more")}<ArrowDown size={16} aria-hidden="true" /></Button>}
      </div>
    </div>
  );
}

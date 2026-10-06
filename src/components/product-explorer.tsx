import { useId, type FormEvent } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Search, ArrowDown, X, LayoutGrid, List } from 'lucide-react';
import { CATEGORIES, featured, type Product } from '@/lib/catalog';
import { categoryTitle, localeMeta, productBlurb, productName, t } from '@/lib/i18n';
import { discoverProducts, parseDiscoverySearch, suggestProducts, visiblePage, type DiscoverySearch } from '@/lib/discovery';
import { useLocale } from '@/lib/use-locale';
import { ux } from '@/lib/storefront-copy';
import { r } from '@/lib/refinement-copy';
import { ProductCard } from './product-card';
import { Button } from './ui/button';

export function ProductExplorer({ products, fixedCategory }: { products: Product[]; fixedCategory?: string }) {
  const locale = useLocale();
  const navigate = useNavigate();
  const raw = useRouterState({ select: state => state.location.search }) as Record<string, unknown>;
  const filters = parseDiscoverySearch(raw);
  const id = useId();
  const selected = discoverProducts(products, { ...filters, category: fixedCategory ?? filters.category }, {
    locale: localeMeta(locale).html,
    text: product => [productName(product, locale), productBlurb(product, locale)],
    name: product => productName(product, locale),
    featuredIds: featured().map(product => product.sourceId),
  });
  const page = visiblePage(selected, filters.page);
  const base = discoverProducts(products, { ...filters, q: '', category: fixedCategory ?? filters.category });
  const suggestions = selected.length ? [] : suggestProducts(base, filters.q, product => productName(product, locale));
  const availableCategories = CATEGORIES.filter(category => products.some(product => product.category === category.id));
  const active = Boolean(filters.q.trim() || filters.shelf !== 'all' || (!fixedCategory && filters.category !== 'all') || filters.media !== 'all' || filters.sort !== 'featured');
  function update(delta: Partial<DiscoverySearch>) {
    void navigate({ search: ((previous: Record<string, unknown>) => ({ ...previous, ...parseDiscoverySearch({ ...previous, page: 1, ...delta }) })) as never, replace: true, resetScroll: false });
  }
  function submit(event: FormEvent) { event.preventDefault(); update({ q: filters.q, page: 1 }); }
  function reset() { update({ q: '', shelf: 'all', category: 'all', sort: 'featured', media: 'all', page: 1 }); }
  return <div className="dt-explorer" data-testid="product-explorer">
    <div className="dt-explorer__toolbar">
      <form onSubmit={submit} role="search" className="dt-explorer__search">
        <label htmlFor={`${id}-search`}>{t(locale, 'nav.search')}</label>
        <div className="dt-search-field"><Search aria-hidden="true" size={18} /><input id={`${id}-search`} type="search" autoComplete="off" maxLength={120} value={filters.q} onChange={event => update({ q: event.target.value })} placeholder={r(locale, 'searchHint')} aria-controls={`${id}-results`} /><button type="submit" aria-label={t(locale, 'nav.search')}><Search aria-hidden="true" size={18} /></button></div>
      </form>
      {!fixedCategory && <label className="dt-explorer__select">{ux(locale, 'category')}<select value={filters.category} onChange={event => update({ category: event.target.value })}><option value="all">{t(locale, 'shop.all')}</option>{availableCategories.map(category => <option key={category.id} value={category.id}>{categoryTitle(category.id, locale)} ({products.filter(product => product.category === category.id).length})</option>)}</select></label>}
      <label className="dt-explorer__select">{t(locale, 'shop.sort')}<select value={filters.sort} onChange={event => update({ sort: event.target.value as DiscoverySearch['sort'] })}><option value="featured">{ux(locale, 'featured')}</option><option value="name">{t(locale, 'shop.sortName')}</option><option value="price-asc">{t(locale, 'shop.sortPriceAsc')}</option><option value="price-desc">{t(locale, 'shop.sortPriceDesc')}</option></select></label>
    </div>
    <div className="dt-explorer__controls">
      <fieldset className="dt-shelf-filter"><legend className="sr-only">{ux(locale, 'shelf')}</legend>{([['all', t(locale, 'home.all')], ['house', t(locale, 'home.chOwn')], ['selected', t(locale, 'home.chPick')]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filters.shelf === value} onClick={() => update({ shelf: value })}>{label}</button>)}</fieldset>
      <label className="customer-pictured"><input type="checkbox" checked={filters.media === 'pictured'} onChange={event => update({ media: event.target.checked ? 'pictured' : 'all' })} />{r(locale, 'pictured')}</label>
    </div>
    {active && <div className="customer-filters" aria-label={r(locale, 'active')}>
      {filters.q.trim() && <button type="button" onClick={() => update({ q: '' })}>{filters.q}<X size={14} aria-hidden="true" /><span className="sr-only">{t(locale, 'cart.remove')}</span></button>}
      {!fixedCategory && filters.category !== 'all' && <button type="button" onClick={() => update({ category: 'all' })}>{categoryTitle(filters.category as Product['category'], locale)}<X size={14} aria-hidden="true" /><span className="sr-only">{t(locale, 'cart.remove')}</span></button>}
      {filters.shelf !== 'all' && <button type="button" onClick={() => update({ shelf: 'all' })}>{t(locale, filters.shelf === 'house' ? 'home.chOwn' : 'home.chPick')}<X size={14} aria-hidden="true" /><span className="sr-only">{t(locale, 'cart.remove')}</span></button>}
      <button type="button" className="dt-clear" onClick={reset}>{ux(locale, 'reset')}<X size={14} aria-hidden="true" /></button>
    </div>}
    <div className="customer-results-bar"><p className="dt-explorer__count" role="status" aria-live="polite" aria-atomic="true">{filters.q.trim() ? t(locale, 'shop.results', { q: filters.q.trim(), n: selected.length }) : t(locale, 'shop.count', { n: selected.length })}</p>
      <div className="customer-view" role="group" aria-label={`${r(locale, 'grid')}, ${r(locale, 'list')}`}><button type="button" aria-pressed={filters.view === 'grid'} onClick={() => update({ view: 'grid', page: filters.page })} aria-label={r(locale, 'grid')}><LayoutGrid size={18} aria-hidden="true" /></button><button type="button" aria-pressed={filters.view === 'list'} onClick={() => update({ view: 'list', page: filters.page })} aria-label={r(locale, 'list')}><List size={18} aria-hidden="true" /></button></div>
    </div>
    {page.items.length ? <div id={`${id}-results`} className="dt-product-grid" data-testid="product-grid" data-view={filters.view}>{page.items.map(product => <ProductCard key={product.sourceId} product={product} discovery={filters} />)}</div> : <div id={`${id}-results`} className="dt-empty"><Search size={28} aria-hidden="true" /><h2>{t(locale, 'shop.empty')}</h2>{suggestions.length > 0 && <div className="customer-suggestions"><p>{r(locale, 'suggest')}</p>{suggestions.map(product => <button key={product.sourceId} type="button" onClick={() => update({ q: productName(product, locale) })}>{productName(product, locale)}</button>)}</div>}<Button variant="outline" onClick={reset}>{ux(locale, 'reset')}</Button></div>}
    <div className="dt-pagination"><p>{ux(locale, 'shown', { shown: page.shown, total: page.total })}</p>{page.hasMore && <Button variant="outline" onClick={() => update({ page: filters.page + 1 })}>{ux(locale, 'more')}<ArrowDown size={16} aria-hidden="true" /></Button>}</div>
  </div>;
}

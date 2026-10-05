export const CATEGORY_IDS = ['lokum', 'soap', 'care', 'cream', 'essential', 'honey', 'pantry', 'nuts', 'dates', 'salt', 'flour', 'form', 'spice', 'oil'] as const;
export type DiscoverySearch = {
  q: string;
  shelf: 'all' | 'house' | 'selected';
  category: string;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'name';
  page: number;
  view: "grid" | "list";
};
export type DiscoverableProduct = {
  slug: string;
  sourceId: string;
  category: string;
  name: string;
  blurb: string;
  priceEur: number | null;
  houseNamed: boolean;
};

/** Unicode folding for discovery only. Original product names are never rewritten. */
export function normalizeSearch(value: string): string {
  return value.replace(/ı/g, 'i').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/ς/g, 'σ').replace(/\s+/g, ' ').trim();
}

export function parseDiscoverySearch(input: Record<string, unknown>): DiscoverySearch {
  const page = typeof input.page === 'number' ? input.page : typeof input.page === 'string' && /^\d+$/.test(input.page) ? Number(input.page) : 1;
  return {
    q: typeof input.q === 'string' ? input.q.slice(0, 120) : '',
    shelf: input.shelf === 'house' || input.shelf === 'selected' ? input.shelf : 'all',
    category: typeof input.category === 'string' && (CATEGORY_IDS as readonly string[]).includes(input.category) ? input.category : 'all',
    sort: input.sort === 'price-asc' || input.sort === 'price-desc' || input.sort === 'name' ? input.sort : 'featured',
    view: input.view === "list" ? "list" : "grid",
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100) : 1,
  };
}

export function discoverProducts<T extends DiscoverableProduct>(
  products: readonly T[],
  input: Partial<DiscoverySearch>,
  options: { locale?: string; text?: (product: T) => string[]; name?: (product: T) => string; featuredIds?: readonly string[] } = {},
): T[] {
  const filters = parseDiscoverySearch(input);
  const terms = normalizeSearch(filters.q).split(' ').filter(Boolean);
  const result = products.filter((product) => {
    if (filters.shelf === 'house' && !product.houseNamed) return false;
    if (filters.shelf === 'selected' && product.houseNamed) return false;
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (terms.length === 0) return true;
    const haystack = normalizeSearch([product.name, product.blurb, product.sourceId, ...(options.text?.(product) ?? [])].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
  const collator = new Intl.Collator(options.locale ?? 'tr', { sensitivity: 'base', numeric: true });
  const featured = new Map((options.featuredIds ?? []).map((id, index) => [id, index]));
  const tie = (a: T, b: T) => collator.compare(a.sourceId, b.sourceId);
  return result.sort((a, b) => {
    if (filters.sort === 'name') return collator.compare(options.name?.(a) ?? a.name, options.name?.(b) ?? b.name) || tie(a, b);
    if (filters.sort === 'price-asc' || filters.sort === 'price-desc') {
      const av = a.priceEur !== null && Number.isFinite(a.priceEur) && a.priceEur > 0;
      const bv = b.priceEur !== null && Number.isFinite(b.priceEur) && b.priceEur > 0;
      if (!av || !bv) return av ? -1 : bv ? 1 : tie(a, b);
      const delta = (a.priceEur as number) - (b.priceEur as number);
      return (filters.sort === 'price-asc' ? delta : -delta) || tie(a, b);
    }
    return (featured.get(a.sourceId) ?? Number.MAX_SAFE_INTEGER) - (featured.get(b.sourceId) ?? Number.MAX_SAFE_INTEGER) || tie(a, b);
  });
}

export function visiblePage<T>(items: readonly T[], page = 1, pageSize = 24): { items: T[]; total: number; shown: number; hasMore: boolean } {
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100) : 1;
  const safeSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 24;
  const shown = Math.min(items.length, safePage * safeSize);
  return { items: items.slice(0, shown), total: items.length, shown, hasMore: shown < items.length };
}

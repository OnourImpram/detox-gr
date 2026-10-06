export const CATEGORY_IDS = ['lokum', 'soap', 'care', 'cream', 'essential', 'honey', 'pantry', 'nuts', 'dates', 'salt', 'flour', 'form', 'spice', 'oil'] as const;
export type DiscoverySearch = {
  q: string;
  shelf: 'all' | 'house' | 'selected';
  category: string;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'name';
  page: number;
  view: 'grid' | 'list';
  media: 'all' | 'pictured';
};
export type DiscoverableProduct = {
  slug: string;
  sourceId: string;
  category: string;
  name: string;
  blurb: string;
  priceEur: number | null;
  houseNamed: boolean;
  image?: string | null;
};

/** Unicode folding for discovery only. Original product names are never rewritten. */
export function normalizeSearch(value: string): string {
  return value.replace(/ı/g, 'i').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().replace(/ς/g, 'σ').replace(/\s+/g, ' ').trim()
    .replace(/\bcorek otu\b/g, 'corekotu').replace(/\bkeci boynuzu\b/g, 'keciboynuzu');
}

export function parseDiscoverySearch(input: Record<string, unknown>): DiscoverySearch {
  const page = typeof input.page === 'number' ? input.page : typeof input.page === 'string' && /^\d+$/.test(input.page) ? Number(input.page) : 1;
  return {
    view: input.view === 'list' ? 'list' : 'grid',
    media: input.media === 'pictured' ? 'pictured' : 'all',
    q: typeof input.q === 'string' ? input.q.slice(0, 120) : '',
    shelf: input.shelf === 'house' || input.shelf === 'selected' ? input.shelf : 'all',
    category: typeof input.category === 'string' && (CATEGORY_IDS as readonly string[]).includes(input.category) ? input.category : 'all',
    sort: input.sort === 'price-asc' || input.sort === 'price-desc' || input.sort === 'name' ? input.sort : 'featured',
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
    if (filters.media === 'pictured' && !product.image) return false;
    if (terms.length === 0) return true;
    const haystack = normalizeSearch([product.name, product.blurb, product.sourceId, ...(options.text?.(product) ?? [])].join(' '));
    return terms.every((term) => haystack.includes(term));
  });
  const collator = new Intl.Collator(options.locale ?? 'tr', { sensitivity: 'base', numeric: true });
  const featured = new Map((options.featuredIds ?? []).map((id, index) => [id, index]));
  const tie = (a: T, b: T) => collator.compare(a.sourceId, b.sourceId);
  const rank = (product: T) => {
    const query = normalizeSearch(filters.q);
    const names = [product.name, options.name?.(product) ?? ''].map(normalizeSearch);
    if (!query) return 0;
    if (normalizeSearch(product.sourceId) === query) return 0;
    if (names.includes(query)) return 1;
    if (names.some(name => name.startsWith(query))) return 2;
    if (names.some(name => terms.every(term => name.includes(term)))) return 3;
    return 4;
  };
  return result.sort((a, b) => {
    if (filters.sort === 'name') return collator.compare(options.name?.(a) ?? a.name, options.name?.(b) ?? b.name) || tie(a, b);
    if (filters.sort === 'price-asc' || filters.sort === 'price-desc') {
      const av = a.priceEur !== null && Number.isFinite(a.priceEur) && a.priceEur > 0;
      const bv = b.priceEur !== null && Number.isFinite(b.priceEur) && b.priceEur > 0;
      if (!av || !bv) return av ? -1 : bv ? 1 : tie(a, b);
      const delta = (a.priceEur as number) - (b.priceEur as number);
      return (filters.sort === 'price-asc' ? delta : -delta) || tie(a, b);
    }
    return rank(a) - rank(b) || (featured.get(a.sourceId) ?? Number.MAX_SAFE_INTEGER) - (featured.get(b.sourceId) ?? Number.MAX_SAFE_INTEGER) || tie(a, b);
  });
}

export function visiblePage<T>(items: readonly T[], page = 1, pageSize = 24): { items: T[]; total: number; shown: number; hasMore: boolean } {
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100) : 1;
  const safeSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 24;
  const shown = Math.min(items.length, safePage * safeSize);
  return { items: items.slice(0, shown), total: items.length, shown, hasMore: shown < items.length };
}

/** Suggestions never replace the query, broaden a filter or silently alter results. */
export function suggestProducts<T extends DiscoverableProduct>(products: readonly T[], query: string, name: (product: T) => string = product => product.name): T[] {
  const term = normalizeSearch(query);
  if (term.length < 4 || term.length > 60 || term.includes(' ')) return [];
  const distance = (a: string, b: string): number => {
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
      previous = row;
    }
    return previous[b.length];
  };
  const threshold = term.length >= 8 ? 2 : 1;
  return products.map(product => ({ product, score: Math.min(...normalizeSearch(name(product)).split(' ').map(word => Math.abs(word.length - term.length) > threshold ? 99 : distance(term, word))) }))
    .filter(item => item.score <= threshold).sort((a, b) => a.score - b.score || a.product.sourceId.localeCompare(b.product.sourceId))
    .slice(0, 3).map(item => item.product);
}

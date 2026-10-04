import test from 'node:test';
import assert from 'node:assert/strict';
import { TARGET_MARKETS, launchBlockers, saleBlockers, validateQuantity, allowedCheckoutOrigin, maskCheckoutEmail } from '../src/lib/commerce-policy.ts';
import { sanitizeCart, sanitizePersistedShop } from '../src/lib/cart-storage.ts';
import { normalizeSearch, parseDiscoverySearch, discoverProducts, visiblePage } from '../src/lib/discovery.ts';
import { localeUrl, changeLocaleSearch } from '../src/lib/locale-navigation.ts';

const config = () => ({ mode: 'live', merchantReady: true, legalReady: true, taxReady: true, shippingReady: true, enabledCountries: ['GR', 'DE', 'NO'] });
const approved = () => ({ publish: true, priceEur: 7.5, klass: 'food', grams: 500, info: { saleApproved: true, labelReviewed: true, vatIncluded: true, stock: 6, approvedMarkets: ['GR', 'DE'], ingredients: 'Apples', allergens: 'None declared on the reviewed label' } });
const products = [
  { slug: 'cay', sourceId: 'DT3', category: 'spice', name: 'Bergamotlu ÇAY', blurb: 'Τσάι με περγαμόντο', priceEur: 8, houseNamed: false },
  { slug: 'sirke', sourceId: 'DT1', category: 'pantry', name: 'Elma sirkesi', blurb: 'Apple vinegar', priceEur: 7.5, houseNamed: true },
  { slug: 'lokum', sourceId: 'DT2', category: 'lokum', name: 'Gül lokumu', blurb: 'Rose lokum', priceEur: null, houseNamed: false },
  { slug: 'sabun', sourceId: 'DT4', category: 'soap', name: 'Lavanta sabunu', blurb: 'Lavender soap', priceEur: 7.5, houseNamed: false },
];

// Launch and product gates are separate. A token is not launch authorization.
test('retains exactly the 27 EU targets and Norway', () => { assert.equal(TARGET_MARKETS.length, 28); assert.equal(new Set(TARGET_MARKETS).size, 28); assert.ok(TARGET_MARKETS.includes('CY')); assert.ok(TARGET_MARKETS.includes('NO')); assert.ok(!TARGET_MARKETS.includes('GB')); });
test('a reviewed live configuration has no launch blockers', () => assert.deepEqual(launchBlockers(config()), []));
test('preview mode remains closed even when every approval is present', () => assert.ok(launchBlockers({ ...config(), mode: 'preview' }).includes('preview')));
for (const key of ['merchantReady', 'legalReady', 'taxReady', 'shippingReady']) {
  test(`missing ${key} blocks launch`, () => assert.ok(launchBlockers({ ...config(), [key]: false }).includes(key)));
  test(`a truthy string cannot spoof ${key}`, () => assert.ok(launchBlockers({ ...config(), [key]: 'true' }).includes(key)));
}
test('launch fails closed for missing or malformed configuration', () => { for (const value of [null, undefined, [], 'live', {}]) assert.ok(launchBlockers(value).length > 0); });
test('unsupported or empty destination configuration blocks launch', () => { for (const enabledCountries of [[], ['XX'], ['GR', 'XX'], 'GR']) assert.ok(launchBlockers({ ...config(), enabledCountries }).includes('destinations')); });
test('approved product may transact only in its approved destination', () => { assert.deepEqual(saleBlockers(approved(), 'GR', 2), []); assert.ok(saleBlockers(approved(), 'FR', 1).includes('market_unapproved')); });
test('source publish false cannot become a purchasable item', () => assert.ok(saleBlockers({ ...approved(), publish: false }, 'GR', 1).includes('unpublished')));
for (const priceEur of [null, undefined, 0, -1, NaN, Infinity, '7.50']) test(`invalid price ${String(priceEur)} is blocked`, () => assert.ok(saleBlockers({ ...approved(), priceEur }, 'GR', 1).includes('invalid_price')));
test('missing product approvals block sale', () => { for (const key of ['saleApproved', 'labelReviewed', 'vatIncluded']) { const p = approved(); delete p.info[key]; assert.ok(saleBlockers(p, 'GR', 1).length); } });
test('unknown stock is not treated as available', () => { const p = approved(); delete p.info.stock; assert.ok(saleBlockers(p, 'GR', 1).includes('stock_unverified')); });
test('stock cannot be oversold', () => assert.ok(saleBlockers(approved(), 'GR', 7).includes('insufficient_stock')));
test('zero stock is unavailable', () => { const p = approved(); p.info.stock = 0; assert.ok(saleBlockers(p, 'GR', 1).includes('out_of_stock')); });
test('Norway food policy remains closed even with product approval', () => { const p = approved(); p.info.approvedMarkets.push('NO'); assert.ok(saleBlockers(p, 'NO', 1).includes('norway_food')); });
test('cosmetics are not implicitly forbidden by Norway food policy', () => { const p = approved(); p.klass = 'cosmetic'; p.info.inci = 'Sodium Olivate, Aqua'; p.info.responsiblePerson = 'Verified operator'; p.info.approvedMarkets.push('NO'); assert.deepEqual(saleBlockers(p, 'NO', 1), []); });
test('transaction quantities must be finite integers from 1 through 20', () => { for (const q of [0, -1, 1.5, 21, Infinity, NaN, '2', null]) assert.equal(validateQuantity(q), false); for (const q of [1, 2, 20]) assert.equal(validateQuantity(q), true); });
test('quantity validation is also applied by the product gate', () => assert.ok(saleBlockers(approved(), 'GR', 1.5).includes('quantity')));

// Persisted input is hostile input, including old versions with personal data.
test('restoration strips order history, free text and unexpected fields', () => { const restored = sanitizePersistedShop({ country: 'DE', cart: [{ slug: 'sirke', qty: 2 }], orders: [{ email: 'private@example.test', address: 'private address' }], note: 'private gift note', ready: true, add: 'attack', locale: 'el' }, new Set(['sirke'])); assert.deepEqual(restored, { country: 'DE', cart: [{ slug: 'sirke', qty: 2 }] }); assert.equal(JSON.stringify(restored).includes('private'), false); });
test('malformed persisted values restore safe defaults', () => { for (const input of [null, undefined, [], 'bad', 2]) assert.deepEqual(sanitizePersistedShop(input), { country: 'GR', cart: [] }); });
test('unrecognized countries never survive restoration', () => assert.equal(sanitizePersistedShop({ country: 'XX' }).country, 'GR'));
test('cart restoration rejects malformed lines and unknown products', () => assert.deepEqual(sanitizeCart([null, {}, { slug: 'unknown', qty: 1 }, { slug: 'sirke', qty: 0 }, { slug: 'sirke', qty: 1.5 }, { slug: 'sirke', qty: '2' }, { slug: 'sirke', qty: 2, email: 'private' }], new Set(['sirke'])), [{ slug: 'sirke', qty: 2 }]));
test('duplicate restored lines merge with the transaction quantity ceiling', () => assert.deepEqual(sanitizeCart([{ slug: 'sirke', qty: 18 }, { slug: 'sirke', qty: 8 }]), [{ slug: 'sirke', qty: 20 }]));
test('restored baskets cannot exceed 40 unique lines', () => assert.equal(sanitizeCart(Array.from({ length: 55 }, (_, i) => ({ slug: `p-${i}`, qty: 1 }))).length, 40));
test('restoration does not mutate the supplied state', () => { const input = { country: 'DE', cart: [{ slug: 'sirke', qty: 2, name: 'private' }], orders: ['private'] }; const before = JSON.stringify(input); sanitizePersistedShop(input); assert.equal(JSON.stringify(input), before); });

// Localized catalogue discovery, not word replacement.
test('search folds Turkish dotted I, Greek diacritics and final sigma', () => { assert.equal(normalizeSearch('IŞIK İncir'), 'isik incir'); assert.equal(normalizeSearch('Τσάι'), normalizeSearch('τσαι')); assert.equal(normalizeSearch('Καφές'), normalizeSearch('καφεσ')); });
test('search can match localized names and source identifiers', () => { assert.deepEqual(discoverProducts(products, { q: 'τσαι' }).map(p => p.slug), ['cay']); assert.deepEqual(discoverProducts(products, { q: 'dt1' }).map(p => p.slug), ['sirke']); });
test('search requires all query terms without regular-expression injection', () => { assert.equal(discoverProducts(products, { q: 'apple vinegar' }).length, 1); assert.equal(discoverProducts(products, { q: 'apple soap' }).length, 0); assert.equal(discoverProducts(products, { q: '.*' }).length, 0); });
test('shelf and category filters intersect', () => { assert.deepEqual(discoverProducts(products, { shelf: 'house', category: 'pantry' }).map(p => p.slug), ['sirke']); assert.equal(discoverProducts(products, { shelf: 'selected', category: 'pantry' }).length, 0); });
for (const sort of ['price-asc', 'price-desc']) test(`missing prices remain last for ${sort}`, () => assert.equal(discoverProducts(products, { sort }).at(-1).slug, 'lokum'));
test('price sorting breaks ties deterministically', () => assert.deepEqual(discoverProducts(products, { sort: 'price-asc' }).map(p => p.slug), ['sirke', 'sabun', 'cay', 'lokum']));
test('featured ordering uses actual source IDs without fabricated popularity', () => assert.equal(discoverProducts(products, {}, { featuredIds: ['DT4'] })[0].slug, 'sabun'));
test('discovery accepts a locale-specific text function', () => assert.equal(discoverProducts(products, { q: 'ξύδι' }, { text: p => p.slug === 'sirke' ? ['Ξύδι μήλου'] : [] })[0].slug, 'sirke'));
test('sorting does not mutate the catalogue', () => { const before = JSON.stringify(products); discoverProducts(products, { sort: 'price-desc' }); assert.equal(JSON.stringify(products), before); });
test('URL filters reject unknown states and bounded search strings', () => { const parsed = parseDiscoverySearch({ q: 'a'.repeat(200), shelf: 'admin', sort: 'DROP', page: '-4', category: 'x' }); assert.equal(parsed.q.length, 120); assert.equal(parsed.shelf, 'all'); assert.equal(parsed.sort, 'featured'); assert.equal(parsed.page, 1); });
test('progressive pages have a stable limit and explicit remaining state', () => { const rows = Array.from({ length: 60 }, (_, id) => id); assert.deepEqual(visiblePage(rows, 2, 24), { items: rows.slice(0, 48), total: 60, shown: 48, hasMore: true }); assert.equal(visiblePage(rows, 100, 24).hasMore, false); });

// Every locale change preserves meaningful URL state, including checkout IDs.
test('explicit Turkish selection is represented in the URL', () => assert.equal(localeUrl('/shop', 'tr'), '/shop?lang=tr'));
test('language navigation preserves search, session and anchor parameters', () => assert.equal(localeUrl('/odeme/basarili?session_id=cs_test_123&lang=en#receipt', 'el'), '/odeme/basarili?session_id=cs_test_123&lang=el#receipt'));
test('language navigation preserves GitHub Pages base paths', () => assert.equal(localeUrl('/detox-gr/shop?q=lokum', 'de'), '/detox-gr/shop?q=lokum&lang=de'));
test('changing locale preserves typed router state without mutation', () => { const input = { q: 'lokum', page: 2, lang: 'en' }; assert.deepEqual(changeLocaleSearch(input, 'el'), { q: 'lokum', page: 2, lang: 'el' }); assert.equal(input.lang, 'en'); });
test('language helper rejects unsupported locales and external URLs', () => { assert.throws(() => localeUrl('/shop', 'xx')); assert.throws(() => localeUrl('//evil.example/path', 'el')); assert.throws(() => localeUrl('https://evil.example/path', 'el')); });

test('food requires reviewed ingredients and allergen information', () => { const p = approved(); delete p.info.ingredients; assert.ok(saleBlockers(p, 'GR').includes('food_information')); });
test('cosmetics require INCI and a responsible person', () => { const p = approved(); p.klass = 'cosmetic'; assert.ok(saleBlockers(p, 'GR').includes('cosmetic_information')); });
test('unknown product classification cannot be sold', () => assert.ok(saleBlockers({ ...approved(), klass: 'other' }, 'GR').includes('classification')));
test('unknown package quantity cannot pass a sale gate', () => assert.ok(saleBlockers({ ...approved(), grams: null }, 'GR').includes('quantity_information')));
test('checkout origins require a clean approved HTTPS origin', () => { assert.equal(allowedCheckoutOrigin('https://detoks.gr', 'https://detoks.gr,https://www.detoks.gr'), true); for (const origin of ['https://evil.example', 'https://detoks.gr/redirect', 'https://u:p@detoks.gr', 'http://detoks.gr', 'null']) assert.equal(allowedCheckoutOrigin(origin, 'https://detoks.gr'), false); });
test('localhost requires explicit development allowance', () => { assert.equal(allowedCheckoutOrigin('http://localhost:8080', '', false), false); assert.equal(allowedCheckoutOrigin('http://localhost:8080', '', true), true); });
test('checkout receipt never returns a full customer address', () => { assert.equal(maskCheckoutEmail('taha@example.test'), 't***@***'); assert.equal(maskCheckoutEmail('invalid'), ''); assert.equal(maskCheckoutEmail(null), ''); });

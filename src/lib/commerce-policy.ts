/** Target markets are an ambition, never an assertion that delivery is available. */
export const TARGET_MARKETS = [
  'GR', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'NO',
] as const;
export type TargetMarket = (typeof TARGET_MARKETS)[number];
export const MAX_CART_LINES = 40;
export const MAX_ITEM_QUANTITY = 20;

export type CommerceConfig = {
  mode: 'preview' | 'live';
  merchantReady: boolean;
  legalReady: boolean;
  taxReady: boolean;
  shippingReady: boolean;
  enabledCountries: string[];
};

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function isTargetMarket(value: unknown): value is TargetMarket {
  return typeof value === 'string' && (TARGET_MARKETS as readonly string[]).includes(value);
}

/** Explicit attestations are operational gates, not an automated legal certification. */
export function launchBlockers(input: unknown): string[] {
  const config = record(input);
  const blockers: string[] = [];
  if (config.mode !== 'live') blockers.push('preview');
  for (const key of ['merchantReady', 'legalReady', 'taxReady', 'shippingReady']) {
    if (config[key] !== true) blockers.push(key);
  }
  const countries = config.enabledCountries;
  if (!Array.isArray(countries) || countries.length === 0 || !countries.every(isTargetMarket)
    || new Set(countries).size !== countries.length) blockers.push('destinations');
  return blockers;
}

export function validateQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
    && value >= 1 && value <= MAX_ITEM_QUANTITY;
}

/** Browsability and a payment token never substitute for product-level approval. */
export function saleBlockers(input: unknown, country: string, qty = 1): string[] {
  const product = record(input);
  const info = record(product.info);
  const blockers: string[] = [];
  if (product.publish !== true) blockers.push('unpublished');
  if (typeof product.priceEur !== 'number' || !Number.isFinite(product.priceEur) || product.priceEur <= 0) blockers.push('invalid_price');
  if (!validateQuantity(qty)) blockers.push('quantity');
  if (info.saleApproved !== true) blockers.push('product_unapproved');
  if (info.labelReviewed !== true) blockers.push('label_unreviewed');
  if (info.vatIncluded !== true) blockers.push('tax_unconfirmed');
  if (!isTargetMarket(country) || !Array.isArray(info.approvedMarkets) || !info.approvedMarkets.includes(country)) blockers.push('market_unapproved');
  if (typeof info.stock !== 'number' || !Number.isInteger(info.stock) || info.stock < 0) {
    blockers.push('stock_unverified');
  } else if (info.stock === 0) {
    blockers.push('out_of_stock');
  } else if (validateQuantity(qty) && qty > info.stock) {
    blockers.push('insufficient_stock');
  }
  const nonempty = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
  if (product.klass !== 'food' && product.klass !== 'cosmetic') blockers.push('classification');
  if (typeof product.grams !== 'number' || !Number.isFinite(product.grams) || product.grams <= 0) blockers.push('quantity_information');
  if (product.klass === 'food' && (!nonempty(info.ingredients) || !nonempty(info.allergens))) blockers.push('food_information');
  if (product.klass === 'cosmetic' && (!nonempty(info.inci) || !nonempty(info.responsiblePerson))) blockers.push('cosmetic_information');
  if (country === 'NO' && product.klass === 'food') blockers.push('norway_food');
  return blockers;
}

export function allowedCheckoutOrigin(origin: unknown, allowlist: string, development = false): boolean {
  if (typeof origin !== 'string') return false;
  try {
    const url = new URL(origin);
    if (origin !== url.origin || url.username || url.password) return false;
    if (development && (url.hostname === 'localhost' || url.hostname === '127.0.0.1') && ['http:', 'https:'].includes(url.protocol)) return true;
    return url.protocol === 'https:' && allowlist.split(',').map(s => s.trim()).filter(Boolean).includes(url.origin);
  } catch { return false; }
}

export function maskCheckoutEmail(email: unknown): string {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+$/.test(email)) return '';
  return `${email[0]}***@***`;
}

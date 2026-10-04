import { isTargetMarket, MAX_CART_LINES, MAX_ITEM_QUANTITY, type TargetMarket } from './commerce-policy.ts';

export type StoredCartLine = { slug: string; qty: number };
export type StoredShop = { country: TargetMarket; cart: StoredCartLine[] };

/** A strict allowlist also purges old order history and free-text notes during migration. */
export function sanitizeCart(input: unknown, allowedSlugs?: ReadonlySet<string>): StoredCartLine[] {
  if (!Array.isArray(input)) return [];
  const lines = new Map<string, number>();
  for (const value of input.slice(0, 2000)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const { slug, qty } = value as Record<string, unknown>;
    if (typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(slug)) continue;
    if (allowedSlugs && !allowedSlugs.has(slug)) continue;
    if (typeof qty !== 'number' || !Number.isSafeInteger(qty) || qty < 1) continue;
    if (!lines.has(slug) && lines.size >= MAX_CART_LINES) continue;
    lines.set(slug, Math.min(MAX_ITEM_QUANTITY, (lines.get(slug) ?? 0) + qty));
  }
  return [...lines].map(([slug, qty]) => ({ slug, qty }));
}

export function sanitizePersistedShop(input: unknown, allowedSlugs?: ReadonlySet<string>): StoredShop {
  const value = input !== null && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown> : {};
  return {
    country: isTargetMarket(value.country) ? value.country : 'GR',
    cart: sanitizeCart(value.cart, allowedSlugs),
  };
}

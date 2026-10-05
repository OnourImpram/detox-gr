/** Quantities in a request list are not Shopify variant quantities or stock approval. */
export function quantityRule(unit: string) {
  return unit === 'kg' ? { min: .25, step: .25, max: 20, initial: .25 } : { min: 1, step: 1, max: 20, initial: 1 };
}
export function validListQuantity(value: unknown, unit: string): value is number {
  const rule = quantityRule(unit);
  return typeof value === 'number' && Number.isFinite(value) && value >= rule.min && value <= rule.max
    && Number.isSafeInteger(value / rule.step);
}
export function normalizeListQuantity(value: number, unit: string): number {
  const rule = quantityRule(unit);
  return Number.isFinite(value) ? Math.max(rule.min, Math.min(rule.max, Math.floor(value / rule.step) * rule.step)) : rule.initial;
}
/** Round each displayed line, then sum the displayed cents. Never turn a missing price into zero. */
export function lineAmountCents(priceEur: number | null | undefined, qty: number): number | null {
  if (typeof priceEur !== 'number' || !Number.isFinite(priceEur) || priceEur <= 0 || !Number.isFinite(qty) || qty <= 0) return null;
  return Math.round(Math.round(priceEur * 100) * qty + Number.EPSILON);
}

import type { CountryCode } from "./markets";
import type { Product } from "./catalog";

export type CartLine = { product: Product; qty: number };

export function cartWeight(lines: CartLine[]) {
  let grams = 0;
  let unknown = false;
  for (const l of lines) {
    if (l.product.grams == null) unknown = true;
    else grams += l.product.grams * l.qty;
  }
  return { grams, unknown };
}

export function hasFood(lines: CartLine[]) {
  return lines.some((l) => l.product.klass === "food");
}

export function hasCosmetic(lines: CartLine[]) {
  return lines.some((l) => l.product.klass === "cosmetic");
}

export function hasGlass(lines: CartLine[]) {
  return lines.some((l) => l.product.kind === "glass" || l.product.kind === "liquid");
}

/** Demo band only — not a carrier quote. Unknown grams skip the weight fee. */
export function shippingEur(country: CountryCode, lines: CartLine[]) {
  if (lines.length === 0) return 0;
  const { grams, unknown } = cartWeight(lines);
  const kg = unknown ? 0 : grams / 1000;
  const glass = hasGlass(lines);
  const base =
    country === "GR" ? 3.5 : country === "NO" ? 18 : country === "CY" || country === "MT" ? 14 : 9.5;
  const weightFee = unknown ? 0 : Math.max(0, Math.ceil(kg) - 1) * (country === "NO" ? 4.5 : 2.4);
  const fragile = glass ? (country === "GR" ? 1.2 : 2.8) : 0;
  return Math.round((base + weightFee + fragile) * 100) / 100;
}

export type RequestItem = { name: string; sourceId: string; qty: number; unit: string };
/** A local inquiry is not an order. Never imply a package size not present in the source. */
export function requestLine(item: RequestItem): string {
  if (!Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 20) throw new RangeError('Invalid selection quantity');
  if (!/^DT[0-9]+$/.test(item.sourceId)) throw new TypeError('Invalid product identifier');
  const name = item.name.replace(/[\r\n\t]/g, ' ').trim().slice(0, 200);
  return `${item.qty}${item.unit === 'kg' ? ' kg' : ' ×'} · ${name} (${item.sourceId})`.replace('× ·', '×');
}
export function selectionSummary(lines: readonly { priceEur: number | null; qty: number }[]) {
  let cents = 0, unknownLines = 0, pricedLines = 0;
  for (const line of lines) {
    if (!Number.isSafeInteger(line.qty) || line.qty < 1 || line.qty > 20) throw new RangeError('Invalid selection quantity');
    if (line.priceEur === null || !Number.isFinite(line.priceEur) || line.priceEur <= 0) { unknownLines++; continue; }
    cents += Math.round(line.priceEur * 100) * line.qty;
    pricedLines++;
  }
  return { knownTotal: cents / 100, unknownLines, pricedLines };
}

export type Inquiry = { heading: string; country: string; concept?: string; budget?: string; note?: string };
function clean(value: string | undefined, limit: number): string {
  return Array.from(value ?? '').filter(char => { const code = char.charCodeAt(0); return code !== 127 && (code >= 32 || code === 9 || code === 10 || code === 13); }).join('').trim().slice(0, limit);
}
/** Builds a user-initiated message, not an order or a server submission. */
export function buildInquiry(input: Inquiry, destination: string): string {
  const url = new URL(destination);
  if (url.protocol !== 'https:' || url.hostname !== 'wa.me' || url.username || url.password || !/^\/\d{8,15}$/.test(url.pathname)) {
    throw new TypeError('Expected a verified WhatsApp destination');
  }
  if (!/^[A-Z]{2}$/.test(input.country)) throw new TypeError('Invalid destination country');
  url.search = '';
  url.hash = '';
  url.searchParams.set('text', [clean(input.heading, 200), input.country, clean(input.concept, 200), clean(input.budget, 80), clean(input.note, 1000)].filter(Boolean).join('\n\n'));
  return url.href;
}

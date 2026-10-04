/** Product identity is explicit. Category images must never impersonate a SKU. */
export type MediaVariant = { src: string; width: number; height: number };
export type Illustration = { sourceId: string; kind: string; width: number; height: number; variants: readonly MediaVariant[] };
export type ProductMedia = {
  kind: 'verified' | 'illustration' | 'reference' | 'pending';
  src: string | null;
  width?: number;
  height?: number;
  variants: readonly MediaVariant[];
};
type Subject = { sourceId: string; info?: { image?: string } };
type ArchiveRecord = { id?: string; variants: readonly MediaVariant[] };

function safeLocalImage(path: string): boolean {
  return /^\/[a-zA-Z0-9/_.,-]+\.(?:png|jpe?g|webp|avif)$/i.test(path)
    && !path.includes('//') && !path.includes('..')
    && !/\/(?:products|__grok)\//.test(path);
}

export function assetUrl(path: string, base = '/'): string {
  const prefix = base.replace(/\/$/, '');
  if (!prefix || path.startsWith(`${prefix}/`)) return path;
  return `${prefix}${path.startsWith('/') ? path : `/${path}`}`;
}

export function resolveProductMedia(
  product: Subject,
  illustrations: Readonly<Record<string, Illustration>>,
  archives: readonly ArchiveRecord[],
  references: Readonly<Record<string, { sourceId: string; assetId: string }>> = {},
): ProductMedia {
  const approved = product.info?.image;
  const isGeneratedPath = typeof approved === 'string' && Object.values(illustrations)
    .some(art => art.variants.some(variant => variant.src === approved));
  if (approved && safeLocalImage(approved) && !isGeneratedPath) {
    const photo = archives.find(entry => entry.variants.some(variant => variant.src === approved));
    const full = photo?.variants.at(-1);
    return { kind: 'verified', src: approved, variants: photo?.variants ?? [], width: full?.width, height: full?.height };
  }
  const illustration = illustrations[product.sourceId];
  if (illustration?.sourceId === product.sourceId && illustration.kind === 'illustration'
    && illustration.variants.length > 0 && illustration.variants.every(variant => safeLocalImage(variant.src))) {
    const fallback = illustration.variants.find(variant => variant.width >= 800) ?? illustration.variants.at(-1)!;
    return { kind: 'illustration', src: fallback.src, width: illustration.width, height: illustration.height, variants: illustration.variants };
  }
  const reference = references[product.sourceId];
  const photo = reference?.sourceId === product.sourceId ? archives.find(entry => entry.id === reference.assetId) : undefined;
  if (photo?.variants.length) {
    const full = photo.variants.at(-1)!;
    return { kind: 'reference', src: (photo.variants.find(variant => variant.width >= 800) ?? full).src,
      width: full.width, height: full.height, variants: photo.variants };
  }
  return { kind: 'pending', src: null, variants: [] };
}

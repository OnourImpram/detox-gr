import illustrations from '@/data/product-media-v3.json';
import references from '@/data/product-photo-references.json';
import { ARCHIVE_PHOTOS } from './photo-archive';
import { resolveProductMedia } from './product-media-policy';

export function productMedia(product: { sourceId: string; info?: { image?: string } }) {
  return resolveProductMedia(product, illustrations.products, ARCHIVE_PHOTOS, references);
}
export const ILLUSTRATION_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(illustrations.products).map(([id, media]) => [id, media.variants.at(-1)!.src]),
);

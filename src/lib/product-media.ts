import illustrations from '@/data/product-media-v3.json';
import references from '@/data/product-photo-references.json';
import { ARCHIVE_PHOTOS } from './photo-archive';
import { resolveProductMedia, type ProductMedia } from './product-media-policy';
import { GENERATED_PRIMARY, GENERATED_SCENES } from './generated-scenes';
import { scenesForProduct } from './generated-scenes-policy';

const active = { ...illustrations.products, ...GENERATED_PRIMARY };
type Subject = { sourceId: string; info?: { image?: string } };
export function productMedia(product: Subject) {
  return resolveProductMedia(product, active, ARCHIVE_PHOTOS, references);
}
export function productGallery(product: Subject): ProductMedia[] {
  const primary = productMedia(product);
  const result: ProductMedia[] = [primary];
  for (const scene of scenesForProduct(GENERATED_SCENES, product.sourceId)) {
    if (scene.id === primary.sceneId) continue;
    result.push({kind:'illustration',sceneId:scene.id,src:(scene.variants.find(v=>v.width>=800) ?? scene.variants.at(-1)!).src,
      width:scene.width,height:scene.height,variants:scene.variants});
  }
  return result;
}
export const ILLUSTRATION_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(active).map(([id, media]) => [id, media.variants.at(-1)!.src]),
);

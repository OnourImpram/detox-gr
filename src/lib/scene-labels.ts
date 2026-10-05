import { productBySourceId, type CategoryId } from './catalog';
import { categoryTitle, productName, type Locale } from './i18n';
import { sceneCopy } from './scene-copy';
import type { GeneratedScene } from './generated-scenes-policy';

export function sceneTitle(scene: GeneratedScene, locale: Locale): string {
  const product = scene.sourceIds.length ? productBySourceId(scene.sourceIds[0]) : undefined;
  return product ? productName(product,locale) : scene.category==='gift' ? sceneCopy(locale,'gift') : categoryTitle(scene.category as CategoryId,locale);
}

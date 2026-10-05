import type { Illustration, MediaVariant } from './product-media-policy.ts';

export type GeneratedScene = {
  id: string; round: number; slug: string; category: string; sourceIds: string[]; primaryFor: string[];
  kind: string; verifiedProductPhoto: boolean; usage: string; width: number; height: number;
  variants: MediaVariant[]; originalName: string; originalSha256: string; generationId: string; note: string;
};

/** An explicit product assignment is editorial use, never identity verification. */
export function primaryIllustrations(scenes: readonly GeneratedScene[]): Record<string, Illustration> {
  const result: Record<string, Illustration> = {};
  for (const scene of scenes) {
    if (scene.kind !== 'illustration' || scene.verifiedProductPhoto || scene.usage !== 'product') continue;
    for (const id of scene.primaryFor) {
      if (!scene.sourceIds.includes(id) || !/^DT\d{3}$/.test(id)) throw new Error(`Invalid scene assignment: ${scene.id}`);
      if (result[id]) throw new Error(`Duplicate primary composition: ${id}`);
      result[id] = { sourceId: id, sceneId: scene.id, kind: 'illustration', width: scene.width, height: scene.height, variants: scene.variants };
    }
  }
  return result;
}

export function scenesForProduct(scenes: readonly GeneratedScene[], sourceId: string): GeneratedScene[] {
  return scenes.filter(scene => scene.kind === 'illustration' && !scene.verifiedProductPhoto
    && scene.usage === 'product' && scene.sourceIds.includes(sourceId))
    .sort((a,b) => Number(b.primaryFor.includes(sourceId)) - Number(a.primaryFor.includes(sourceId)));
}

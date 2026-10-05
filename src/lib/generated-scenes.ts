import data from '@/data/generated-scenes.json';
import { primaryIllustrations, type GeneratedScene } from './generated-scenes-policy';
export const GENERATED_SCENES: readonly GeneratedScene[] = data.scenes;
export const GENERATED_PRIMARY = primaryIllustrations(GENERATED_SCENES);
export function sceneById(id: string) { return GENERATED_SCENES.find(scene => scene.id === id); }
/** Category compositions stay separate from SKU media. */
export const CATEGORY_SCENES: Readonly<Record<string,string>> = {
  lokum:'R2-01', soap:'R2-03', honey:'R3-05', pantry:'R1-04',
  nuts:'R3-07', dates:'R1-06', flour:'R3-08', spice:'R3-10', oil:'R2-06',
};

import source from '@/data/photo-archive.json';
export type ArchivePhotoRecord = (typeof source.photos)[number];
export const ARCHIVE_PHOTOS = source.photos;
export const PHOTO_GROUPS = ['seeds', 'herbs', 'spices', 'blends', 'powders', 'flowers', 'bark'] as const;
export type PhotoGroup = (typeof PHOTO_GROUPS)[number];
export function archivePhoto(original: string): ArchivePhotoRecord {
  const normalized = original.toUpperCase().endsWith('.JPG') ? original.toUpperCase() : `${original.toUpperCase()}.JPG`;
  const photo = ARCHIVE_PHOTOS.find(item => item.original === normalized || item.id === original);
  if (!photo) throw new RangeError(`Unknown archive photo: ${original}`);
  return photo;
}
export const EDITORIAL_PHOTOS = {
  hero: 'MF8A6610', rose: 'MF8A6417', cinnamon: 'MF8A6527', star: 'MF8A6611',
  cloves: 'MF8A6571', seeds: 'MF8A6403', flowers: 'MF8A6565', texture: 'MF8A6482',
} as const;

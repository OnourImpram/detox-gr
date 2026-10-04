import { archivePhoto, type ArchivePhotoRecord, type PhotoGroup } from '@/lib/photo-archive';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';

type Props = { original: string | ArchivePhotoRecord; className?: string; sizes?: string; priority?: boolean; caption?: boolean; decorative?: boolean };
export function ArchivePhoto({ original, className = '', sizes = '100vw', priority = false, caption = true, decorative = false }: Props) {
  const locale = useLocale();
  const photo = typeof original === 'string' ? archivePhoto(original) : original;
  const full = photo.variants.at(-1)!;
  const observed = b(locale, `group.${photo.group as PhotoGroup}`);
  return <figure className={`ed-photo ${className}`} data-archive-id={photo.id}>
    <img src={photo.variants[1].src} srcSet={photo.variants.map(variant => `${variant.src} ${variant.width}w`).join(', ')} sizes={sizes}
      width={full.width} height={full.height} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async"
      alt={decorative ? '' : `${observed}. ${b(locale, 'photo.source')} ${photo.original.replace('.JPG', '')}.`} />
    {caption && <figcaption><span>{b(locale, 'photo.source')}</span><span>{photo.original.replace('.JPG', '')}</span></figcaption>}
  </figure>;
}

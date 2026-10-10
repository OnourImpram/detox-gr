import hero from '@/data/aktar-hero.json';
import { assetUrl } from '@/lib/product-media-policy';
import { mediaCopy } from '@/lib/media-copy';
import { featuredName } from '@/lib/featured-names';
import { b } from '@/lib/brand-copy';
import { useLocale } from '@/lib/use-locale';

/** Approved editorial composition; never an actual-shop or verified-product photograph. */
export function AktarHeroImage() {
  const locale = useLocale();
  const full = hero.variants.at(-1)!;
  const fallback = hero.variants.find(variant => variant.width === 1200)!;
  const path = (src: string) => assetUrl(src, import.meta.env.BASE_URL);
  const alt = [featuredName('DT117', locale), b(locale, 'group.flowers'), b(locale, 'group.spices'), mediaCopy(locale, 'illustration')].join('. ');
  return <figure className="ed-photo aktar-hero-image" data-hero-id={hero.id} data-media-kind="illustration">
    <img src={path(fallback.src)} srcSet={hero.variants.map(variant => `${path(variant.src)} ${variant.width}w`).join(', ')}
      sizes="(min-width: 1100px) 46vw, (min-width: 640px) 48vw, 90vw"
      width={full.width} height={full.height} alt={alt} loading="eager" fetchPriority="high" decoding="async" />
  </figure>;
}

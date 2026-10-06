import { BRAND } from '@/lib/seo';
export function BrandMark({size='nav',className=''}:{size?:'nav'|'hero'|'footer';className?:string}) {
  return <span className={`atelier-wordmark atelier-wordmark--${size} ${className}`} aria-label={BRAND}>detoks<span className="atelier-wordmark__suffix">.gr</span></span>;
}

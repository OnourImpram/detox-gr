import source from '@/data/brand-copy.json';
import { interpolateBrand } from './brand-format';
import { localeMeta, type Locale } from './i18n-locales';
export type BrandKey = keyof typeof source.tr;
export function b(locale: Locale, key: BrandKey, values: Record<string, string | number> = {}): string {
  const text = source[locale]?.[key];
  if (!text) throw new Error(`Missing editorial text: ${locale}.${key}`);
  const formatter = new Intl.NumberFormat(localeMeta(locale).html);
  return interpolateBrand(text, Object.fromEntries(Object.entries(values).map(([name, value]) => [name, typeof value === 'number' ? formatter.format(value) : value])));
}

import tr from '@/data/brand/tr.json';
import { interpolateBrand } from './brand-format';
import { localeMeta, type Locale } from './i18n-locales';
export type BrandKey = keyof typeof tr;
export type BrandPack = Record<BrandKey, string>;
const loaded: Partial<Record<Locale, BrandPack>> = { tr };
const loaders = import.meta.glob<{ default: BrandPack }>('../data/brand/*.json');
const pending = new Map<Locale, Promise<BrandPack>>();

export function registerBrandPack(locale: Locale, pack: BrandPack): void { loaded[locale] = pack; }
export async function loadBrandPack(locale: Locale): Promise<BrandPack> {
  const cached = loaded[locale];
  if (cached) return cached;
  const inFlight = pending.get(locale);
  if (inFlight) return inFlight;
  const loader = loaders[`../data/brand/${locale}.json`];
  if (!loader) throw new Error(`No editorial pack for ${locale}`);
  const task = loader().then(module => {
    registerBrandPack(locale, module.default);
    return module.default;
  }).finally(() => pending.delete(locale));
  pending.set(locale, task);
  return task;
}
export function b(locale: Locale, key: BrandKey, values: Record<string, string | number> = {}): string {
  const text = loaded[locale]?.[key];
  if (!text) throw new Error(`Editorial pack not loaded: ${locale}.${key}`);
  const formatter = new Intl.NumberFormat(localeMeta(locale).html);
  return interpolateBrand(text, Object.fromEntries(Object.entries(values).map(([name, value]) => [name, typeof value === 'number' ? formatter.format(value) : value])));
}

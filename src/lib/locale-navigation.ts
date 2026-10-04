import { isLocale, type Locale } from './i18n-locales.ts';

/** Keep an explicit lang=tr. Dropping it lets Accept-Language override the user's choice. */
export function changeLocaleSearch<T extends Record<string, unknown>>(search: T, locale: string): T & { lang: Locale } {
  if (!isLocale(locale)) throw new RangeError('Unsupported locale');
  return { ...search, lang: locale };
}

/** Relative in-app URLs only. Preserve search terms, receipt IDs, the deployment base and hash. */
export function localeUrl(path: string, locale: string): string {
  if (!isLocale(locale)) throw new RangeError('Unsupported locale');
  if (!path.startsWith('/') || path.startsWith('//')) throw new TypeError('Expected an internal absolute path');
  const url = new URL(path, 'https://internal.invalid');
  if (url.origin !== 'https://internal.invalid') throw new TypeError('Expected an internal absolute path');
  url.searchParams.set('lang', locale);
  return `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
}

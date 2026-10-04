import { createContext, useContext } from 'react';
import { isLocale, type Locale } from './i18n-locales.ts';

/** A pending navigation must not expose a language before its dictionaries exist. */
export const ContentLocale = createContext<Locale>('tr');
export function useContentLocale(): Locale { return useContext(ContentLocale); }

/** The document shell is outside the provider. Read only its completed root loader. */
export function localeFromLoaderData(data: unknown): Locale {
  if (data !== null && typeof data === 'object' && 'locale' in data && typeof data.locale === 'string' && isLocale(data.locale)) return data.locale;
  return 'tr';
}

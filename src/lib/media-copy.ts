import copy from '@/data/media-copy.json';
import type { Locale } from './i18n-locales';
export type MediaCopyKey = keyof typeof copy.tr;
export function mediaCopy(locale: Locale, key: MediaCopyKey): string { return copy[locale][key]; }

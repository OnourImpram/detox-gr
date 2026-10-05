import copy from '@/data/scene-copy.json';
import type { Locale } from './i18n-locales';
export function sceneCopy(locale: Locale, key: keyof typeof copy.tr): string { return copy[locale][key]; }

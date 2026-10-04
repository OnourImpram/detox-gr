// The root binds this context to the locale whose UI and editorial packs finished loading.
// Reading the latest URL here caused visible headers to render a not-yet-loaded language.
export { useContentLocale as useLocale } from './content-locale';

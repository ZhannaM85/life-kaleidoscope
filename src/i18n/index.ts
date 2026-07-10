export type { Dictionary } from './dictionary'
export { pluralEn, pluralRu } from './plural'
export {
  type Locale,
  localeTag,
  detectLocale,
  readStoredLocale,
  saveStoredLocale,
  getCurrentLocale,
  applyDocumentLanguage,
} from './locale'
export { getDictionary } from './dictionaries'

// Locale detection and persistence (#18). Kept independent of UserProfile —
// language is a UI/content preference, not user data, and needs to be
// readable synchronously before the first paint (a lazy IndexedDB read
// would flash the wrong language).
import type { Locale } from '@/domain/prompt'

export type { Locale }

const LOCALE_STORAGE_KEY = 'life-like-kaleidoscope.locale'

const BCP47_TAG: Record<Locale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
}

/** The BCP-47 tag to pass to `toLocaleDateString`/`toLocaleString` for a locale. */
export function localeTag(locale: Locale): string {
  return BCP47_TAG[locale]
}

/** Best guess from the browser's language when nothing has been chosen yet. */
export function detectLocale(): Locale {
  const lang = typeof navigator !== 'undefined' ? navigator.language : ''
  return lang.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

// localStorage can throw (privacy modes); a lost preference just means the
// language is re-detected next visit — never an error the user sees.
export function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return stored === 'en' || stored === 'ru' ? stored : null
  } catch {
    return null
  }
}

export function saveStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // not persisted this session — fine
  }
}

/** The locale the app should currently use, without needing a React tree. */
export function getCurrentLocale(): Locale {
  return readStoredLocale() ?? detectLocale()
}

/**
 * Reflect the UI language on `<html lang>` so assistive tech switches
 * voices along with the interface.
 */
export function applyDocumentLanguage(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}

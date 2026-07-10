import { create } from 'zustand'
import {
  getCurrentLocale,
  saveStoredLocale,
  applyDocumentLanguage,
  getDictionary,
  type Locale,
  type Dictionary,
} from '@/i18n'

interface LocaleState {
  locale: Locale
  dictionary: Dictionary
  setLocale: (locale: Locale) => void
}

const initialLocale = getCurrentLocale()
applyDocumentLanguage(initialLocale)

/** UI language (#18) — switching never touches already-issued prompts or memories. */
export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: initialLocale,
  dictionary: getDictionary(initialLocale),
  setLocale(locale) {
    saveStoredLocale(locale)
    applyDocumentLanguage(locale)
    set({ locale, dictionary: getDictionary(locale) })
  },
}))

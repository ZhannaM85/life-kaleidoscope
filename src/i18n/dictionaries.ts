import type { Locale } from './locale'
import type { Dictionary } from './dictionary'
import { en } from './en'
import { ru } from './ru'

const DICTIONARIES: Record<Locale, Dictionary> = { en, ru }

/** The active UI dictionary for a locale (#18). */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

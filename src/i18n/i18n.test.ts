import { describe, it, expect, afterEach, vi } from 'vitest'
import { pluralEn, pluralRu } from './plural'
import {
  applyDocumentLanguage,
  detectLocale,
  getCurrentLocale,
  localeTag,
  readStoredLocale,
  saveStoredLocale,
} from './locale'

afterEach(() => {
  localStorage.clear()
  document.documentElement.lang = 'en'
  vi.restoreAllMocks()
})

describe('pluralEn', () => {
  it('uses the singular only for exactly one', () => {
    const forms = { one: 'memory', many: 'memories' }
    expect(pluralEn(1, forms)).toBe('memory')
    expect(pluralEn(0, forms)).toBe('memories')
    expect(pluralEn(2, forms)).toBe('memories')
    expect(pluralEn(21, forms)).toBe('memories')
  })
})

describe('pluralRu', () => {
  const forms = { one: 'год', few: 'года', many: 'лет' }

  it('follows the CLDR "one" rule (1, 21, 101 — but not 11)', () => {
    expect(pluralRu(1, forms)).toBe('год')
    expect(pluralRu(21, forms)).toBe('год')
    expect(pluralRu(101, forms)).toBe('год')
    expect(pluralRu(11, forms)).toBe('лет')
  })

  it('follows the "few" rule (2–4, 22–24 — but not 12–14)', () => {
    expect(pluralRu(2, forms)).toBe('года')
    expect(pluralRu(4, forms)).toBe('года')
    expect(pluralRu(22, forms)).toBe('года')
    expect(pluralRu(104, forms)).toBe('года')
    expect(pluralRu(12, forms)).toBe('лет')
    expect(pluralRu(14, forms)).toBe('лет')
  })

  it('falls to "many" everywhere else (0, 5–20, 25…)', () => {
    expect(pluralRu(0, forms)).toBe('лет')
    expect(pluralRu(5, forms)).toBe('лет')
    expect(pluralRu(19, forms)).toBe('лет')
    expect(pluralRu(100, forms)).toBe('лет')
    expect(pluralRu(111, forms)).toBe('лет')
  })
})

describe('locale persistence', () => {
  it('round-trips a saved choice', () => {
    saveStoredLocale('ru')
    expect(readStoredLocale()).toBe('ru')
    expect(getCurrentLocale()).toBe('ru')
  })

  it('ignores values that are not a known locale', () => {
    localStorage.setItem('life-like-kaleidoscope.locale', 'fr')
    expect(readStoredLocale()).toBeNull()
  })

  it('falls back to browser detection when nothing is stored', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU')
    expect(readStoredLocale()).toBeNull()
    expect(detectLocale()).toBe('ru')
    expect(getCurrentLocale()).toBe('ru')

    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
    expect(detectLocale()).toBe('en')
  })
})

describe('localeTag', () => {
  it('maps locales to full BCP-47 tags for date formatting', () => {
    expect(localeTag('en')).toBe('en-US')
    expect(localeTag('ru')).toBe('ru-RU')
  })
})

describe('applyDocumentLanguage', () => {
  it('keeps <html lang> in step with the interface language', () => {
    applyDocumentLanguage('ru')
    expect(document.documentElement.lang).toBe('ru')
    applyDocumentLanguage('en')
    expect(document.documentElement.lang).toBe('en')
  })
})

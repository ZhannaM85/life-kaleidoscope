import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createIndexedDbRepositories,
  LifeLikeKaleidoscopeDb,
} from '@/infrastructure/persistence/indexeddb'
import { WORD_POOL, WORD_POOL_RU } from '@/domain/prompt'
import { getDictionary } from '@/i18n'
import { setRepositories, useDailyPromptStore, useLocaleStore } from '@/stores'

let dbCounter = 0
let dbName: string

function resetDailyPromptStore() {
  useDailyPromptStore.setState({
    prompt: null,
    todaysMemories: [],
    draft: '',
    status: 'idle',
    error: null,
  })
}

beforeEach(() => {
  dbName = `locale-prompt-db-${++dbCounter}`
  setRepositories(createIndexedDbRepositories(dbName))
  resetDailyPromptStore()
  useLocaleStore.setState({ locale: 'en', dictionary: getDictionary('en') })
})

afterEach(async () => {
  setRepositories(null)
  localStorage.clear()
  useLocaleStore.setState({ locale: 'en', dictionary: getDictionary('en') })
  await new LifeLikeKaleidoscopeDb(dbName).delete()
})

describe('daily prompt × locale (#18)', () => {
  it("draws today's word from the Russian pool when Russian is active", async () => {
    useLocaleStore.getState().setLocale('ru')
    await useDailyPromptStore.getState().load()

    const prompt = useDailyPromptStore.getState().prompt
    expect(prompt).not.toBeNull()
    expect(WORD_POOL_RU).toContain(prompt!.word)
  })

  it("keeps today's already-issued word when the language changes mid-day", async () => {
    await useDailyPromptStore.getState().load()
    const issued = useDailyPromptStore.getState().prompt
    expect(issued).not.toBeNull()
    expect(WORD_POOL).toContain(issued!.word)

    // Switch to Russian and reload as if the page were reopened — the word
    // already issued today must survive untouched (user data is never
    // rewritten by a preference change).
    useLocaleStore.getState().setLocale('ru')
    resetDailyPromptStore()
    await useDailyPromptStore.getState().load()

    const reloaded = useDailyPromptStore.getState().prompt
    expect(reloaded).not.toBeNull()
    expect(reloaded!.id).toBe(issued!.id)
    expect(reloaded!.word).toBe(issued!.word)
  })
})

import { create } from 'zustand'
import type { Prompt } from '@/domain/prompt'
import type { Memory } from '@/domain/memory'
import { getOrCreateTodaysPrompt, localDateKey } from '@/domain/prompt'
import { createMemory } from '@/domain/memory'
import { ensureUserProfile } from '@/domain/user'
import { defaultGenerateId, nowIso } from '@/domain/shared'
import { getRepositories } from './repositories'

interface DailyPromptState {
  prompt: Prompt | null
  /** Memories already written for today's prompt (there may be several). */
  todaysMemories: Memory[]
  draft: string
  status: 'idle' | 'loading' | 'ready' | 'saving' | 'error'
  error: string | null
  load: () => Promise<void>
  setDraft: (text: string) => void
  save: () => Promise<void>
}

export const useDailyPromptStore = create<DailyPromptState>()((set, get) => ({
  prompt: null,
  todaysMemories: [],
  draft: '',
  status: 'idle',
  error: null,

  async load() {
    // Guard against concurrent loads (StrictMode double-invokes effects in
    // dev) — without this, two racing getOrCreateTodaysPrompt calls can both
    // see "no prompt today" and each create one.
    if (get().status === 'loading') return

    const { memories, prompts } = getRepositories()
    set({ status: 'loading', error: null })
    try {
      const prompt = await getOrCreateTodaysPrompt(prompts, {
        generateId: defaultGenerateId,
        now: nowIso,
      })
      // Collect memories across *all* of today's prompts, not just the
      // canonical one — tolerates duplicate same-day prompts from older
      // versions or racing tabs, so no memory ever silently disappears.
      const todayKey = localDateKey(new Date())
      const todaysPromptIds = (await prompts.getAll())
        .filter((p) => localDateKey(new Date(p.createdAt)) === todayKey)
        .map((p) => p.id)
      const lists = await Promise.all(todaysPromptIds.map((id) => memories.getByPromptId(id)))
      const todaysMemories = lists.flat().sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      set({ prompt, todaysMemories, status: 'ready' })
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  },

  setDraft(text) {
    set({ draft: text })
  },

  async save() {
    const { prompt, draft } = get()
    const story = draft.trim()
    if (!prompt || !story) return

    const { memories, userProfile } = getRepositories()
    set({ status: 'saving', error: null })
    try {
      const profile = await ensureUserProfile(userProfile, { generateId: defaultGenerateId })
      const created = createMemory(
        { promptId: prompt.id, story, authoredBy: profile.id },
        { generateId: defaultGenerateId, now: nowIso }
      )
      await memories.create(created)
      set((state) => ({
        todaysMemories: [...state.todaysMemories, created.memory],
        draft: '',
        status: 'ready',
      }))
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  },
}))

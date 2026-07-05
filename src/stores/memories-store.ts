import { create } from 'zustand'
import type { Memory } from '@/domain/memory'
import type { Prompt } from '@/domain/prompt'
import { getRepositories } from './repositories'

interface MemoriesState {
  memories: Memory[]
  /** Prompt lookup so the list can show each memory's word. */
  promptsById: Record<string, Prompt>
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  load: () => Promise<void>
}

export const useMemoriesStore = create<MemoriesState>()((set) => ({
  memories: [],
  promptsById: {},
  status: 'idle',
  error: null,

  async load() {
    const repos = getRepositories()
    set({ status: 'loading', error: null })
    try {
      const [memories, prompts] = await Promise.all([
        repos.memories.getAll(),
        repos.prompts.getAll(),
      ])
      const promptsById: Record<string, Prompt> = {}
      for (const p of prompts) promptsById[p.id] = p
      set({ memories, promptsById, status: 'ready' })
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  },
}))

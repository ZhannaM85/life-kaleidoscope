// Shared shaping for the human-readable exports (Markdown and print/PDF):
// resolve ids to words/names once, order memories for reading, keep the two
// renderers in agreement about what a memory "says".
import { localDateKey } from '@/domain/prompt'
import type { IsoDateString } from '@/domain/shared'
import type { BackupFile } from './backup'

/** One memory reduced to the strings both human-readable exports print. */
export interface MemoryFacts {
  /** e.g. "Bicycle — 2026-07-05". */
  heading: string
  title?: string
  story: string
  /** "When: …", "People: …", "Places: …", "Tags: …" — only the ones that apply. */
  details: string[]
}

/** Local YYYY-MM-DD of a timestamp — deliberately locale-free so exports are stable. */
export function dayOf(iso: IsoDateString): string {
  return localDateKey(new Date(iso))
}

/** Flatten a backup into renderable facts, oldest memory first — a life reads forward. */
export function backupToFacts(backup: BackupFile): MemoryFacts[] {
  const { prompts, memories, people, places, tags } = backup.data
  const wordById = new Map(prompts.map((p) => [p.id, p.word]))
  const personById = new Map(people.map((p) => [p.id, p.name]))
  const placeById = new Map(places.map((p) => [p.id, p.name]))
  const tagById = new Map(tags.map((t) => [t.id, t.label]))

  return [...memories]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((memory) => {
      const details: string[] = []
      const when = [
        memory.approxAge !== undefined ? `around age ${memory.approxAge}` : null,
        memory.approxYear !== undefined ? `around ${memory.approxYear}` : null,
      ].filter((part): part is string => part !== null)
      if (when.length > 0) details.push(`When: ${when.join(', ')}`)
      if (memory.mood !== undefined) details.push(`Mood: ${memory.mood}`)
      pushNames(details, 'People', memory.peopleIds, personById)
      pushNames(details, 'Places', memory.placeIds, placeById)
      pushNames(details, 'Tags', memory.tagIds, tagById)

      return {
        heading: `${wordById.get(memory.promptId) ?? 'A memory'} — ${dayOf(memory.createdAt)}`,
        title: memory.title,
        story: memory.story,
        details,
      }
    })
}

function pushNames(
  details: string[],
  label: string,
  ids: string[],
  names: Map<string, string>
): void {
  const found = ids.map((id) => names.get(id)).filter((name): name is string => name !== undefined)
  if (found.length > 0) details.push(`${label}: ${found.join(', ')}`)
}

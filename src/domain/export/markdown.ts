import type { BackupFile } from './backup'
import { backupToFacts, dayOf } from './facts'

/**
 * All memories as one Markdown document, oldest first. Plain text on purpose:
 * it opens in any editor today and in thirty years. Story text is included
 * verbatim — it is the author's own writing, not ours to escape.
 */
export function backupToMarkdown(backup: BackupFile): string {
  const facts = backupToFacts(backup)
  const count = facts.length
  const lines: string[] = [
    '# Life Like Kaleidoscope — Memories',
    '',
    `Exported ${dayOf(backup.exportedAt)} · ${count} ${count === 1 ? 'memory' : 'memories'}.`,
  ]

  for (const memory of facts) {
    lines.push('', '---', '', `## ${memory.heading}`)
    if (memory.title) lines.push('', `**${memory.title}**`)
    lines.push('', memory.story)
    if (memory.details.length > 0) lines.push('', ...memory.details.map((detail) => `- ${detail}`))
  }

  lines.push('')
  return lines.join('\n')
}

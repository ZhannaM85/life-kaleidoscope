import type { BackupFile } from './backup'
import { backupToFacts, dayOf } from './facts'

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Story text → paragraphs, preserving the author's line and blank-line breaks. */
function storyHtml(story: string): string {
  return story
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('\n')
}

/**
 * A self-contained printable document. "Export to PDF" is the browser's own
 * print dialog over this page — no PDF library, no new dependency, and the
 * user chooses paper size and margins themselves. Styling mirrors the app's
 * serif/paper feel with plain values (the page lives outside the app's CSS).
 */
export function backupToPrintHtml(backup: BackupFile): string {
  const facts = backupToFacts(backup)
  const count = facts.length
  const articles = facts
    .map((memory) =>
      [
        '<article>',
        `<h2>${escapeHtml(memory.heading)}</h2>`,
        memory.title ? `<p><strong>${escapeHtml(memory.title)}</strong></p>` : '',
        storyHtml(memory.story),
        memory.details.length > 0
          ? `<p class="details">${memory.details.map(escapeHtml).join(' · ')}</p>`
          : '',
        '</article>',
      ]
        .filter((part) => part !== '')
        .join('\n')
    )
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Life Like Kaleidoscope — Memories</title>
<style>
  body { font-family: Charter, 'Sitka Text', Cambria, Georgia, serif; color: #221d16; max-width: 42rem; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.6; }
  h1 { font-size: 1.6rem; font-weight: 500; }
  h2 { font-size: 1.15rem; font-weight: 600; margin: 2.5rem 0 0.5rem; }
  article { break-inside: avoid; }
  .meta, .details { color: #6f6558; font-size: 0.9rem; }
</style>
</head>
<body>
<h1>Life Like Kaleidoscope — Memories</h1>
<p class="meta">Exported ${escapeHtml(dayOf(backup.exportedAt))} · ${count} ${count === 1 ? 'memory' : 'memories'}.</p>
${articles}
</body>
</html>
`
}

import { useState } from 'react'
import { FileJson, FileText, Printer } from 'lucide-react'
import {
  backupToMarkdown,
  backupToPrintHtml,
  collectBackup,
  serializeBackup,
} from '@/domain/export'
import { localDateKey } from '@/domain/prompt'
import { nowIso } from '@/domain/shared'
import { getRepositories } from '@/stores'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { downloadTextFile, openPrintDialog } from './download'

type ExportFormat = 'json' | 'markdown' | 'pdf'

export function ExportPage() {
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function exportAs(format: ExportFormat) {
    setBusy(format)
    setError(null)
    try {
      const backup = await collectBackup(getRepositories(), { now: nowIso })
      const date = localDateKey(new Date())
      if (format === 'json') {
        downloadTextFile(
          `life-like-kaleidoscope-backup-${date}.json`,
          serializeBackup(backup),
          'application/json'
        )
      } else if (format === 'markdown') {
        downloadTextFile(
          `life-like-kaleidoscope-memories-${date}.md`,
          backupToMarkdown(backup),
          'text/markdown'
        )
      } else if (!openPrintDialog(backupToPrintHtml(backup))) {
        setError('The print view was blocked — allow pop-ups for this site and try again.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Export"
        description="Your memories are yours — take them with you in open formats."
      />
      {error && (
        <p role="alert" className="mb-6 font-sans text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson aria-hidden className="size-4 text-muted-foreground" />
              JSON backup
            </CardTitle>
            <CardDescription>
              Everything, losslessly — every memory, its full version history, people, places, tags,
              and photos in one file. This is the file a future restore reads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => void exportAs('json')}
            >
              {busy === 'json' ? 'Preparing…' : 'Download JSON'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText aria-hidden className="size-4 text-muted-foreground" />
              Markdown
            </CardTitle>
            <CardDescription>
              One readable text file, oldest memory first — opens in any editor, today and in thirty
              years.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => void exportAs('markdown')}
            >
              {busy === 'markdown' ? 'Preparing…' : 'Download Markdown'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer aria-hidden className="size-4 text-muted-foreground" />
              PDF
            </CardTitle>
            <CardDescription>
              A printable copy. Your browser's print dialog opens — choose “Save as PDF” there.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled={busy !== null} onClick={() => void exportAs('pdf')}>
              {busy === 'pdf' ? 'Preparing…' : 'Open print view'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
import { getRepositories, useLocaleStore } from '@/stores'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { downloadTextFile, openPrintDialog } from './download'
import { ImportBackupCard } from './ImportBackupCard'

type ExportFormat = 'json' | 'markdown' | 'pdf'

export function ExportPage() {
  const t = useLocaleStore((s) => s.dictionary)
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
        setError(t.exportPage.printBlocked)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <PageHeader title={t.exportPage.title} description={t.exportPage.description} />
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
              {t.exportPage.jsonTitle}
            </CardTitle>
            <CardDescription>{t.exportPage.jsonDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => void exportAs('json')}
            >
              {busy === 'json' ? t.common.preparing : t.exportPage.downloadJson}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText aria-hidden className="size-4 text-muted-foreground" />
              {t.exportPage.markdownTitle}
            </CardTitle>
            <CardDescription>{t.exportPage.markdownDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => void exportAs('markdown')}
            >
              {busy === 'markdown' ? t.common.preparing : t.exportPage.downloadMarkdown}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer aria-hidden className="size-4 text-muted-foreground" />
              {t.exportPage.pdfTitle}
            </CardTitle>
            <CardDescription>{t.exportPage.pdfDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled={busy !== null} onClick={() => void exportAs('pdf')}>
              {busy === 'pdf' ? t.common.preparing : t.exportPage.openPrintView}
            </Button>
          </CardContent>
        </Card>

        <ImportBackupCard />
      </div>
    </div>
  )
}

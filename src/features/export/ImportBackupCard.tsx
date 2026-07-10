import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { Upload } from 'lucide-react'
import {
  parseBackup,
  restoreBackup,
  summarizeBackup,
  type BackupFile,
  type BackupSummary,
} from '@/domain/export'
import { localDateKey } from '@/domain/prompt'
import { getRepositories, useLocaleStore } from '@/stores'
import type { Dictionary } from '@/i18n'
import { cn } from '@/shared/lib/utils'
import { Button, buttonVariants } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface PendingImport {
  backup: BackupFile
  summary: BackupSummary
  filename: string
}

function describeSummary(t: Dictionary, summary: BackupSummary): string {
  return [
    t.importBackup.counts.memories(summary.memories),
    t.importBackup.counts.memoryVersionsOfHistory(summary.memoryVersions),
    t.importBackup.counts.people(summary.people),
    t.importBackup.counts.places(summary.places),
    t.importBackup.counts.tags(summary.tags),
    t.importBackup.counts.photos(summary.photos),
    t.importBackup.counts.promptWords(summary.prompts),
  ].join(', ')
}

/**
 * The read-it-back half of the JSON backup (#16). Two steps on purpose:
 * choosing a file only validates and reports what it holds — nothing is
 * written until the user confirms.
 */
export function ImportBackupCard() {
  const t = useLocaleStore((s) => s.dictionary)
  const [pending, setPending] = useState<PendingImport | null>(null)
  const [busy, setBusy] = useState(false)
  const [restored, setRestored] = useState<BackupSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so the same file can be re-chosen after a cancel.
    event.target.value = ''
    if (!file) return
    setError(null)
    setRestored(null)
    try {
      const backup = parseBackup(await file.text())
      setPending({ backup, summary: summarizeBackup(backup), filename: file.name })
    } catch (e) {
      setPending(null)
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  async function confirmRestore() {
    if (!pending) return
    setBusy(true)
    setError(null)
    try {
      await restoreBackup(pending.backup, getRepositories().restore)
      setRestored(pending.summary)
      setPending(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload aria-hidden className="size-4 text-muted-foreground" />
          {t.importBackup.title}
        </CardTitle>
        <CardDescription>{t.importBackup.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="font-sans text-sm text-destructive">
            {error}
          </p>
        )}
        {restored && (
          <p role="status" className="font-sans text-sm">
            {t.importBackup.restoredMessage(describeSummary(t, restored))}{' '}
            <Link to="/memories" className="underline underline-offset-2 hover:text-foreground">
              {t.importBackup.seeYourMemories}
            </Link>
            .
          </p>
        )}
        {pending ? (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-sm">
              {t.importBackup.pendingSummary(
                pending.filename,
                localDateKey(new Date(pending.summary.exportedAt)),
                describeSummary(t, pending.summary)
              )}
              {pending.summary.photosWithoutBytes > 0 &&
                t.importBackup.photosWithoutBytesNote(pending.summary.photosWithoutBytes)}
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              {t.importBackup.nothingWrittenYet}
            </p>
            <div className="flex gap-2">
              <Button disabled={busy} onClick={() => void confirmRestore()}>
                {busy ? t.common.restoring : t.importBackup.restoreThisBackup}
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => setPending(null)}>
                {t.common.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <label
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-fit cursor-pointer',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
            )}
          >
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              aria-label={t.importBackup.chooseBackupFile}
              onChange={(event) => void pickFile(event)}
            />
            {t.importBackup.chooseBackupFile}
          </label>
        )}
      </CardContent>
    </Card>
  )
}

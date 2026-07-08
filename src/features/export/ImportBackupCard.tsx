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
import { getRepositories } from '@/stores'
import { cn } from '@/shared/lib/utils'
import { Button, buttonVariants } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface PendingImport {
  backup: BackupFile
  summary: BackupSummary
  filename: string
}

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function describeSummary(summary: BackupSummary): string {
  return [
    plural(summary.memories, 'memory', 'memories'),
    `${plural(summary.memoryVersions, 'version', 'versions')} of their history`,
    plural(summary.people, 'person', 'people'),
    plural(summary.places, 'place', 'places'),
    plural(summary.tags, 'tag', 'tags'),
    plural(summary.photos, 'photo', 'photos'),
    plural(summary.prompts, 'prompt word', 'prompt words'),
  ].join(', ')
}

/**
 * The read-it-back half of the JSON backup (#16). Two steps on purpose:
 * choosing a file only validates and reports what it holds — nothing is
 * written until the user confirms.
 */
export function ImportBackupCard() {
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
          Restore a backup
        </CardTitle>
        <CardDescription>
          Bring a JSON backup made above back into an empty app — every memory, its full version
          history, people, places, tags, and photos, exactly as exported.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="font-sans text-sm text-destructive">
            {error}
          </p>
        )}
        {restored && (
          <p role="status" className="font-sans text-sm">
            Backup restored — {describeSummary(restored)} are back.{' '}
            <Link to="/memories" className="underline underline-offset-2 hover:text-foreground">
              See your memories
            </Link>
            .
          </p>
        )}
        {pending ? (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-sm">
              <span className="font-medium">{pending.filename}</span>, exported on{' '}
              {localDateKey(new Date(pending.summary.exportedAt))}, holds{' '}
              {describeSummary(pending.summary)}.
              {pending.summary.photosWithoutBytes > 0 &&
                ` ${plural(pending.summary.photosWithoutBytes, 'photo was', 'photos were')} already missing image data when this backup was made.`}
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              Nothing has been written yet.
            </p>
            <div className="flex gap-2">
              <Button disabled={busy} onClick={() => void confirmRestore()}>
                {busy ? 'Restoring…' : 'Restore this backup'}
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => setPending(null)}>
                Cancel
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
              aria-label="Choose backup file"
              onChange={(event) => void pickFile(event)}
            />
            Choose backup file
          </label>
        )}
      </CardContent>
    </Card>
  )
}

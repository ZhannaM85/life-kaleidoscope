import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import type { Memory, MemoryVersion } from '@/domain/memory'
import { getRepositories, useLocaleStore } from '@/stores'
import { localeTag, type Locale } from '@/i18n'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

function savedOn(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(localeTag(locale), { dateStyle: 'long', timeStyle: 'short' })
}

interface HistoryData {
  memory: Memory
  /** Oldest first, as the repository returns them. */
  versions: MemoryVersion[]
}

/**
 * Read-only version history of a memory (Epic 4). Every save — including the
 * first — is here; nothing can be changed or removed from this page, which is
 * the point.
 */
export function VersionHistoryPage() {
  const { id } = useParams()
  const t = useLocaleStore((s) => s.dictionary)
  const locale = useLocaleStore((s) => s.locale)
  const [data, setData] = useState<HistoryData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { memories } = getRepositories()
        const memory = id ? await memories.getById(id) : undefined
        const versions = memory ? await memories.getVersions(memory.id) : []
        if (cancelled) return
        setData(memory ? { memory, versions } : null)
        setStatus(memory ? 'ready' : 'missing')
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (status === 'loading') {
    return <p className="py-24 text-center text-muted-foreground">{t.versionHistory.loading}</p>
  }

  if (status === 'error') {
    return (
      <p role="alert" className="py-24 text-center text-muted-foreground">
        {t.versionHistory.errorOpening(error ?? '')}
      </p>
    )
  }

  if (status === 'missing' || !data) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t.common.memoryNotFoundTitle}
        description={t.common.memoryNotFoundDescription}
        action={
          <Link
            to="/memories"
            className="font-sans text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground"
          >
            {t.common.backToAllMemories}
          </Link>
        }
      />
    )
  }

  const { memory, versions } = data
  const newestFirst = [...versions].reverse()

  return (
    <div>
      <PageHeader
        title={t.versionHistory.title}
        description={t.versionHistory.description}
        action={
          <Link
            to={`/memories/${memory.id}`}
            className="font-sans text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground"
          >
            {t.versionHistory.backToMemory}
          </Link>
        }
      />
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {newestFirst.map((version, index) => {
          const number = versions.length - index
          const isCurrent = version.id === memory.currentVersionId
          return (
            <li key={version.id}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t.versionHistory.versionNumber(number)}
                    {isCurrent && (
                      <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
                        {t.versionHistory.current}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{t.versionHistory.savedOn(savedOn(version.editedAt, locale))}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {version.snapshot.title && (
                    <p className="m-0 font-medium">{version.snapshot.title}</p>
                  )}
                  <p className="m-0 whitespace-pre-wrap leading-relaxed">
                    {version.snapshot.story}
                  </p>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

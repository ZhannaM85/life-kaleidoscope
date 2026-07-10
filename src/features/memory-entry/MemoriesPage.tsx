import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, PenLine } from 'lucide-react'
import { useMemoriesStore, useLocaleStore } from '@/stores'
import { localeTag, type Locale } from '@/i18n'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { EmptyState } from '@/shared/ui/empty-state'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'

function writtenOn(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(localeTag(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function MemoriesPage() {
  const { memories, promptsById, status, error, load } = useMemoriesStore()
  const t = useLocaleStore((s) => s.dictionary)
  const locale = useLocaleStore((s) => s.locale)

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading' || status === 'idle') {
    return <p className="py-24 text-center text-muted-foreground">{t.memories.loading}</p>
  }

  if (status === 'error') {
    return (
      <p role="alert" className="py-24 text-center text-muted-foreground">
        {t.memories.errorLoading(error ?? '')}
      </p>
    )
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t.memories.emptyTitle}
        description={t.memories.emptyDescription}
        action={
          <Link
            to="/"
            className="font-sans text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground"
          >
            {t.common.goToTodaysWord}
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title={t.memories.title}
        description={t.memories.description}
        action={
          <Link to="/memories/new" className={cn(buttonVariants({ variant: 'outline' }))}>
            <PenLine aria-hidden />
            {t.memories.writeAction}
          </Link>
        }
      />
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {memories.map((memory) => {
          const word = promptsById[memory.promptId]?.word
          return (
            <li key={memory.id}>
              <Link to={`/memories/${memory.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader className="pb-3">
                    {word && <CardTitle className="text-base">{word}</CardTitle>}
                    <CardDescription>{writtenOn(memory.createdAt, locale)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 whitespace-pre-wrap leading-relaxed">{memory.story}</p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

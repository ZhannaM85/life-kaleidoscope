import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDailyPromptStore, useLocaleStore } from '@/stores'
import { localeTag, type Locale } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'

function todayLabel(locale: Locale) {
  return new Date().toLocaleDateString(localeTag(locale), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function TodayPage() {
  const { prompt, todaysMemories, draft, status, error, load, setDraft, save } =
    useDailyPromptStore()
  const t = useLocaleStore((s) => s.dictionary)
  const locale = useLocaleStore((s) => s.locale)

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading' || (status === 'idle' && !prompt)) {
    return <p className="py-24 text-center text-muted-foreground">{t.today.opening}</p>
  }

  if (status === 'error') {
    return (
      <p role="alert" className="py-24 text-center text-muted-foreground">
        {t.today.errorOpening(error ?? '')}
      </p>
    )
  }

  if (!prompt) return null

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-center gap-2 pt-6 text-center">
        <p className="font-sans text-sm text-muted-foreground">
          {todayLabel(locale)} {t.today.wordSuffix}
        </p>
        <h1 className="text-5xl font-medium tracking-tight text-foreground">{prompt.word}</h1>
      </section>

      <section aria-label={t.today.writeSectionLabel} className="flex flex-col gap-4">
        <Textarea
          label={t.today.textareaLabel}
          hint={t.today.textareaHint}
          placeholder={t.common.placeholderIRemember}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={status === 'saving'}
          className="min-h-48"
        />
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/memories/new"
            className="font-sans text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {t.today.openFullForm}
          </Link>
          <Button onClick={() => void save()} disabled={status === 'saving' || !draft.trim()}>
            {status === 'saving' ? t.common.saving : t.common.keepThisMemory}
          </Button>
        </div>
      </section>

      {todaysMemories.length > 0 && (
        <section aria-label={t.today.savedTodaySectionLabel} className="flex flex-col gap-3">
          <p className="font-sans text-sm text-muted-foreground">
            {t.today.keptTodayPrefix}{' '}
            <Link to="/memories" className="underline underline-offset-2 hover:text-foreground">
              {t.common.seeAllMemories}
            </Link>
          </p>
          {todaysMemories.map((memory) => (
            <Card key={memory.id}>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap leading-relaxed">{memory.story}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/shared/ui/page-header'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { useLocaleStore } from '@/stores'
import type { Dictionary, Locale } from '@/i18n'
import {
  getStorageStatus,
  type StorageStatus,
} from '@/infrastructure/persistence/storage-persistence'

const BACKUP_SUGGESTION_DISMISSED_KEY = 'life-like-kaleidoscope.backup-suggestion-dismissed'

// localStorage can throw (privacy modes); a lost dismissal just means the
// suggestion reappears next visit — never an error the user sees.
function readSuggestionDismissed(): boolean {
  try {
    return localStorage.getItem(BACKUP_SUGGESTION_DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

function saveSuggestionDismissed(): void {
  try {
    localStorage.setItem(BACKUP_SUGGESTION_DISMISSED_KEY, 'true')
  } catch {
    // dismissed for this session only — fine
  }
}

function formatBytes(bytes: number, t: Dictionary): string {
  if (bytes < 1024) return `${bytes} ${t.common.byteUnits[0]}`
  let value = bytes
  let unit = t.common.byteUnits[0]
  for (const next of t.common.byteUnits.slice(1)) {
    if (value < 1024) break
    value /= 1024
    unit = next
  }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${unit}`
}

function protectionLabel(status: StorageStatus | null, t: Dictionary): string {
  if (!status) return t.settings.checking
  if (status.persisted === true) return t.settings.protectionOn
  if (status.persisted === false) return t.settings.protectionNotGranted
  return t.settings.unknown
}

function spaceUsedLabel(status: StorageStatus | null, t: Dictionary): string {
  if (!status) return t.settings.checking
  if (status.usage === null) return t.settings.unknown
  const used = formatBytes(status.usage, t)
  return status.quota === null ? used : t.settings.spaceUsedOf(used, formatBytes(status.quota, t))
}

const LANGUAGE_OPTIONS: readonly Locale[] = ['en', 'ru']

export function SettingsPage() {
  const t = useLocaleStore((s) => s.dictionary)
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const [status, setStatus] = useState<StorageStatus | null>(null)
  const [suggestionDismissed, setSuggestionDismissed] = useState(readSuggestionDismissed)

  useEffect(() => {
    let cancelled = false
    void getStorageStatus().then((s) => {
      if (!cancelled) setStatus(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function dismissSuggestion() {
    saveSuggestionDismissed()
    setSuggestionDismissed(true)
  }

  const languageLabel: Record<Locale, string> = {
    en: t.settings.languageEnglish,
    ru: t.settings.languageRussian,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.settings.title} />

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.languageTitle}</CardTitle>
          <CardDescription>{t.settings.languageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label={t.settings.languageTitle} className="flex gap-2">
            {LANGUAGE_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                role="radio"
                aria-checked={locale === option}
                variant={locale === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale(option)}
              >
                {languageLabel[option]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.settings.yourDataTitle}</CardTitle>
          <CardDescription>{t.settings.yourDataDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-4 font-sans text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">{t.settings.storageProtectionLabel}</dt>
              <dd>{protectionLabel(status, t)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">{t.settings.spaceUsedLabel}</dt>
              <dd>{spaceUsedLabel(status, t)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {status?.persisted === false && !suggestionDismissed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.settings.suggestionTitle}</CardTitle>
            <CardDescription>
              {t.settings.suggestionPrefix}{' '}
              <Link to="/export" className="underline underline-offset-2 hover:text-foreground">
                {t.settings.suggestionLinkText}
              </Link>{' '}
              {t.settings.suggestionSuffix}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={dismissSuggestion}>
              {t.settings.dismissSuggestion}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

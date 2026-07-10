import { PlaceholderPage } from '@/shared/ui/PlaceholderPage'
import { useLocaleStore } from '@/stores'

export function SearchPage() {
  const t = useLocaleStore((s) => s.dictionary)
  return <PlaceholderPage title={t.searchPage.title} description={t.placeholder.comingSoon} />
}

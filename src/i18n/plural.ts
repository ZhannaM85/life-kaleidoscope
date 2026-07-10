/** English: one form for 1, another for everything else. */
export function pluralEn(count: number, forms: { one: string; many: string }): string {
  return count === 1 ? forms.one : forms.many
}

/**
 * Russian CLDR plural rule: "one" (1, 21, 31…), "few" (2-4, 22-24…), "many"
 * (0, 5-20, 25-30…) — the count itself decides the noun's ending, unlike
 * English's singular/plural split.
 */
export function pluralRu(count: number, forms: { one: string; few: string; many: string }): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return forms.one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few
  return forms.many
}

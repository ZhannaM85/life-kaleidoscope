import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { useLocaleStore } from '@/stores'
import { Button, buttonVariants } from '@/shared/ui/button'
import { TextField } from '@/shared/ui/text-field'
import { Textarea } from '@/shared/ui/textarea'
import { ChipGroup } from '@/shared/ui/chip-group'
import { makeMemoryFormSchema, type MemoryFormValues } from './memory-form'

interface MemoryFormProps {
  defaultValues: MemoryFormValues
  submitLabel: string
  savingLabel: string
  saving: boolean
  /** Where "Cancel" leads — back to the detail view or the list. */
  cancelTo: string
  onSubmit: (values: MemoryFormValues) => void
}

/**
 * The full memory form (Epic 4), shared by the new and edit pages. React Hook
 * Form + Zod; only the story is required — everything else is an invitation,
 * not a demand.
 */
export function MemoryForm({
  defaultValues,
  submitLabel,
  savingLabel,
  saving,
  cancelTo,
  onSubmit,
}: MemoryFormProps) {
  const t = useLocaleStore((s) => s.dictionary)
  const schema = useMemo(() => makeMemoryFormSchema(t.memoryForm), [t])
  const moodOptions = useMemo(
    () => [
      { value: 'happy', label: t.mood.happy },
      { value: 'bittersweet', label: t.mood.bittersweet },
      { value: 'neutral', label: t.mood.neutral },
      { value: 'sad', label: t.mood.sad },
    ],
    [t]
  )
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <TextField
        label={t.memoryForm.titleLabel}
        hint={t.memoryForm.titleHint}
        error={errors.title?.message}
        disabled={saving}
        {...register('title')}
      />
      <Textarea
        label={t.memoryForm.storyLabel}
        hint={t.memoryForm.storyHint}
        placeholder={t.common.placeholderIRemember}
        className="min-h-48"
        error={errors.story?.message}
        disabled={saving}
        {...register('story')}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label={t.memoryForm.approxAgeLabel}
          hint={t.memoryForm.approxHint}
          inputMode="numeric"
          error={errors.approxAge?.message}
          disabled={saving}
          {...register('approxAge')}
        />
        <TextField
          label={t.memoryForm.approxYearLabel}
          hint={t.memoryForm.approxHint}
          inputMode="numeric"
          error={errors.approxYear?.message}
          disabled={saving}
          {...register('approxYear')}
        />
      </div>
      <Controller
        control={control}
        name="mood"
        render={({ field }) => (
          <ChipGroup
            legend={t.mood.question}
            options={moodOptions}
            value={field.value === '' ? undefined : field.value}
            onChange={(value) => field.onChange(value ?? '')}
            disabled={saving}
          />
        )}
      />
      <TextField
        label={t.common.people}
        hint={t.memoryForm.peopleHint}
        error={errors.people?.message}
        disabled={saving}
        {...register('people')}
      />
      <TextField
        label={t.common.places}
        hint={t.memoryForm.placesHint}
        error={errors.places?.message}
        disabled={saving}
        {...register('places')}
      />
      <TextField
        label={t.common.tags}
        hint={t.memoryForm.tagsHint}
        error={errors.tags?.message}
        disabled={saving}
        {...register('tags')}
      />
      <div className="flex items-center justify-end gap-3">
        <Link to={cancelTo} className={cn(buttonVariants({ variant: 'ghost' }))}>
          {t.common.cancel}
        </Link>
        <Button type="submit" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}

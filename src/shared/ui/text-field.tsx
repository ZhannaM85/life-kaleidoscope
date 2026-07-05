import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

interface TextFieldProps extends ComponentProps<'input'> {
  label: string
  /** Quiet helper text below the input. Replaced by `error` when present. */
  hint?: string
  error?: string
}

/**
 * Labeled single-line input. Label, hint, and error are wired up with
 * aria-describedby/aria-invalid so screen readers announce them.
 */
function TextField({ label, hint, error, className, id: idProp, ...props }: TextFieldProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const descriptionId = `${id}-description`
  const description = error ?? hint

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base',
          'placeholder:text-muted-foreground/70',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
      {description && (
        <p
          id={descriptionId}
          className={cn('font-sans text-sm', error ? 'text-destructive' : 'text-muted-foreground')}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export { TextField, type TextFieldProps }

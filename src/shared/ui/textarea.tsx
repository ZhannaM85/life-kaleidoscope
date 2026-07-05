import { useId, type ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

interface TextareaProps extends ComponentProps<'textarea'> {
  label: string
  hint?: string
  error?: string
}

/**
 * Labeled multi-line input for memory prose. Serif by inheritance — writing
 * should feel like a notebook page, not a form control.
 */
function Textarea({ label, hint, error, className, id: idProp, ...props }: TextareaProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const descriptionId = `${id}-description`
  const description = error ?? hint

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'min-h-32 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base leading-relaxed',
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

export { Textarea, type TextareaProps }

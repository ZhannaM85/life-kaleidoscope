import { useRef, type ChangeEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface PhotoUploadProps {
  /** Called with the chosen files. The input resets after each pick so the same file can be re-chosen. */
  onSelect: (files: File[]) => void
  multiple?: boolean
  disabled?: boolean
  label?: string
  className?: string
}

/**
 * Photo picker styled as a quiet dashed drop-well. The real `<input type="file">`
 * sits inside the label (visually hidden but focusable), so keyboard and screen
 * reader users operate the native control.
 */
function PhotoUpload({
  onSelect,
  multiple = false,
  disabled = false,
  label = multiple ? 'Add photos' : 'Add a photo',
  className,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) onSelect(files)
    event.target.value = ''
  }

  return (
    <label
      className={cn(
        'flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-4 py-6',
        'font-sans text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        aria-label={label}
      />
      <ImagePlus aria-hidden className="size-5" />
      <span>{label}</span>
    </label>
  )
}

export { PhotoUpload, type PhotoUploadProps }

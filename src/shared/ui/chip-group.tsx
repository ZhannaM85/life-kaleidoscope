import { cn } from '@/shared/lib/utils'

export interface ChipOption {
  value: string
  label: string
}

interface ChipGroupProps {
  legend: string
  options: ChipOption[]
  value: string | undefined
  onChange: (value: string | undefined) => void
  disabled?: boolean
}

/**
 * A row of quiet, outlined toggle chips for a small set of mutually
 * exclusive, optional choices (e.g. mood, #26) — tap to select, tap again to
 * clear. No color coding: the selected chip gets a muted-ink fill, nothing
 * else changes.
 */
function ChipGroup({ legend, options, value, onChange, disabled }: ChipGroupProps) {
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="p-0 font-sans text-sm font-medium text-foreground">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(selected ? undefined : option.value)}
              className={cn(
                'rounded-full border border-input px-4 py-1.5 font-serif text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
                'disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'bg-transparent text-foreground hover:bg-muted'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export { ChipGroup, type ChipGroupProps }

import { CalendarBlank, X } from "@phosphor-icons/react"
import { format, parseISO } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DatePickerInputProps {
  /** ISO day string (YYYY-MM-DD) or null. */
  value: string | null
  onChange: (next: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** When true, render a clear button next to the trigger. */
  clearable?: boolean
  className?: string
  triggerClassName?: string
  /** Forwarded to the trigger button for label association. */
  id?: string
  ariaLabel?: string
}

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/**
 * Presentational date picker built on Popover + Calendar. Stores the value
 * as an ISO day string (YYYY-MM-DD). Use directly for uncontrolled / RHF
 * `Controller` flows; `<DateField>` wraps this for the most common case.
 */
export function DatePickerInput({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  clearable = false,
  className,
  triggerClassName,
  id,
  ariaLabel,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const selected = parseDate(value)
  const display = selected ? format(selected, "PP") : null

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
              "flex-1 justify-start font-normal",
              !display && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <CalendarBlank className="size-4 text-muted-foreground" />
            {display ?? placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return
              onChange(format(date, "yyyy-MM-dd"))
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {clearable && value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground"
          aria-label="Clear date"
          onClick={() => onChange(null)}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

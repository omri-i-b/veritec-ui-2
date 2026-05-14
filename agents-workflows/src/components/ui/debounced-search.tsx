import { MagnifyingGlass } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface DebouncedSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  delayMs?: number
  className?: string
}

/**
 * Search input with debounced `onChange` via the shared `useDebounce`
 * hook. Local value tracks keystrokes; emits to `onChange` only after
 * `delayMs` of inactivity (default 300ms). Prefer this component over
 * wiring `useDebounce` + `<Input>` by hand at each call site.
 */
export function DebouncedSearch({
  value,
  onChange,
  placeholder = "Search",
  delayMs = 300,
  className,
}: DebouncedSearchProps) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, delayMs)
  const lastEmittedRef = useRef(value)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Sync external value back into local when it changes from outside.
  useEffect(() => {
    setLocalValue(value)
    lastEmittedRef.current = value
  }, [value])

  // Emit when the debounced value settles on something new.
  useEffect(() => {
    if (debouncedValue !== lastEmittedRef.current) {
      lastEmittedRef.current = debouncedValue
      onChangeRef.current(debouncedValue)
    }
  }, [debouncedValue])

  return (
    <div className="relative">
      <MagnifyingGlass className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className={cn("h-8 w-56 pl-8", className)}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  )
}

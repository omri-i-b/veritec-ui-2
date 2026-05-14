import { CaretDown } from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const MAX_VISIBLE = 50

interface Option {
  value: string
  label: string
}

interface SearchSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

function SearchSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return options.slice(0, MAX_VISIBLE)
    const lower = search.toLowerCase()
    return options
      .filter((o) => (o.label ?? "").toLowerCase().includes(lower))
      .slice(0, MAX_VISIBLE)
  }, [options, search])

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label,
    [options, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selectedLabel && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <CaretDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] rounded-lg p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem
                  key={option.value}
                  data-checked={value === option.value || undefined}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {!search && options.length > MAX_VISIBLE && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Type to search {options.length.toLocaleString()} items...
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface SearchMultiSelectProps {
  selected: string[]
  onChange: (selected: string[]) => void
  options: Option[]
  placeholder?: string
  children: React.ReactNode
  /** Extra classes for the popover content (e.g. custom width). */
  contentClassName?: string
}

function SearchMultiSelect({
  selected,
  onChange,
  options,
  children,
  contentClassName,
}: SearchMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const scope = useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter((o) => (o.label ?? "").toLowerCase().includes(lower))
  }, [options, search])

  const visible = useMemo(() => scope.slice(0, MAX_VISIBLE), [scope])

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const allInScopeSelected =
    scope.length > 0 && scope.every((o) => selectedSet.has(o.value))

  function toggleValue(value: string) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function toggleAll() {
    if (scope.length === 0) return
    const scopeValues = scope.map((o) => o.value)
    if (allInScopeSelected) {
      const scopeSet = new Set(scopeValues)
      onChange(selected.filter((v) => !scopeSet.has(v)))
    } else {
      onChange(Array.from(new Set([...selected, ...scopeValues])))
    }
  }

  const selectAllLabel = allInScopeSelected
    ? search
      ? "Deselect all matches"
      : "Deselect all"
    : search
      ? `Select all matches (${scope.length})`
      : `Select all (${options.length})`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn("w-56 rounded-lg p-0", contentClassName)}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {scope.length > 0 && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__select_all__"
                    data-checked={allInScopeSelected || undefined}
                    onSelect={toggleAll}
                    className="font-medium"
                  >
                    {selectAllLabel}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup>
              {visible.map((opt) => (
                <CommandItem
                  key={opt.value}
                  data-checked={selectedSet.has(opt.value) || undefined}
                  onSelect={() => toggleValue(opt.value)}
                >
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {!search && options.length > MAX_VISIBLE && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Type to search {options.length.toLocaleString()} items...
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export type { Option as SearchSelectOption }
export { SearchMultiSelect, SearchSelect }

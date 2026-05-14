import { SpinnerGap } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100]

interface TablePaginationProps {
  page: number
  pageCount: number
  itemCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  isLoading?: boolean
  className?: string
}

function TablePagination({
  page,
  pageCount,
  itemCount,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  isLoading,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(pageCount, 1)
  const [draft, setDraft] = useState(String(page))
  const debouncedDraft = useDebounce(draft, 400)

  // Hold `page` and `onPageChange` in refs so the debounce-commit effect
  // below only re-fires when the user's debounced input actually changes.
  // Otherwise an external page change re-runs that effect with a stale
  // `debouncedDraft` and reverts the page (e.g. clicking Next would snap
  // back to 1).
  const pageRef = useRef(page)
  const onPageChangeRef = useRef(onPageChange)
  useEffect(() => {
    pageRef.current = page
  }, [page])
  useEffect(() => {
    onPageChangeRef.current = onPageChange
  }, [onPageChange])

  useEffect(() => {
    setDraft(String(page))
  }, [page])

  useEffect(() => {
    if (debouncedDraft === "" || debouncedDraft === String(pageRef.current))
      return
    const next = Number(debouncedDraft)
    if (!Number.isFinite(next)) return
    const clamped = Math.min(Math.max(Math.trunc(next), 1), totalPages)
    if (clamped !== pageRef.current) onPageChangeRef.current(clamped)
    if (String(clamped) !== debouncedDraft) setDraft(String(clamped))
  }, [debouncedDraft, totalPages])

  const isDebouncing = draft !== String(page) && draft !== ""
  const showSpinner = isDebouncing || Boolean(isLoading)

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border px-4 py-2",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          Page
          <span className="relative">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Go to page"
              className="h-7 w-14 px-2 pr-6 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {showSpinner && (
              <SpinnerGap
                aria-label="Loading"
                className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground"
              />
            )}
          </span>
          of {totalPages}
        </span>
        <span>({itemCount} items)</span>
      </div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && pageSize && (
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export { TablePagination }
export type { TablePaginationProps }

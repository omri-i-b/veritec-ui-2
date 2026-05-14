import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { SpreadsheetColumn } from "./types"

export const CELL_ROW_ATTR = "data-cell-row"
export const CELL_COL_ATTR = "data-cell-col"

interface SpreadsheetCellProps<TRow> {
  rowIndex: number
  colIndex: number
  column: SpreadsheetColumn<TRow>
  value: unknown
  editable: boolean
  highlighted: boolean
  renderReadonly?: () => ReactNode
  onCommit: (value: unknown) => void
}

export function SpreadsheetCell<TRow>({
  rowIndex,
  colIndex,
  column,
  value,
  editable,
  highlighted,
  renderReadonly,
  onCommit,
}: SpreadsheetCellProps<TRow>) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => toInputString(value, column.type))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(toInputString(value, column.type))
  }, [value, column.type, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function commit() {
    if (draft === toInputString(value, column.type)) {
      setEditing(false)
      return
    }
    const parsed = parseDraft(draft, column.type)
    if (parsed !== INVALID) {
      onCommit(parsed)
    }
    setEditing(false)
  }

  function cancel() {
    setDraft(toInputString(value, column.type))
    setEditing(false)
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      commit()
      focusSibling(rowIndex + 1, colIndex)
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancel()
    } else if (e.key === "Tab") {
      e.preventDefault()
      commit()
      focusSibling(rowIndex, colIndex + (e.shiftKey ? -1 : 1))
    }
  }

  const cellAttrs = {
    [CELL_ROW_ATTR]: rowIndex,
    [CELL_COL_ATTR]: colIndex,
  }

  const selectionClasses =
    "data-[selected=true]:bg-primary/10 data-[fill-preview=true]:bg-primary/5"

  if (!editable) {
    return (
      <div
        {...cellAttrs}
        tabIndex={-1}
        className={cn(
          "flex h-8 w-full items-center px-2 text-xs select-none",
          highlighted && "bg-yellow-50 dark:bg-yellow-950/30",
          selectionClasses,
        )}
      >
        {renderReadonly ? (
          renderReadonly()
        ) : (
          <span className="truncate">{toDisplay(value, column.type)}</span>
        )}
      </div>
    )
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        {...cellAttrs}
        type={htmlInputType(column.type)}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onInputKeyDown}
        maxLength={column.maxLength}
        className={cn(
          "h-8 rounded-none border-2 border-primary px-2 text-xs focus-visible:ring-0",
        )}
      />
    )
  }

  return (
    <button
      type="button"
      {...cellAttrs}
      onDoubleClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "F2") {
          e.preventDefault()
          setEditing(true)
        }
      }}
      className={cn(
        "flex h-8 w-full items-center px-2 text-left text-xs select-none hover:bg-muted/50 focus-visible:outline-none",
        highlighted &&
          "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-800",
        selectionClasses,
      )}
    >
      <span className="truncate">{toDisplay(value, column.type)}</span>
    </button>
  )
}

const INVALID = Symbol("invalid")

function parseDraft(draft: string, type: SpreadsheetColumn<unknown>["type"]) {
  const trimmed = draft.trim()
  if (type === "text") return trimmed
  if (type === "number") {
    if (trimmed === "") return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : INVALID
  }
  if (type === "date") {
    if (trimmed === "") return null
    const d = new Date(trimmed)
    return Number.isNaN(d.getTime()) ? INVALID : d.toISOString()
  }
  return trimmed
}

function toInputString(
  value: unknown,
  type: SpreadsheetColumn<unknown>["type"],
): string {
  if (value == null) return ""
  if (type === "date") {
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return ""
    return d.toISOString().slice(0, 10)
  }
  return String(value)
}

function toDisplay(
  value: unknown,
  type: SpreadsheetColumn<unknown>["type"],
): string {
  if (value == null || value === "") return "—"
  if (type === "date") {
    const d = new Date(String(value))
    if (Number.isNaN(d.getTime())) return String(value)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(d)
  }
  if (type === "number") {
    return typeof value === "number" ? value.toLocaleString() : String(value)
  }
  return String(value)
}

function htmlInputType(type: SpreadsheetColumn<unknown>["type"]): string {
  if (type === "number") return "number"
  if (type === "date") return "date"
  return "text"
}

function focusSibling(row: number, col: number) {
  const selector = `[${CELL_ROW_ATTR}="${row}"][${CELL_COL_ATTR}="${col}"]`
  const el = document.querySelector(selector) as HTMLElement | null
  el?.focus()
}

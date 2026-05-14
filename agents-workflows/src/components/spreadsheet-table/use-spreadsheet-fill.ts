import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { applyPasteMatrix, buildSelectionMatrix } from "./clipboard-ops"
import type { CellRange, SpreadsheetColumn } from "./types"
import { normalizeRange } from "./use-spreadsheet-selection"

interface UseSpreadsheetFillOptions<TRow> {
  selection: CellRange | null
  setSelection: (range: CellRange | null) => void
  data: TRow[]
  columns: SpreadsheetColumn<TRow>[]
  onRowsChange: (rows: TRow[]) => void
  isRowEditable?: (row: TRow) => boolean
  containerRef: RefObject<HTMLElement | null>
}

export function useSpreadsheetFill<TRow>({
  selection,
  setSelection,
  data,
  columns,
  onRowsChange,
  isRowEditable,
  containerRef,
}: UseSpreadsheetFillOptions<TRow>) {
  const [isFilling, setIsFilling] = useState(false)
  const endRowRef = useRef<number | null>(null)

  const paintPreview = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const current = container.querySelectorAll("[data-fill-preview]")
    for (const el of current) el.removeAttribute("data-fill-preview")
    if (!selection) return
    const endRow = endRowRef.current
    if (endRow === null) return
    const { rMax, cMin, cMax } = normalizeRange(selection)
    if (endRow <= rMax) return
    for (let r = rMax + 1; r <= endRow; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const el = container.querySelector(
          `[data-cell-row="${r}"][data-cell-col="${c}"]`,
        )
        if (el) el.setAttribute("data-fill-preview", "true")
      }
    }
  }, [selection, containerRef])

  const applyFill = useCallback(() => {
    const endRow = endRowRef.current
    endRowRef.current = null
    if (!selection || endRow === null) return
    const src = normalizeRange(selection)
    if (endRow <= src.rMax) return
    const matrix = buildSelectionMatrix(src, data, columns)
    const target = {
      rMin: src.rMin,
      rMax: endRow,
      cMin: src.cMin,
      cMax: src.cMax,
    }
    const result = applyPasteMatrix(
      matrix,
      target,
      data,
      columns,
      isRowEditable,
    )
    if (result.applied > 0) onRowsChange(result.rows)
    setSelection({
      anchor: { row: src.rMin, col: src.cMin },
      focus: { row: Math.min(endRow, data.length - 1), col: src.cMax },
    })
  }, [selection, data, columns, onRowsChange, isRowEditable, setSelection])

  const onHandleMouseDown = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    setIsFilling(true)
  }, [])

  useEffect(() => {
    if (!isFilling) return
    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el) return
      const cell = (el as Element).closest?.(
        "[data-cell-row]",
      ) as HTMLElement | null
      if (!cell) return
      const row = Number(cell.getAttribute("data-cell-row"))
      if (!Number.isFinite(row)) return
      if (endRowRef.current !== row) {
        endRowRef.current = row
        paintPreview()
      }
    }
    const onUp = () => {
      applyFill()
      setIsFilling(false)
      const container = containerRef.current
      if (container) {
        for (const el of container.querySelectorAll("[data-fill-preview]")) {
          el.removeAttribute("data-fill-preview")
        }
      }
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [isFilling, paintPreview, applyFill, containerRef])

  return { isFilling, onHandleMouseDown }
}

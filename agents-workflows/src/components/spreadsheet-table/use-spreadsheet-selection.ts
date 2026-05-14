import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import type { CellCoord, CellRange } from "./types"

interface UseSpreadsheetSelectionOptions {
  rowCount: number
  colCount: number
  containerRef: RefObject<HTMLElement | null>
  scrollRef?: RefObject<HTMLElement | null>
  /** Pass `data` here so the paint effect re-runs after row mutations
   * replace the cell DOM (otherwise data-selected attrs would be lost). */
  repaintDep?: unknown
}

interface NormalizedRange {
  rMin: number
  rMax: number
  cMin: number
  cMax: number
}

export function normalizeRange(range: CellRange): NormalizedRange {
  return {
    rMin: Math.min(range.anchor.row, range.focus.row),
    rMax: Math.max(range.anchor.row, range.focus.row),
    cMin: Math.min(range.anchor.col, range.focus.col),
    cMax: Math.max(range.anchor.col, range.focus.col),
  }
}

export function useSpreadsheetSelection({
  rowCount,
  colCount,
  containerRef,
  scrollRef,
  repaintDep,
}: UseSpreadsheetSelectionOptions) {
  const [selection, setSelection] = useState<CellRange | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const draggingRef = useRef(false)

  // Paint data-selected attr on cells imperatively — React doesn't touch
  // attrs it didn't render, so these survive cell re-renders. `repaintDep`
  // is a signal dep so the effect re-runs after row mutations.
  // biome-ignore lint/correctness/useExhaustiveDependencies: signal-only dep
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cells = container.querySelectorAll<HTMLElement>("[data-cell-row]")
    for (const el of cells) el.removeAttribute("data-selected")
    if (!selection) return
    const { rMin, rMax, cMin, cMax } = normalizeRange(selection)
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const el = container.querySelector<HTMLElement>(
          `[data-cell-row="${r}"][data-cell-col="${c}"]`,
        )
        if (el) el.setAttribute("data-selected", "true")
      }
    }
    const focusEl = container.querySelector<HTMLElement>(
      `[data-cell-row="${selection.focus.row}"][data-cell-col="${selection.focus.col}"]`,
    )
    if (focusEl) {
      const active = document.activeElement
      const activeIsInput = active?.tagName === "INPUT"
      if (!activeIsInput && active !== focusEl) {
        focusEl.focus({ preventScroll: true })
      }
    }
  }, [selection, containerRef, repaintDep])

  // Window listener so a release outside the table still ends the drag.
  useEffect(() => {
    const onUp = () => {
      draggingRef.current = false
      setIsDragging(false)
    }
    window.addEventListener("mouseup", onUp)
    return () => window.removeEventListener("mouseup", onUp)
  }, [])

  // Auto-scroll while dragging near scroll-area edges.
  useEffect(() => {
    if (!isDragging) return
    const scroll = scrollRef?.current
    if (!scroll) return
    const threshold = 48
    const maxSpeed = 24
    let rafId: number | null = null
    // Start null so the edge check doesn't fire with a default (0, 0) —
    // that would read as "past the left edge" and yank the view back.
    let mouseX: number | null = null
    let mouseY: number | null = null
    const step = () => {
      if (mouseX !== null && mouseY !== null) {
        const r = scroll.getBoundingClientRect()
        let dx = 0
        let dy = 0
        if (mouseY < r.top + threshold) {
          dy = -maxSpeed * Math.min(1, (r.top + threshold - mouseY) / threshold)
        } else if (mouseY > r.bottom - threshold) {
          dy =
            maxSpeed *
            Math.min(1, (mouseY - (r.bottom - threshold)) / threshold)
        }
        if (mouseX < r.left + threshold) {
          dx =
            -maxSpeed * Math.min(1, (r.left + threshold - mouseX) / threshold)
        } else if (mouseX > r.right - threshold) {
          dx =
            maxSpeed *
            Math.min(1, (mouseX - (r.right - threshold)) / threshold)
        }
        if (dx !== 0 || dy !== 0) scroll.scrollBy(dx, dy)
      }
      rafId = requestAnimationFrame(step)
    }
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener("mousemove", onMove)
    rafId = requestAnimationFrame(step)
    return () => {
      window.removeEventListener("mousemove", onMove)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [isDragging, scrollRef])

  const onCellMouseDown = useCallback(
    (row: number, col: number, e: ReactMouseEvent<HTMLElement>) => {
      if (e.button === 2) {
        // Keep a multi-cell range intact when right-clicking inside it, so
        // the context-menu action targets the whole selection.
        setSelection((prev) => {
          if (!prev) return { anchor: { row, col }, focus: { row, col } }
          const { rMin, rMax, cMin, cMax } = normalizeRange(prev)
          const inside =
            row >= rMin && row <= rMax && col >= cMin && col <= cMax
          return inside ? prev : { anchor: { row, col }, focus: { row, col } }
        })
        return
      }
      if (e.button !== 0) return
      if (e.shiftKey) {
        setSelection((prev) =>
          prev
            ? { anchor: prev.anchor, focus: { row, col } }
            : { anchor: { row, col }, focus: { row, col } },
        )
        return
      }
      draggingRef.current = true
      setIsDragging(true)
      setSelection({ anchor: { row, col }, focus: { row, col } })
    },
    [],
  )

  const onCellMouseEnter = useCallback(
    (row: number, col: number, e: ReactMouseEvent<HTMLElement>) => {
      if (!draggingRef.current) return
      if ((e.buttons & 1) === 0) {
        draggingRef.current = false
        return
      }
      setSelection((prev) =>
        prev ? { anchor: prev.anchor, focus: { row, col } } : prev,
      )
    },
    [],
  )

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      const target = e.target as HTMLElement | null
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return

      if (e.key === "Escape") {
        if (selection) {
          setSelection(null)
          e.preventDefault()
        }
        return
      }

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      if (ctrl && (e.key === "a" || e.key === "A")) {
        e.preventDefault()
        setSelection({
          anchor: { row: 0, col: 0 },
          focus: { row: rowCount - 1, col: colCount - 1 },
        })
        return
      }

      if (!selection) return
      const anchor = selection.anchor
      const { focus } = selection

      if (e.key === " ") {
        if (ctrl) {
          e.preventDefault()
          setSelection({
            anchor: { row: 0, col: focus.col },
            focus: { row: rowCount - 1, col: focus.col },
          })
          return
        }
        if (shift) {
          e.preventDefault()
          setSelection({
            anchor: { row: focus.row, col: 0 },
            focus: { row: focus.row, col: colCount - 1 },
          })
          return
        }
        return
      }

      let next: CellCoord | null = null
      let extending = shift
      const pageSize = (() => {
        const h = scrollRef?.current?.clientHeight
        if (!h) return 10
        return Math.max(1, Math.floor(h / 32) - 1)
      })()

      switch (e.key) {
        case "ArrowUp":
          next = ctrl
            ? { row: 0, col: focus.col }
            : { row: clamp(focus.row - 1, 0, rowCount - 1), col: focus.col }
          break
        case "ArrowDown":
          next = ctrl
            ? { row: rowCount - 1, col: focus.col }
            : { row: clamp(focus.row + 1, 0, rowCount - 1), col: focus.col }
          break
        case "ArrowLeft":
          next = ctrl
            ? { row: focus.row, col: 0 }
            : { row: focus.row, col: clamp(focus.col - 1, 0, colCount - 1) }
          break
        case "ArrowRight":
          next = ctrl
            ? { row: focus.row, col: colCount - 1 }
            : { row: focus.row, col: clamp(focus.col + 1, 0, colCount - 1) }
          break
        case "Home":
          next = ctrl ? { row: 0, col: 0 } : { row: focus.row, col: 0 }
          break
        case "End":
          next = ctrl
            ? { row: rowCount - 1, col: colCount - 1 }
            : { row: focus.row, col: colCount - 1 }
          break
        case "PageUp":
          next = {
            row: clamp(focus.row - pageSize, 0, rowCount - 1),
            col: focus.col,
          }
          break
        case "PageDown":
          next = {
            row: clamp(focus.row + pageSize, 0, rowCount - 1),
            col: focus.col,
          }
          break
        case "Tab":
          next = {
            row: focus.row,
            col: clamp(focus.col + (shift ? -1 : 1), 0, colCount - 1),
          }
          extending = false
          break
        default:
          return
      }

      e.preventDefault()
      if (extending) setSelection({ anchor, focus: next })
      else setSelection({ anchor: next, focus: next })
    },
    [selection, rowCount, colCount, scrollRef],
  )

  const moveTo = useCallback((row: number, col: number) => {
    setSelection({ anchor: { row, col }, focus: { row, col } })
  }, [])

  return {
    selection,
    setSelection,
    moveTo,
    onCellMouseDown,
    onCellMouseEnter,
    onKeyDown,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

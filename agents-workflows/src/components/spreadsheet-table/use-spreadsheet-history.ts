import { useCallback, useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"

interface UseSpreadsheetHistoryOptions<TRow> {
  data: TRow[]
  onRowsChange: (rows: TRow[]) => void
  capacity?: number
}

// One `commit` call = one history step (one edit / one paste / one fill).
// Matches Excel: Cmd+Z undoes the whole action, not per-cell.
export function useSpreadsheetHistory<TRow>({
  data,
  onRowsChange,
  capacity = 50,
}: UseSpreadsheetHistoryOptions<TRow>) {
  const undoRef = useRef<TRow[][]>([])
  const redoRef = useRef<TRow[][]>([])

  const commit = useCallback(
    (next: TRow[]) => {
      undoRef.current.push(data)
      if (undoRef.current.length > capacity) undoRef.current.shift()
      redoRef.current = []
      onRowsChange(next)
    },
    [data, onRowsChange, capacity],
  )

  const undo = useCallback(() => {
    const prev = undoRef.current.pop()
    if (!prev) return
    redoRef.current.push(data)
    if (redoRef.current.length > capacity) redoRef.current.shift()
    onRowsChange(prev)
  }, [data, onRowsChange, capacity])

  const redo = useCallback(() => {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(data)
    if (undoRef.current.length > capacity) undoRef.current.shift()
    onRowsChange(next)
  }, [data, onRowsChange, capacity])

  useHotkeys(
    "mod+z",
    (e) => {
      const t = e.target as HTMLElement | null
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA") return
      e.preventDefault()
      undo()
    },
    { enableOnFormTags: false },
    [undo],
  )

  useHotkeys(
    ["mod+shift+z", "mod+y"],
    (e) => {
      const t = e.target as HTMLElement | null
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA") return
      e.preventDefault()
      redo()
    },
    { enableOnFormTags: false },
    [redo],
  )

  return { commit, undo, redo }
}

import { coerceValue, formatForClipboard } from "./coerce"
import type { SpreadsheetColumn } from "./types"

export interface NormalizedRange {
  rMin: number
  rMax: number
  cMin: number
  cMax: number
}

export function buildSelectionMatrix<TRow>(
  range: NormalizedRange,
  data: TRow[],
  columns: SpreadsheetColumn<TRow>[],
): string[][] {
  const matrix: string[][] = []
  for (let r = range.rMin; r <= range.rMax; r++) {
    const row = data[r]
    if (!row) continue
    const line: string[] = []
    for (let c = range.cMin; c <= range.cMax; c++) {
      const spec = columns[c]
      if (!spec) continue
      line.push(formatForClipboard(spec.accessor(row), spec.type))
    }
    matrix.push(line)
  }
  return matrix
}

export interface PasteResult<TRow> {
  rows: TRow[]
  applied: number
  skipped: number
  targetRows: number
  targetCols: number
}

/**
 * Rectangle expansion (Excel semantics):
 *   1x1 source  → fills the whole selection
 *   1xM source  → broadcasts down an Nx1 selection when columns match
 *   Nx1 source  → broadcasts right a 1xM selection when rows match
 *   1x1 target  → pastes full source at the anchor, growing past bounds
 *   otherwise   → pastes source 1:1 at the anchor
 */
export function applyPasteMatrix<TRow>(
  matrix: string[][],
  range: NormalizedRange,
  data: TRow[],
  columns: SpreadsheetColumn<TRow>[],
  isRowEditable?: (row: TRow) => boolean,
): PasteResult<TRow> {
  if (matrix.length === 0) {
    return {
      rows: data,
      applied: 0,
      skipped: 0,
      targetRows: 0,
      targetCols: 0,
    }
  }

  const srcRows = matrix.length
  const srcCols = matrix.reduce((m, r) => Math.max(m, r.length), 0)
  const selRows = range.rMax - range.rMin + 1
  const selCols = range.cMax - range.cMin + 1

  let targetRows: number
  let targetCols: number
  if (srcRows === 1 && srcCols === 1) {
    targetRows = selRows
    targetCols = selCols
  } else if (selRows === 1 && selCols === 1) {
    targetRows = srcRows
    targetCols = srcCols
  } else if (srcRows === 1 && selCols === srcCols) {
    targetRows = selRows
    targetCols = selCols
  } else if (srcCols === 1 && selRows === srcRows) {
    targetRows = selRows
    targetCols = selCols
  } else {
    targetRows = srcRows
    targetCols = srcCols
  }

  const next = data.slice()
  let applied = 0
  let skipped = 0

  for (let dr = 0; dr < targetRows; dr++) {
    const r = range.rMin + dr
    if (r >= data.length) {
      skipped += targetCols
      continue
    }
    let updated: TRow = next[r]
    if (isRowEditable && !isRowEditable(updated)) {
      skipped += targetCols
      continue
    }
    for (let dc = 0; dc < targetCols; dc++) {
      const c = range.cMin + dc
      if (c >= columns.length) {
        skipped++
        continue
      }
      const spec = columns[c]
      if (!spec?.setter) {
        skipped++
        continue
      }
      const srcR = dr % srcRows
      const srcC = dc % srcCols
      const raw = matrix[srcR]?.[srcC] ?? ""
      const result = coerceValue(raw, spec.type, {
        maxLength: spec.maxLength,
      })
      if (result.ok) {
        updated = spec.setter(updated, result.value)
        applied++
      } else {
        skipped++
      }
    }
    if (updated !== next[r]) next[r] = updated
  }

  return { rows: next, applied, skipped, targetRows, targetCols }
}

export function clearSelection<TRow>(
  range: NormalizedRange,
  data: TRow[],
  columns: SpreadsheetColumn<TRow>[],
  isRowEditable?: (row: TRow) => boolean,
): { rows: TRow[]; changed: boolean } {
  const next = data.slice()
  let changed = false
  for (let r = range.rMin; r <= range.rMax; r++) {
    const row = next[r]
    if (!row) continue
    if (isRowEditable && !isRowEditable(row)) continue
    let updated: TRow = row
    for (let c = range.cMin; c <= range.cMax; c++) {
      const spec = columns[c]
      if (!spec?.setter) continue
      const clear = spec.type === "text" ? "" : null
      updated = spec.setter(updated, clear)
    }
    if (updated !== row) {
      next[r] = updated
      changed = true
    }
  }
  return { rows: next, changed }
}

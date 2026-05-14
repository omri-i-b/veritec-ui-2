import type { ReactNode } from "react"

export type SpreadsheetColumnType = "number" | "text" | "date" | "readonly"

export interface SpreadsheetColumn<TRow> {
  id: string
  header: string
  type: SpreadsheetColumnType
  accessor: (row: TRow) => unknown
  /** Required unless `type === "readonly"`. */
  setter?: (row: TRow, value: unknown) => TRow
  size?: number
  minSize?: number
  maxLength?: number
  required?: boolean
  render?: (row: TRow) => ReactNode
}

export interface CellCoord {
  row: number
  col: number
}

export interface CellRange {
  anchor: CellCoord
  focus: CellCoord
}

export interface SpreadsheetTableProps<TRow> {
  data: TRow[]
  columns: SpreadsheetColumn<TRow>[]
  getRowId: (row: TRow) => string
  onRowsChange: (rows: TRow[]) => void
  isRowEditable?: (row: TRow) => boolean
  isCellHighlighted?: (row: TRow, columnId: string) => boolean
  /** Persists column order + sizing under `<storageKey>:order` and
   * `<storageKey>:sizing`. */
  storageKey?: string
  isLoading?: boolean
  emptyMessage?: string
  getRowClassName?: (row: TRow, index: number) => string | undefined
  /** Fires when the selection's focus cell moves into a different row. */
  onFocusRowChange?: (row: TRow | null, index: number) => void
}

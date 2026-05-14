import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Header,
  useReactTable,
} from "@tanstack/react-table"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableResizeHandle,
  TableRow,
  TableScrollArea,
  TableSkeleton,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { clearSelection } from "./clipboard-ops"
import { SpreadsheetCell } from "./spreadsheet-cell"
import type { SpreadsheetColumn, SpreadsheetTableProps } from "./types"
import { useSpreadsheetClipboard } from "./use-spreadsheet-clipboard"
import { useSpreadsheetFill } from "./use-spreadsheet-fill"
import { useSpreadsheetHistory } from "./use-spreadsheet-history"
import {
  normalizeRange,
  useSpreadsheetSelection,
} from "./use-spreadsheet-selection"

function loadJson<T>(key: string | undefined, suffix: string): T | undefined {
  if (!key || typeof localStorage === "undefined") return undefined
  try {
    const raw = localStorage.getItem(`${key}:${suffix}`)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* ignore */
  }
  return undefined
}

function saveJson(key: string | undefined, suffix: string, value: unknown) {
  if (!key || typeof localStorage === "undefined") return
  try {
    localStorage.setItem(`${key}:${suffix}`, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

function DraggableHeader<TRow>({ header }: { header: Header<TRow, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: header.id })

  return (
    <TableHead
      ref={setNodeRef}
      className={cn(
        "relative text-xs font-semibold select-none",
        isDragging && "opacity-50",
      )}
      style={{
        width: header.getSize(),
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? "none" : "transform 200ms ease",
        cursor: "grab",
      }}
      {...attributes}
      {...listeners}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {header.column.getCanResize() && (
        <TableResizeHandle
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          isResizing={header.column.getIsResizing()}
        />
      )}
    </TableHead>
  )
}

export function SpreadsheetTable<TRow>({
  data,
  columns: specs,
  getRowId,
  onRowsChange,
  isRowEditable,
  isCellHighlighted,
  storageKey,
  isLoading,
  emptyMessage = "No rows",
  getRowClassName,
  onFocusRowChange,
}: SpreadsheetTableProps<TRow>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const { commit } = useSpreadsheetHistory({ data, onRowsChange })

  const lastFocusRowRef = useRef<number | null>(null)

  const {
    selection,
    setSelection,
    onCellMouseDown,
    onCellMouseEnter,
    onKeyDown,
  } = useSpreadsheetSelection({
    rowCount: data.length,
    colCount: specs.length,
    containerRef,
    scrollRef,
    repaintDep: data,
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(
    () => loadJson<string[]>(storageKey, "order") ?? [],
  )
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>(
    () => loadJson<Record<string, number>>(storageKey, "sizing") ?? {},
  )

  const specIds = useMemo(() => specs.map((s) => s.id), [specs])

  const validOrder = useMemo(() => {
    const set = new Set(specIds)
    const kept = columnOrder.filter((id) => set.has(id))
    const missing = specIds.filter((id) => !columnOrder.includes(id))
    return [...kept, ...missing]
  }, [columnOrder, specIds])

  const orderedSpecs = useMemo(() => {
    const byId = new Map(specs.map((s) => [s.id, s]))
    const out: SpreadsheetColumn<TRow>[] = []
    for (const id of validOrder) {
      const spec = byId.get(id)
      if (spec) out.push(spec)
    }
    return out
  }, [validOrder, specs])

  const { copy, cut, pasteText } = useSpreadsheetClipboard({
    selection,
    setSelection,
    data,
    columns: orderedSpecs,
    onRowsChange: commit,
    isRowEditable,
  })

  const { onHandleMouseDown } = useSpreadsheetFill({
    selection,
    setSelection,
    data,
    columns: orderedSpecs,
    onRowsChange: commit,
    isRowEditable,
    containerRef,
  })

  const hasSelection = selection !== null

  const overlayRef = useRef<HTMLDivElement>(null)
  const fillHandleRef = useRef<HTMLButtonElement>(null)

  // Imperative style mutation — React never reads these, so re-renders
  // don't clobber them and we avoid the extra commit from setState.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure on data change
  useLayoutEffect(() => {
    const content = contentRef.current
    const overlay = overlayRef.current
    const handle = fillHandleRef.current
    if (!content || !overlay || !handle) return
    if (!selection) {
      overlay.style.display = "none"
      handle.style.display = "none"
      return
    }
    const { rMin, rMax, cMin, cMax } = normalizeRange(selection)
    const tl = content.querySelector<HTMLElement>(
      `[data-cell-row="${rMin}"][data-cell-col="${cMin}"]`,
    )
    const br = content.querySelector<HTMLElement>(
      `[data-cell-row="${rMax}"][data-cell-col="${cMax}"]`,
    )
    if (!tl || !br) {
      overlay.style.display = "none"
      handle.style.display = "none"
      return
    }
    const wrap = content.getBoundingClientRect()
    const tlRect = tl.getBoundingClientRect()
    const brRect = br.getBoundingClientRect()
    const left = tlRect.left - wrap.left
    const top = tlRect.top - wrap.top
    const width = brRect.right - tlRect.left
    const height = brRect.bottom - tlRect.top
    overlay.style.display = "block"
    overlay.style.left = `${left}px`
    overlay.style.top = `${top}px`
    overlay.style.width = `${width}px`
    overlay.style.height = `${height}px`
    handle.style.display = "block"
    handle.style.left = `${left + width - 4}px`
    handle.style.top = `${top + height - 4}px`
  }, [selection, data])

  useEffect(() => {
    if (!onFocusRowChange) return
    const row = selection ? selection.focus.row : -1
    if (row === lastFocusRowRef.current) return
    lastFocusRowRef.current = row
    if (row === -1 || !data[row]) {
      onFocusRowChange(null, -1)
    } else {
      onFocusRowChange(data[row], row)
    }
  }, [selection, data, onFocusRowChange])

  const handleMenuPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) pasteText(text)
    } catch {
      // Read may be blocked; Cmd/Ctrl+V still works via the native paste event.
    }
  }, [pasteText])

  const handleMenuClear = useCallback(() => {
    if (!selection) return
    const range = normalizeRange(selection)
    const { rows, changed } = clearSelection(
      range,
      data,
      orderedSpecs,
      isRowEditable,
    )
    if (changed) commit(rows)
  }, [selection, data, orderedSpecs, commit, isRowEditable])

  const mod =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      ? "⌘"
      : "Ctrl"

  const setCell = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      const spec = specs.find((s) => s.id === columnId)
      if (!spec?.setter) return
      const next = data.slice()
      next[rowIndex] = spec.setter(next[rowIndex], value)
      commit(next)
    },
    [data, specs, commit],
  )

  const columnDefs = useMemo<ColumnDef<TRow>[]>(
    () =>
      specs.map((spec) => ({
        id: spec.id,
        header: spec.header,
        size: spec.size ?? 140,
        minSize: spec.minSize ?? 60,
        accessorFn: (row) => spec.accessor(row),
        cell: ({ row, column }) => {
          const colIdx = column.getIndex()
          const editable =
            spec.type !== "readonly" &&
            Boolean(spec.setter) &&
            (isRowEditable ? isRowEditable(row.original) : true)
          const highlighted = isCellHighlighted
            ? isCellHighlighted(row.original, spec.id)
            : false
          return (
            <SpreadsheetCell
              rowIndex={row.index}
              colIndex={colIdx}
              column={spec}
              value={spec.accessor(row.original)}
              editable={editable}
              highlighted={highlighted}
              renderReadonly={
                spec.render ? () => spec.render?.(row.original) : undefined
              }
              onCommit={(value) => setCell(row.index, spec.id, value)}
            />
          )
        },
      })),
    [specs, isRowEditable, isCellHighlighted, setCell],
  )

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => getRowId(row),
    columnResizeMode: "onChange",
    state: {
      columnOrder: validOrder,
      columnSizing,
    },
    onColumnOrderChange: (updater) => {
      const next = typeof updater === "function" ? updater(validOrder) : updater
      setColumnOrder(next)
      saveJson(storageKey, "order", next)
    },
    onColumnSizingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnSizing) : updater
      setColumnSizing(next)
      saveJson(storageKey, "sizing", next)
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = validOrder.indexOf(String(active.id))
      const newIndex = validOrder.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return
      const next = arrayMove(validOrder, oldIndex, newIndex)
      setColumnOrder(next)
      saveJson(storageKey, "order", next)
    },
    [validOrder, storageKey],
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableContainer
          ref={containerRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="focus-visible:outline-none"
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <TableScrollArea ref={scrollRef}>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: fallback handler catches clicks in the 1px row-border gap that's outside any <td>; real interactivity lives on the cells */}
              <div
                ref={contentRef}
                className="relative"
                style={{ width: table.getTotalSize() }}
                onMouseDown={(e) => {
                  // Fall-through: row borders and sub-pixel gaps aren't
                  // inside a <td>. Resolve to the nearest cell by Y so
                  // clicks in the gap still start a selection.
                  const target = e.target as HTMLElement
                  if (target.closest("td")) return
                  const cells =
                    contentRef.current?.querySelectorAll<HTMLElement>(
                      "[data-cell-row]",
                    )
                  if (!cells) return
                  let best: HTMLElement | null = null
                  let bestDist = Number.POSITIVE_INFINITY
                  for (const c of cells) {
                    const r = c.getBoundingClientRect()
                    if (e.clientX < r.left || e.clientX > r.right) continue
                    const dy = Math.min(
                      Math.abs(e.clientY - r.top),
                      Math.abs(e.clientY - r.bottom),
                    )
                    if (dy < bestDist) {
                      bestDist = dy
                      best = c
                    }
                  }
                  if (!best) return
                  const row = Number(best.getAttribute("data-cell-row"))
                  const col = Number(best.getAttribute("data-cell-col"))
                  if (Number.isFinite(row) && Number.isFinite(col)) {
                    onCellMouseDown(row, col, e)
                  }
                }}
              >
                <Table
                  className="table-fixed"
                  style={{ minWidth: "100%", width: table.getTotalSize() }}
                >
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        <SortableContext
                          items={validOrder}
                          strategy={horizontalListSortingStrategy}
                        >
                          {headerGroup.headers.map((header) => (
                            <DraggableHeader key={header.id} header={header} />
                          ))}
                        </SortableContext>
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeleton columns={columnDefs.length} />
                    ) : data.length === 0 ? (
                      <TableEmpty colSpan={columnDefs.length}>
                        {emptyMessage}
                      </TableEmpty>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className={cn(
                            getRowClassName?.(row.original, row.index),
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const colIdx = cell.column.getIndex()
                            return (
                              <TableCell
                                key={cell.id}
                                style={{ width: cell.column.getSize() }}
                                className="p-0"
                                onMouseDown={(e) =>
                                  onCellMouseDown(row.index, colIdx, e)
                                }
                                onMouseEnter={(e) =>
                                  onCellMouseEnter(row.index, colIdx, e)
                                }
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div
                  ref={overlayRef}
                  className="pointer-events-none absolute z-10 border-2 border-primary"
                  style={{ display: "none" }}
                />
                <button
                  ref={fillHandleRef}
                  type="button"
                  aria-label="Fill handle"
                  onMouseDown={onHandleMouseDown}
                  className="absolute z-20 size-2 rounded-[2px] border border-background bg-primary cursor-crosshair"
                  style={{ display: "none" }}
                />
              </div>
            </TableScrollArea>
          </DndContext>
        </TableContainer>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => cut()} disabled={!hasSelection}>
          Cut
          <ContextMenuShortcut>{mod}+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => copy()} disabled={!hasSelection}>
          Copy
          <ContextMenuShortcut>{mod}+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleMenuPaste} disabled={!hasSelection}>
          Paste
          <ContextMenuShortcut>{mod}+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={handleMenuClear}
          disabled={!hasSelection}
          variant="destructive"
        >
          Clear
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export type { SpreadsheetColumn }

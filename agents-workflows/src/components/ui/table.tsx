import { ArrowDown, ArrowUp } from "@phosphor-icons/react"
import type * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TableContainerProps extends React.ComponentProps<"div"> {
  /**
   * `bordered` (default) renders the standard bordered, rounded card shell.
   * `plain` drops the border + rounded corners for tables nested inside
   * another bordered container (e.g. report widget content panel).
   */
  variant?: "bordered" | "plain"
}

function TableContainer({
  className,
  variant = "bordered",
  ...props
}: TableContainerProps) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        variant === "bordered" && "rounded-lg border border-border",
        className,
      )}
      {...props}
    />
  )
}

function TableScrollArea({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-scroll-area"
      className={cn(
        "min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]",
        className,
      )}
      {...props}
    />
  )
}

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 z-10 [&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

type SortOrder = "ASC" | "DESC" | null

interface TableHeadProps extends React.ComponentProps<"th"> {
  sortable?: boolean
  sortOrder?: SortOrder
  onSortChange?: () => void
  sticky?: "right" | "left"
}

function TableHead({
  className,
  children,
  sortable,
  sortOrder,
  onSortChange,
  sticky,
  onClick,
  ...props
}: TableHeadProps) {
  const handleClick = sortable ? onSortChange : onClick
  return (
    <th
      data-slot="table-head"
      className={cn(
        "relative h-10 bg-muted px-2 text-left align-middle text-xs font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        sortable && "cursor-pointer select-none",
        sticky === "right" && "sticky right-0 border-l border-border",
        sticky === "left" && "sticky left-0 z-20 border-r border-border",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortOrder === "ASC" && <ArrowUp className="size-3" />}
        {sortOrder === "DESC" && <ArrowDown className="size-3" />}
      </div>
    </th>
  )
}

interface TableCellProps extends React.ComponentProps<"td"> {
  sticky?: "right" | "left"
}

function TableCell({ className, sticky, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-[42px] px-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        sticky === "right" &&
          "sticky right-0 overflow-hidden border-l border-border bg-background p-0",
        sticky === "left" &&
          "sticky left-0 z-20 border-r border-border bg-background",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

interface TableSkeletonProps {
  rows?: number
  columns: number
}

function TableSkeleton({ rows = 10, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows are never reordered
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cells
            <TableCell key={`skeleton-cell-${colIndex}`}>
              <Skeleton className="h-4 w-3/4" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

interface TableEmptyProps extends React.ComponentProps<"td"> {
  colSpan: number
}

function TableEmpty({
  className,
  colSpan,
  children,
  ...props
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn("h-24 text-center text-muted-foreground", className)}
        {...props}
      >
        {children}
      </TableCell>
    </TableRow>
  )
}

interface TableResizeHandleProps {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>
  onTouchStart: React.TouchEventHandler<HTMLDivElement>
  isResizing: boolean
}

function TableResizeHandle({
  onMouseDown,
  onTouchStart,
  isResizing,
}: TableResizeHandleProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: resize handle is mouse/touch only by design
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={cn(
        "absolute -right-1 top-0 z-10 h-full w-3 cursor-col-resize touch-none select-none",
        isResizing ? "bg-primary/50" : "hover:bg-primary/30",
      )}
    />
  )
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableResizeHandle,
  TableRow,
  TableScrollArea,
  TableSkeleton,
}

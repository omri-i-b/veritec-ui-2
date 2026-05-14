import { useRef } from "react"

export interface PaginationMetaShape {
  page: number
  take: number
  itemCount: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * Returns the server's pagination meta when available, falling back to
 * a value derived from the user's pagination state plus the last
 * successful meta. Keeps the toolbar showing the requested page (and
 * accurate Next/Previous enablement) during refetch instead of snapping
 * to "page 1, no pages" while data is undefined — which made the first
 * page click look like a no-op and rapid clicks look like a reset.
 */
export function usePaginationMeta<T extends PaginationMetaShape>(
  serverMeta: T | undefined,
  pagination: { page: number; take: number },
): T | PaginationMetaShape {
  const lastMetaRef = useRef<T | null>(null)
  if (serverMeta) lastMetaRef.current = serverMeta
  if (serverMeta) return serverMeta

  const last = lastMetaRef.current
  return {
    page: pagination.page,
    take: pagination.take,
    itemCount: last?.itemCount ?? 0,
    pageCount: last?.pageCount ?? 0,
    hasPreviousPage: pagination.page > 1,
    hasNextPage: last ? pagination.page < last.pageCount : false,
  }
}

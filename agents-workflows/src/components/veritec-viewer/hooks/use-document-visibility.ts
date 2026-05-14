import { useCallback, useEffect, useRef, useState } from "react"
import type { IViewerDocument } from "../veritec-viewer.types"

interface IDocumentVisibilityResult {
  visibleDocIds: Set<string>
  handleRangeChanged: (range: { startIndex: number; endIndex: number }) => void
}

const PRELOAD_BUFFER = 3

export function useDocumentVisibility(
  documents: IViewerDocument[],
  /**
   * Which document index the viewer is mounting at — used to seed the
   * initial visible window so we prioritise pages around the target
   * instead of always fetching the first six. Critical for deep-link
   * citations (e.g. opening a 300-page chart at page 200): without this
   * the browser burns bandwidth on pages 1–6 while the user is waiting
   * on 197–203.
   */
  initialIndex: number = 0,
): IDocumentVisibilityResult {
  const [visibleDocIds, setVisibleDocIds] = useState<Set<string>>(new Set())
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (documents.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      const start = Math.max(0, initialIndex - PRELOAD_BUFFER)
      const end = Math.min(documents.length, initialIndex + PRELOAD_BUFFER + 1)
      setVisibleDocIds(
        new Set(documents.slice(start, end).map((doc) => doc.viewerPageId)),
      )
    }
  }, [documents, initialIndex])

  const handleRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      const startWithBuffer = Math.max(0, range.startIndex - PRELOAD_BUFFER)
      const endWithBuffer = Math.min(
        documents.length - 1,
        range.endIndex + PRELOAD_BUFFER,
      )
      const newIds = documents
        .slice(startWithBuffer, endWithBuffer + 1)
        .map((doc) => doc.viewerPageId)
      setVisibleDocIds(new Set(newIds))
    },
    [documents],
  )

  return { visibleDocIds, handleRangeChanged }
}

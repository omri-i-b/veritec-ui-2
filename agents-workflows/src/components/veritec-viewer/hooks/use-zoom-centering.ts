import { useLayoutEffect, useRef, type RefObject } from "react"
import type { VirtuosoHandle } from "react-virtuoso"
import type { IZoomAnchor, IViewerDocument } from "../veritec-viewer.types"
import { findPageElement } from "../utils/page-element.utils"

const MAX_ELEMENT_SEARCH_ATTEMPTS = 10

function calculateScrollTop(container: HTMLElement, pageElement: HTMLElement, offsetRatio: number): number {
  const pageHeight = pageElement.getBoundingClientRect().height
  const pageOffsetTop = pageElement.offsetTop
  const viewportCenterOffset = container.clientHeight / 2
  const targetScrollTop = pageOffsetTop + pageHeight * offsetRatio - viewportCenterOffset
  const maxScrollTop = container.scrollHeight - container.clientHeight
  return Math.max(0, Math.min(targetScrollTop, maxScrollTop))
}

export function useZoomCentering(
  containerRef: RefObject<HTMLElement | null>,
  virtuosoRef: RefObject<VirtuosoHandle | null>,
  documents: IViewerDocument[],
  zoom: number,
  zoomAnchor: IZoomAnchor | null,
  onZoomComplete?: () => void,
): void {
  const prevZoomRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) { prevZoomRef.current = zoom; return }
    if (prevZoomRef.current === null) { prevZoomRef.current = zoom; return }
    if (prevZoomRef.current === zoom) return
    if (!zoomAnchor) { prevZoomRef.current = zoom; onZoomComplete?.(); return }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const { documentPageId, pageNumber, offsetRatio } = zoomAnchor
    prevZoomRef.current = zoom

    const pageElement = findPageElement(container, documentPageId, pageNumber)
    if (pageElement) {
      container.scrollTop = calculateScrollTop(container, pageElement, offsetRatio)
      onZoomComplete?.()
    } else {
      const docIndex = documents.findIndex((doc) => doc.pageIds?.includes(documentPageId))
      if (docIndex !== -1 && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({ index: docIndex, align: "start", behavior: "auto" })
        let attempts = 0
        const checkElement = (): void => {
          attempts++
          const el = findPageElement(container, documentPageId, pageNumber)
          if (el) {
            container.scrollTop = calculateScrollTop(container, el, offsetRatio)
            onZoomComplete?.()
          } else if (attempts < MAX_ELEMENT_SEARCH_ATTEMPTS) {
            rafRef.current = requestAnimationFrame(checkElement)
          } else {
            onZoomComplete?.()
          }
        }
        rafRef.current = requestAnimationFrame(checkElement)
      } else {
        onZoomComplete?.()
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [zoom, zoomAnchor, containerRef, virtuosoRef, documents, onZoomComplete])
}

import React, { memo, useEffect, useRef, useState, useCallback } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { PdfPage } from "./pdf-page"
import { useViewerActions, useZoom, useRotations, useContainerDimensionsSelector } from "../context/veritec-viewer-context"
import type { IRendererProps } from "../veritec-viewer.types"
import { PdfCacheService } from "@/lib/services/pdf-cache.service"
import { getRenderScale, calculateBaseFitScale, DEFAULT_PAGE_DIMENSIONS } from "../utils/scale.utils"
import { PageDimensionCache } from "@/lib/services/page-dimension-cache.service"

const ZOOM_RERENDER_DELAY_MS = 400
const PAGE_MOUNT_BUFFER = 20
const SENTINEL_INTERVAL = 5

interface IPdfRenderState {
  isLoading: boolean
  numPages: number
  error: string | null
}

const PageSpacer: React.FC<{
  docKey: string
  pageNumber: number
  documentPageId?: number
  zoom: number
}> = memo(function PageSpacer({ docKey, pageNumber, documentPageId, zoom }) {
  const containerDimensions = useContainerDimensionsSelector()
  const cached = documentPageId ? PageDimensionCache.get(docKey, documentPageId) : undefined
  const baseWidth = cached?.width ?? DEFAULT_PAGE_DIMENSIONS.WIDTH
  const baseHeight = cached?.height ?? DEFAULT_PAGE_DIMENSIONS.HEIGHT
  const fitScale = calculateBaseFitScale(baseWidth, baseHeight, {
    containerDimensions: containerDimensions ?? undefined,
  })
  const visualWidth = baseWidth * fitScale * zoom
  const visualHeight = baseHeight * fitScale * zoom
  return (
    <div
      data-page-number={pageNumber}
      data-document-page-id={documentPageId}
      data-spacer="true"
      style={{ width: visualWidth, height: visualHeight, position: "relative", flexShrink: 0 }}
    />
  )
})

const PagePlaceholder: React.FC<{
  docKey: string
  pageNumber: number
  documentPageId?: number
  zoom: number
}> = memo(function PagePlaceholder({ docKey, pageNumber, documentPageId, zoom }) {
  const containerDimensions = useContainerDimensionsSelector()
  const cached = documentPageId ? PageDimensionCache.get(docKey, documentPageId) : undefined
  const baseWidth = cached?.width ?? DEFAULT_PAGE_DIMENSIONS.WIDTH
  const baseHeight = cached?.height ?? DEFAULT_PAGE_DIMENSIONS.HEIGHT
  const fitScale = calculateBaseFitScale(baseWidth, baseHeight, {
    containerDimensions: containerDimensions ?? undefined,
  })
  const visualWidth = baseWidth * fitScale * zoom
  const visualHeight = baseHeight * fitScale * zoom
  return (
    <div
      data-page-number={pageNumber}
      data-document-page-id={documentPageId}
      data-placeholder="true"
      className="relative flex items-center justify-center bg-background shadow-md mb-2 mt-1"
      style={{ width: visualWidth, height: visualHeight }}
    >
      <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  )
})

export const PdfRenderer: React.FC<IRendererProps> = memo(function PdfRenderer({ document, onProgress }) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [renderState, setRenderState] = useState<IPdfRenderState>({
    isLoading: true,
    numPages: 0,
    error: null,
  })

  const { setDocumentProgress, setDocumentLoaded, setDocumentError } = useViewerActions()
  const zoom = useZoom()
  const rotations = useRotations()
  const pageCount = renderState.isLoading ? 1 : renderState.numPages

  const [renderScale, setRenderScale] = useState(() => getRenderScale(zoom))
  const renderScaleRef = useRef(renderScale)
  renderScaleRef.current = renderScale

  useEffect(() => {
    const newScale = getRenderScale(zoom)
    if (newScale <= renderScaleRef.current) {
      setRenderScale(newScale)
      return
    }
    const timer = setTimeout(() => setRenderScale(newScale), ZOOM_RERENDER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [zoom])

  const [visibleCenterIdx, setVisibleCenterIdx] = useState(0)
  const sentinelRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRefCallback = useCallback(
    (pageIndex: number) => (el: HTMLDivElement | null) => {
      if (el) {
        sentinelRefs.current.set(pageIndex, el)
        observerRef.current?.observe(el)
      } else {
        const prev = sentinelRefs.current.get(pageIndex)
        if (prev) observerRef.current?.unobserve(prev)
        sentinelRefs.current.delete(pageIndex)
      }
    },
    [],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1
        let bestRatio = -1
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio
            const idx = Number(entry.target.getAttribute("data-sentinel-idx"))
            if (!isNaN(idx)) bestIdx = idx
          }
        }
        if (bestIdx >= 0) setVisibleCenterIdx(bestIdx)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "200px" },
    )
    observerRef.current = observer
    for (const el of sentinelRefs.current.values()) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const mountStart = Math.max(0, visibleCenterIdx - PAGE_MOUNT_BUFFER)
  const mountEnd = Math.min(pageCount - 1, visibleCenterIdx + PAGE_MOUNT_BUFFER)

  useEffect(() => {
    let cancelled = false
    const handleProgress = (percent: number): void => {
      if (cancelled) return
      onProgress?.(percent)
      setDocumentProgress(document.viewerPageId, percent)
    }
    PdfCacheService.getDocument(
      document.url,
      handleProgress,
      document.withCredentials,
    )
      .then((pdf) => {
        if (cancelled) return
        setPdfDoc(pdf)
        setRenderState((prev) => ({ ...prev, isLoading: false, numPages: pdf.numPages }))
        setDocumentLoaded(document.viewerPageId, pdf.numPages)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        if ((error as Error).name === "AbortError") return
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setRenderState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
        setDocumentError(document.viewerPageId, errorMessage)
      })
    return (): void => {
      cancelled = true
      PdfCacheService.releaseDocument(document.url)
    }
  }, [document.url, document.viewerPageId, onProgress, setDocumentProgress, setDocumentLoaded, setDocumentError])

  return renderState.error ? (
    <div className="p-4 text-destructive">
      <p>Error loading PDF: {renderState.error}</p>
    </div>
  ) : (
    <div className="flex w-full flex-col items-center">
      {Array.from({ length: pageCount }, (_, i) => {
        const pageNumber = i + 1
        const documentPageId = document.pageIds?.[i] ?? pageNumber
        const isSentinel = i % SENTINEL_INTERVAL === 0
        const docKey = document.viewerPageId

        if (renderState.isLoading) {
          return <PagePlaceholder key={`placeholder-${documentPageId}-${pageNumber}`} docKey={docKey} pageNumber={pageNumber} documentPageId={documentPageId} zoom={zoom} />
        }

        const isInMountWindow = i >= mountStart && i <= mountEnd
        if (!isInMountWindow) {
          return (
            <React.Fragment key={`${documentPageId}-page-${pageNumber}`}>
              {isSentinel && <div ref={sentinelRefCallback(i)} data-sentinel-idx={i} style={{ height: 0, width: 0 }} />}
              <PageSpacer docKey={docKey} pageNumber={pageNumber} documentPageId={documentPageId} zoom={zoom} />
            </React.Fragment>
          )
        }

        return (
          <React.Fragment key={`${documentPageId}-page-${pageNumber}`}>
            {isSentinel && <div ref={sentinelRefCallback(i)} data-sentinel-idx={i} style={{ height: 0, width: 0 }} />}
            <PdfPage
              pdfDoc={pdfDoc!}
              docKey={docKey}
              pageNumber={pageNumber}
              documentPageId={documentPageId!}
              zoom={zoom}
              renderScale={renderScale}
              rotation={rotations.get(documentPageId!) ?? 0}
            />
          </React.Fragment>
        )
      })}
    </div>
  )
})

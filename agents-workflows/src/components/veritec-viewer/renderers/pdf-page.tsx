import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist"
import type React from "react"
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { PageDimensionCache } from "@/lib/services/page-dimension-cache.service"
import { PageRenderCacheService } from "@/lib/services/page-render-cache.service"
import { useOptionalTextSelection } from "../context/text-selection-context"
import { useContainerDimensionsSelector } from "../context/veritec-viewer-context"
import { pdfRenderQueue } from "../utils/render-queue.utils"
import { calculateBaseFitScale, getRenderScale } from "../utils/scale.utils"
import { OcrTextLayer } from "./ocr-text-layer"

const DEFAULT_RENDER_SCALE = getRenderScale()

interface IPdfPageProps {
  pdfDoc: PDFDocumentProxy
  docKey: string
  pageNumber: number
  documentPageId: number
  zoom?: number
  renderScale?: number
  rotation?: 0 | 90 | 180 | 270
}

export const PdfPage: React.FC<IPdfPageProps> = memo(function PdfPage({
  pdfDoc,
  docKey,
  pageNumber,
  documentPageId,
  zoom = 1,
  renderScale = DEFAULT_RENDER_SCALE,
  rotation = 0,
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)
  const lastRotationRef = useRef<number>(rotation)
  const lastRenderedScaleRef = useRef<number>(renderScale)
  const containerDimensions = useContainerDimensionsSelector()
  const textSelection = useOptionalTextSelection()
  const ocrPage = textSelection?.getOcrPage(documentPageId)

  const [isVisible, setIsVisible] = useState(false)
  const [isRendered, setIsRendered] = useState(false)
  const [pageSize, setPageSize] = useState(
    () =>
      PageDimensionCache.get(docKey, documentPageId) ?? {
        width: 595,
        height: 842,
      },
  )

  const isRotated90or270 = rotation === 90 || rotation === 270
  const effectiveWidth = isRotated90or270 ? pageSize.height : pageSize.width
  const effectiveHeight = isRotated90or270 ? pageSize.width : pageSize.height

  const fitScale = useMemo(
    () =>
      calculateBaseFitScale(effectiveWidth, effectiveHeight, {
        containerDimensions: containerDimensions ?? undefined,
      }),
    [effectiveWidth, effectiveHeight, containerDimensions],
  )

  const visualWidth = effectiveWidth * fitScale * zoom
  const visualHeight = effectiveHeight * fitScale * zoom
  const queueKey = `page-${documentPageId}-${rotation}`

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1, rootMargin: "200px" },
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return

    const rotationChanged = lastRotationRef.current !== rotation
    if (rotationChanged) {
      lastRotationRef.current = rotation
      setIsRendered(false)
    }

    const scaleChanged = lastRenderedScaleRef.current !== renderScale
    if (isRendered && !rotationChanged && !scaleChanged) return

    // Concurrency: pdfRenderQueue dedupes by key; the cleanup below
    // cancels any in-flight pdf.js task before a new one enqueues.
    renderTaskRef.current?.cancel()

    if (!scaleChanged) {
      const cached = PageRenderCacheService.get(
        docKey,
        documentPageId,
        rotation,
      )
      if (cached) {
        setPageSize({
          width: cached.pageSize.width,
          height: cached.pageSize.height,
        })
        PageRenderCacheService.restore(cached, canvasRef.current!)
        setIsRendered(true)
        return
      }
    }

    let cancelled = false

    pdfRenderQueue
      .enqueue(queueKey, pageNumber, async () => {
        if (cancelled) return
        try {
          const page = await pdfDoc.getPage(pageNumber)
          if (cancelled) return

          const baseViewport = page.getViewport({ scale: 1.0 })
          const { width, height } = baseViewport
          PageDimensionCache.set(docKey, documentPageId, { width, height })
          setPageSize({ width, height })

          const renderFitScale = calculateBaseFitScale(width, height, {
            containerDimensions: containerDimensions ?? undefined,
          })

          const intrinsicRotation = page.rotate ?? 0
          const combinedRotation = (intrinsicRotation + rotation) % 360

          const viewport = page.getViewport({
            scale: renderFitScale * renderScale,
            rotation: combinedRotation,
          })
          const canvas = canvasRef.current!
          if (!canvas) return
          const dpr = window.devicePixelRatio || 1

          canvas.width = viewport.width * dpr
          canvas.height = viewport.height * dpr

          const ctx = canvas.getContext("2d")!
          ctx.scale(dpr, dpr)

          const renderTask = page.render({
            canvas,
            canvasContext: ctx,
            viewport,
          })
          renderTaskRef.current = renderTask

          await renderTask.promise
          if (!cancelled) {
            setIsRendered(true)
            lastRenderedScaleRef.current = renderScale
            PageRenderCacheService.save(
              docKey,
              documentPageId,
              rotation,
              canvas,
              {
                width,
                height,
                fitScale: renderFitScale,
              },
            )
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.name === "RenderingCancelledException"
          )
            return
          if (cancelled) return
          console.error(`Error rendering page ${pageNumber}:`, err)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      pdfRenderQueue.cancel(queueKey)
      renderTaskRef.current?.cancel()
    }
  }, [
    isVisible,
    pdfDoc,
    docKey,
    pageNumber,
    rotation,
    documentPageId,
    queueKey,
    renderScale,
  ])

  return (
    <div
      ref={containerRef}
      data-page-number={pageNumber}
      data-document-page-id={documentPageId}
      data-pdf-width={pageSize.width}
      data-pdf-height={pageSize.height}
      data-rotation={rotation}
      className="relative mb-2 mt-1 max-w-full bg-background shadow-md"
      style={{ width: visualWidth, height: visualHeight }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: visualWidth, height: visualHeight }}
      />
      {isRendered && ocrPage && (
        <OcrTextLayer
          ocrPage={ocrPage}
          documentPageId={documentPageId}
          visualWidth={visualWidth}
          visualHeight={visualHeight}
          rotation={rotation}
        />
      )}
      {isRendered &&
        textSelection &&
        !ocrPage &&
        textSelection.hasOcrUrl(documentPageId) && (
          <div className="pointer-events-none absolute right-1 bottom-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] text-muted-foreground shadow-sm">
            OCR loading…
          </div>
        )}
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
    </div>
  )
})

import { useEffect, useRef, useState } from "react"
import { PdfCacheService } from "@/lib/services/pdf-cache.service"

interface UsePdfThumbnailOptions {
  url: string
  pageNumber: number
  width: number
  withCredentials?: boolean
}

export function usePdfThumbnail({
  url,
  pageNumber,
  width,
  withCredentials,
}: UsePdfThumbnailOptions) {
  const containerRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isRendered, setIsRendered] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Visibility tracking — flips both ways so off-screen thumbnails
  // release their PDF refcount and become eligible for cache eviction.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? false)
      },
      { rootMargin: "200px" },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Render when visible
  useEffect(() => {
    if (!isVisible || !canvasRef.current || !url) return

    let cancelled = false

    const render = async () => {
      try {
        const pdfDoc = await PdfCacheService.getDocument(
          url,
          undefined,
          withCredentials,
        )
        if (cancelled) return

        const page = await pdfDoc.getPage(pageNumber)
        if (cancelled) return

        const baseViewport = page.getViewport({ scale: 1.0 })
        const scale = width / baseViewport.width
        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current
        if (!canvas || cancelled) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = viewport.width * dpr
        canvas.height = viewport.height * dpr
        setDimensions({ width: viewport.width, height: viewport.height })

        const ctx = canvas.getContext("2d")!
        ctx.scale(dpr, dpr)

        await page.render({ canvas, canvasContext: ctx, viewport }).promise
        if (!cancelled) setIsRendered(true)
      } catch {
        // Silently fail for thumbnails
      }
    }

    render()

    return () => {
      cancelled = true
      PdfCacheService.releaseDocument(url)
    }
  }, [isVisible, url, pageNumber, width])

  return { containerRef, canvasRef, isRendered, dimensions }
}

import type { PDFDocumentProxy } from "pdfjs-dist"
import * as pdfjsLib from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// pdfjs v5 ships JPEG 2000 / JBIG2 / standard-font / CMap / ICC assets
// separately. The worker fetches them at runtime by concatenating a
// directory base + an unhashed filename (e.g. `${WASM_URL}openjpeg.wasm`).
// Vite's `?url` imports hash filenames in production, which makes the
// worker request a non-existent path and fall back to the SPA's
// index.html — which Chrome then refuses to instantiate as WASM,
// leaving every page blank.
//
// `vite.config.ts` mirrors `node_modules/pdfjs-dist/{wasm, standard_fonts,
// cmaps, iccs}` to `dist/pdfjs/...` (and serves them in dev), so the
// unhashed paths the worker constructs always resolve.
const WASM_URL = "/pdfjs/wasm/"
const STANDARD_FONT_DATA_URL = "/pdfjs/standard_fonts/"
const CMAP_URL = "/pdfjs/cmaps/"
const ICC_URL = "/pdfjs/iccs/"

const MAX_PDF_CACHE_SIZE = 100

type ProgressCallback = (progress: number) => void

export interface IPdfOutlineItem {
  title: string
  pageNumber: number
  children?: IPdfOutlineItem[]
}

export interface IPdfOutline {
  items: IPdfOutlineItem[]
  hasOutline: boolean
}

interface ICacheEntry {
  promise: Promise<PDFDocumentProxy>
  loadingTask: pdfjsLib.PDFDocumentLoadingTask
  refCount: number
  lastAccessed: number
  progressCallbacks: ProgressCallback[]
  outline?: IPdfOutline
  outlinePromise?: Promise<IPdfOutline>
}

class PdfCacheServiceImpl {
  private cache = new Map<string, ICacheEntry>()
  private maxSize = MAX_PDF_CACHE_SIZE

  getDocument(
    url: string,
    onProgress?: ProgressCallback,
    withCredentials = false,
  ): Promise<PDFDocumentProxy> {
    const existing = this.cache.get(url)
    if (existing) {
      existing.refCount++
      existing.lastAccessed = Date.now()
      if (onProgress) existing.progressCallbacks.push(onProgress)
      return existing.promise
    }
    this.evictIfNeeded()
    // When the URL is proxied through our backend (withCredentials), force
    // pdf.js to download the file in one go. The backend streams through
    // Azure + Container Apps' HTTP/2 ingress, which intermittently aborts
    // concurrent range requests with ERR_HTTP2_PROTOCOL_ERROR; a single
    // full download avoids that failure mode entirely.
    const loadingTask = pdfjsLib.getDocument({
      url,
      withCredentials,
      disableRange: withCredentials,
      disableStream: withCredentials,
      wasmUrl: WASM_URL,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
      cMapUrl: CMAP_URL,
      cMapPacked: true,
      iccUrl: ICC_URL,
    })
    const progressCallbacks: ProgressCallback[] = []
    if (onProgress) progressCallbacks.push(onProgress)
    loadingTask.onProgress = ({
      loaded,
      total,
    }: {
      loaded: number
      total: number
    }): void => {
      if (total > 0) {
        const percent = Math.round((loaded / total) * 100)
        progressCallbacks.forEach((cb) => cb(percent))
      }
    }
    const entry: ICacheEntry = {
      promise: loadingTask.promise,
      loadingTask,
      refCount: 1,
      lastAccessed: Date.now(),
      progressCallbacks,
    }
    this.cache.set(url, entry)
    return entry.promise
  }

  private evictIfNeeded(): void {
    if (this.cache.size < this.maxSize) return
    let oldest: { url: string; time: number } | null = null
    for (const [url, entry] of this.cache) {
      if (entry.refCount === 0) {
        if (!oldest || entry.lastAccessed < oldest.time) {
          oldest = { url, time: entry.lastAccessed }
        }
      }
    }
    if (oldest) {
      const entry = this.cache.get(oldest.url)
      if (entry) {
        entry.promise.then((doc) => doc.destroy()).catch(() => {})
        entry.loadingTask.destroy().catch(() => {})
        this.cache.delete(oldest.url)
      }
    }
  }

  /**
   * Extract the PDF's built-in outline (table of contents). Cached per
   * document; the document must already be loaded via `getDocument`.
   */
  async getOutline(url: string): Promise<IPdfOutline> {
    const entry = this.cache.get(url)
    if (!entry) {
      throw new Error("Document not loaded. Call getDocument first.")
    }
    if (entry.outline !== undefined) return entry.outline
    if (entry.outlinePromise) return entry.outlinePromise

    entry.outlinePromise = this.extractOutline(entry.promise)
    try {
      const outline = await entry.outlinePromise
      entry.outline = outline
      return outline
    } finally {
      entry.outlinePromise = undefined
    }
  }

  private async extractOutline(
    docPromise: Promise<PDFDocumentProxy>,
  ): Promise<IPdfOutline> {
    const pdfDoc = await docPromise
    const rawOutline = await pdfDoc.getOutline()
    if (!rawOutline || rawOutline.length === 0) {
      return { items: [], hasOutline: false }
    }
    const items = await this.transformOutlineItems(pdfDoc, rawOutline)
    return { items, hasOutline: true }
  }

  private async transformOutlineItems(
    pdfDoc: PDFDocumentProxy,
    items: unknown[],
  ): Promise<IPdfOutlineItem[]> {
    const result: IPdfOutlineItem[] = []
    for (const raw of items) {
      const item = raw as {
        title?: string
        dest?: unknown
        items?: unknown[]
      }
      let pageNumber = 1
      if (item.dest) {
        try {
          const dest =
            typeof item.dest === "string"
              ? await pdfDoc.getDestination(item.dest)
              : (item.dest as unknown[] | null)
          if (dest && Array.isArray(dest) && dest[0]) {
            const pageIndex = await pdfDoc.getPageIndex(
              dest[0] as Parameters<typeof pdfDoc.getPageIndex>[0],
            )
            pageNumber = pageIndex + 1
          }
        } catch (e) {
          console.warn("Could not resolve outline destination:", e)
        }
      }
      result.push({
        title: item.title || "Untitled",
        pageNumber,
        children: item.items?.length
          ? await this.transformOutlineItems(pdfDoc, item.items)
          : undefined,
      })
    }
    return result
  }

  releaseDocument(url: string): void {
    const entry = this.cache.get(url)
    if (!entry) return
    entry.refCount = Math.max(0, entry.refCount - 1)
  }

  hasDocument(url: string): boolean {
    return this.cache.has(url)
  }

  clearAll(): void {
    this.cache.forEach((entry) => {
      entry.promise.then((doc) => doc.destroy()).catch(() => {})
      entry.loadingTask.destroy().catch(() => {})
    })
    this.cache.clear()
  }
}

export const PdfCacheService = new PdfCacheServiceImpl()

import type { RefObject } from "react"
import type { VirtuosoHandle } from "react-virtuoso"
import type { IPluginContext, IViewerPlugin } from "./types"
import type {
  IViewerDocument,
  IDocumentState,
  IScrollToPageOptions,
} from "../veritec-viewer.types"

export interface INavigationPluginOptions {
  documents: IViewerDocument[]
  virtuosoRef: RefObject<VirtuosoHandle | null>
  containerRef: RefObject<HTMLElement | null>
  documentStatesRef: RefObject<Map<string, IDocumentState>>
  onStabilizationChange?: (isStabilizing: boolean) => void
}

export interface INavigationPlugin extends IViewerPlugin {
  scrollToPage: (
    documentPageId: number,
    page: number,
    options?: IScrollToPageOptions,
  ) => Promise<void>
  stopStabilization: () => void
}

export function createNavigationPlugin(options: INavigationPluginOptions): INavigationPlugin {
  const { documents, virtuosoRef, containerRef, documentStatesRef, onStabilizationChange } = options

  let ctx: IPluginContext | null = null
  let stabilizationCleanup: (() => void) | null = null
  let stabilizationSelector: string | null = null

  const scrollToPage = async (
    documentPageId: number,
    pageNumber: number,
    scrollOptions: IScrollToPageOptions = {},
  ): Promise<void> => {
    if (!virtuosoRef.current || !containerRef.current?.querySelector("[data-viewer-page-id]")) {
      await new Promise<void>((resolve) => {
        const checkReady = (): void => {
          const hasItems = containerRef.current?.querySelector("[data-viewer-page-id]")
          if (virtuosoRef.current && hasItems) {
            resolve()
          } else {
            requestAnimationFrame(checkReady)
          }
        }
        requestAnimationFrame(checkReady)
      })
    }

    const { stabilize: enableStabilization = false } = scrollOptions
    const container = containerRef.current
    const selector = `[data-document-page-id="${documentPageId}"][data-page-number="${pageNumber}"]`

    if (stabilizationCleanup) {
      stabilizationCleanup()
      stabilizationCleanup = null
    }

    let docIndex = documents.findIndex((doc) => doc.pageIds?.includes(documentPageId))
    if (docIndex === -1) {
      docIndex = documents.findIndex((doc) =>
        doc.pageIds?.some((id) => String(id) === String(documentPageId)),
      )
    }
    // Single document without pageIds — default to first document
    if (docIndex === -1 && documents.length === 1) {
      docIndex = 0
    }
    if (docIndex === -1) return

    if (!container) return

    const scrollToElement = (): Element | null => {
      const pageElement = container.querySelector(selector)
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "auto", block: "start" })
        return pageElement
      }
      return null
    }

    let targetElement = scrollToElement()

    if (!targetElement && documents.length > 1) {
      if (virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({ index: docIndex, align: "start", behavior: "auto" })
        targetElement = scrollToElement()
      }
    }

    if (!targetElement) {
      targetElement = await new Promise<Element | null>((resolve) => {
        const poll = setInterval(() => {
          const el = scrollToElement()
          if (el) {
            clearInterval(poll)
            resolve(el)
            return
          }
          const targetDoc = documents.find((doc) => doc.pageIds?.includes(documentPageId))
          if (targetDoc) {
            const docState = documentStatesRef.current?.get(targetDoc.viewerPageId)
            if (docState?.loadState === "error") {
              clearInterval(poll)
              resolve(null)
            }
          }
        }, 100)
      })
    }

    if (targetElement && enableStabilization) {
      stabilizationSelector = selector
      onStabilizationChange?.(true)

      let active = true
      let rafId: number | null = null
      let frameCount = 0
      let settled = false
      let idleAfterSettle = 0
      const GRACE_FRAMES = 60

      const SCROLL_KEYS = new Set([
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
        "PageUp", "PageDown", "Home", "End", " ",
      ])

      const areNearbyDocsSettled = (): boolean => {
        const states = documentStatesRef.current
        if (!states) return false
        for (const [, docState] of states) {
          if (docState.loadState === "loading") return false
        }
        return true
      }

      const reanchor = (): void => {
        if (!active || !stabilizationSelector) return
        frameCount++
        if (ctx?.getState("zooming")) { stop(); return }
        const el = container.querySelector(stabilizationSelector)
        if (!el) { stop(); return }
        const drift = el.getBoundingClientRect().top - container.getBoundingClientRect().top
        if (Math.abs(drift) > 2) {
          container.scrollTop += drift
          idleAfterSettle = 0
        }
        if (frameCount % 30 === 0) settled = areNearbyDocsSettled()
        if (settled && Math.abs(drift) <= 2) {
          idleAfterSettle++
          if (idleAfterSettle >= GRACE_FRAMES) { stop(); return }
        }
        rafId = requestAnimationFrame(reanchor)
      }

      const stop = (): void => {
        if (!active) return
        active = false
        if (rafId !== null) cancelAnimationFrame(rafId)
        container.removeEventListener("wheel", stop)
        container.removeEventListener("touchstart", stop)
        document.removeEventListener("keydown", handleKeydown)
        stabilizationCleanup = null
        stabilizationSelector = null
        onStabilizationChange?.(false)
      }

      const handleKeydown = (e: KeyboardEvent): void => {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return
        if (SCROLL_KEYS.has(e.key)) stop()
      }

      stabilizationCleanup = stop
      container.addEventListener("wheel", stop, { once: true, passive: true })
      container.addEventListener("touchstart", stop, { once: true, passive: true })
      document.addEventListener("keydown", handleKeydown)
      rafId = requestAnimationFrame(reanchor)
    }
  }

  const stopStabilization = (): void => {
    if (stabilizationCleanup) {
      stabilizationCleanup()
      stabilizationCleanup = null
    }
  }

  return {
    name: "navigation",
    onMount(context: IPluginContext) {
      ctx = context
      ctx.setState("navigation", {
        scrollToPage: (docPageId: number, page: number) =>
          scrollToPage(docPageId, page, { stabilize: false }),
      })
      return () => {
        stopStabilization()
        ctx?.setState("navigation", null)
        ctx = null
      }
    },
    scrollToPage,
    stopStabilization,
  }
}

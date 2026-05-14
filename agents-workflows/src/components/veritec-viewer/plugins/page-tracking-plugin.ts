import type { IViewerPlugin, IPluginContext } from "./types"
import type { IPageInfo } from "../veritec-viewer.types"
import { PAGE_DATA_ATTRIBUTES, PAGE_ELEMENT_SELECTOR } from "../utils/page-element.utils"

export type { IPageInfo }

export interface IPageTrackingPluginOptions {
  onPageChange?: (pageInfo: IPageInfo) => void
}

export interface IPageTrackingPlugin extends IViewerPlugin {
  getCurrentPage: () => IPageInfo | null
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }) as T
}

const OBSERVER_SETUP_DEBOUNCE_MS = 100

export function createPageTrackingPlugin(options: IPageTrackingPluginOptions = {}): IPageTrackingPlugin {
  const { onPageChange } = options

  let ctx: IPluginContext | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null
  let lastReportedKey = ""
  let currentPageInfo: IPageInfo | null = null

  const updatePage = (pageInfo: IPageInfo): void => {
    currentPageInfo = pageInfo
    ctx?.setState("currentPage", pageInfo)
    onPageChange?.(pageInfo)
  }

  const setupIntersectionObserver = (): void => {
    if (!ctx) return
    intersectionObserver?.disconnect()
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (ctx?.getState("zooming")) return
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const documentPageIdStr = entry.target.getAttribute(PAGE_DATA_ATTRIBUTES.DOCUMENT_PAGE_ID)
            const page = parseInt(entry.target.getAttribute(PAGE_DATA_ATTRIBUTES.PAGE_NUMBER) || "1", 10)
            if (documentPageIdStr) {
              const documentPageId = parseInt(documentPageIdStr, 10)
              const key = `${documentPageId}-${page}`
              if (key !== lastReportedKey) {
                lastReportedKey = key
                updatePage({ documentPageId, page })
              }
            }
            break
          }
        }
      },
      { root: ctx.container, threshold: 0.5 },
    )
    const pages = ctx.container.querySelectorAll(PAGE_ELEMENT_SELECTOR)
    pages.forEach((page) => intersectionObserver?.observe(page))
  }

  const debouncedSetupObserver = debounce(setupIntersectionObserver, OBSERVER_SETUP_DEBOUNCE_MS)

  return {
    name: "pageTracking",
    onMount(context: IPluginContext) {
      ctx = context
      debouncedSetupObserver()
      mutationObserver = new MutationObserver(() => { debouncedSetupObserver() })
      mutationObserver.observe(ctx.container, { childList: true, subtree: true })
      return () => {
        intersectionObserver?.disconnect()
        mutationObserver?.disconnect()
        intersectionObserver = null
        mutationObserver = null
        ctx = null
        lastReportedKey = ""
        currentPageInfo = null
      }
    },
    getCurrentPage(): IPageInfo | null { return currentPageInfo },
  }
}

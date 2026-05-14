import type { IViewerPlugin, IPluginContext } from "./types"
import { ZOOM_CONSTANTS } from "../constants"
import { findPageElement } from "../utils/page-element.utils"

export interface IZoomPluginOptions {
  initial?: number
  min?: number
  max?: number
  step?: number
  onChange?: (zoom: number) => void
}

export interface IZoomPlugin extends IViewerPlugin {
  set: (zoom: number) => void
  get: () => number
}

function throttle<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let lastCall = 0
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= ms) {
      lastCall = now
      fn(...args)
    }
  }) as T
}

const ZOOM_THROTTLE_MS = 16

export function createZoomPlugin(options: IZoomPluginOptions = {}): IZoomPlugin {
  const {
    initial = 1,
    min = ZOOM_CONSTANTS.MIN_ZOOM,
    max = ZOOM_CONSTANTS.MAX_ZOOM,
    step = ZOOM_CONSTANTS.ZOOM_STEP_WHEEL,
    onChange,
  } = options

  let ctx: IPluginContext | null = null
  let current = initial
  let wheelHandler: ((e: WheelEvent) => void) | null = null

  const clamp = (zoom: number): number => Math.min(max, Math.max(min, zoom))

  const update = (newZoom: number, notify = true): void => {
    const clamped = clamp(newZoom)
    if (clamped !== current) {
      const container = ctx?.container
      const currentPage = ctx?.getState("currentPage")

      if (container && currentPage) {
        const pageElement = findPageElement(container, currentPage.documentPageId, currentPage.page)
        if (pageElement) {
          const containerRect = container.getBoundingClientRect()
          const pageRect = pageElement.getBoundingClientRect()
          const viewportCenterY = containerRect.top + containerRect.height / 2
          const offsetFromPageTop = viewportCenterY - pageRect.top
          const offsetRatio = Math.max(0, Math.min(1, offsetFromPageTop / pageRect.height))
          ctx?.setState("zoomAnchor", {
            documentPageId: currentPage.documentPageId,
            pageNumber: currentPage.page,
            offsetRatio,
            oldZoom: current,
          })
        } else {
          ctx?.setState("zoomAnchor", {
            documentPageId: currentPage.documentPageId,
            pageNumber: currentPage.page,
            offsetRatio: 0.5,
            oldZoom: current,
          })
        }
      }

      ctx?.setState("zooming", true)
      current = clamped
      ctx?.setState("zoom", current)
      if (notify) onChange?.(current)
    }
  }

  const throttledWheelUpdate = throttle((delta: number) => {
    update(current + delta)
  }, ZOOM_THROTTLE_MS)

  return {
    name: "zoom",
    onMount(context: IPluginContext) {
      ctx = context
      ctx.setState("zoom", current)
      wheelHandler = (e: WheelEvent): void => {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          const delta = e.deltaY > 0 ? -step : step
          throttledWheelUpdate(delta)
        }
      }
      context.container.addEventListener("wheel", wheelHandler, { passive: false })
      return () => {
        if (wheelHandler) context.container.removeEventListener("wheel", wheelHandler)
        wheelHandler = null
        ctx = null
      }
    },
    set(zoom: number): void { update(zoom, false) },
    get(): number { return current },
  }
}

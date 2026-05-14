import { useEffect, useRef, useMemo } from "react"
import type { IContainerDimensions, PluginStateKey, IPluginState } from "../veritec-viewer.types"

interface IUseContainerDimensionsOptions {
  containerRef: React.RefObject<HTMLElement | null>
  setState: <K extends PluginStateKey>(key: K, value: IPluginState[K]) => void
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T & { cancel: () => void; flush: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: unknown[] | null = null
  const debounced = (...args: unknown[]) => {
    lastArgs = args
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => { fn(...args); lastArgs = null }, ms)
  }
  debounced.cancel = () => { if (timeoutId) clearTimeout(timeoutId); timeoutId = null; lastArgs = null }
  debounced.flush = () => { if (timeoutId && lastArgs) { clearTimeout(timeoutId); timeoutId = null; fn(...lastArgs); lastArgs = null } }
  return debounced as T & { cancel: () => void; flush: () => void }
}

export function useContainerDimensions({ containerRef, setState }: IUseContainerDimensionsOptions): void {
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const updateDimensions = useMemo(
    () =>
      debounce((): void => {
        const container = containerRef.current
        if (!container) return
        // Use offsetWidth/offsetHeight (border-box) instead of
        // clientWidth/clientHeight here. clientHeight shrinks by ~15px
        // when an inner horizontal scrollbar appears, which then makes
        // fitScale recompute smaller, which shrinks the page enough to
        // hide the scrollbar — and the cycle repeats. The user sees
        // this as a continuous flicker at high zoom levels (e.g. 300%)
        // when the right pane is wide enough that pages overflow
        // horizontally. The border-box dimensions are stable across
        // inner-scrollbar appearance, so fitScale stays put.
        const dimensions: IContainerDimensions = {
          width: container.offsetWidth,
          height: container.offsetHeight,
        }
        setState("containerDimensions", dimensions)
      }, 50),
    [containerRef, setState],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    updateDimensions()
    updateDimensions.flush()
    resizeObserverRef.current = new ResizeObserver(() => { updateDimensions() })
    resizeObserverRef.current.observe(container)
    return () => {
      updateDimensions.cancel()
      resizeObserverRef.current?.disconnect()
    }
  }, [containerRef, updateDimensions])
}

import { useEffect, useRef } from "react"
import type { IViewerPlugin, IPluginContext, PluginCleanup } from "../plugins/types"
import type { IPluginState, PluginStateKey } from "../veritec-viewer.types"

interface IUsePluginsOptions {
  plugins: IViewerPlugin[]
  containerRef: React.RefObject<HTMLElement | null>
  setState: <K extends PluginStateKey>(key: K, value: IPluginState[K]) => void
  getState: <K extends PluginStateKey>(key: K) => IPluginState[K] | undefined
}

export function usePlugins({ plugins, containerRef, setState, getState }: IUsePluginsOptions): void {
  const cleanupsRef = useRef<Map<string, PluginCleanup>>(new Map())
  const setStateRef = useRef(setState)
  const getStateRef = useRef(getState)
  setStateRef.current = setState
  getStateRef.current = getState

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const context: IPluginContext = {
      container,
      setState: (key, value) => setStateRef.current(key, value),
      getState: (key) => getStateRef.current(key),
    }

    plugins.forEach((plugin) => {
      if (!cleanupsRef.current.has(plugin.name)) {
        const cleanup = plugin.onMount(context)
        if (cleanup) cleanupsRef.current.set(plugin.name, cleanup)
      }
    })

    return () => {
      cleanupsRef.current.forEach((cleanup) => cleanup())
      cleanupsRef.current.clear()
    }
  }, [plugins, containerRef])
}

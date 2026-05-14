import type { IPluginState, PluginStateKey } from "../veritec-viewer.types"

export interface IPluginContext {
  container: HTMLElement
  setState: <K extends PluginStateKey>(key: K, value: IPluginState[K]) => void
  getState: <K extends PluginStateKey>(key: K) => IPluginState[K] | undefined
}

export type PluginCleanup = () => void

export interface IViewerPlugin {
  name: string
  onMount: (ctx: IPluginContext) => PluginCleanup | void
  setZoom?: (zoom: number) => void
}

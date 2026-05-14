import type React from "react"
import type { IViewerPlugin } from "./plugins/types"

export interface IVeritecViewerProps {
  documents: IViewerDocument[]
  /**
   * Opens the viewer with this document page already scrolled into view.
   * Resolved at mount time by finding the first document whose `pageIds`
   * array contains this id. If the target isn't present the viewer falls
   * back to the top. Ignored after the first render — use the imperative
   * `scrollToPage` ref method to jump again later.
   *
   * This is the primary, reusable entrypoint for "open doc X at page Y"
   * flows (chat citations, events panel, billing panel, doc-intel).
   */
  initialDocumentPageId?: number
  onDocumentsLoadProgress?: (progress: IDocumentProgress[]) => void
  onDocumentLoaded?: (documents: IDocumentLoadedInfo[]) => void
  onStabilizationChange?: (isStabilizing: boolean) => void
  plugins?: IViewerPlugin[]
}

export interface IViewerDocument {
  viewerPageId: string
  url: string
  title?: string
  mediaType?: MediaType
  pageCount?: number
  pageIds?: number[]
  /**
   * When true, pdf.js fetches the document with `credentials: include` so the
   * browser sends session cookies. Required when the `url` points at a
   * backend-proxied stream (e.g. fileflow, whose blob storage is locked down
   * by IP allowlist).
   */
  withCredentials?: boolean
}

export interface IDocumentProgress {
  viewerPageId: string
  progress: number
}

export interface IDocumentLoadedInfo {
  viewerPageId: string
  numPages: number
  loadState: "pending" | "loading" | "loaded" | "error"
}

export interface IScrollToPageOptions {
  stabilize?: boolean
}

export interface IVeritecViewerRef {
  scrollToPage: (
    documentPageId: number,
    page: number,
    options?: IScrollToPageOptions,
  ) => Promise<void>
}

export interface IVeritecViewerInnerProps extends IVeritecViewerProps {
  innerRef: React.Ref<IVeritecViewerRef>
}

export type MediaType = "pdf" | "audio" | "video" | "unknown"

export interface IRendererProps {
  document: IViewerDocument
  onProgress?: (progress: number) => void
}

export interface IRendererRegistryEntry {
  mediaType: MediaType
  component: React.ComponentType<IRendererProps>
  extensions: string[]
}

export interface IDocumentState {
  viewerPageId: string
  mediaType: MediaType
  loadState: "pending" | "loading" | "loaded" | "error"
  progress: number
  numPages?: number
  error?: string
}

export interface IPageInfo {
  documentPageId: number
  page: number
}

export interface INavigationState {
  scrollToPage: (documentPageId: number, page: number) => Promise<void>
}

export interface IContainerDimensions {
  width: number
  height: number
}

export interface IZoomAnchor {
  documentPageId: number
  pageNumber: number
  offsetRatio: number
  oldZoom: number
}

export interface IPluginState {
  zoom: number
  currentPage: IPageInfo | null
  zooming: boolean
  zoomAnchor: IZoomAnchor | null
  rotations: Map<number, 0 | 90 | 180 | 270>
  navigation: INavigationState | null
  containerDimensions: IContainerDimensions | null
}

export type PluginStateKey = keyof IPluginState

export interface IViewerContextState {
  documents: IViewerDocument[]
  documentStates: Map<string, IDocumentState>
  currentVisibleDocument: string | null
  currentVisiblePage: number
  pluginState: Partial<IPluginState>
}

export interface IViewerContextActions {
  setDocumentProgress: (viewerPageId: string, progress: number) => void
  setDocumentLoaded: (viewerPageId: string, numPages?: number) => void
  setDocumentError: (viewerPageId: string, error: string) => void
  setVisiblePage: (viewerPageId: string, page: number) => void
  setPluginState: <K extends PluginStateKey>(
    key: K,
    value: IPluginState[K],
  ) => void
  getPluginState: <K extends PluginStateKey>(
    key: K,
  ) => IPluginState[K] | undefined
}

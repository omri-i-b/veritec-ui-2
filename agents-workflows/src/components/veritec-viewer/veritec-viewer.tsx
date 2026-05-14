import type React from "react"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import type { VirtuosoHandle } from "react-virtuoso"
import { Virtuoso } from "react-virtuoso"
import { DocumentContainer } from "./components/document-container"
import { DocumentErrorBoundary } from "./components/document-error-boundary"
import {
  useViewerActions,
  useViewerState,
  VeritecViewerProvider,
} from "./context/veritec-viewer-context"
import { useContainerDimensions } from "./hooks/use-container-dimensions"
import { useDocumentVisibility } from "./hooks/use-document-visibility"
import { usePlugins } from "./hooks/use-plugins"
import { useZoomCentering } from "./hooks/use-zoom-centering"
import { createNavigationPlugin } from "./plugins/navigation-plugin"
import type {
  IVeritecViewerInnerProps,
  IVeritecViewerProps,
  IVeritecViewerRef,
} from "./veritec-viewer.types"

const VeritecViewerInner: React.FC<IVeritecViewerInnerProps> = ({
  documents,
  initialDocumentPageId,
  onDocumentsLoadProgress,
  onDocumentLoaded,
  onStabilizationChange,
  plugins = [],
  innerRef,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const { setPluginState, getPluginState } = useViewerActions()
  const { documentStates } = useViewerState()
  const documentStatesRef = useRef(documentStates)
  documentStatesRef.current = documentStates

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    scrollContainerRef.current = node
    setScrollContainer(node)
  }, [])

  const currentZoom = getPluginState("zoom") ?? 1
  const zoomAnchor = getPluginState("zoomAnchor") ?? null

  // Resolve `initialDocumentPageId` to a Virtuoso row index. Computed
  // here (rather than later near the JSX) so `useDocumentVisibility`
  // below can seed its preload window around the same index — otherwise
  // the first six pages always prefetch even when opening at page 200.
  const initialTopMostItemIndex = useMemo(() => {
    if (!initialDocumentPageId || documents.length === 0) return 0
    const idx = documents.findIndex((doc) =>
      doc.pageIds?.includes(initialDocumentPageId),
    )
    return idx >= 0 ? idx : 0
  }, [initialDocumentPageId, documents])

  const { visibleDocIds, handleRangeChanged } = useDocumentVisibility(
    documents,
    initialTopMostItemIndex,
  )

  const handleZoomComplete = useCallback(() => {
    setPluginState("zooming", false)
    setPluginState("zoomAnchor", null)
  }, [setPluginState])

  const navigationPlugin = useMemo(
    () =>
      createNavigationPlugin({
        documents,
        virtuosoRef,
        containerRef: scrollContainerRef,
        documentStatesRef,
        onStabilizationChange,
      }),
    [documents, onStabilizationChange],
  )

  const allPlugins = useMemo(
    () => [navigationPlugin, ...plugins],
    [navigationPlugin, plugins],
  )

  usePlugins({
    plugins: allPlugins,
    containerRef: scrollContainerRef,
    setState: setPluginState,
    getState: getPluginState,
  })

  useZoomCentering(
    scrollContainerRef,
    virtuosoRef,
    documents,
    currentZoom,
    zoomAnchor,
    handleZoomComplete,
  )

  useContainerDimensions({
    containerRef: scrollContainerRef,
    setState: setPluginState,
  })

  // Notify parent when documents finish loading
  useEffect(() => {
    if (!onDocumentLoaded) return
    const loaded = Array.from(documentStates.values()).filter(
      (s) => s.loadState === "loaded" || s.loadState === "error",
    )
    if (loaded.length > 0 && loaded.length === documentStates.size) {
      onDocumentLoaded(
        loaded.map((s) => ({
          viewerPageId: s.viewerPageId,
          numPages: s.numPages ?? 0,
          loadState: s.loadState,
        })),
      )
    }
  }, [documentStates, onDocumentLoaded])

  // Stream per-document load progress to the parent. Fires on every
  // `documentStates` change; dedupe in the consumer if needed.
  const lastProgressKeyRef = useRef<string>("")
  useEffect(() => {
    if (!onDocumentsLoadProgress) return
    const entries = Array.from(documentStates.values())
      .map((s) => ({ viewerPageId: s.viewerPageId, progress: s.progress }))
      .sort((a, b) => a.viewerPageId.localeCompare(b.viewerPageId))
    const key = entries.map((e) => `${e.viewerPageId}:${e.progress}`).join("|")
    if (key === lastProgressKeyRef.current) return
    lastProgressKeyRef.current = key
    onDocumentsLoadProgress(entries)
  }, [documentStates, onDocumentsLoadProgress])

  useImperativeHandle(
    innerRef,
    () => ({ scrollToPage: navigationPlugin.scrollToPage }),
    [navigationPlugin],
  )

  const showHeader = documents.length > 1

  // Gate Virtuoso on the scroll container AND on documents having arrived.
  // `initialTopMostItemIndex` is a mount-only prop; mounting Virtuoso
  // before documents land would pin it to index 0 and silently ignore any
  // later target. This makes the declarative initial-page path reliable.
  const shouldMountVirtuoso = scrollContainer && documents.length > 0

  return (
    <div
      ref={setContainerRef}
      className="flex h-full w-full flex-col items-center overflow-auto bg-muted/50 p-0.5"
      style={{ scrollbarGutter: "stable" }}
    >
      {shouldMountVirtuoso && (
        <Virtuoso
          ref={virtuosoRef}
          data={documents}
          initialTopMostItemIndex={initialTopMostItemIndex}
          rangeChanged={handleRangeChanged}
          overscan={200}
          style={{ height: "100%", width: "100%" }}
          customScrollParent={scrollContainer}
          itemContent={(_, doc) => (
            <DocumentErrorBoundary
              key={doc.viewerPageId}
              documentId={doc.viewerPageId}
            >
              <DocumentContainer
                document={doc}
                shouldLoad={visibleDocIds.has(doc.viewerPageId)}
                showHeader={showHeader}
              />
            </DocumentErrorBoundary>
          )}
        />
      )}
    </div>
  )
}

export const VeritecViewer = forwardRef<IVeritecViewerRef, IVeritecViewerProps>(
  (props, ref) => (
    <VeritecViewerProvider documents={props.documents}>
      <VeritecViewerInner {...props} innerRef={ref} />
    </VeritecViewerProvider>
  ),
)

VeritecViewer.displayName = "VeritecViewer"

export default VeritecViewer

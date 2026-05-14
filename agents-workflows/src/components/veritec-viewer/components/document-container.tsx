import type React from "react"
import { memo, useCallback } from "react"
import {
  useViewerActions,
  useViewerState,
  useZoom,
} from "../context/veritec-viewer-context"
import { detectMediaType, getRenderer } from "../renderers"
import type { IViewerDocument } from "../veritec-viewer.types"

interface IDocumentContainerProps {
  document: IViewerDocument
  shouldLoad: boolean
  showHeader?: boolean
}

const arePropsEqual = (
  prev: IDocumentContainerProps,
  next: IDocumentContainerProps,
): boolean =>
  prev.document.viewerPageId === next.document.viewerPageId &&
  prev.document.url === next.document.url &&
  prev.document.pageIds?.length === next.document.pageIds?.length &&
  prev.shouldLoad === next.shouldLoad &&
  prev.showHeader === next.showHeader

export const DocumentContainer: React.FC<IDocumentContainerProps> = memo(
  function DocumentContainer({ document, shouldLoad, showHeader }) {
    const { documentStates } = useViewerState()
    const { setDocumentProgress } = useViewerActions()
    const zoom = useZoom()

    const mediaType = document.mediaType ?? detectMediaType(document.url)
    const Renderer = getRenderer(mediaType)
    const docState = documentStates.get(document.viewerPageId)
    const loadState = docState?.loadState ?? "pending"
    const isLoading = loadState === "pending" || loadState === "loading"

    const handleProgress = useCallback(
      (progress: number): void => {
        setDocumentProgress(document.viewerPageId, progress)
      },
      [document.viewerPageId, setDocumentProgress],
    )

    const progress = docState?.progress ?? 0
    const showProgress = isLoading && progress > 0 && progress < 100

    return (
      <div
        data-viewer-page-id={document.viewerPageId}
        className="flex w-full flex-col items-center"
      >
        {showHeader && document.title && (
          <div className="w-full px-4 py-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{document.title}</span>
              {showProgress && (
                <span className="shrink-0 text-xs tabular-nums">
                  {progress}%
                </span>
              )}
            </div>
          </div>
        )}
        {/*
         * Standalone progress bar — rendered in both single-doc and
         * multi-doc modes so a large PDF opened in DocumentPreviewSheet
         * (where `showHeader` is false) still surfaces download
         * progress. Sits flush to the top of the document frame and
         * disappears the moment loading finishes.
         */}
        {showProgress && (
          <div className="h-0.5 w-full overflow-hidden bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {shouldLoad ? (
          Renderer ? (
            <Renderer document={document} onProgress={handleProgress} />
          ) : (
            !isLoading && (
              <p className="text-destructive">
                Unsupported media type: {mediaType}
              </p>
            )
          )
        ) : (
          <div className="flex w-full flex-col items-center">
            <div
              className="relative flex items-center justify-center bg-background shadow-md mb-2 mt-1"
              style={{ width: 595 * 0.75 * zoom, height: 842 * 0.75 * zoom }}
            >
              <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          </div>
        )}
      </div>
    )
  },
  arePropsEqual,
)

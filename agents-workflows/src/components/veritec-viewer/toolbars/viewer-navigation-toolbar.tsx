import { useCallback, useMemo, useRef, useState } from "react"
import {
  CaretLeft,
  CaretRight,
  DownloadSimple,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Printer,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ZOOM_CONSTANTS } from "../constants"

export interface IDocumentLocation {
  viewerPageId: string
  documentTitle: string
  pagesCount: number
}

export interface ICurrentLocation {
  viewerPageId: string
  currentPage: number
}

export interface IViewerNavigationToolbarProps {
  locations: IDocumentLocation[]
  currentLocation: ICurrentLocation
  onPageChange: (location: { viewerPageId: string; pageNumber: number }) => void
  onZoomChange: (zoom: number) => void
  disabled?: boolean
  zoom?: number
  pageNumberingMode?: "continuous" | "per-document"
  totalPages?: number
  isStabilizing?: boolean
  onPrint?: () => void
  onDownload?: () => void
  isPrintLoading?: boolean
  isDownloadLoading?: boolean
  printProgress?: number
}

export function ViewerNavigationToolbar({
  locations,
  currentLocation,
  onPageChange,
  onZoomChange,
  disabled = false,
  zoom = 1,
  pageNumberingMode = "per-document",
  totalPages,
  isStabilizing = false,
  onPrint,
  onDownload,
  isPrintLoading = false,
  isDownloadLoading = false,
  printProgress,
}: IViewerNavigationToolbarProps) {
  const [pageInput, setPageInput] = useState("")
  const [isEditingPage, setIsEditingPage] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentDocumentIndex = useMemo(
    () =>
      locations.findIndex(
        (loc) => loc.viewerPageId === currentLocation.viewerPageId
      ),
    [locations, currentLocation.viewerPageId]
  )

  const currentDocument = locations[currentDocumentIndex]

  const continuousPage = useMemo(() => {
    if (pageNumberingMode !== "continuous") return currentLocation.currentPage
    let page = 0
    for (let i = 0; i < currentDocumentIndex; i++) {
      page += locations[i].pagesCount
    }
    return page + currentLocation.currentPage
  }, [
    pageNumberingMode,
    currentDocumentIndex,
    currentLocation.currentPage,
    locations,
  ])

  const effectiveTotalPages = useMemo(() => {
    if (totalPages != null) return totalPages
    if (pageNumberingMode === "continuous") {
      return locations.reduce((sum, loc) => sum + loc.pagesCount, 0)
    }
    return currentDocument?.pagesCount ?? 0
  }, [totalPages, pageNumberingMode, locations, currentDocument])

  const displayPage =
    pageNumberingMode === "continuous"
      ? continuousPage
      : currentLocation.currentPage

  const isFirstPage = useMemo(() => {
    if (pageNumberingMode === "continuous") return continuousPage <= 1
    return currentDocumentIndex === 0 && currentLocation.currentPage <= 1
  }, [
    pageNumberingMode,
    continuousPage,
    currentDocumentIndex,
    currentLocation.currentPage,
  ])

  const isLastPage = useMemo(() => {
    if (pageNumberingMode === "continuous")
      return continuousPage >= effectiveTotalPages
    return (
      currentDocumentIndex === locations.length - 1 &&
      currentLocation.currentPage >= (currentDocument?.pagesCount ?? 0)
    )
  }, [
    pageNumberingMode,
    continuousPage,
    effectiveTotalPages,
    currentDocumentIndex,
    locations.length,
    currentLocation.currentPage,
    currentDocument,
  ])

  const handlePageDelta = useCallback(
    (delta: number) => {
      if (pageNumberingMode === "continuous") {
        const targetContinuous = continuousPage + delta
        if (targetContinuous < 1 || targetContinuous > effectiveTotalPages)
          return

        let remaining = targetContinuous
        for (const loc of locations) {
          if (remaining <= loc.pagesCount) {
            onPageChange({
              viewerPageId: loc.viewerPageId,
              pageNumber: remaining,
            })
            return
          }
          remaining -= loc.pagesCount
        }
        return
      }

      const newPage = currentLocation.currentPage + delta
      if (newPage >= 1 && newPage <= (currentDocument?.pagesCount ?? 0)) {
        onPageChange({
          viewerPageId: currentLocation.viewerPageId,
          pageNumber: newPage,
        })
        return
      }

      if (delta > 0 && currentDocumentIndex < locations.length - 1) {
        const nextDoc = locations[currentDocumentIndex + 1]
        onPageChange({ viewerPageId: nextDoc.viewerPageId, pageNumber: 1 })
        return
      }

      if (delta < 0 && currentDocumentIndex > 0) {
        const prevDoc = locations[currentDocumentIndex - 1]
        onPageChange({
          viewerPageId: prevDoc.viewerPageId,
          pageNumber: prevDoc.pagesCount,
        })
      }
    },
    [
      pageNumberingMode,
      continuousPage,
      effectiveTotalPages,
      locations,
      currentLocation,
      currentDocument,
      currentDocumentIndex,
      onPageChange,
    ]
  )

  const handleZoomDelta = useCallback(
    (delta: number) => {
      const newZoom = Math.min(
        ZOOM_CONSTANTS.MAX_ZOOM,
        Math.max(ZOOM_CONSTANTS.MIN_ZOOM, zoom + delta)
      )
      onZoomChange(newZoom)
    },
    [zoom, onZoomChange]
  )

  const handleDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const viewerPageId = e.target.value
      onPageChange({ viewerPageId, pageNumber: 1 })
    },
    [onPageChange]
  )

  const navigateToPage = useCallback(
    (value: string) => {
      const parsed = parseInt(value, 10)
      if (isNaN(parsed) || parsed < 1 || parsed > effectiveTotalPages) return

      if (pageNumberingMode === "continuous") {
        let remaining = parsed
        for (const loc of locations) {
          if (remaining <= loc.pagesCount) {
            onPageChange({
              viewerPageId: loc.viewerPageId,
              pageNumber: remaining,
            })
            return
          }
          remaining -= loc.pagesCount
        }
        return
      }

      onPageChange({
        viewerPageId: currentLocation.viewerPageId,
        pageNumber: parsed,
      })
    },
    [
      effectiveTotalPages,
      pageNumberingMode,
      locations,
      currentLocation.viewerPageId,
      onPageChange,
    ]
  )

  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPageInput(e.target.value)
    },
    []
  )

  const handlePageInputSubmit = useCallback(() => {
    navigateToPage(pageInput)
    setIsEditingPage(false)
    setPageInput("")
  }, [pageInput, navigateToPage])

  const handlePageInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handlePageInputSubmit()
      } else if (e.key === "Escape") {
        setIsEditingPage(false)
        setPageInput("")
      }
    },
    [handlePageInputSubmit]
  )

  const handlePageInputBlur = useCallback(() => {
    if (pageInput.trim()) {
      navigateToPage(pageInput)
    }
    setIsEditingPage(false)
    setPageInput("")
  }, [pageInput, navigateToPage])

  const handlePageDisplayClick = useCallback(() => {
    setIsEditingPage(true)
    setPageInput(String(displayPage))
    requestAnimationFrame(() => inputRef.current?.select())
  }, [displayPage])

  return (
    <TooltipProvider>
      <div className="inline-flex items-center h-9 bg-card border border-border rounded-md px-2">
        {/* Document selector (multi-document mode) */}
        {locations.length > 1 && (
          <>
            <div className="flex items-center gap-1">
              <select
                className="w-[200px] text-sm font-medium bg-transparent border-none focus:outline-none truncate"
                value={currentLocation.viewerPageId}
                onChange={handleDocumentChange}
                disabled={disabled}
              >
                {locations.map((loc) => (
                  <option key={loc.viewerPageId} value={loc.viewerPageId}>
                    {loc.documentTitle}
                  </option>
                ))}
              </select>
            </div>
            <Separator orientation="vertical" className="mx-2 h-5" />
          </>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handlePageDelta(-1)}
                disabled={disabled || isFirstPage}
              >
                <CaretLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous page</TooltipContent>
          </Tooltip>

          {isEditingPage ? (
            <input
              ref={inputRef}
              type="text"
              className="w-7 h-6 text-center text-sm bg-transparent border-none focus:outline-none"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
            />
          ) : (
            <button
              className="w-7 h-6 text-center text-sm bg-transparent border-none cursor-text hover:bg-muted rounded"
              onClick={handlePageDisplayClick}
              disabled={disabled}
            >
              {displayPage}
            </button>
          )}

          <span className="text-sm text-muted-foreground">
            / {effectiveTotalPages}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handlePageDelta(1)}
                disabled={disabled || isLastPage}
              >
                <CaretRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next page</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-2 h-5" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleZoomDelta(-ZOOM_CONSTANTS.ZOOM_STEP_BUTTON)}
                disabled={disabled || zoom <= ZOOM_CONSTANTS.MIN_ZOOM}
              >
                <MagnifyingGlassMinus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <span className="min-w-10 text-center text-sm text-foreground">
            {Math.round(zoom * 100)}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleZoomDelta(ZOOM_CONSTANTS.ZOOM_STEP_BUTTON)}
                disabled={disabled || zoom >= ZOOM_CONSTANTS.MAX_ZOOM}
              >
                <MagnifyingGlassPlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
        </div>

        {/* Stabilization indicator */}
        <span
          className={cn(
            "flex items-center transition-opacity duration-150",
            isStabilizing ? "opacity-50" : "opacity-0"
          )}
        >
          <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>

        {/* Print / Download actions */}
        {(onPrint || onDownload) && (
          <>
            <Separator orientation="vertical" className="mx-2 h-5" />
            <div className="flex items-center gap-1">
              {onPrint && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={onPrint}
                      disabled={disabled || isPrintLoading}
                    >
                      {isPrintLoading ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Printer />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPrintLoading && printProgress != null
                      ? `Preparing print... ${Math.round(printProgress * 100)}%`
                      : "Print"}
                  </TooltipContent>
                </Tooltip>
              )}

              {onDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={onDownload}
                      disabled={disabled || isDownloadLoading}
                    >
                      {isDownloadLoading ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <DownloadSimple />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDownloadLoading ? "Downloading..." : "Download"}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

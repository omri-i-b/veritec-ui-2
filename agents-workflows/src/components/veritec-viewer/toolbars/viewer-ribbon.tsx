import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsOut,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Copy,
  Cursor,
  DownloadSimple,
  File,
  FirstAid,
  Funnel,
  Lock,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  NotePencil,
  Printer,
  Sparkle,
  Square,
  SquaresFour,
  TextAa,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react"
import React, { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { ZOOM_CONSTANTS } from "../constants"

/* -------------------------------------------------------------------------- */
/*                              Inline Types                                  */
/* -------------------------------------------------------------------------- */

type AnnotationMode = "pointer" | "rectangle"

interface IViewerAnnotation {
  id: string
  source?: { type: string }
}

interface IHighlightVisibility {
  keywords: boolean
  medicalEvents: boolean
  userNotes: boolean
}

/* -------------------------------------------------------------------------- */
/*                              RibbonGroup                                   */
/* -------------------------------------------------------------------------- */

function RibbonGroup({
  label,
  children,
  hideBorder,
  hideLabels,
  noHover,
  fixedWidth,
}: {
  label?: string
  children: React.ReactNode
  hideBorder?: boolean
  hideLabels?: boolean
  noHover?: boolean
  fixedWidth?: number
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch",
        fixedWidth ? "flex-none" : "flex-auto",
        !hideBorder && "border-r border-border last:border-r-0",
        !noHover && "hover:bg-accent/50"
      )}
      style={fixedWidth ? { width: fixedWidth } : undefined}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-0.5 flex-1 min-h-8",
          hideLabels ? "px-2" : "px-2 pt-1"
        )}
      >
        {children}
      </div>
      {!hideLabels && label && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-0.5 text-center bg-muted/50 w-full">
          {label}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

export type PageFilterType = "bookmarked" | "notes"

export interface IPageFilterConfig {
  activeFilters: Set<PageFilterType>
  counts: Record<PageFilterType, number>
  onChange: (filters: Set<PageFilterType>) => void
}

export interface IViewerRibbonProps {
  hideLabels?: boolean

  viewerMode?: "viewer" | "grid"
  onViewerModeChange?: (mode: "viewer" | "grid") => void

  gridModeInfo?: {
    selectedCount: number
    totalCount: number
    notice?: string
    activeDuplicatesCount?: number
    excludedDuplicatesCount?: number
    onFlagAsDuplicate?: () => void
    onUnflagDuplicate?: () => void
    hasDuplicatesInSelection?: boolean
    showOnlyActiveDuplicates?: boolean
    showOnlyExcludedDuplicates?: boolean
    onToggleShowOnlyActiveDuplicates?: () => void
    onToggleShowOnlyExcludedDuplicates?: () => void
  }

  onClose?: () => void

  currentPage: number
  totalPages: number
  onPageChange: (pageNumber: number) => void
  isStabilizing?: boolean

  zoom: number
  onZoomChange: (zoom: number) => void

  searchQuery?: string
  onSearchChange?: (query: string) => void
  searchState?: {
    currentMatchIndex: number
    totalMatches: number
    isSearching: boolean
  }
  onSearchPrev?: () => void
  onSearchNext?: () => void
  onSearchClose?: () => void
  onSearchExpand?: () => void
  ocrLoadingState?: "idle" | "loading" | "loaded"
  ocrLoadingProgress?: { loaded: number; total: number }

  onRotateCW: () => void
  onRotateCCW: () => void

  highlightVisibility?: IHighlightVisibility
  onHighlightVisibilityChange?: (visibility: IHighlightVisibility) => void
  hasKeywords?: boolean
  hasMedicalEvents?: boolean
  hasUserNotes?: boolean

  annotationMode: AnnotationMode
  onAnnotationModeChange: (mode: AnnotationMode) => void
  selectedAnnotation?: IViewerAnnotation | null
  onDeleteAnnotation?: () => void

  onPrint?: (mode: "document" | "page") => void
  currentPageUrl?: string
  onDownload?: () => void
  downloadMenuItems?: Array<{
    label: string
    onClick: () => void
    disabled?: boolean
  }>
  isPrintLoading?: boolean
  isDownloadLoading?: boolean
  printProgress?: number

  onChatWithDocument?: () => void
  showFullScreen?: boolean
  onOpenFullScreen?: () => void

  pageFilter?: IPageFilterConfig

  navigationOverride?: {
    onPrev: () => void
    onNext: () => void
    canPrev: boolean
    canNext: boolean
  }

  disabled?: boolean
}

/* -------------------------------------------------------------------------- */
/*                              Spinner                                       */
/* -------------------------------------------------------------------------- */

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                            ViewerRibbon                                    */
/* -------------------------------------------------------------------------- */

export const ViewerRibbon: React.FC<IViewerRibbonProps> = ({
  hideLabels = false,

  viewerMode,
  onViewerModeChange,

  gridModeInfo,

  onClose,

  currentPage,
  totalPages,
  onPageChange,
  isStabilizing = false,

  zoom,
  onZoomChange,

  searchQuery,
  onSearchChange,
  searchState,
  onSearchPrev,
  onSearchNext,
  onSearchClose,
  onSearchExpand,
  ocrLoadingState,
  ocrLoadingProgress,

  onRotateCW,
  onRotateCCW,

  highlightVisibility,
  onHighlightVisibilityChange,
  hasKeywords = false,
  hasMedicalEvents = false,
  hasUserNotes = false,

  annotationMode,
  onAnnotationModeChange,
  selectedAnnotation,
  onDeleteAnnotation,

  onPrint,
  currentPageUrl,
  onDownload,
  downloadMenuItems,
  isPrintLoading = false,
  isDownloadLoading = false,
  printProgress: _printProgress = 0,

  pageFilter,

  navigationOverride,

  onChatWithDocument,
  showFullScreen = false,
  onOpenFullScreen,

  disabled = false,
}) => {
  /* --------------------------------- State -------------------------------- */

  const [pageInputValue, setPageInputValue] = useState<string>(
    String(currentPage)
  )
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  useEffect(() => {
    setPageInputValue(String(currentPage))
  }, [currentPage])

  useEffect(() => {
    if (searchQuery) {
      setIsSearchExpanded(true)
    }
  }, [searchQuery])

  const canGoPrev = navigationOverride
    ? navigationOverride.canPrev
    : currentPage > 1
  const canGoNext = navigationOverride
    ? navigationOverride.canNext
    : currentPage < totalPages
  const canZoomOut = zoom > ZOOM_CONSTANTS.MIN_ZOOM
  const canZoomIn = zoom < ZOOM_CONSTANTS.MAX_ZOOM

  /* -------------------------------- Handlers ------------------------------ */

  const handlePageDelta = useCallback(
    (delta: 1 | -1) => {
      const newPage = currentPage + delta
      if (newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage)
      }
    },
    [currentPage, totalPages, onPageChange]
  )

  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "")
      setPageInputValue(value)
    },
    []
  )

  const handlePageInputSubmit = useCallback(() => {
    const pageNum = parseInt(pageInputValue, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
    } else {
      setPageInputValue(String(currentPage))
    }
  }, [pageInputValue, totalPages, onPageChange, currentPage])

  const handlePageInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur()
      }
    },
    []
  )

  const handleZoomDelta = useCallback(
    (delta: 1 | -1) => {
      const newZoom = zoom + delta * ZOOM_CONSTANTS.ZOOM_STEP_BUTTON
      if (
        newZoom >= ZOOM_CONSTANTS.MIN_ZOOM &&
        newZoom <= ZOOM_CONSTANTS.MAX_ZOOM
      ) {
        onZoomChange(newZoom)
      }
    },
    [zoom, onZoomChange]
  )

  const handleSearchToggle = useCallback(() => {
    if (isSearchExpanded && searchQuery && onSearchClose) {
      onSearchClose()
    }
    const expanding = !isSearchExpanded
    setIsSearchExpanded(expanding)
    if (expanding) {
      onSearchExpand?.()
    }
  }, [isSearchExpanded, searchQuery, onSearchClose, onSearchExpand])

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSearchChange) {
        onSearchChange(e.target.value)
      }
    },
    [onSearchChange]
  )

  const toggleKeywords = useCallback(() => {
    if (!highlightVisibility || !onHighlightVisibilityChange) return
    onHighlightVisibilityChange({
      ...highlightVisibility,
      keywords: !highlightVisibility.keywords,
    })
  }, [highlightVisibility, onHighlightVisibilityChange])

  const toggleMedicalEvents = useCallback(() => {
    if (!highlightVisibility || !onHighlightVisibilityChange) return
    onHighlightVisibilityChange({
      ...highlightVisibility,
      medicalEvents: !highlightVisibility.medicalEvents,
    })
  }, [highlightVisibility, onHighlightVisibilityChange])

  const toggleUserNotes = useCallback(() => {
    if (!highlightVisibility || !onHighlightVisibilityChange) return
    onHighlightVisibilityChange({
      ...highlightVisibility,
      userNotes: !highlightVisibility.userNotes,
    })
  }, [highlightVisibility, onHighlightVisibilityChange])

  const handleFilterToggle = useCallback(
    (filterType: PageFilterType) => {
      if (!pageFilter) return
      const next = new Set(pageFilter.activeFilters)
      if (next.has(filterType)) {
        next.delete(filterType)
      } else {
        next.add(filterType)
      }
      pageFilter.onChange(next)
    },
    [pageFilter]
  )

  const handleFilterClearAll = useCallback(() => {
    if (!pageFilter) return
    pageFilter.onChange(new Set())
  }, [pageFilter])

  /* -------------------------------- Render -------------------------------- */

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-stretch w-full bg-card border-b border-border overflow-x-auto shrink-0",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          hideLabels ? "h-10" : "h-14"
        )}
      >
        {/* ========================= Mode Group ========================== */}
        {viewerMode && onViewerModeChange && (
          <RibbonGroup
            label="Mode"
            fixedWidth={80}
            hideLabels={hideLabels}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Toggle
                    size="sm"
                    pressed={viewerMode === "viewer"}
                    onPressedChange={() => onViewerModeChange("viewer")}
                    className="size-7"
                  >
                    <File className="size-[18px]" />
                  </Toggle>
                </span>
              </TooltipTrigger>
              <TooltipContent>View document</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Toggle
                    size="sm"
                    pressed={viewerMode === "grid"}
                    onPressedChange={() => onViewerModeChange("grid")}
                    className="size-7"
                  >
                    <SquaresFour className="size-[18px]" />
                  </Toggle>
                </span>
              </TooltipTrigger>
              <TooltipContent>Edit pages</TooltipContent>
            </Tooltip>
          </RibbonGroup>
        )}

        {/* ========================= Close Group ========================= */}
        {onClose && (
          <RibbonGroup label="Close" hideLabels={hideLabels}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={onClose}
                >
                  <X className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </RibbonGroup>
        )}

        {/* ================= Grid Mode Info (replaces viewer controls) ===== */}
        {viewerMode === "grid" && gridModeInfo && (
          <>
            <RibbonGroup
              label="Selection"
              hideBorder
              noHover
              hideLabels={hideLabels}
            >
              <span className="flex items-center text-sm font-medium text-foreground whitespace-nowrap px-2">
                Selected: {gridModeInfo.selectedCount} of{" "}
                {gridModeInfo.totalCount} pages
              </span>
              {gridModeInfo.notice && (
                <>
                  <Separator orientation="vertical" className="h-4 mx-1" />
                  <span className="flex items-center text-xs text-muted-foreground whitespace-nowrap px-2">
                    {gridModeInfo.notice}
                  </span>
                </>
              )}
            </RibbonGroup>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Duplicates */}
            {((gridModeInfo.activeDuplicatesCount ?? 0) > 0 ||
              (gridModeInfo.excludedDuplicatesCount ?? 0) > 0 ||
              (gridModeInfo.selectedCount > 0 &&
                (gridModeInfo.onFlagAsDuplicate ||
                  gridModeInfo.onUnflagDuplicate))) && (
              <div className="flex items-center gap-1.5 px-3 h-full">
                {/* Badge: Active duplicates */}
                {(gridModeInfo.activeDuplicatesCount ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 h-[26px] px-2 rounded text-xs font-medium whitespace-nowrap transition-colors",
                          gridModeInfo.showOnlyActiveDuplicates
                            ? "bg-muted text-foreground"
                            : "bg-transparent text-muted-foreground",
                          gridModeInfo.onToggleShowOnlyActiveDuplicates
                            ? "cursor-pointer hover:bg-muted"
                            : "cursor-default"
                        )}
                        onClick={
                          gridModeInfo.onToggleShowOnlyActiveDuplicates
                        }
                      >
                        <Warning className="size-3.5" />
                        {gridModeInfo.activeDuplicatesCount} duplicate
                        {gridModeInfo.activeDuplicatesCount !== 1 ? "s" : ""}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {gridModeInfo.showOnlyActiveDuplicates
                        ? "Show all pages"
                        : "Show only duplicates"}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Badge: Excluded duplicates */}
                {(gridModeInfo.excludedDuplicatesCount ?? 0) > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 h-[26px] px-2 rounded text-xs font-medium whitespace-nowrap transition-colors",
                          gridModeInfo.showOnlyExcludedDuplicates
                            ? "bg-muted text-foreground"
                            : "bg-transparent text-muted-foreground/70",
                          gridModeInfo.onToggleShowOnlyExcludedDuplicates
                            ? "cursor-pointer hover:bg-muted"
                            : "cursor-default"
                        )}
                        onClick={
                          gridModeInfo.onToggleShowOnlyExcludedDuplicates
                        }
                      >
                        + {gridModeInfo.excludedDuplicatesCount} excluded
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {gridModeInfo.showOnlyExcludedDuplicates
                        ? "Show all pages"
                        : "Show only excluded"}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Action: Flag/Unflag duplicate */}
                {gridModeInfo.selectedCount > 0 &&
                  (gridModeInfo.hasDuplicatesInSelection &&
                  gridModeInfo.onUnflagDuplicate ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 h-[26px] px-2.5 rounded bg-muted text-foreground text-xs font-medium whitespace-nowrap cursor-pointer transition-colors hover:bg-muted/80 active:bg-accent"
                          onClick={gridModeInfo.onUnflagDuplicate}
                        >
                          <X className="size-3.5" />
                          Unmark duplicate
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Remove duplicate mark from selected pages
                      </TooltipContent>
                    </Tooltip>
                  ) : gridModeInfo.onFlagAsDuplicate ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 h-[26px] px-2.5 rounded bg-muted text-foreground text-xs font-medium whitespace-nowrap cursor-pointer transition-colors hover:bg-muted/80 active:bg-accent"
                          onClick={gridModeInfo.onFlagAsDuplicate}
                        >
                          <Copy className="size-3.5" />
                          Mark as duplicate
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Mark selected pages as duplicates
                      </TooltipContent>
                    </Tooltip>
                  ) : null)}
              </div>
            )}
          </>
        )}

        {/* ================= Viewer Controls (hidden in grid mode) ========= */}
        {viewerMode !== "grid" && (
          <>
            {/* ===================== Navigate Group ====================== */}
            <RibbonGroup label="Navigate" hideLabels={hideLabels}>
              <div
                className={cn(
                  "flex items-center justify-center mr-0.5 transition-opacity",
                  isStabilizing ? "opacity-60" : "opacity-0"
                )}
              >
                <Lock className="size-3" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={
                  navigationOverride
                    ? navigationOverride.onPrev
                    : () => handlePageDelta(-1)
                }
                disabled={disabled || !canGoPrev}
              >
                <CaretLeft className="size-4" />
              </Button>
              <input
                type="text"
                className="w-8 h-6 border-none text-center text-sm bg-transparent focus:outline-none disabled:opacity-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                value={pageInputValue}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                onBlur={handlePageInputSubmit}
                disabled={disabled}
              />
              <span className="text-sm text-foreground min-w-5 text-center">
                /
              </span>
              <span className="text-sm text-foreground min-w-5 text-center">
                {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={
                  navigationOverride
                    ? navigationOverride.onNext
                    : () => handlePageDelta(1)
                }
                disabled={disabled || !canGoNext}
              >
                <CaretRight className="size-4" />
              </Button>
            </RibbonGroup>

            {/* ====================== Filter Group ======================= */}
            {pageFilter && (
              <RibbonGroup label="Filter" hideLabels={hideLabels}>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="relative">
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            disabled={disabled}
                          >
                            <Funnel className="size-4" />
                            <CaretDown className="size-3 -ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        {pageFilter.activeFilters.size > 0 && (
                          <div className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary" />
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Filter pages</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="min-w-[200px]">
                    <DropdownMenuItem
                      onSelect={() => handleFilterClearAll()}
                    >
                      <Checkbox
                        checked={pageFilter.activeFilters.size === 0}
                        className="mr-2"
                      />
                      All Pages
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleFilterToggle("bookmarked")}
                    >
                      <Checkbox
                        checked={pageFilter.activeFilters.has("bookmarked")}
                        className="mr-2"
                      />
                      Bookmarked ({pageFilter.counts.bookmarked})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleFilterToggle("notes")}
                    >
                      <Checkbox
                        checked={pageFilter.activeFilters.has("notes")}
                        className="mr-2"
                      />
                      With Notes ({pageFilter.counts.notes})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </RibbonGroup>
            )}

            {/* ======================= Zoom Group ======================== */}
            <RibbonGroup label="Zoom" hideLabels={hideLabels}>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleZoomDelta(-1)}
                disabled={disabled || !canZoomOut}
              >
                <MagnifyingGlassMinus className="size-4" />
              </Button>
              <span className="text-xs text-foreground min-w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleZoomDelta(1)}
                disabled={disabled || !canZoomIn}
              >
                <MagnifyingGlassPlus className="size-4" />
              </Button>
            </RibbonGroup>

            {/* ====================== Search Group ======================= */}
            {onSearchChange && searchState && (
              <RibbonGroup label="Search" hideLabels={hideLabels}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={handleSearchToggle}
                      disabled={disabled}
                    >
                      {isSearchExpanded ? (
                        <X className="size-4" />
                      ) : (
                        <MagnifyingGlass className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isSearchExpanded
                      ? "Close search"
                      : "Search in document"}
                  </TooltipContent>
                </Tooltip>
                {isSearchExpanded && (
                  <>
                    <input
                      type="text"
                      className="h-6 min-w-[120px] border-none px-2 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
                      placeholder="Search..."
                      value={searchQuery ?? ""}
                      onChange={handleSearchInputChange}
                      disabled={disabled}
                      autoFocus
                    />
                    <span className="text-xs text-muted-foreground min-w-9 text-center">
                      {ocrLoadingState === "loading" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Spinner className="size-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Downloading OCR Data
                            {ocrLoadingProgress
                              ? ` (${ocrLoadingProgress.loaded}/${ocrLoadingProgress.total})`
                              : ""}
                          </TooltipContent>
                        </Tooltip>
                      ) : searchState.isSearching ? (
                        <Spinner className="size-3" />
                      ) : searchState.totalMatches > 0 ? (
                        `${searchState.currentMatchIndex}/${searchState.totalMatches}`
                      ) : searchQuery ? (
                        "0/0"
                      ) : null}
                    </span>
                    {ocrLoadingState !== "loading" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={onSearchPrev}
                          disabled={
                            disabled || searchState.totalMatches === 0
                          }
                        >
                          <CaretUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={onSearchNext}
                          disabled={
                            disabled || searchState.totalMatches === 0
                          }
                        >
                          <CaretDown className="size-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </RibbonGroup>
            )}

            {/* =================== View Group (Rotation + Highlights) ==== */}
            <RibbonGroup label="View" hideLabels={hideLabels}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={onRotateCCW}
                      disabled={disabled}
                    >
                      <ArrowCounterClockwise className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Rotate counter-clockwise</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={onRotateCW}
                      disabled={disabled}
                    >
                      <ArrowClockwise className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Rotate clockwise</TooltipContent>
              </Tooltip>
              {highlightVisibility && onHighlightVisibilityChange && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-1"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Toggle
                          size="sm"
                          pressed={highlightVisibility.keywords}
                          onPressedChange={toggleKeywords}
                          disabled={disabled || !hasKeywords}
                          className={cn(
                            "size-7",
                            !hasKeywords && "opacity-40"
                          )}
                        >
                          <TextAa className="size-[18px]" />
                        </Toggle>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Keyword highlights</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Toggle
                          size="sm"
                          pressed={highlightVisibility.medicalEvents}
                          onPressedChange={toggleMedicalEvents}
                          disabled={disabled || !hasMedicalEvents}
                          className={cn(
                            "size-7",
                            !hasMedicalEvents && "opacity-40"
                          )}
                        >
                          <FirstAid className="size-[18px]" />
                        </Toggle>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Medical event highlights
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Toggle
                          size="sm"
                          pressed={highlightVisibility.userNotes}
                          onPressedChange={toggleUserNotes}
                          disabled={disabled || !hasUserNotes}
                          className={cn(
                            "size-7",
                            !hasUserNotes && "opacity-40"
                          )}
                        >
                          <NotePencil className="size-[18px]" />
                        </Toggle>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>User note highlights</TooltipContent>
                  </Tooltip>
                </>
              )}
            </RibbonGroup>

            {/* ==================== Annotate Group ======================== */}
            <RibbonGroup label="Annotate" hideLabels={hideLabels}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Toggle
                      size="sm"
                      pressed={annotationMode === "pointer"}
                      onPressedChange={() =>
                        onAnnotationModeChange("pointer")
                      }
                      disabled={disabled}
                      className="size-7"
                    >
                      <Cursor className="size-[18px]" />
                    </Toggle>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Select</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Toggle
                      size="sm"
                      pressed={annotationMode === "rectangle"}
                      onPressedChange={() =>
                        onAnnotationModeChange("rectangle")
                      }
                      disabled={disabled}
                      className="size-7"
                    >
                      <Square className="size-[18px]" />
                    </Toggle>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Draw rectangle</TooltipContent>
              </Tooltip>
              {selectedAnnotation && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-1"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={onDeleteAnnotation}
                          disabled={disabled}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Delete annotation</TooltipContent>
                  </Tooltip>
                </>
              )}
            </RibbonGroup>

            {/* ==================== Document Group ======================== */}
            {(onPrint || onDownload) && (
              <RibbonGroup label="Document" hideLabels={hideLabels}>
                {/* Print */}
                {onPrint && (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              disabled={disabled || isPrintLoading}
                            >
                              {isPrintLoading ? (
                                <Spinner className="size-[18px]" />
                              ) : (
                                <>
                                  <Printer className="size-4" />
                                  <CaretDown className="size-3 -ml-1" />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Print</TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                      align="start"
                      className="min-w-[180px]"
                    >
                      <DropdownMenuItem
                        onSelect={() => onPrint("document")}
                      >
                        Print document
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => onPrint("page")}
                        disabled={!currentPageUrl}
                      >
                        Print current page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Download */}
                {onDownload &&
                  (downloadMenuItems && downloadMenuItems.length > 0 ? (
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                disabled={disabled || isDownloadLoading}
                              >
                                {isDownloadLoading ? (
                                  <Spinner className="size-[18px]" />
                                ) : (
                                  <>
                                    <DownloadSimple className="size-4" />
                                    <CaretDown className="size-3 -ml-1" />
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent
                        align="start"
                        className="min-w-[180px]"
                      >
                        {downloadMenuItems.map((item) => (
                          <DropdownMenuItem
                            key={item.label}
                            onSelect={item.onClick}
                            disabled={item.disabled}
                          >
                            {item.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={onDownload}
                            disabled={disabled || isDownloadLoading}
                          >
                            {isDownloadLoading ? (
                              <Spinner className="size-[18px]" />
                            ) : (
                              <DownloadSimple className="size-4" />
                            )}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Download document</TooltipContent>
                    </Tooltip>
                  ))}
              </RibbonGroup>
            )}
          </>
        )}

        {/* ========================= Chat Group ========================== */}
        {onChatWithDocument && (
          <RibbonGroup
            label="Chat"
            hideBorder
            hideLabels={hideLabels}
          >
            {showFullScreen && onOpenFullScreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={onOpenFullScreen}
                      disabled={disabled}
                    >
                      <ArrowsOut className="size-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Open in full screen</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={onChatWithDocument}
                    disabled={disabled}
                  >
                    <Sparkle className="size-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Chat with AI about this document
              </TooltipContent>
            </Tooltip>
          </RibbonGroup>
        )}
      </div>
    </TooltipProvider>
  )
}

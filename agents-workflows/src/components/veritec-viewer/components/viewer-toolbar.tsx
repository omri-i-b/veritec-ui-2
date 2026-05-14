import { useState, useCallback, useEffect } from "react"
import { CaretLeft, CaretRight, MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZOOM_CONSTANTS } from "../constants"

interface ViewerToolbarProps {
  currentPage: number
  totalPages: number
  zoom: number
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
}

export function ViewerToolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
}: ViewerToolbarProps) {
  const [pageInput, setPageInput] = useState(String(currentPage))

  useEffect(() => {
    setPageInput(String(currentPage))
  }, [currentPage])

  const handlePageInputSubmit = useCallback(() => {
    const page = parseInt(pageInput, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
    } else {
      setPageInput(String(currentPage))
    }
  }, [pageInput, totalPages, currentPage, onPageChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handlePageInputSubmit()
      if (e.key === "Escape") setPageInput(String(currentPage))
    },
    [handlePageInputSubmit, currentPage],
  )

  const zoomPercent = Math.round(zoom * 100)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-card px-2">
        {/* Page Navigation */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <CaretLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous page</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1">
            <Input
              className="h-7 w-12 text-center text-xs"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageInputSubmit}
              onKeyDown={handleKeyDown}
            />
            <span className="text-xs text-muted-foreground">/ {totalPages}</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <CaretRight className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next page</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={zoom <= ZOOM_CONSTANTS.MIN_ZOOM}
                onClick={() => onZoomChange(Math.max(ZOOM_CONSTANTS.MIN_ZOOM, zoom - ZOOM_CONSTANTS.ZOOM_STEP_BUTTON))}
              >
                <MagnifyingGlassMinus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
            {zoomPercent}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={zoom >= ZOOM_CONSTANTS.MAX_ZOOM}
                onClick={() => onZoomChange(Math.min(ZOOM_CONSTANTS.MAX_ZOOM, zoom + ZOOM_CONSTANTS.ZOOM_STEP_BUTTON))}
              >
                <MagnifyingGlassPlus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

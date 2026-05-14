import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { usePdfThumbnail } from "../hooks/use-pdf-thumbnail"

const THUMBNAIL_WIDTH = 120

interface ThumbnailSidebarProps {
  documentUrl: string
  totalPages: number
  currentPage: number
  pageIds?: number[]
  onPageClick: (page: number) => void
  withCredentials?: boolean
}

export function ThumbnailSidebar({
  documentUrl,
  totalPages,
  currentPage,
  pageIds,
  onPageClick,
  withCredentials,
}: ThumbnailSidebarProps) {
  return (
    <ScrollArea className="h-full w-[152px] shrink-0 border-r border-border bg-muted/30">
      <div className="flex flex-col items-center gap-2 p-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <ThumbnailItem
            key={i}
            url={documentUrl}
            pageNumber={i + 1}
            documentPageId={pageIds?.[i]}
            isCurrent={currentPage === i + 1}
            onClick={() => onPageClick(i + 1)}
            withCredentials={withCredentials}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

interface ThumbnailItemProps {
  url: string
  pageNumber: number
  documentPageId?: number
  isCurrent: boolean
  onClick: () => void
  withCredentials?: boolean
}

const ThumbnailItem = memo(function ThumbnailItem({
  url,
  pageNumber,
  isCurrent,
  onClick,
  withCredentials,
}: ThumbnailItemProps) {
  const { containerRef, canvasRef, isRendered, dimensions } = usePdfThumbnail({
    url,
    pageNumber,
    width: THUMBNAIL_WIDTH,
    withCredentials,
  })

  return (
    <button
      ref={containerRef as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-1 rounded-md p-1 transition-colors",
        isCurrent
          ? "bg-primary/10 ring-2 ring-primary"
          : "hover:bg-muted",
      )}
    >
      <div
        className="overflow-hidden rounded-sm bg-background shadow-sm"
        style={{
          width: THUMBNAIL_WIDTH,
          height: dimensions.height || THUMBNAIL_WIDTH * 1.414,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: dimensions.width || THUMBNAIL_WIDTH,
            height: dimensions.height || THUMBNAIL_WIDTH * 1.414,
          }}
        />
        {!isRendered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>
      <span className={cn(
        "text-[10px] tabular-nums",
        isCurrent ? "font-semibold text-primary" : "text-muted-foreground",
      )}>
        {pageNumber}
      </span>
    </button>
  )
})

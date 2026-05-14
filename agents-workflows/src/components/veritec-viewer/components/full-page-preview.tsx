import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VeritecViewer } from "../veritec-viewer"
import { ViewerToolbar } from "./viewer-toolbar"
import { ThumbnailSidebar } from "./thumbnail-sidebar"
import type { IViewerDocument } from "../veritec-viewer.types"
import type { IViewerPlugin } from "../plugins/types"

interface FullPagePreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documents: IViewerDocument[]
  plugins: IViewerPlugin[]
  pdfUrl: string | null
  totalPages: number
  currentPage: number
  zoom: number
  onPageChange: (page: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function FullPagePreview({
  open,
  onOpenChange,
  documents,
  plugins,
  pdfUrl,
  totalPages,
  currentPage,
  zoom,
  onPageChange,
  onZoomIn,
  onZoomOut,
}: FullPagePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-[95vw] flex-col gap-0 p-0">
        <DialogHeader className="flex h-12 shrink-0 flex-row items-center justify-between border-b border-border px-4">
          <DialogTitle className="text-base font-semibold">Preview</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1">
          {pdfUrl && (
            <ThumbnailSidebar
              documentUrl={pdfUrl}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageClick={onPageChange}
            />
          )}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <ViewerToolbar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              zoom={zoom}
              onZoomChange={(next) =>
                next > zoom ? onZoomIn() : onZoomOut()
              }
            />

            <div className="min-h-0 flex-1">
              {documents.length > 0 ? (
                <VeritecViewer documents={documents} plugins={plugins} />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

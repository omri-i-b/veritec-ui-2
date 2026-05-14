import { Cursor, Square, Trash } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type AnnotationMode = "pointer" | "rectangle"

export interface IViewerAnnotation {
  id: string
  source?: { type: string }
}

export interface IViewerAnnotationsToolbarProps {
  annotationMode: AnnotationMode
  onAnnotationModeChange: (mode: AnnotationMode) => void
  disabled?: boolean
  selectedAnnotation?: IViewerAnnotation | null
  onDeleteAnnotation?: () => void
}

export function ViewerAnnotationsToolbar({
  annotationMode,
  onAnnotationModeChange,
  disabled = false,
  selectedAnnotation,
  onDeleteAnnotation,
}: IViewerAnnotationsToolbarProps) {
  return (
    <TooltipProvider>
      <div className="inline-flex items-center h-9 bg-card border border-border rounded-md px-2">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7",
                  annotationMode === "pointer" &&
                    "bg-accent text-accent-foreground"
                )}
                onClick={() => onAnnotationModeChange("pointer")}
                disabled={disabled}
              >
                <Cursor />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pointer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-7",
                  annotationMode === "rectangle" &&
                    "bg-accent text-accent-foreground"
                )}
                onClick={() => onAnnotationModeChange("rectangle")}
                disabled={disabled}
              >
                <Square />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rectangle annotation</TooltipContent>
          </Tooltip>
        </div>

        {selectedAnnotation && onDeleteAnnotation && (
          <>
            <Separator orientation="vertical" className="mx-2 h-5" />
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={onDeleteAnnotation}
                    disabled={disabled}
                  >
                    <Trash />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete annotation</TooltipContent>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

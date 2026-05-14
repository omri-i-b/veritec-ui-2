import type { Icon } from "@phosphor-icons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CollapsedRailProps {
  icon: Icon
  label: string
  onExpand: () => void
  side?: "left" | "right"
}

export function CollapsedRail({
  icon: Icon,
  label,
  onExpand,
  side = "left",
}: CollapsedRailProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Expand ${label.toLowerCase()}`}
          className="flex h-full w-full flex-col items-center justify-start gap-2 rounded-xl border border-border bg-background py-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="size-5" />
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={side === "left" ? "right" : "left"}>
        Expand {label.toLowerCase()}
      </TooltipContent>
    </Tooltip>
  )
}

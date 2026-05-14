import { X } from "@phosphor-icons/react"
import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterButtonProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    "variant" | "size" | "ref"
  > {
  active?: boolean
  onClear?: () => void
}

const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ active, onClear, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn(
          active && "border-primary/30 bg-primary/10 text-primary",
          className,
        )}
        {...props}
      >
        {children}
        {active && onClear && (
          <span
            role="button"
            tabIndex={0}
            className="ml-1 inline-flex"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onClear()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation()
                e.preventDefault()
                onClear()
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <X className="size-3" />
          </span>
        )}
      </Button>
    )
  },
)
FilterButton.displayName = "FilterButton"

export type { FilterButtonProps }
export { FilterButton }

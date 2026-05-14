import { Check } from "@phosphor-icons/react"
import { Fragment } from "react"
import { cn } from "@/lib/utils"

export interface StepperStep {
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  current: number
  className?: string
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="list"
      aria-label="Progress"
    >
      {steps.map((step, i) => {
        const complete = i < current
        const active = i === current
        return (
          <Fragment key={step.label}>
            {i > 0 && (
              <div
                className={cn(
                  "h-px flex-1",
                  complete ? "bg-primary" : "bg-border",
                )}
              />
            )}
            <div className="flex items-center gap-2" role="listitem">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  complete &&
                    "border-primary bg-primary text-primary-foreground",
                  active &&
                    !complete &&
                    "border-primary bg-background text-primary",
                  !active &&
                    !complete &&
                    "border-border bg-background text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {complete ? (
                  <Check weight="bold" className="size-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  active || complete
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ToggleSwitchProps {
  id: string
  label: string
  checked: boolean
  disabled?: boolean
  disabledReason?: string
  onChange: (checked: boolean) => void
}

export function ToggleSwitch({
  id,
  label,
  checked,
  disabled,
  disabledReason,
  onChange,
}: ToggleSwitchProps) {
  const control = (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        size="sm"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
    </div>
  )

  if (disabled && disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{control}</span>
        </TooltipTrigger>
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    )
  }

  return control
}

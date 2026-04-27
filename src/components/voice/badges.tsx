import {
  CheckCircle,
  XCircle,
  ArrowUUpLeft,
  Warning,
  Voicemail,
  CalendarCheck,
  CircleNotch,
  PhoneIncoming,
  PhoneOutgoing,
} from "@phosphor-icons/react"
import { type Direction, type Outcome, OUTCOME_LABELS } from "@/lib/voice-data"

const OUTCOME_CONFIG: Record<
  Outcome,
  { icon: typeof CheckCircle; cls: string; weight: "bold" | "fill" }
> = {
  qualified: { icon: CheckCircle, cls: "bg-green-50 text-green-700 border-green-200", weight: "fill" },
  not_qualified: { icon: ArrowUUpLeft, cls: "bg-zinc-100 text-zinc-600 border-zinc-200", weight: "bold" },
  escalated: { icon: Warning, cls: "bg-amber-50 text-amber-700 border-amber-200", weight: "fill" },
  failed: { icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200", weight: "fill" },
  voicemail: { icon: Voicemail, cls: "bg-blue-50 text-blue-700 border-blue-200", weight: "bold" },
  callback_scheduled: { icon: CalendarCheck, cls: "bg-indigo-50 text-indigo-700 border-indigo-200", weight: "bold" },
  in_progress: { icon: CircleNotch, cls: "bg-blue-50 text-blue-700 border-blue-200", weight: "bold" },
}

export function OutcomeBadge({ outcome, className = "" }: { outcome: Outcome; className?: string }) {
  const cfg = OUTCOME_CONFIG[outcome]
  const Icon = cfg.icon
  const spin = outcome === "in_progress"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${cfg.cls} ${className}`}
    >
      <Icon className={`h-3 w-3 ${spin ? "animate-spin" : ""}`} weight={cfg.weight} />
      {OUTCOME_LABELS[outcome]}
    </span>
  )
}

export function DirectionBadge({ direction, compact = false }: { direction: Direction; compact?: boolean }) {
  const Icon = direction === "inbound" ? PhoneIncoming : PhoneOutgoing
  const cls =
    direction === "inbound"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-purple-50 text-purple-700 border-purple-200"
  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center h-5 w-5 rounded-md border ${cls}`}
        title={direction === "inbound" ? "Inbound" : "Outbound"}
      >
        <Icon className="h-3 w-3" weight="bold" />
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <Icon className="h-3 w-3" weight="bold" />
      {direction === "inbound" ? "Inbound" : "Outbound"}
    </span>
  )
}

export function formatDuration(sec: number | null): string {
  if (sec === null) return "—"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function timeAgo(iso: string, nowMs = Date.now()): string {
  if (!iso) return "—"
  const t = new Date(iso).getTime()
  const diff = Math.max(0, nowMs - t)
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

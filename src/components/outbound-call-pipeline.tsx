"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  Pause,
  ArrowsClockwise,
  Lightning,
  CalendarBlank,
  Globe,
  CaretRight,
  PhoneOutgoing,
  CircleNotch,
  Voicemail,
} from "@phosphor-icons/react"
import {
  getOutboundInFlight,
  getOutboundPending,
  getOutboundRecent,
  type VoiceCall,
} from "@/lib/voice-data"
import { OutcomeBadge, formatDuration, timeAgo } from "@/components/voice/badges"

export function OutboundCallPipeline() {
  const router = useRouter()
  const [, setTick] = useState(0)

  // 5-second poll — in production this would be SSE on real outbound state.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  // 1-second tick for live duration on in-flight rows
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const pending = getOutboundPending()
  const inFlight = getOutboundInFlight()
  const recent = getOutboundRecent()
  const succeededToday = recent.filter((c) => c.outcome === "qualified" || c.outcome === "callback_scheduled").length
  const failedToday = recent.filter((c) => c.outcome === "failed").length
  const escalatedToday = recent.filter((c) => c.outcome === "escalated").length

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      {/* Tiles */}
      <div className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <Tile icon={Clock} label="Pending" value={pending.length} tone="zinc" />
        <Tile icon={CircleNotch} label="In flight" value={inFlight.length} tone="blue" spin />
        <Tile icon={CheckCircle} label="Succeeded today" value={succeededToday} tone="green" />
        <Tile icon={XCircle} label="Failed today" value={failedToday} tone="red" />
        <Tile icon={Warning} label="Escalated today" value={escalatedToday} tone="amber" />
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4 space-y-4">
        {/* Pending */}
        <Section title="Pending" subtitle="Outbound calls scheduled to fire">
          {pending.length === 0 ? (
            <Empty />
          ) : (
            <div className="divide-y divide-gray-100">
              {pending.map((c) => (
                <PendingRow key={c.id} call={c} onOpen={() => router.push(`/voice/calls/${c.id}`)} />
              ))}
            </div>
          )}
        </Section>

        {/* In flight */}
        <Section title="In flight" subtitle="Calls currently happening">
          {inFlight.length === 0 ? (
            <Empty />
          ) : (
            <div className="divide-y divide-gray-100">
              {inFlight.map((c) => (
                <InFlightRow key={c.id} call={c} onOpen={() => router.push(`/voice/calls/${c.id}`)} />
              ))}
            </div>
          )}
        </Section>

        {/* Recent */}
        <Section title="Recent" subtitle="Completed in the last 24 hours">
          {recent.length === 0 ? (
            <Empty />
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((c) => (
                <RecentRow key={c.id} call={c} onOpen={() => router.push(`/voice/calls/${c.id}`)} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
  tone,
  spin = false,
}: {
  icon: typeof Clock
  label: string
  value: number
  tone: "blue" | "green" | "red" | "amber" | "zinc"
  spin?: boolean
}) {
  const cls = {
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    green: "text-green-700 bg-green-50 border-green-200",
    red: "text-red-700 bg-red-50 border-red-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    zinc: "text-zinc-700 bg-zinc-100 border-zinc-200",
  }[tone]
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`flex items-center justify-center h-7 w-7 rounded-md border ${cls}`}>
          <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} weight="bold" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold text-zinc-900 tabular-nums">{value}</div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <span className="text-[11px] text-zinc-500">{subtitle}</span>
        </div>
      </header>
      {children}
    </section>
  )
}

function Empty() {
  return <div className="px-4 py-6 text-center text-xs text-zinc-400">Nothing here.</div>
}

function PendingRow({ call, onOpen }: { call: VoiceCall; onOpen: () => void }) {
  const trigger = call.triggerSource
  const TriggerIcon = trigger?.kind === "web-form" ? Globe : trigger?.kind === "workflow-cadence" ? CalendarBlank : Lightning
  const scheduledIn = call.scheduledFor
    ? Math.max(0, Math.floor((new Date(call.scheduledFor).getTime() - Date.now()) / 1000))
    : null

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 group">
      <span className="flex items-center justify-center h-7 w-7 rounded-md bg-zinc-100 shrink-0">
        <Clock className="h-3.5 w-3.5 text-zinc-600" weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-zinc-900 truncate">{call.linkedEntity.label}</span>
          <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600">
            {call.agentName}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500">
          {trigger && (
            <span className="inline-flex items-center gap-1">
              <TriggerIcon className="h-3 w-3" weight="bold" />
              {trigger.label}
            </span>
          )}
          {call.callerPhone && (
            <span className="font-mono tabular-nums">{call.callerPhone}</span>
          )}
          {call.retryCount > 0 && (
            <span className="text-amber-700">Retry {call.retryCount}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-blue-800 tabular-nums">
          {scheduledIn !== null && scheduledIn < 120 ? (
            <span>Firing in {scheduledIn}s…</span>
          ) : (
            <span>{call.scheduledFor ? new Date(call.scheduledFor).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
          )}
        </div>
        <div className="text-[10px] text-zinc-400 uppercase tracking-wide">scheduled</div>
      </div>
      <RowActions onOpen={onOpen}>
        <RowAction icon={Lightning} label="Force now" />
        <RowAction icon={ArrowsClockwise} label="Reschedule" />
        <RowAction icon={Pause} label="Pause" />
        <RowAction icon={XCircle} label="Cancel" tone="danger" />
      </RowActions>
    </div>
  )
}

function InFlightRow({ call, onOpen }: { call: VoiceCall; onOpen: () => void }) {
  const liveSec = call.startedAt
    ? Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
    : 0
  return (
    <div
      onClick={onOpen}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer group"
    >
      <span className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 shrink-0">
        <PhoneOutgoing className="h-3.5 w-3.5 text-blue-700" weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-zinc-900 truncate">{call.linkedEntity.label}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 px-1.5 py-0 text-[10px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500">
          <span>{call.agentName}</span>
          {call.callerPhone && <span className="font-mono tabular-nums">{call.callerPhone}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-blue-800 tabular-nums">
          {formatDuration(liveSec)}
        </div>
        <div className="text-[10px] text-zinc-400 uppercase tracking-wide">duration</div>
      </div>
      <CaretRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
    </div>
  )
}

function RecentRow({ call, onOpen }: { call: VoiceCall; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer group"
    >
      <span className="flex items-center justify-center h-7 w-7 rounded-md bg-gray-100 shrink-0">
        <RecentOutcomeIcon outcome={call.outcome} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-zinc-900 truncate">{call.linkedEntity.label}</span>
          <OutcomeBadge outcome={call.outcome} />
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500">
          <span>{call.agentName}</span>
          {call.callerPhone && <span className="font-mono tabular-nums">{call.callerPhone}</span>}
          {call.outcomeReason && (
            <span className="truncate max-w-[420px] italic">{call.outcomeReason}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 mr-2">
        <div className="text-xs text-zinc-600 tabular-nums">{formatDuration(call.durationSec)}</div>
        <div className="text-[10px] text-zinc-400">{timeAgo(call.startedAt)}</div>
      </div>
      <CaretRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
    </div>
  )
}

function RecentOutcomeIcon({ outcome }: { outcome: VoiceCall["outcome"] }) {
  const map = {
    qualified: { Icon: CheckCircle, cls: "text-green-700" },
    callback_scheduled: { Icon: CheckCircle, cls: "text-green-700" },
    not_qualified: { Icon: XCircle, cls: "text-zinc-500" },
    escalated: { Icon: Warning, cls: "text-amber-700" },
    failed: { Icon: XCircle, cls: "text-red-700" },
    voicemail: { Icon: Voicemail, cls: "text-blue-700" },
    in_progress: { Icon: CircleNotch, cls: "text-blue-700" },
  }[outcome]
  const Icon = map.Icon
  return <Icon className={`h-3.5 w-3.5 ${map.cls}`} weight="fill" />
}

function RowActions({ onOpen, children }: { onOpen: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      {children}
      <button
        onClick={onOpen}
        className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
        title="Open detail"
      >
        <CaretRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function RowAction({
  icon: Icon,
  label,
  tone = "default",
}: {
  icon: typeof Clock
  label: string
  tone?: "default" | "danger"
}) {
  const cls =
    tone === "danger"
      ? "hover:bg-red-50 text-red-600"
      : "hover:bg-gray-100 text-zinc-600"
  return (
    <button
      title={label}
      className={`flex items-center justify-center h-7 w-7 rounded-md transition-colors ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" weight="bold" />
    </button>
  )
}

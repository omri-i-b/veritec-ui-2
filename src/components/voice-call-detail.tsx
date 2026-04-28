"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowSquareOut,
  CaretRight,
  CheckCircle,
  Warning,
  ArrowsClockwise,
  ChatText,
  PencilSimple,
  PhoneCall,
  Clock,
  SuitcaseSimple,
  CaretDown,
  CaretUp,
  Lightning,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { type ExtractedField, type VoiceCall } from "@/lib/voice-data"
import { TranscriptView } from "@/components/voice/transcript-view"
import { ExtractedFieldsPanel } from "@/components/voice/extracted-fields-panel"
import { RecordingPlayer } from "@/components/voice/recording-player"
import { DirectionBadge, OutcomeBadge, formatDuration, timeAgo } from "@/components/voice/badges"

export function VoiceCallDetail({
  call: initial,
  variant = "page",
  backHref = "/voice",
  onClose,
}: {
  call: VoiceCall
  variant?: "page" | "sheet"
  backHref?: string
  onClose?: () => void
}) {
  const [call, setCall] = useState(initial)
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null)
  const [scrubToMs, setScrubToMs] = useState<number | null>(null)
  const [systemEventsOpen, setSystemEventsOpen] = useState(false)

  const handleTurnClick = (turnId: string, startMs: number) => {
    setActiveTurnId(turnId)
    setScrubToMs(startMs)
  }

  const handleFieldEdit = (key: string, newValue: string) => {
    setCall((c) => ({
      ...c,
      fields: c.fields.map((f) =>
        f.key === key
          ? {
              ...f,
              value: newValue,
              edited: { by: "John Lawyer", at: new Date().toISOString() },
            }
          : f
      ),
    }))
  }

  return (
    <div className={`flex flex-col flex-1 min-h-0 bg-gray-50 ${variant === "sheet" ? "w-full" : ""}`}>
      {/* Header strip */}
      <header className="flex h-12 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 shrink-0">
        {variant === "page" ? (
          <Link
            href={backHref}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" weight="bold" />
          </Link>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" weight="bold" />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          <CaretRight className="h-3 w-3 text-zinc-300" weight="bold" />
          <span>Voice</span>
        </div>
        <span className="text-zinc-300">/</span>
        <div className="flex items-center gap-1.5">
          <PhoneCall className="h-3.5 w-3.5 text-zinc-500" weight="bold" />
          <span className="text-sm font-semibold text-zinc-900 truncate max-w-[260px]">
            {call.agentName}
          </span>
        </div>
        <DirectionBadge direction={call.direction} />
        <OutcomeBadge outcome={call.outcome} />
        <div className="flex-1" />
        <span className="text-xs text-zinc-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(call.durationSec)} · {timeAgo(call.startedAt)}
        </span>
      </header>

      {/* Linked entity strip */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Linked
        </span>
        <Link
          href={`/${call.linkedEntity.type === "Case" ? "cases" : "intake"}/${call.linkedEntity.id}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-800 px-2 py-0.5 text-xs font-medium hover:bg-blue-100 transition-colors"
        >
          <SuitcaseSimple className="h-3 w-3" weight="bold" />
          {call.linkedEntity.type} · {call.linkedEntity.id}
          <span className="text-blue-700/70 ml-0.5">— {call.linkedEntity.label}</span>
        </Link>
        {call.workflowInstanceId && (
          <Link
            href={`/workflows/${call.workflowInstanceId}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-800 transition-colors"
          >
            <Lightning className="h-3 w-3" weight="bold" />
            Workflow {call.workflowInstanceId}
            {call.workflowStepId && <span className="text-zinc-400">· {call.workflowStepId}</span>}
          </Link>
        )}
        {call.callerPhone && (
          <span className="ml-auto text-xs text-zinc-500 font-mono tabular-nums">
            {call.callerPhone}
          </span>
        )}
      </div>

      {/* Outcome reason banner */}
      {call.outcomeReason && (
        <div className="flex items-start gap-2 px-4 py-2 border-b border-gray-200 bg-amber-50/50 shrink-0">
          <Warning className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" weight="fill" />
          <span className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Outcome reason —</span> {call.outcomeReason}
          </span>
        </div>
      )}

      {/* Body — Results primary; Transcript & recording secondary tab */}
      <BodyTabs
        call={call}
        activeTurnId={activeTurnId}
        onTurnClick={handleTurnClick}
        onFieldEdit={handleFieldEdit}
        scrubToMs={scrubToMs}
      />

      {/* System events (collapsible) */}
      {call.systemEvents && call.systemEvents.length > 0 && (
        <div className="border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setSystemEventsOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
          >
            {systemEventsOpen ? (
              <CaretUp className="h-3 w-3 text-zinc-500" weight="bold" />
            ) : (
              <CaretDown className="h-3 w-3 text-zinc-500" weight="bold" />
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              System events
            </span>
            <span className="text-[11px] text-zinc-400">
              · {call.systemEvents.length}
            </span>
          </button>
          {systemEventsOpen && (
            <ul className="px-4 pb-3 space-y-1">
              {call.systemEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-2 text-xs text-zinc-700"
                >
                  <span className="w-32 text-zinc-400 font-mono tabular-nums shrink-0">
                    {new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <SystemEventDot kind={e.kind} />
                  <span className="text-zinc-500 uppercase tracking-wide text-[10px] font-semibold w-20 shrink-0">
                    {e.kind}
                  </span>
                  <span className="text-zinc-700">{e.note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-gray-200 bg-white shrink-0">
        <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
          <CheckCircle className="h-3.5 w-3.5" weight="fill" />
          Accept outcome
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          <PencilSimple className="h-3.5 w-3.5" />
          Override outcome
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          <ArrowsClockwise className="h-3.5 w-3.5" />
          Re-run
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50">
          <Warning className="h-3.5 w-3.5" weight="fill" />
          Escalate to human
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          <ChatText className="h-3.5 w-3.5" />
          Add note
        </Button>
      </div>
    </div>
  )
}

// ── Body tabs: Results | Transcript & recording ──────────────────────

function BodyTabs({
  call,
  activeTurnId,
  onTurnClick,
  onFieldEdit,
  scrubToMs,
}: {
  call: VoiceCall
  activeTurnId: string | null
  onTurnClick: (turnId: string, startMs: number) => void
  onFieldEdit: (key: string, value: string) => void
  scrubToMs: number | null
}) {
  const [tab, setTab] = useState<"results" | "evidence">("results")
  return (
    <div className="flex flex-1 min-h-0 flex-col bg-white">
      <nav className="flex items-center gap-0 border-b border-gray-200 bg-white px-4 shrink-0">
        <Tab
          active={tab === "results"}
          onClick={() => setTab("results")}
          icon={<ArrowSquareOut className="h-3.5 w-3.5" weight="bold" />}
          label="Results"
          count={call.fields.length}
        />
        <Tab
          active={tab === "evidence"}
          onClick={() => setTab("evidence")}
          icon={<ChatText className="h-3.5 w-3.5" weight="bold" />}
          label="Transcript & recording"
          count={call.transcript.length}
        />
        <div className="flex-1" />
        {tab === "results" && (
          <button
            onClick={() => setTab("evidence")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-blue-800 transition-colors"
          >
            Verify against transcript
            <CaretRight className="h-3 w-3" weight="bold" />
          </button>
        )}
      </nav>

      {tab === "results" ? (
        <div className="flex-1 min-h-0 overflow-auto bg-gray-50">
          <div className="max-w-[1100px] mx-auto p-5">
            <ResultsView
              call={call}
              onJumpToTurn={(turnId) => {
                const t = call.transcript.find((x) => x.id === turnId)
                if (t) {
                  onTurnClick(turnId, t.startMs)
                  setTab("evidence")
                }
              }}
              onFieldEdit={onFieldEdit}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <TranscriptView
              turns={call.transcript}
              activeTurnId={activeTurnId}
              onTurnClick={(t) => onTurnClick(t.id, t.startMs)}
            />
          </div>
          {call.recordingUrl && call.durationSec && (
            <RecordingPlayer durationSec={call.durationSec} scrubToMs={scrubToMs} />
          )}
        </div>
      )}
    </div>
  )
}

function Tab({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
        active ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
      {typeof count === "number" && count > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0 rounded-full font-semibold tabular-nums ${
            active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
          }`}
        >
          {count}
        </span>
      )}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
    </button>
  )
}

// ── Results view (the primary surface) ────────────────────────────────

function ResultsView({
  call,
  onJumpToTurn,
  onFieldEdit,
}: {
  call: VoiceCall
  onJumpToTurn: (turnId: string) => void
  onFieldEdit: (key: string, value: string) => void
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
        Extracted by the agent
      </div>
      <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
        <ExtractedFieldsPanel
          fields={call.fields}
          onJumpToTurn={onJumpToTurn}
          onFieldEdit={onFieldEdit}
        />
      </div>
    </div>
  )
}

function SystemEventDot({ kind }: { kind: NonNullable<VoiceCall["systemEvents"]>[number]["kind"] }) {
  const cls = {
    started: "bg-blue-500",
    retried: "bg-amber-500",
    escalated: "bg-amber-500",
    errored: "bg-red-500",
    ended: "bg-zinc-400",
  }[kind]
  return <span className={`h-1.5 w-1.5 rounded-full ${cls} shrink-0`} />
}

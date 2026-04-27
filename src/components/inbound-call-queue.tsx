"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PhoneIncoming,
  Headphones,
  HandWaving,
  Warning,
  CaretRight,
} from "@phosphor-icons/react"
import { getInboundLive, type VoiceCall } from "@/lib/voice-data"
import { formatDuration } from "@/components/voice/badges"

const STATE_LABELS: Record<string, { label: string; cls: string }> = {
  ringing: { label: "Ringing", cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  qualifying: { label: "Qualifying", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  wrapping: { label: "Wrapping up", cls: "bg-green-50 text-green-700 border-green-200" },
  handed_off: { label: "Handed off", cls: "bg-purple-50 text-purple-700 border-purple-200" },
}

function inferState(call: VoiceCall): keyof typeof STATE_LABELS {
  // Mocked state inference based on transcript progress
  if (call.transcript.length === 0) return "ringing"
  if (call.transcript.length < 3) return "ringing"
  if (call.transcript.length < 6) return "qualifying"
  if (call.fields.find((f) => f.key === "consult_scheduled")) return "wrapping"
  return "qualifying"
}

export function InboundCallQueue() {
  const router = useRouter()
  const [, setTick] = useState(0)
  const live = getInboundLive()

  // 1-second tick for live duration
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-900">{live.length} live</span>
        </div>
        <span className="text-[11px] text-zinc-500">
          · inbound calls being routed to a voice agent right now
        </span>
        <div className="flex-1" />
        <span className="text-[11px] text-zinc-400">
          Auto-updating · only non-PHI summary fields shown here
        </span>
      </header>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {live.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
            <PhoneIncoming className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">No live calls</h3>
            <p className="text-xs text-zinc-500">
              When someone calls the firm&rsquo;s number, the inbound voice agent picks up and
              you&rsquo;ll see the live conversation here.
            </p>
          </div>
        ) : (
          <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
            <div className="divide-y divide-gray-100">
              {live.map((call) => (
                <LiveRow
                  key={call.id}
                  call={call}
                  onOpen={() => router.push(`/voice/calls/${call.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LiveRow({ call, onOpen }: { call: VoiceCall; onOpen: () => void }) {
  const liveSec = call.startedAt
    ? Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000)
    : 0
  const state = inferState(call)
  const stateCfg = STATE_LABELS[state]

  // Latest non-PHI snippet — the agent or caller's most recent line, only safe to surface here
  const latestTurn = call.transcript[call.transcript.length - 1]
  const safeSnippet =
    latestTurn && !looksLikePhi(latestTurn.text)
      ? `${latestTurn.speaker === "agent" ? "Agent" : "Caller"}: ${latestTurn.text}`
      : null

  return (
    <div className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 group">
      <span className="flex items-center justify-center h-9 w-9 rounded-md bg-blue-50 shrink-0">
        <PhoneIncoming className="h-4 w-4 text-blue-700" weight="bold" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 font-mono tabular-nums">
            {call.callerPhone ?? "Unknown"}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${stateCfg.cls}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {stateCfg.label}
          </span>
          <span className="text-[11px] text-zinc-500">
            on <span className="font-medium text-zinc-700">{call.agentName}</span>
          </span>
        </div>
        {safeSnippet && (
          <div className="text-[11px] text-zinc-500 italic mt-0.5 truncate">
            “{safeSnippet}”
          </div>
        )}
      </div>

      {/* Live duration */}
      <div className="text-right shrink-0 mr-2">
        <div className="text-base font-semibold text-blue-800 tabular-nums">
          {formatDuration(liveSec)}
        </div>
        <div className="text-[10px] text-zinc-400 uppercase tracking-wide">duration</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-800 transition-colors"
          title="Listen in silently"
        >
          <Headphones className="h-3.5 w-3.5" weight="bold" />
          Listen
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          title="Escalate to human"
        >
          <Warning className="h-3.5 w-3.5" weight="fill" />
          Escalate
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-800 text-white px-2.5 py-1 text-xs font-semibold hover:bg-blue-900 transition-colors"
          title="Take this call over from the agent"
        >
          <HandWaving className="h-3.5 w-3.5" weight="bold" />
          Take over
        </button>
        <button
          onClick={onOpen}
          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
          title="Open detail"
        >
          <CaretRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// Coarse PHI heuristic for the live snippet — production would gate by labeled fields.
// Safe to show generic phrases ("hi", "I got hurt at work"), hide content that mentions
// medical specifics or full names.
function looksLikePhi(text: string): boolean {
  return /diagnosis|prescription|HIV|cancer|surgery|SSN|social security/i.test(text)
}

"use client"

import { useMemo, useState } from "react"
import { MagnifyingGlass, Translate } from "@phosphor-icons/react"
import type { TranscriptTurn } from "@/lib/voice-data"
import { formatDuration } from "./badges"

export function TranscriptView({
  turns,
  activeTurnId,
  onTurnClick,
}: {
  turns: TranscriptTurn[]
  activeTurnId?: string | null
  onTurnClick?: (turn: TranscriptTurn) => void
}) {
  const [query, setQuery] = useState("")
  const [showGloss, setShowGloss] = useState(true)

  const filtered = useMemo(() => {
    if (!query.trim()) return turns
    const q = query.toLowerCase()
    return turns.filter(
      (t) => t.text.toLowerCase().includes(q) || (t.gloss ?? "").toLowerCase().includes(q)
    )
  }, [turns, query])

  const hasNonEnglish = turns.some((t) => t.lang && t.lang !== "en")

  if (turns.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-xs text-zinc-500">
        Transcript not yet available — call has not started or is being processed.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50/60 shrink-0">
        <div className="relative flex-1 max-w-[280px]">
          <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript…"
            className="w-full h-7 pl-7 pr-2 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {hasNonEnglish && (
          <button
            onClick={() => setShowGloss((s) => !s)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
              showGloss
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300"
            }`}
          >
            <Translate className="h-3 w-3" weight="bold" />
            EN gloss
          </button>
        )}
        <span className="text-[11px] text-zinc-500 tabular-nums ml-auto">
          {filtered.length} / {turns.length} turns
        </span>
      </div>

      {/* Turns */}
      <div className="flex-1 min-h-0 overflow-auto px-3 py-3 space-y-2">
        {filtered.map((turn) => {
          const isAgent = turn.speaker === "agent"
          const isActive = activeTurnId === turn.id
          return (
            <button
              key={turn.id}
              onClick={() => onTurnClick?.(turn)}
              className={`w-full flex gap-3 p-2 rounded-md text-left transition-colors group ${
                isActive
                  ? "bg-blue-50 ring-1 ring-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* Timestamp + speaker */}
              <div className="shrink-0 w-14 text-right">
                <div className="text-[10px] font-mono text-zinc-400 tabular-nums">
                  {formatDuration(Math.floor(turn.startMs / 1000))}
                </div>
                <div
                  className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${
                    isAgent ? "text-blue-700" : "text-zinc-700"
                  }`}
                >
                  {isAgent ? "Agent" : "Caller"}
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm leading-relaxed ${
                    isAgent ? "text-zinc-800" : "text-zinc-900"
                  }`}
                >
                  {turn.lang && turn.lang !== "en" && (
                    <span className="inline-flex items-center rounded bg-amber-100 text-amber-800 px-1 py-0 text-[9px] font-semibold uppercase tracking-wide mr-1.5 align-middle">
                      {turn.lang}
                    </span>
                  )}
                  {highlight(turn.text, query)}
                </div>
                {showGloss && turn.gloss && (
                  <div className="text-[11px] text-zinc-500 italic mt-1 leading-relaxed">
                    {highlight(turn.gloss, query)}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const q = query.toLowerCase()
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-amber-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

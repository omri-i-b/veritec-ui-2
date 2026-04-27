"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  MagnifyingGlass,
  FunnelSimple,
  CheckCircle,
  Circle,
  X,
  CaretDown,
} from "@phosphor-icons/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AGENTS, VOICE_CALLS, type Outcome, type VoiceCall } from "@/lib/voice-data"
import { DirectionBadge, OutcomeBadge, formatDuration, timeAgo } from "@/components/voice/badges"
import { VoiceCallDetail } from "@/components/voice-call-detail"

type Tab = "all" | "inbound" | "outbound" | "escalated" | "needs_review"

const TAB_LABELS: Record<Tab, string> = {
  all: "All",
  inbound: "Inbound",
  outbound: "Outbound",
  escalated: "Escalated",
  needs_review: "Needs review",
}

export function VoiceCallsInbox() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("needs_review")
  const [agentFilter, setAgentFilter] = useState<string | null>(null)
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | null>(null)
  const [query, setQuery] = useState("")
  const [drawerCall, setDrawerCall] = useState<VoiceCall | null>(null)

  const counts = useMemo(() => {
    return {
      all: VOICE_CALLS.length,
      inbound: VOICE_CALLS.filter((c) => c.direction === "inbound").length,
      outbound: VOICE_CALLS.filter((c) => c.direction === "outbound").length,
      escalated: VOICE_CALLS.filter((c) => c.outcome === "escalated").length,
      needs_review: VOICE_CALLS.filter((c) => !c.reviewed && c.outcome !== "in_progress").length,
    }
  }, [])

  const filtered = useMemo(() => {
    let calls = [...VOICE_CALLS]
    // Tab filter
    if (tab === "inbound") calls = calls.filter((c) => c.direction === "inbound")
    if (tab === "outbound") calls = calls.filter((c) => c.direction === "outbound")
    if (tab === "escalated") calls = calls.filter((c) => c.outcome === "escalated")
    if (tab === "needs_review") calls = calls.filter((c) => !c.reviewed && c.outcome !== "in_progress")
    // Field filters
    if (agentFilter) calls = calls.filter((c) => c.agentId === agentFilter)
    if (outcomeFilter) calls = calls.filter((c) => c.outcome === outcomeFilter)
    // Search
    if (query.trim()) {
      const q = query.toLowerCase()
      calls = calls.filter(
        (c) =>
          c.linkedEntity.label.toLowerCase().includes(q) ||
          c.linkedEntity.id.toLowerCase().includes(q) ||
          (c.callerPhone ?? "").toLowerCase().includes(q)
      )
    }
    // Sort: oldest unreviewed first, escalated bumped up
    calls.sort((a, b) => {
      const aPriority = a.outcome === "escalated" ? 0 : a.reviewed ? 2 : 1
      const bPriority = b.outcome === "escalated" ? 0 : b.reviewed ? 2 : 1
      if (aPriority !== bPriority) return aPriority - bPriority
      return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    })
    return calls
  }, [tab, agentFilter, outcomeFilter, query])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 bg-white px-4 shrink-0">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
              tab === t ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {TAB_LABELS[t]}
            <span
              className={`text-[10px] px-1.5 py-0 rounded-full font-semibold tabular-nums ${
                tab === t ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
              }`}
            >
              {counts[t]}
            </span>
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2 shrink-0">
        <div className="relative flex-1 max-w-[320px]">
          <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by case, lead, or phone…"
            className="w-full h-8 pl-8 pr-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <FilterChip
          label="Agent"
          value={agentFilter ? AGENTS[agentFilter]?.name : null}
          onClear={() => setAgentFilter(null)}
          options={Object.values(AGENTS).map((a) => ({ value: a.id, label: a.name }))}
          onSelect={(v) => setAgentFilter(v as string)}
        />
        <FilterChip
          label="Outcome"
          value={outcomeFilter ?? null}
          onClear={() => setOutcomeFilter(null)}
          options={[
            { value: "qualified", label: "Qualified" },
            { value: "not_qualified", label: "Not qualified" },
            { value: "escalated", label: "Escalated" },
            { value: "voicemail", label: "Voicemail" },
            { value: "failed", label: "Failed" },
            { value: "callback_scheduled", label: "Callback scheduled" },
          ]}
          onSelect={(v) => setOutcomeFilter(v as Outcome)}
        />
        <div className="flex-1" />
        <span className="text-xs text-zinc-500">
          {filtered.length} call{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-12" />
              <TableHead className="w-12">Dir</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Linked</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Highlights</TableHead>
              <TableHead className="text-right whitespace-nowrap">Duration</TableHead>
              <TableHead className="whitespace-nowrap">Age</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((call) => (
              <TableRow
                key={call.id}
                onClick={() => setDrawerCall(call)}
                className="group/row cursor-pointer hover:bg-gray-50 border-b border-gray-100"
              >
                <TableCell className="py-2">
                  {call.reviewed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 group-hover/row:text-zinc-400" />
                  )}
                </TableCell>
                <TableCell className="py-2">
                  <DirectionBadge direction={call.direction} compact />
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-sm font-medium text-zinc-800 whitespace-nowrap">
                    {call.agentName}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 text-blue-800 px-1.5 py-0 text-[10px] font-semibold">
                      {call.linkedEntity.type}
                    </span>
                    <span className="text-sm text-zinc-700 truncate max-w-[180px]" title={call.linkedEntity.label}>
                      {call.linkedEntity.label}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <OutcomeBadge outcome={call.outcome} />
                </TableCell>
                <TableCell className="py-2">
                  <Highlights call={call} />
                </TableCell>
                <TableCell className="py-2 text-sm text-zinc-600 tabular-nums text-right whitespace-nowrap">
                  {formatDuration(call.durationSec)}
                </TableCell>
                <TableCell className="py-2 text-sm text-zinc-600 whitespace-nowrap">
                  {timeAgo(call.startedAt)}
                </TableCell>
                <TableCell className="py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/voice/calls/${call.id}`)
                    }}
                    className="opacity-0 group-hover/row:opacity-100 transition-opacity text-[11px] font-medium text-blue-800 hover:underline whitespace-nowrap"
                  >
                    Open page
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-sm text-zinc-500">
                  No calls match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail drawer */}
      {drawerCall && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-zinc-900/15 backdrop-blur-sm"
            onClick={() => setDrawerCall(null)}
          />
          <div className="w-[920px] max-w-[92vw] bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden">
            <VoiceCallDetail
              call={drawerCall}
              variant="sheet"
              onClose={() => setDrawerCall(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Highlights({ call }: { call: VoiceCall }) {
  // Show 1-2 non-PHI fields per row, agent-config-driven (here: name/matter, or first 2 non-PHI)
  const nonPhi = call.fields.filter((f) => !f.phi).slice(0, 2)
  if (nonPhi.length === 0) {
    return <span className="text-xs text-zinc-400 italic">—</span>
  }
  return (
    <div className="flex items-center gap-2 min-w-0">
      {nonPhi.map((f) => (
        <div key={f.key} className="flex items-baseline gap-1 min-w-0">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wide shrink-0">
            {f.label}
          </span>
          <span className="text-xs font-medium text-zinc-800 truncate max-w-[160px]" title={String(f.value ?? "")}>
            {f.value === null ? "—" : String(f.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function FilterChip({
  label,
  value,
  options,
  onSelect,
  onClear,
}: {
  label: string
  value: string | null
  options: { value: string; label: string }[]
  onSelect: (v: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${
          value
            ? "border-blue-300 bg-blue-50 text-blue-800"
            : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300"
        }`}
      >
        <FunnelSimple className="h-3.5 w-3.5" />
        {value ? (
          <>
            <span>{label}:</span>
            <span className="font-semibold">
              {options.find((o) => o.value === value)?.label ?? value}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="ml-1 flex items-center justify-center h-4 w-4 rounded hover:bg-blue-100"
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : (
          <>{label}</>
        )}
        <CaretDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-[220px] rounded-[10px] border border-gray-200 bg-white shadow-lg py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value)
                  setOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 text-sm hover:bg-gray-50 ${
                  value === opt.value ? "bg-blue-50 text-blue-800 font-medium" : "text-zinc-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

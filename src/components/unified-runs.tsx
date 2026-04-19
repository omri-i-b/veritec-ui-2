"use client"

import { useState } from "react"
import {
  MagnifyingGlass,
  FunnelSimple,
  Columns,
  CaretDown,
  CaretRight,
  Plus,
  CheckCircle,
  XCircle,
  CircleNotch,
  Clock,
  SuitcaseSimple,
  Warning,
  DotsThreeVertical,
  Copy,
  ArrowClockwise,
  X,
  FileText,
  Notepad,
  Timer,
  Calculator,
  Scales,
  Gavel,
  PhoneCall,
  UsersThree,
  ChartLineUp,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ── Playbook registry (icon + name lookup) ─────────────────────────────

const PLAYBOOKS: Record<
  string,
  { name: string; icon: typeof FileText; color: string; bg: string }
> = {
  "medical-records-summary": { name: "Medical Records Summary", icon: FileText, color: "text-blue-800", bg: "bg-blue-50" },
  "demand-letter-draft": { name: "Demand Letter Draft", icon: Notepad, color: "text-purple-700", bg: "bg-purple-50" },
  "case-timeline": { name: "Case Timeline", icon: Timer, color: "text-amber-700", bg: "bg-amber-50" },
  "damage-calculator": { name: "Damages Calculator", icon: Calculator, color: "text-emerald-700", bg: "bg-emerald-50" },
  "similar-case-finder": { name: "Similar Case Finder", icon: Scales, color: "text-indigo-700", bg: "bg-indigo-50" },
  "discovery-response": { name: "Discovery Response", icon: Gavel, color: "text-rose-700", bg: "bg-rose-50" },
  "intake-voice": { name: "Voice Intake to Case", icon: PhoneCall, color: "text-sky-700", bg: "bg-sky-50" },
  "witness-list": { name: "Witness List Builder", icon: UsersThree, color: "text-teal-700", bg: "bg-teal-50" },
  "filing-checker": { name: "Filing Compliance", icon: ChartLineUp, color: "text-fuchsia-700", bg: "bg-fuchsia-50" },
}

// ── Types ──────────────────────────────────────────────────────────────

type RunStatus = "success" | "running" | "failed" | "queued"

interface Run {
  id: string
  playbookId: keyof typeof PLAYBOOKS
  status: RunStatus
  case: string
  /** Output preview — structured differently per playbook */
  output: { label: string; value: string; tone?: "neutral" | "warning" | "danger" | "success" }[]
  started: string
  duration: string | null
  triggeredBy: { name: string; initials: string; color: string }
}

// ── Sample data (mixed playbooks) ──────────────────────────────────────

const RUNS: Run[] = [
  {
    id: "run_01HMX",
    playbookId: "medical-records-summary",
    status: "running",
    case: "CVSA-1234",
    output: [{ label: "Progress", value: "Analyzing 42 records..." }],
    started: "12s ago",
    duration: null,
    triggeredBy: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
  },
  {
    id: "run_01HMW",
    playbookId: "medical-records-summary",
    status: "success",
    case: "CVSA-1189",
    output: [
      { label: "Records", value: "47" },
      { label: "Gaps", value: "3", tone: "warning" },
      { label: "Confidence", value: "94%", tone: "success" },
    ],
    started: "4m ago",
    duration: "18.2s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
  },
  {
    id: "run_02DLD",
    playbookId: "demand-letter-draft",
    status: "success",
    case: "CVSA-1189",
    output: [
      { label: "Pages", value: "3" },
      { label: "Claim", value: "$2.4M", tone: "success" },
      { label: "Tone", value: "Firm" },
    ],
    started: "8m ago",
    duration: "42.1s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
  },
  {
    id: "run_03CT",
    playbookId: "case-timeline",
    status: "success",
    case: "2025CI03480",
    output: [
      { label: "Events", value: "128" },
      { label: "Span", value: "18 months" },
      { label: "Key dates", value: "12 flagged", tone: "warning" },
    ],
    started: "15m ago",
    duration: "24.6s",
    triggeredBy: { name: "Bob Chen", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
  },
  {
    id: "run_04IV",
    playbookId: "intake-voice",
    status: "success",
    case: "CVSA-1389",
    output: [
      { label: "Transcript", value: "18 min call" },
      { label: "Case created", value: "CVSA-1389", tone: "success" },
      { label: "Parties", value: "3 identified" },
    ],
    started: "22m ago",
    duration: "3.2s",
    triggeredBy: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
  {
    id: "run_05DC",
    playbookId: "damage-calculator",
    status: "success",
    case: "CVSA-1045",
    output: [
      { label: "Economic", value: "$487K" },
      { label: "Non-economic", value: "$1.2M" },
      { label: "Total", value: "$1.69M", tone: "success" },
    ],
    started: "41m ago",
    duration: "11.4s",
    triggeredBy: { name: "Dylan Park", initials: "DP", color: "bg-amber-100 text-amber-700" },
  },
  {
    id: "run_06FC",
    playbookId: "filing-checker",
    status: "failed",
    case: "DC-24-09558",
    output: [{ label: "Error", value: "PDF parse failure on page 23", tone: "danger" }],
    started: "1h ago",
    duration: "4.1s",
    triggeredBy: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
  },
  {
    id: "run_07MR",
    playbookId: "medical-records-summary",
    status: "success",
    case: "2025CI02115",
    output: [
      { label: "Records", value: "31" },
      { label: "Gaps", value: "5", tone: "danger" },
      { label: "Confidence", value: "87%", tone: "warning" },
    ],
    started: "1h ago",
    duration: "14.6s",
    triggeredBy: { name: "Dylan Park", initials: "DP", color: "bg-amber-100 text-amber-700" },
  },
  {
    id: "run_08SF",
    playbookId: "similar-case-finder",
    status: "success",
    case: "CVSA-0998",
    output: [
      { label: "Matches", value: "14" },
      { label: "Top similarity", value: "92%", tone: "success" },
      { label: "Median settlement", value: "$1.1M" },
    ],
    started: "2h ago",
    duration: "9.3s",
    triggeredBy: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
  {
    id: "run_09DR",
    playbookId: "discovery-response",
    status: "success",
    case: "CVSA-0874",
    output: [
      { label: "Responses", value: "28" },
      { label: "Objections", value: "6", tone: "warning" },
      { label: "Produced", value: "22" },
    ],
    started: "2h ago",
    duration: "17.8s",
    triggeredBy: { name: "Bob Chen", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
  },
  {
    id: "run_10WL",
    playbookId: "witness-list",
    status: "success",
    case: "CVSA-0723",
    output: [
      { label: "Witnesses", value: "17" },
      { label: "Depositions scheduled", value: "4", tone: "success" },
      { label: "Topics", value: "8" },
    ],
    started: "3h ago",
    duration: "8.9s",
    triggeredBy: { name: "John Johnson", initials: "JJ", color: "bg-indigo-100 text-indigo-700" },
  },
  {
    id: "run_11MR",
    playbookId: "medical-records-summary",
    status: "queued",
    case: "CVSA-1276",
    output: [{ label: "Status", value: "Waiting for records upload" }],
    started: "4h ago",
    duration: null,
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
  },
  {
    id: "run_12DL",
    playbookId: "demand-letter-draft",
    status: "success",
    case: "2025CI01899",
    output: [
      { label: "Pages", value: "5" },
      { label: "Claim", value: "$3.8M", tone: "success" },
      { label: "Tone", value: "Aggressive" },
    ],
    started: "5h ago",
    duration: "38.7s",
    triggeredBy: { name: "Dylan Park", initials: "DP", color: "bg-amber-100 text-amber-700" },
  },
  {
    id: "run_13CT",
    playbookId: "case-timeline",
    status: "success",
    case: "DC-24-07722",
    output: [
      { label: "Events", value: "89" },
      { label: "Span", value: "11 months" },
      { label: "Key dates", value: "8 flagged" },
    ],
    started: "Yesterday",
    duration: "19.2s",
    triggeredBy: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
  },
  {
    id: "run_14MR",
    playbookId: "medical-records-summary",
    status: "failed",
    case: "CVSA-0542",
    output: [{ label: "Error", value: "LLM timeout", tone: "danger" }],
    started: "Yesterday",
    duration: "30.0s",
    triggeredBy: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
]

// ── Status Pill ────────────────────────────────────────────────────────

function StatusPill({ status }: { status: RunStatus }) {
  const config = {
    success: { icon: CheckCircle, cls: "bg-green-50 text-green-700 border-green-200", label: "Success", weight: "fill" as const },
    running: { icon: CircleNotch, cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Running", weight: "bold" as const, spin: true },
    failed: { icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200", label: "Failed", weight: "fill" as const },
    queued: { icon: Clock, cls: "bg-gray-50 text-zinc-600 border-gray-200", label: "Queued", weight: "bold" as const },
  }[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.cls}`}>
      <Icon className={`h-3 w-3 ${"spin" in config && config.spin ? "animate-spin" : ""}`} weight={config.weight} />
      {config.label}
    </span>
  )
}

// ── Playbook cell ──────────────────────────────────────────────────────

function PlaybookCell({ playbookId }: { playbookId: keyof typeof PLAYBOOKS }) {
  const p = PLAYBOOKS[playbookId]
  const Icon = p.icon
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={`flex items-center justify-center h-5 w-5 rounded ${p.bg} shrink-0`}>
        <Icon className={`h-3 w-3 ${p.color}`} />
      </div>
      <span className="text-sm font-medium text-zinc-800 whitespace-nowrap">{p.name}</span>
    </div>
  )
}

// ── Output preview (renders per-playbook) ──────────────────────────────

function OutputPreview({ output }: { output: Run["output"] }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      {output.map((field, i) => {
        const toneClass = {
          neutral: "text-zinc-700",
          success: "text-green-700",
          warning: "text-amber-700",
          danger: "text-red-700",
        }[field.tone ?? "neutral"]
        return (
          <div key={i} className="flex items-baseline gap-1 min-w-0">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wide shrink-0">{field.label}</span>
            <span className={`text-sm font-medium tabular-nums whitespace-nowrap ${toneClass}`}>{field.value}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-semibold ${color}`}>
      {initials}
    </div>
  )
}

// ── Playbook filter dropdown ───────────────────────────────────────────

function PlaybookFilter({
  value,
  onChange,
}: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? PLAYBOOKS[value as keyof typeof PLAYBOOKS] : null
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${
          selected
            ? "border-blue-300 bg-blue-50 text-blue-800"
            : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300"
        }`}
      >
        <FunnelSimple className="h-3.5 w-3.5" />
        {selected ? (
          <>
            <span>Playbook:</span>
            <span className="font-semibold">{selected.name}</span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              className="ml-1 flex items-center justify-center h-4 w-4 rounded hover:bg-blue-100"
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : (
          <>All playbooks</>
        )}
        <CaretDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-[260px] rounded-[10px] border border-gray-200 bg-white shadow-lg py-1 max-h-[320px] overflow-auto">
            <button
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 ${
                !value ? "bg-blue-50 text-blue-800 font-medium" : "text-zinc-700"
              }`}
            >
              <span className="w-5" />
              All playbooks
            </button>
            <div className="h-px bg-gray-100 my-1" />
            {Object.entries(PLAYBOOKS).map(([id, p]) => {
              const Icon = p.icon
              return (
                <button
                  key={id}
                  onClick={() => {
                    onChange(id)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 ${
                    value === id ? "bg-blue-50 text-blue-800 font-medium" : "text-zinc-700"
                  }`}
                >
                  <div className={`flex items-center justify-center h-5 w-5 rounded ${p.bg} shrink-0`}>
                    <Icon className={`h-3 w-3 ${p.color}`} />
                  </div>
                  <span className="text-left flex-1">{p.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────

export function UnifiedRuns({ initialPlaybookFilter }: { initialPlaybookFilter?: string | null }) {
  const [playbookFilter, setPlaybookFilter] = useState<string | null>(initialPlaybookFilter ?? null)
  const [query, setQuery] = useState("")

  const filtered = RUNS.filter((r) => {
    if (playbookFilter && r.playbookId !== playbookFilter) return false
    if (query) {
      const q = query.toLowerCase()
      if (!r.case.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by case, run ID..."
            className="w-full h-8 pl-9 pr-3 text-sm rounded-[10px] border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <PlaybookFilter value={playbookFilter} onChange={setPlaybookFilter} />

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          <FunnelSimple className="h-3.5 w-3.5" />
          More filters
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          <Columns className="h-3.5 w-3.5" />
          Columns
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          Last 24 hours
          <CaretDown className="h-3 w-3" />
        </Button>
        <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
          <Plus className="h-3.5 w-3.5" />
          New run
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Playbook</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Case</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide min-w-[380px]">Output</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Started</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Duration</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Triggered by</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((run) => (
              <TableRow
                key={run.id}
                className="group/row cursor-pointer hover:bg-gray-50 border-b border-gray-100"
              >
                <TableCell className="py-2">
                  <CaretRight className="h-3.5 w-3.5 text-zinc-300 group-hover/row:text-zinc-500 transition-colors" />
                </TableCell>
                <TableCell className="py-2">
                  <StatusPill status={run.status} />
                </TableCell>
                <TableCell className="py-2">
                  <PlaybookCell playbookId={run.playbookId} />
                </TableCell>
                <TableCell className="py-2">
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 rounded-md px-1.5 py-0.5 text-xs font-medium">
                    <SuitcaseSimple className="h-3 w-3" weight="bold" />
                    {run.case}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <OutputPreview output={run.output} />
                </TableCell>
                <TableCell className="py-2 text-sm text-zinc-600 whitespace-nowrap">{run.started}</TableCell>
                <TableCell className="py-2 text-sm text-zinc-600 tabular-nums whitespace-nowrap">
                  {run.duration ?? <span className="text-zinc-300">—</span>}
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-1.5">
                    <Avatar initials={run.triggeredBy.initials} color={run.triggeredBy.color} />
                    <span className="text-sm text-zinc-700 whitespace-nowrap">{run.triggeredBy.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
                      title="Copy output"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
                      title="Re-run"
                    >
                      <ArrowClockwise className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
                    >
                      <DotsThreeVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-zinc-500 shrink-0">
        <span>
          Showing <span className="font-medium text-zinc-900">{filtered.length}</span> of{" "}
          <span className="font-medium text-zinc-900">{RUNS.length}</span> runs
          {playbookFilter && (
            <>
              {" "}
              filtered by{" "}
              <span className="font-medium text-zinc-900">{PLAYBOOKS[playbookFilter as keyof typeof PLAYBOOKS].name}</span>
            </>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live · 10s auto-refresh
        </span>
      </div>
    </div>
  )
}

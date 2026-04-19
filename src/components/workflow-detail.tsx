"use client"

import { useState } from "react"
import {
  FlowArrow,
  Play,
  CaretRight,
  MagnifyingGlass,
  FunnelSimple,
  Columns,
  DotsThreeVertical,
  CheckCircle,
  XCircle,
  CircleNotch,
  Clock,
  SuitcaseSimple,
  Warning,
  Copy,
  ArrowClockwise,
  ArrowSquareOut,
  CaretDown,
  Plus,
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
import { DefinitionStrip } from "@/components/workflow-builder"

// ── Types ──────────────────────────────────────────────────────────────

type RunStatus = "success" | "running" | "failed" | "queued"

interface Run {
  id: string
  status: RunStatus
  case: string
  recordsAnalyzed: number | null
  gapsFound: number | null
  summary: string | null
  confidence: number | null
  started: string
  duration: string | null
  triggeredBy: {
    name: string
    initials: string
    color: string
  }
}

// ── Sample Data ────────────────────────────────────────────────────────

const RUNS: Run[] = [
  {
    id: "run_01HMX",
    status: "running",
    case: "CVSA-1234",
    recordsAnalyzed: null,
    gapsFound: null,
    summary: null,
    confidence: null,
    started: "12s ago",
    duration: null,
    triggeredBy: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
  },
  {
    id: "run_01HMW",
    status: "success",
    case: "CVSA-1189",
    recordsAnalyzed: 47,
    gapsFound: 3,
    summary: "Plaintiff received continuous care from 2023-07 to 2024-03 with documented treatment for lumbar strain and cervical injury...",
    confidence: 94,
    started: "4m ago",
    duration: "18.2s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
  },
  {
    id: "run_01HMV",
    status: "success",
    case: "2025CI03480",
    recordsAnalyzed: 62,
    gapsFound: 0,
    summary: "Complete medical documentation from incident date through treatment completion. No gaps in care identified...",
    confidence: 98,
    started: "12m ago",
    duration: "22.7s",
    triggeredBy: { name: "Bob Chen", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
  },
  {
    id: "run_01HMU",
    status: "failed",
    case: "DC-24-09558",
    recordsAnalyzed: null,
    gapsFound: null,
    summary: null,
    confidence: null,
    started: "28m ago",
    duration: "3.1s",
    triggeredBy: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
  },
  {
    id: "run_01HMT",
    status: "success",
    case: "CVSA-1045",
    recordsAnalyzed: 31,
    gapsFound: 5,
    summary: "Significant gaps identified between 2024-01 and 2024-04. Plaintiff missed 3 scheduled PT appointments and has undocumented...",
    confidence: 87,
    started: "1h ago",
    duration: "14.6s",
    triggeredBy: { name: "Dylan Park", initials: "DP", color: "bg-amber-100 text-amber-700" },
  },
  {
    id: "run_01HMS",
    status: "success",
    case: "CVSA-0998",
    recordsAnalyzed: 89,
    gapsFound: 1,
    summary: "Comprehensive records spanning 18 months of treatment. Single documentation gap of 14 days in December 2023...",
    confidence: 96,
    started: "2h ago",
    duration: "31.4s",
    triggeredBy: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
  {
    id: "run_01HMR",
    status: "success",
    case: "2025CI02115",
    recordsAnalyzed: 24,
    gapsFound: 2,
    summary: "Records indicate conservative treatment protocol followed initial injury. Two minor gaps noted in follow-up care...",
    confidence: 91,
    started: "3h ago",
    duration: "11.9s",
    triggeredBy: { name: "John Johnson", initials: "JJ", color: "bg-indigo-100 text-indigo-700" },
  },
  {
    id: "run_01HMQ",
    status: "queued",
    case: "CVSA-1276",
    recordsAnalyzed: null,
    gapsFound: null,
    summary: null,
    confidence: null,
    started: "4h ago",
    duration: null,
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
  },
  {
    id: "run_01HMP",
    status: "success",
    case: "CVSA-0874",
    recordsAnalyzed: 53,
    gapsFound: 0,
    summary: "Well-documented treatment timeline with consistent provider engagement. No gaps or inconsistencies found...",
    confidence: 99,
    started: "5h ago",
    duration: "19.8s",
    triggeredBy: { name: "Bob Chen", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
  },
  {
    id: "run_01HMN",
    status: "success",
    case: "DC-24-07722",
    recordsAnalyzed: 41,
    gapsFound: 7,
    summary: "Significant gaps in medical documentation. Multiple providers with inconsistent record-keeping. Recommends further discovery...",
    confidence: 78,
    started: "7h ago",
    duration: "25.1s",
    triggeredBy: { name: "Dylan Park", initials: "DP", color: "bg-amber-100 text-amber-700" },
  },
  {
    id: "run_01HMM",
    status: "success",
    case: "CVSA-1156",
    recordsAnalyzed: 36,
    gapsFound: 2,
    summary: "Records generally complete. Two brief gaps identified during provider transition in Q2 2024...",
    confidence: 93,
    started: "9h ago",
    duration: "16.3s",
    triggeredBy: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
  },
  {
    id: "run_01HML",
    status: "failed",
    case: "CVSA-0542",
    recordsAnalyzed: null,
    gapsFound: null,
    summary: null,
    confidence: null,
    started: "12h ago",
    duration: "2.4s",
    triggeredBy: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
  {
    id: "run_01HMK",
    status: "success",
    case: "2025CI01899",
    recordsAnalyzed: 71,
    gapsFound: 0,
    summary: "Exemplary documentation across all treating providers. Full continuity of care established...",
    confidence: 97,
    started: "Yesterday",
    duration: "28.9s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
  },
  {
    id: "run_01HMJ",
    status: "success",
    case: "CVSA-0723",
    recordsAnalyzed: 44,
    gapsFound: 4,
    summary: "Mixed documentation quality. Significant gaps between emergency treatment and follow-up care require further review...",
    confidence: 85,
    started: "Yesterday",
    duration: "17.5s",
    triggeredBy: { name: "John Johnson", initials: "JJ", color: "bg-indigo-100 text-indigo-700" },
  },
]

// ── Header ──────────────────────────────────────────────────────────────

function DetailHeader() {
  return (
    <div className="flex h-12 items-center border-b border-gray-200 bg-gray-50 px-4 gap-2">
      <div className="flex items-center gap-2 text-sm flex-1">
        <FlowArrow className="h-4 w-4 text-zinc-500" />
        <span className="text-zinc-500">Workflows</span>
        <span className="text-zinc-400">/</span>
        <span className="font-semibold text-zinc-900">Medical Records Summary</span>
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Published
        </span>
      </div>
      <Button variant="outline" size="sm" className="h-8 gap-1.5">
        <ArrowSquareOut className="h-4 w-4" />
        Share
      </Button>
      <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
        <Play className="h-4 w-4" weight="fill" />
        Run workflow
      </Button>
    </div>
  )
}

// ── Tabs ────────────────────────────────────────────────────────────────

type Tab = "runs" | "builder" | "schedule" | "settings"

function DetailTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "runs", label: "Runs", count: 1847 },
    { id: "builder", label: "Builder" },
    { id: "schedule", label: "Schedule" },
    { id: "settings", label: "Settings" },
  ]
  return (
    <div className="flex items-center border-b border-gray-200 bg-white px-4 gap-0.5">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
              isActive
                ? "text-blue-800 font-semibold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full px-1.5 text-[11px] font-medium ${
                isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
              }`}>
                {tab.count > 999 ? `${(tab.count / 1000).toFixed(1)}k` : tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Status Pill ─────────────────────────────────────────────────────────

function StatusPill({ status }: { status: RunStatus }) {
  const config = {
    success: {
      icon: CheckCircle,
      className: "bg-green-50 text-green-700 border-green-200",
      label: "Success",
      weight: "fill" as const,
    },
    running: {
      icon: CircleNotch,
      className: "bg-blue-50 text-blue-700 border-blue-200",
      label: "Running",
      weight: "bold" as const,
      spin: true,
    },
    failed: {
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
      label: "Failed",
      weight: "fill" as const,
    },
    queued: {
      icon: Clock,
      className: "bg-gray-50 text-zinc-600 border-gray-200",
      label: "Queued",
      weight: "bold" as const,
    },
  }[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.className}`}>
      <Icon className={`h-3 w-3 ${"spin" in config && config.spin ? "animate-spin" : ""}`} weight={config.weight} />
      {config.label}
    </span>
  )
}

// ── Confidence Bar ──────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 95 ? "bg-green-500" : value >= 85 ? "bg-blue-500" : value >= 75 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
        <div className={`absolute inset-y-0 left-0 ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-zinc-600">{value}%</span>
    </div>
  )
}

// ── Avatar ──────────────────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-semibold ${color}`}>
      {initials}
    </div>
  )
}

// ── Runs Toolbar ────────────────────────────────────────────────────────

function RunsToolbar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
      <div className="relative flex-1 max-w-sm">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search runs by case, ID, or content..."
          className="w-full h-8 pl-9 pr-3 text-sm rounded-[10px] border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <FunnelSimple className="h-4 w-4" />
        Filter
        <span className="ml-0.5 inline-flex items-center justify-center h-[16px] min-w-[16px] rounded-full bg-blue-800 px-1 text-[10px] font-medium text-white">2</span>
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <Columns className="h-4 w-4" />
        Columns
      </Button>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        Last 24 hours
        <CaretDown className="h-3 w-3" />
      </Button>
      <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
        <Plus className="h-4 w-4" />
        New run
      </Button>
    </div>
  )
}

// ── Runs Grid ───────────────────────────────────────────────────────────

function RunsGrid({ runs, onSelect }: { runs: Run[]; onSelect: (run: Run) => void }) {
  return (
    <div className="flex-1 overflow-auto bg-white">
      <Table>
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="w-8" />
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Run ID</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Case</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Records</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Gaps</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide min-w-[320px]">Summary</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Confidence</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Started</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Duration</TableHead>
            <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Triggered by</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow
              key={run.id}
              onClick={() => onSelect(run)}
              className="group/row cursor-pointer hover:bg-gray-50 border-b border-gray-100"
            >
              <TableCell className="py-2">
                <CaretRight className="h-3.5 w-3.5 text-zinc-300 group-hover/row:text-zinc-500 transition-colors" />
              </TableCell>
              <TableCell className="py-2">
                <StatusPill status={run.status} />
              </TableCell>
              <TableCell className="py-2 font-mono text-xs text-zinc-600">{run.id}</TableCell>
              <TableCell className="py-2">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 rounded-md px-1.5 py-0.5 text-xs font-medium">
                  <SuitcaseSimple className="h-3 w-3" weight="bold" />
                  {run.case}
                </div>
              </TableCell>
              <TableCell className="py-2 text-right tabular-nums text-sm text-zinc-900">
                {run.recordsAnalyzed ?? <span className="text-zinc-300">—</span>}
              </TableCell>
              <TableCell className="py-2">
                {run.gapsFound === null ? (
                  <span className="text-zinc-300">—</span>
                ) : run.gapsFound === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle className="h-3 w-3" weight="fill" />
                    None
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium ${
                    run.gapsFound >= 5
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    <Warning className="h-3 w-3" weight="fill" />
                    {run.gapsFound}
                  </span>
                )}
              </TableCell>
              <TableCell className="py-2 text-sm text-zinc-700 max-w-[400px]">
                {run.summary ? (
                  <span className="line-clamp-1">{run.summary}</span>
                ) : (
                  <span className="text-zinc-300">—</span>
                )}
              </TableCell>
              <TableCell className="py-2">
                {run.confidence !== null ? (
                  <ConfidenceBar value={run.confidence} />
                ) : (
                  <span className="text-zinc-300">—</span>
                )}
              </TableCell>
              <TableCell className="py-2 text-sm text-zinc-600 whitespace-nowrap">{run.started}</TableCell>
              <TableCell className="py-2 text-sm text-zinc-600 tabular-nums">
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
  )
}

// ── Run Detail Drawer ───────────────────────────────────────────────────

function RunDetailDrawer({ run, onClose }: { run: Run | null; onClose: () => void }) {
  if (!run) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-zinc-900/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-[560px] bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <StatusPill status={run.status} />
            <span className="font-mono text-xs text-zinc-600">{run.id}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900">
            <XCircle className="h-5 w-5" weight="fill" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Inputs</h3>
            <div className="rounded-[10px] border border-gray-200 bg-gray-50 p-3 space-y-2">
              <div className="flex items-start gap-3 text-sm">
                <span className="text-zinc-500 w-20 shrink-0">Case</span>
                <span className="text-zinc-900 font-medium">{run.case}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-zinc-500 w-20 shrink-0">Records</span>
                <span className="text-zinc-900">42 uploaded PDFs</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="text-zinc-500 w-20 shrink-0">Plaintiff</span>
                <span className="text-zinc-900">Jane Doe</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Outputs</h3>
            <div className="rounded-[10px] border border-gray-200 bg-white p-3 space-y-3">
              <div>
                <div className="text-xs text-zinc-500 mb-1">Summary</div>
                <p className="text-sm text-zinc-900 leading-relaxed">{run.summary ?? "—"}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md bg-gray-50 border border-gray-200 p-2">
                  <div className="text-[11px] text-zinc-500">Records</div>
                  <div className="text-lg font-semibold text-zinc-900 tabular-nums">{run.recordsAnalyzed ?? "—"}</div>
                </div>
                <div className="rounded-md bg-gray-50 border border-gray-200 p-2">
                  <div className="text-[11px] text-zinc-500">Gaps</div>
                  <div className="text-lg font-semibold text-zinc-900 tabular-nums">{run.gapsFound ?? "—"}</div>
                </div>
                <div className="rounded-md bg-gray-50 border border-gray-200 p-2">
                  <div className="text-[11px] text-zinc-500">Confidence</div>
                  <div className="text-lg font-semibold text-zinc-900 tabular-nums">{run.confidence ? `${run.confidence}%` : "—"}</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Timeline</h3>
            <div className="rounded-[10px] border border-gray-200 bg-white p-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Started</span>
                <span className="text-zinc-900">{run.started}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Duration</span>
                <span className="text-zinc-900 tabular-nums">{run.duration ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Triggered by</span>
                <div className="flex items-center gap-1.5">
                  <Avatar initials={run.triggeredBy.initials} color={run.triggeredBy.color} />
                  <span className="text-zinc-900">{run.triggeredBy.name}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5">
            <Copy className="h-4 w-4" />
            Copy output
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5">
            <ArrowClockwise className="h-4 w-4" />
            Re-run
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 bg-blue-800 hover:bg-blue-900">
            <ArrowSquareOut className="h-4 w-4" />
            Open
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Page Shell ──────────────────────────────────────────────────────────

export function WorkflowDetail() {
  const [query, setQuery] = useState("")
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)

  const filtered = RUNS.filter((r) => {
    const q = query.toLowerCase()
    if (!q) return true
    return (
      r.case.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.summary?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="flex flex-1 flex-col bg-white min-h-0">
      <DetailHeader />

      {/* Schema strip (read-only preview, Edit definition navigates to /edit) */}
      <DefinitionStrip />

      {/* Runs section — always visible */}
      <div className="flex items-center gap-2 px-4 h-10 bg-gray-50 border-b border-gray-200 shrink-0">
        <span className="text-xs font-semibold text-zinc-700">Runs</span>
        <span className="inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-zinc-600">
          1.8k
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>
      <RunsToolbar query={query} setQuery={setQuery} />
      <RunsGrid runs={filtered} onSelect={setSelectedRun} />
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-zinc-500 shrink-0">
        <span>
          Showing <span className="font-medium text-zinc-900">{filtered.length}</span> of{" "}
          <span className="font-medium text-zinc-900">{RUNS.length}</span> runs
        </span>
        <span>Auto-refresh: <span className="font-medium text-zinc-900">10s</span></span>
      </div>

      <RunDetailDrawer run={selectedRun} onClose={() => setSelectedRun(null)} />
    </div>
  )
}

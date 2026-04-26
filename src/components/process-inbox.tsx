"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChartBar,
  MagnifyingGlass,
  CaretDown,
  CaretRight,
  FunnelSimple,
  Plus,
  SuitcaseSimple,
  Clock,
  WarningCircle,
  Calendar,
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
import { OWNER_KIND, SAMPLE_INBOX, type ProcessRow, type ProcessOwner } from "@/lib/process-data"

function OwnerLine({ owner }: { owner: ProcessOwner }) {
  const cfg = OWNER_KIND[owner.kind]
  const isHuman = owner.kind === "human"
  const Icon = cfg.icon

  if (isHuman && owner.initials && owner.color) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[9px] font-semibold ${owner.color}`}>
          {owner.initials}
        </span>
        <span className="text-sm text-zinc-800 whitespace-nowrap">{owner.name}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center justify-center h-5 w-5 rounded ${cfg.tileBg}`}>
        <Icon className={`h-3 w-3 ${cfg.tileText}`} weight="bold" />
      </span>
      <span className="text-sm text-zinc-800 whitespace-nowrap">{owner.name}</span>
    </span>
  )
}

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "Intake", label: "Intake" },
  { id: "Pre-Litigation", label: "Pre-Litigation" },
  { id: "Litigation", label: "Litigation" },
]

export function ProcessInbox() {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [overdueOnly, setOverdueOnly] = useState(false)

  const filtered = SAMPLE_INBOX.filter((row) => {
    if (typeFilter !== "all" && row.template !== typeFilter) return false
    if (overdueOnly && row.dueTone !== "danger") return false
    if (query) {
      const q = query.toLowerCase()
      return (
        row.entityLabel.toLowerCase().includes(q) ||
        row.entityId.toLowerCase().includes(q) ||
        row.state.toLowerCase().includes(q)
      )
    }
    return true
  })

  const overdueCount = SAMPLE_INBOX.filter((r) => r.dueTone === "danger").length

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Header */}
      <div className="flex h-12 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 shrink-0">
        <ChartBar className="h-4 w-4 text-zinc-500" />
        <h1 className="text-sm font-semibold text-zinc-900">Workflows</h1>
        <span className="text-xs text-zinc-400 ml-1">All running processes you own or watch</span>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          View definitions
        </Button>
        <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
          <Plus className="h-4 w-4" />
          Start workflow
        </Button>
      </div>

      {/* Stats band */}
      <div className="flex items-stretch gap-0 border-b border-gray-200 bg-white shrink-0">
        <Stat label="Active" value={SAMPLE_INBOX.length.toString()} hint="across all types" />
        <Stat label="Yours" value="4" hint="you own next action" />
        <Stat label="Overdue" value={overdueCount.toString()} hint="SLA breached" tone={overdueCount > 0 ? "danger" : "neutral"} />
        <Stat label="Awaiting agents" value="3" hint="agents in flight" />
        <Stat label="Started today" value="2" />
      </div>

      {/* Tabs + filter */}
      <div className="flex items-center border-b border-gray-200 bg-white px-4 gap-0.5 shrink-0">
        {TYPE_TABS.map((t) => {
          const active = typeFilter === t.id
          const count =
            t.id === "all"
              ? SAMPLE_INBOX.length
              : SAMPLE_INBOX.filter((r) => r.template === t.id).length
          return (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
                active ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t.label}
              <span
                className={`inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full px-1.5 text-[11px] font-medium ${
                  active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
                }`}
              >
                {count}
              </span>
              {active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by case, entity, state..."
            className="w-full h-8 pl-9 pr-3 text-sm rounded-[10px] border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            overdueOnly
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300"
          }`}
        >
          <WarningCircle className="h-3.5 w-3.5" weight={overdueOnly ? "fill" : "regular"} />
          Overdue only
          {overdueOnly && <span className="text-[10px]">{overdueCount}</span>}
        </button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          <FunnelSimple className="h-3.5 w-3.5" />
          More filters
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
          Owner: anyone
          <CaretDown className="h-3 w-3" />
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Entity</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Current state</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Owner of next action</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Age</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Due</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Last activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <ProcessRowView key={row.id} row={row} />
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-zinc-500">
                  No workflows match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-zinc-500 shrink-0">
        <span>
          Showing <span className="font-medium text-zinc-900">{filtered.length}</span> of{" "}
          <span className="font-medium text-zinc-900">{SAMPLE_INBOX.length}</span> workflows
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live · 30s auto-refresh
        </span>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string
  value: string
  hint?: string
  tone?: "neutral" | "danger"
}) {
  const valueClass = tone === "danger" ? "text-red-700" : "text-zinc-900"
  return (
    <div className="flex-1 px-4 py-3 border-r border-gray-200 last:border-r-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${valueClass}`}>{value}</div>
      {hint && <div className="text-[11px] text-zinc-500">{hint}</div>}
    </div>
  )
}

function ProcessRowView({ row }: { row: ProcessRow }) {
  return (
    <TableRow className="group/row hover:bg-gray-50 border-b border-gray-100">
      <TableCell className="py-2">
        <Link href={`/workflows/${row.id}`} className="flex items-center justify-center h-6 w-6 rounded hover:bg-gray-100">
          <CaretRight className="h-3.5 w-3.5 text-zinc-300 group-hover/row:text-zinc-500 transition-colors" />
        </Link>
      </TableCell>
      <TableCell className="py-2">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${row.templateColor}`}>
          {row.template}
        </span>
      </TableCell>
      <TableCell className="py-2">
        <Link href={`/workflows/${row.id}`} className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 rounded px-1.5 py-0.5 text-xs font-medium">
            <SuitcaseSimple className="h-3 w-3" weight="bold" />
            {row.entityId}
          </span>
          <span className="text-sm text-zinc-700">{row.entityLabel}</span>
        </Link>
      </TableCell>
      <TableCell className="py-2 text-sm text-zinc-700">{row.state}</TableCell>
      <TableCell className="py-2">
        <OwnerLine owner={row.ownerNext} />
      </TableCell>
      <TableCell className="py-2 text-right text-sm text-zinc-600 tabular-nums whitespace-nowrap">
        {row.age}d
      </TableCell>
      <TableCell className="py-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
            row.dueTone === "danger"
              ? "bg-red-50 text-red-700 border-red-200"
              : row.dueTone === "warning"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : row.dueTone === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-zinc-600 border-gray-200"
          }`}
        >
          {row.dueTone === "danger" ? (
            <WarningCircle className="h-3 w-3" weight="fill" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {row.due}
        </span>
      </TableCell>
      <TableCell className="py-2 text-sm text-zinc-600 whitespace-nowrap">{row.lastActivity}</TableCell>
    </TableRow>
  )
}

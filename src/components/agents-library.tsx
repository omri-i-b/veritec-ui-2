"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PhoneCall,
  Play,
  PencilRuler,
  CaretRight,
  ChartLineUp,
  Clock,
  X,
  Stack,
  CursorClick,
  PhoneIncoming,
  Plug,
  Globe,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { PLAYBOOK_DEFS, isAlwaysOnTrigger, type Field, type PlaybookDef } from "@/lib/playbook-data"
import { UnifiedRuns } from "@/components/unified-runs"

/** An "agent" is a playbook that contains at least one voice step.
 *  (Future: also email-out, sms-out, e-file steps.) */
function isAgent(p: PlaybookDef): boolean {
  return p.steps.some((s) => s.type === "voice")
}

const AGENT_PLAYBOOK_IDS = Object.values(PLAYBOOK_DEFS).filter(isAgent).map((p) => p.id)

/** Surface the dial / external-action input for the card. */
function getOutsideContact(p: PlaybookDef): string | null {
  const phoneInput = p.inputs.find((i) => i.type === "phone")
  return phoneInput?.name ?? null
}

type Tab = "library" | "runs"

export function AgentsLibrary({ initialTab = "library" }: { initialTab?: Tab } = {}) {
  const agents = useMemo(
    () => Object.values(PLAYBOOK_DEFS).filter(isAgent),
    []
  )
  const [tab, setTab] = useState<Tab>(initialTab)
  const [runDrawerFor, setRunDrawerFor] = useState<PlaybookDef | null>(null)

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5 shrink-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-zinc-900 mb-0.5">Agents</h1>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[640px]">
              Automations that act with an outside party — voice calls today, email and SMS next.
              Each agent is configured like any other playbook; it just happens to dial.
            </p>
          </div>
          <Link
            href="/agents/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-800 hover:bg-blue-900 text-white px-3 h-8 text-sm font-medium transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5" weight="bold" />
            New agent
          </Link>
        </div>
      </header>

      <nav className="flex items-center gap-0 border-b border-gray-200 bg-white px-6 shrink-0">
        <PrimaryTab
          active={tab === "library"}
          onClick={() => setTab("library")}
          icon={<Stack className="h-3.5 w-3.5" weight="bold" />}
          label="Library"
          count={agents.length}
        />
        <PrimaryTab
          active={tab === "runs"}
          onClick={() => setTab("runs")}
          icon={<Play className="h-3.5 w-3.5" weight="fill" />}
          label="Runs"
        />
      </nav>

      {tab === "library" ? (
        <AgentsTable agents={agents} onRun={(a) => setRunDrawerFor(a)} />
      ) : (
        <UnifiedRuns initialPlaybookFilter={null} agentIdsOnly={AGENT_PLAYBOOK_IDS} />
      )}

      {runDrawerFor && (
        <KickoffDrawer
          agent={runDrawerFor}
          onClose={() => setRunDrawerFor(null)}
        />
      )}
    </div>
  )
}

function PrimaryTab({
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
      {typeof count === "number" && (
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

function AgentsTable({
  agents,
  onRun,
}: {
  agents: PlaybookDef[]
  onRun: (a: PlaybookDef) => void
}) {
  const router = useRouter()
  return (
    <div className="flex-1 min-h-0 overflow-auto bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            <th className="px-4 py-2.5 font-medium">Agent</th>
            <th className="px-4 py-2.5 font-medium">Trigger</th>
            <th className="px-4 py-2.5 font-medium">Dials</th>
            <th className="px-4 py-2.5 font-medium text-right">Runs</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Last run</th>
            <th className="px-4 py-2.5 w-32" />
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <AgentsTableRow key={a.id} agent={a} onRun={() => onRun(a)} onOpen={() => router.push(`/playbooks/${a.id}/edit`)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AgentsTableRow({
  agent,
  onRun,
  onOpen,
}: {
  agent: PlaybookDef
  onRun: () => void
  onOpen: () => void
}) {
  const dials = getOutsideContact(agent)
  return (
    <tr
      onClick={onOpen}
      className="group/row cursor-pointer hover:bg-gray-50 border-b border-gray-100"
    >
      <td className="px-4 py-2.5">
        <div className="text-sm font-medium text-zinc-900">{agent.name}</div>
        <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 max-w-[440px]">
          {agent.description}
        </div>
      </td>
      <td className="px-4 py-2.5">
        <TriggerCell trigger={agent.trigger} />
      </td>
      <td className="px-4 py-2.5">
        {dials ? (
          <code className="font-mono text-[11px] text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">
            {`{{${dials}}}`}
          </code>
        ) : (
          <span className="text-zinc-400 text-xs">\u2014 inbound</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-zinc-700">
        {agent.totalRuns.toLocaleString()}
      </td>
      <td className="px-4 py-2.5">
        {isAlwaysOnTrigger(agent.trigger) ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 text-green-700 px-1.5 py-0.5 text-[10px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
              agent.status === "Published"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
            }`}
          >
            {agent.status === "Published" ? "Published" : "Draft"}
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 text-xs text-zinc-600 whitespace-nowrap">{agent.lastRun}</td>
      <td className="px-2 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          {!isAlwaysOnTrigger(agent.trigger) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRun()
              }}
              className="inline-flex items-center gap-1 rounded-md bg-blue-800 hover:bg-blue-900 text-white px-2 h-7 text-xs font-medium transition-colors"
            >
              <Play className="h-3 w-3" weight="fill" />
              Run
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:bg-gray-100"
            title="Edit"
          >
            <PencilRuler className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Kickoff drawer ────────────────────────────────────────────────────

const SAMPLE_RUN_FOR: Record<string, string> = {
  "intake-callback-voice": "vc_001",
  "med-treatment-verification-voice": "vc_004",
}

function TriggerCell({ trigger }: { trigger: PlaybookDef["trigger"] }) {
  if (!trigger || trigger.kind === "manual") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 text-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold">
        <CursorClick className="h-2.5 w-2.5" weight="bold" />
        Manual
      </span>
    )
  }
  if (trigger.kind === "incoming-call") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 text-blue-800 px-1.5 py-0.5 text-[10px] font-semibold">
        <PhoneIncoming className="h-2.5 w-2.5" weight="bold" />
        Inbound call
      </span>
    )
  }
  if (trigger.kind === "integration") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 text-violet-700 px-1.5 py-0.5 text-[10px] font-semibold">
        <Plug className="h-2.5 w-2.5" weight="bold" />
        {trigger.source ?? "Integration"}
      </span>
    )
  }
  if (trigger.kind === "webform") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-1.5 py-0.5 text-[10px] font-semibold">
        <Globe className="h-2.5 w-2.5" weight="bold" />
        Web form
      </span>
    )
  }
  if (trigger.kind === "cadence") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-semibold">
        <Clock className="h-2.5 w-2.5" weight="bold" />
        Cadence
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 text-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold">
      Webhook
    </span>
  )
}

function KickoffDrawer({
  agent,
  onClose,
}: {
  agent: PlaybookDef
  onClose: () => void
}) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(agent.inputs.map((f) => [f.id, f.sample ?? ""]))
  )
  const handleRun = () => {
    const sampleId = SAMPLE_RUN_FOR[agent.id]
    if (sampleId) {
      router.push(`/agents/runs/${sampleId}`)
    } else {
      router.push(`/playbooks?p=${agent.id}`)
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-zinc-900/15 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="w-[480px] max-w-[92vw] bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden">
        <header className="flex items-center gap-2 px-4 h-12 border-b border-gray-200 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-900 truncate">Run {agent.name}</div>
            <div className="text-[11px] text-zinc-500">
              Fill in the fields below and the agent will dial.
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-auto p-4 space-y-3">
          {agent.inputs.map((field) => (
            <KickoffField
              key={field.id}
              field={field}
              value={values[field.id] ?? ""}
              onChange={(v) => setValues((s) => ({ ...s, [field.id]: v }))}
            />
          ))}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 flex items-center gap-2 shrink-0 bg-white">
          <span className="text-[11px] text-zinc-500">Call fires within ~10s</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onClose} className="h-9">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            className="h-9 gap-1.5 bg-blue-800 hover:bg-blue-900"
          >
            <Play className="h-3.5 w-3.5" weight="fill" />
            Place call
          </Button>
        </footer>
      </div>
    </div>
  )
}

function KickoffField({
  field,
  value,
  onChange,
}: {
  field: Field
  value: string
  onChange: (v: string) => void
}) {
  const isLong = field.type === "long_text"
  const isPhone = field.type === "phone"
  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1">
        {field.name}
        {field.required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      {field.description && (
        <div className="text-[11px] text-zinc-500 leading-relaxed mb-1.5">{field.description}</div>
      )}
      {field.type === "enum" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">— pick one —</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : isLong ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed"
        />
      ) : (
        <input
          type={isPhone ? "tel" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 ${
            isPhone ? "font-mono tabular-nums" : ""
          }`}
        />
      )}
    </div>
  )
}

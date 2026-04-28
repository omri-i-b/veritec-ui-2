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
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { PLAYBOOK_DEFS, type Field, type PlaybookDef } from "@/lib/playbook-data"

/** An "agent" is a playbook that contains at least one voice step.
 *  (Future: also email-out, sms-out, e-file steps.) */
function isAgent(p: PlaybookDef): boolean {
  return p.steps.some((s) => s.type === "voice")
}

/** Surface the dial / external-action input for the card. */
function getOutsideContact(p: PlaybookDef): string | null {
  const phoneInput = p.inputs.find((i) => i.type === "phone")
  return phoneInput?.name ?? null
}

export function AgentsLibrary() {
  const agents = useMemo(
    () => Object.values(PLAYBOOK_DEFS).filter(isAgent),
    []
  )
  const [runDrawerFor, setRunDrawerFor] = useState<PlaybookDef | null>(null)

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5 shrink-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-zinc-900 mb-0.5">Agents</h1>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[640px]">
              Automations that act with an outside party — voice calls today, email and SMS next.
              Each agent is configured like any other playbook (canvas + memory + returns); it just
              happens to dial.
            </p>
          </div>
          <Link
            href="/playbooks/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-800 hover:bg-blue-900 text-white px-3 h-8 text-sm font-medium transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5" weight="bold" />
            New agent
          </Link>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-6 py-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                onRun={() => setRunDrawerFor(a)}
              />
            ))}
            <NewAgentCard />
          </div>
        </div>
      </div>

      {runDrawerFor && (
        <KickoffDrawer
          agent={runDrawerFor}
          onClose={() => setRunDrawerFor(null)}
        />
      )}
    </div>
  )
}

function AgentCard({
  agent,
  onRun,
}: {
  agent: PlaybookDef
  onRun: () => void
}) {
  const Icon = agent.icon
  const dials = getOutsideContact(agent)
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`flex items-center justify-center h-10 w-10 rounded-md ${agent.iconBg} shrink-0`}>
          <Icon className={`h-5 w-5 ${agent.iconColor}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-zinc-900 truncate">{agent.name}</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 px-1.5 py-0 text-[10px] font-semibold">
              <PhoneCall className="h-2.5 w-2.5" weight="bold" />
              Voice
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3 mt-0.5">
            {agent.description}
          </p>
        </div>
      </div>

      {/* Dials info */}
      {dials && (
        <div className="text-[11px] text-zinc-600 mb-2">
          <span className="text-zinc-400">Dials </span>
          <code className="font-mono text-[11px] text-violet-700 bg-violet-50 border border-violet-200 px-1 py-0 rounded">
            {`{{${dials}}}`}
          </code>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-3">
        <span className="inline-flex items-center gap-1">
          <ChartLineUp className="h-3 w-3" weight="bold" />
          <span className="tabular-nums font-medium text-zinc-700">{agent.totalRuns.toLocaleString()}</span>
          runs
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {agent.lastRun}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-gray-100">
        <Button
          size="sm"
          className="h-8 flex-1 gap-1.5 bg-blue-800 hover:bg-blue-900"
          onClick={onRun}
        >
          <Play className="h-3.5 w-3.5" weight="fill" />
          Run
        </Button>
        <Link
          href={`/playbooks/${agent.id}/edit`}
          className="inline-flex items-center justify-center h-8 px-2 rounded-md border border-gray-200 bg-white text-xs font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-800 transition-colors"
          title="Open editor"
        >
          <PencilRuler className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/playbooks?p=${agent.id}`}
          className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-gray-200 bg-white text-xs font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-800 transition-colors"
          title="See past runs"
        >
          Runs
          <CaretRight className="h-3 w-3" weight="bold" />
        </Link>
      </div>
    </div>
  )
}

function NewAgentCard() {
  return (
    <button className="rounded-[10px] border border-dashed border-gray-300 bg-white px-4 py-6 hover:border-blue-300 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gray-100">
        <PhoneCall className="h-5 w-5 text-zinc-400" weight="bold" />
      </div>
      <div className="text-sm font-semibold text-zinc-700">New agent</div>
      <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[240px]">
        Compose a voice agent in the canvas — single Voice step with goals + extractions, or chain a
        Fetch first.
      </p>
    </button>
  )
}

// ── Kickoff drawer ────────────────────────────────────────────────────

const SAMPLE_RUN_FOR: Record<string, string> = {
  "intake-callback-voice": "vc_001",
  "med-treatment-verification-voice": "vc_004",
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
          <div className={`flex items-center justify-center h-7 w-7 rounded ${agent.iconBg}`}>
            <agent.icon className={`h-4 w-4 ${agent.iconColor}`} weight="bold" />
          </div>
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

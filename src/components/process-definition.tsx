"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ChartBar,
  Lightning,
  Calendar,
  User,
  Robot,
  Gear,
  CaretRight,
  Plus,
  ArrowSquareOut,
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

type OwnerRole = "Operator" | "Lead Lawyer" | "Paralegal" | "Voice Intake Agent" | "Records Chaser" | "Filing Agent" | "Lien Resolution Agent" | "System"
type TriggerKind = "event" | "schedule" | "manual" | "agent"

interface DefState {
  id: string
  name: string
  description: string
  ownerRole: OwnerRole
  ownerKind: "human" | "agent" | "system"
  expectedDuration: string
}

interface DefTransition {
  fromId: string
  toId: string
  trigger: string
  kind: TriggerKind
}

const STATES: DefState[] = [
  { id: "s1", name: "Lead intake", description: "Inbound call, web form, or referral. Disqualify or route.", ownerRole: "Voice Intake Agent", ownerKind: "agent", expectedDuration: "Minutes" },
  { id: "s2", name: "Sign retainer", description: "Send retainer; collect e-signature.", ownerRole: "Operator", ownerKind: "human", expectedDuration: "1–3 days" },
  { id: "s3", name: "Initial medical request", description: "Send HIPAA-compliant requests to ER and PCP.", ownerRole: "Filing Agent", ownerKind: "agent", expectedDuration: "1 day" },
  { id: "s4", name: "Treatment cycle", description: "6-month treatment window. Auto-collect records as visits happen.", ownerRole: "Records Chaser", ownerKind: "agent", expectedDuration: "26 weeks" },
  { id: "s5", name: "Records collected", description: "All providers responded; record set complete.", ownerRole: "Paralegal", ownerKind: "human", expectedDuration: "1–2 weeks" },
  { id: "s6", name: "Demand prepared", description: "Demand letter drafted with damages calc.", ownerRole: "Lead Lawyer", ownerKind: "human", expectedDuration: "3–5 days" },
  { id: "s7", name: "Demand sent", description: "Demand transmitted to carrier.", ownerRole: "Operator", ownerKind: "human", expectedDuration: "Same day" },
  { id: "s8", name: "Negotiation", description: "Counter-offers, mediation if needed.", ownerRole: "Lead Lawyer", ownerKind: "human", expectedDuration: "30–90 days" },
  { id: "s9", name: "Settlement / Filed", description: "Settlement disbursed or move to litigation.", ownerRole: "Operator", ownerKind: "human", expectedDuration: "Final" },
]

const TRANSITIONS: DefTransition[] = [
  { fromId: "s1", toId: "s2", trigger: "Lead qualified by Voice Intake Agent", kind: "agent" },
  { fromId: "s2", toId: "s3", trigger: "Retainer signed via DocuSign webhook", kind: "event" },
  { fromId: "s3", toId: "s4", trigger: "First treatment visit logged", kind: "event" },
  { fromId: "s4", toId: "s5", trigger: "All open record requests resolved (auto)", kind: "schedule" },
  { fromId: "s4", toId: "s5", trigger: "26 weeks elapsed since first visit", kind: "schedule" },
  { fromId: "s5", toId: "s6", trigger: "Operator marks records review complete", kind: "manual" },
  { fromId: "s6", toId: "s7", trigger: "Lead lawyer approves draft", kind: "manual" },
  { fromId: "s7", toId: "s8", trigger: "Carrier acknowledgment received", kind: "event" },
  { fromId: "s8", toId: "s9", trigger: "Settlement agreement signed OR file litigation", kind: "manual" },
]

const TRIGGER_STYLE: Record<TriggerKind, { icon: typeof Lightning; cls: string }> = {
  event: { icon: Lightning, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  schedule: { icon: Calendar, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  manual: { icon: User, cls: "bg-rose-50 text-rose-700 border-rose-200" },
  agent: { icon: Robot, cls: "bg-violet-50 text-violet-700 border-violet-200" },
}

const OWNER_KIND_STYLE: Record<DefState["ownerKind"], { icon: typeof User; cls: string }> = {
  human: { icon: User, cls: "bg-blue-50 text-blue-700 border-blue-200" },
  agent: { icon: Robot, cls: "bg-violet-50 text-violet-700 border-violet-200" },
  system: { icon: Gear, cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
}

export function ProcessDefinition() {
  const [selectedId, setSelectedId] = useState<string>("s4")
  const selected = STATES.find((s) => s.id === selectedId)!
  const incoming = TRANSITIONS.filter((t) => t.toId === selectedId)
  const outgoing = TRANSITIONS.filter((t) => t.fromId === selectedId)

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">
      {/* Header */}
      <div className="flex h-12 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 shrink-0">
        <Link
          href="/workflows"
          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" />
        </Link>
        <ChartBar className="h-4 w-4 text-zinc-500" />
        <span className="text-sm text-zinc-500">Definitions</span>
        <span className="text-zinc-400 text-sm">/</span>
        <span className="text-sm font-semibold text-zinc-900">Pre-Litigation</span>
        <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
          v3
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Published
        </span>
        <span className="ml-1 text-[11px] text-zinc-500">Read-only · This is the template, not a running instance</span>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <ArrowSquareOut className="h-3.5 w-3.5" />
          See running instances · 12
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-4 grid grid-cols-[1fr_360px] gap-4">
          {/* Main */}
          <div className="space-y-4 min-w-0">
            {/* Description band */}
            <div className="rounded-[10px] border border-gray-200 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">
                What this template does
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Standard pre-litigation lifecycle for a personal-injury case. Starts the moment a lead is
                qualified into a case, ends when the case settles or moves to litigation. The treatment cycle
                is the longest state — most automation lives there.
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Pill label="9 states" />
                <Pill label="9 transitions" />
                <Pill label="Avg duration: 6–9 months" />
                <Pill label="Owner mix: 4 human · 4 agent · 1 system" />
              </div>
            </div>

            {/* State graph */}
            <section className="rounded-[10px] border border-gray-200 bg-white">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900">State graph</h2>
                <span className="text-[11px] text-zinc-500">Click a state to see its triggers</span>
              </div>
              <div className="overflow-x-auto">
                <div className="px-6 py-6 flex items-start gap-0 min-w-max">
                  {STATES.map((state, i) => {
                    const next = STATES[i + 1]
                    const isSelected = state.id === selectedId
                    const ownerCfg = OWNER_KIND_STYLE[state.ownerKind]
                    const OwnerIcon = ownerCfg.icon
                    return (
                      <Fragment key={state.id}>
                        <div className="flex flex-col items-center gap-2 shrink-0 w-[120px]">
                          <button
                            onClick={() => setSelectedId(state.id)}
                            className={`flex items-center justify-center h-9 w-9 rounded-full transition-all ${
                              isSelected
                                ? "bg-blue-800 text-white ring-4 ring-blue-200"
                                : "bg-white border-2 border-gray-300 text-zinc-500 hover:border-blue-300"
                            }`}
                          >
                            <span className="text-[11px] font-semibold">{i + 1}</span>
                          </button>
                          <div className="text-center px-1">
                            <div className={`text-xs leading-tight ${isSelected ? "text-blue-800 font-semibold" : "text-zinc-700"}`}>
                              {state.name}
                            </div>
                            <div className="mt-1 inline-flex">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-[10px] font-medium ${ownerCfg.cls}`}
                              >
                                <OwnerIcon className="h-2.5 w-2.5" weight="bold" />
                                {state.ownerRole.split(" ")[0]}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{state.expectedDuration}</div>
                          </div>
                        </div>
                        {next && (
                          <div className="flex items-center pt-4 shrink-0 -mx-2">
                            <div className="w-16 border-t-2 border-dashed border-gray-300" />
                          </div>
                        )}
                      </Fragment>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Transition matrix */}
            <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900">Transitions</h2>
                <span className="text-[11px] text-zinc-500">{TRANSITIONS.length} total — what advances the workflow</span>
              </div>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-transparent border-b border-gray-200">
                    <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">From</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide w-12" />
                    <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">To</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Trigger kind</TableHead>
                    <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Trigger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRANSITIONS.map((t, i) => {
                    const from = STATES.find((s) => s.id === t.fromId)!
                    const to = STATES.find((s) => s.id === t.toId)!
                    const cfg = TRIGGER_STYLE[t.kind]
                    const Icon = cfg.icon
                    return (
                      <TableRow key={i} className="hover:bg-gray-50 border-b border-gray-100">
                        <TableCell className="py-2 text-sm text-zinc-700">{from.name}</TableCell>
                        <TableCell className="py-2">
                          <CaretRight className="h-3.5 w-3.5 text-zinc-400" />
                        </TableCell>
                        <TableCell className="py-2 text-sm text-zinc-700 font-medium">{to.name}</TableCell>
                        <TableCell className="py-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
                            <Icon className="h-3 w-3" weight="fill" />
                            {t.kind}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-zinc-600">{t.trigger}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </section>
          </div>

          {/* Right sidebar — selected state */}
          <div className="space-y-3 min-w-0">
            <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden sticky top-4">
              <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Selected state</div>
                <h3 className="text-sm font-semibold text-zinc-900">{selected.name}</h3>
              </div>
              <div className="p-3 space-y-3">
                <p className="text-xs text-zinc-700 leading-relaxed">{selected.description}</p>

                <div className="rounded-md border border-gray-200 bg-gray-50 p-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Owner role</span>
                    <span className="text-zinc-900 font-medium">{selected.ownerRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Expected duration</span>
                    <span className="text-zinc-900 font-medium">{selected.expectedDuration}</span>
                  </div>
                </div>

                {/* Incoming */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
                    Triggers IN ({incoming.length})
                  </div>
                  <div className="space-y-1.5">
                    {incoming.length === 0 && (
                      <div className="text-[11px] text-zinc-400 italic">Initial state — no incoming triggers</div>
                    )}
                    {incoming.map((t, i) => {
                      const from = STATES.find((s) => s.id === t.fromId)!
                      const cfg = TRIGGER_STYLE[t.kind]
                      const Icon = cfg.icon
                      return (
                        <div key={i} className="rounded-md border border-gray-200 bg-white p-2 text-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Icon className={`h-3 w-3 ${cfg.cls.split(" ")[1]}`} weight="fill" />
                            <span className="text-zinc-500">from</span>
                            <span className="font-medium text-zinc-900">{from.name}</span>
                          </div>
                          <div className="text-zinc-600 ml-4">{t.trigger}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Outgoing */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
                    Triggers OUT ({outgoing.length})
                  </div>
                  <div className="space-y-1.5">
                    {outgoing.length === 0 && (
                      <div className="text-[11px] text-zinc-400 italic">Terminal state — no outgoing triggers</div>
                    )}
                    {outgoing.map((t, i) => {
                      const to = STATES.find((s) => s.id === t.toId)!
                      const cfg = TRIGGER_STYLE[t.kind]
                      const Icon = cfg.icon
                      return (
                        <div key={i} className="rounded-md border border-gray-200 bg-white p-2 text-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Icon className={`h-3 w-3 ${cfg.cls.split(" ")[1]}`} weight="fill" />
                            <span className="text-zinc-500">to</span>
                            <span className="font-medium text-zinc-900">{to.name}</span>
                          </div>
                          <div className="text-zinc-600 ml-4">{t.trigger}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
      {label}
    </span>
  )
}

"use client"

import { Fragment, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowSquareOut,
  Pause,
  ArrowsClockwise,
  PencilSimple,
  Plus,
  WarningCircle,
  CheckCircle,
  Robot,
  User,
  Gear,
  Plug,
  CaretDown,
  CaretUp,
  Clock,
  ChatCircleText,
  DotsThreeVertical,
  Sparkle,
  Calendar,
  SuitcaseSimple,
  PlayCircle,
  CircleNotch,
  ChartBar,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  OWNER_KIND,
  STATE_STATUS,
  type ProcessDef,
  type ProcessOwner,
  type ProcessState,
  type ActiveStep,
  type HistoryEvent,
} from "@/lib/process-data"

// ── Owner indicator (unified across human/agent/system/integration) ───

function OwnerIndicator({
  owner,
  size = "md",
}: {
  owner: ProcessOwner
  size?: "sm" | "md"
}) {
  const cfg = OWNER_KIND[owner.kind]
  const isHuman = owner.kind === "human"
  const tileSize = size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]"

  if (isHuman && owner.initials && owner.color) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full font-semibold ${tileSize} ${owner.color}`}
        title={`${owner.name} · person`}
      >
        {owner.initials}
      </span>
    )
  }
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md ${tileSize} ${cfg.tileBg}`}
      title={`${owner.name} · ${cfg.label.toLowerCase()}`}
    >
      <Icon className={`${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} ${cfg.tileText}`} weight="bold" />
    </span>
  )
}

function OwnerLine({ owner }: { owner: ProcessOwner }) {
  const cfg = OWNER_KIND[owner.kind]
  return (
    <span className="inline-flex items-center gap-1.5">
      <OwnerIndicator owner={owner} size="sm" />
      <span className="text-zinc-700">{owner.name}</span>
      <span className="text-[10px] uppercase tracking-wide text-zinc-400">{cfg.label}</span>
    </span>
  )
}

// ── State Timeline (the spine) ────────────────────────────────────────

function StateTimeline({ states }: { states: ProcessState[] }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white">
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">State</h2>
        <span className="text-[11px] text-zinc-500">
          The spine of this workflow — every action is anchored to a step
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="px-6 py-6 flex items-start gap-0 min-w-max">
          {states.map((state, i) => {
            const cfg = STATE_STATUS[state.status]
            const NodeIcon = cfg.icon
            const next = states[i + 1]
            return (
              <Fragment key={state.id}>
                <div className="flex flex-col items-center gap-2 shrink-0 w-[120px]">
                  <button
                    className={`flex items-center justify-center h-9 w-9 rounded-full ${cfg.bg} ${cfg.ring} transition-all`}
                  >
                    <NodeIcon
                      className={`${state.status === "completed" ? "h-5 w-5" : "h-4 w-4"}`}
                      weight={state.status === "completed" ? "fill" : "bold"}
                    />
                  </button>
                  <div className="text-center px-1">
                    <div className={`text-xs leading-tight ${cfg.text}`}>{state.name}</div>
                    {state.completedAt && (
                      <div className="text-[10px] text-zinc-400 mt-0.5">{state.completedAt}</div>
                    )}
                    {state.status === "current" && (
                      <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0 text-[10px] font-medium text-blue-800">
                        <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
                {next && (
                  <div className="flex items-center pt-4 shrink-0 -mx-2">
                    <Connector
                      tone={
                        state.status === "completed"
                          ? "completed"
                          : state.status === "current"
                            ? "current-edge"
                            : "future"
                      }
                    />
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Connector({ tone }: { tone: "completed" | "current-edge" | "future" }) {
  const className = {
    completed: "border-t-2 border-green-300",
    "current-edge": "border-t-2 border-dashed border-blue-300",
    future: "border-t-2 border-dashed border-gray-200",
  }[tone]
  return <div className={`w-16 ${className}`} />
}

// ── Active Steps Panel ────────────────────────────────────────────────

function ActiveStepsPanel({ steps, onSelectAgent }: { steps: ActiveStep[]; onSelectAgent: (id: string) => void }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">Active steps</h2>
        <span className="inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-zinc-600">
          {steps.length}
        </span>
        <span className="text-[11px] text-zinc-500">In flight right now</span>
      </div>
      <div className="divide-y divide-gray-100">
        {steps.map((step) => (
          <ActiveStepCard key={step.id} step={step} onSelectAgent={onSelectAgent} />
        ))}
      </div>
    </section>
  )
}

function ActiveStepCard({ step, onSelectAgent }: { step: ActiveStep; onSelectAgent: (id: string) => void }) {
  const cfg = OWNER_KIND[step.owner.kind]
  const isAgent = step.owner.kind === "agent"
  const isBlocked = !!step.blocker

  const statusPill = (() => {
    switch (step.status) {
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-700">
            <CircleNotch className="h-3 w-3 animate-spin" weight="bold" />
            In progress
          </span>
        )
      case "waiting":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            <Clock className="h-3 w-3" weight="bold" />
            Waiting
          </span>
        )
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-medium text-red-700">
            <WarningCircle className="h-3 w-3" weight="fill" />
            Blocked
          </span>
        )
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            <Calendar className="h-3 w-3" weight="bold" />
            Scheduled
          </span>
        )
    }
  })()

  return (
    <div className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start gap-3">
        <OwnerIndicator owner={step.owner} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-zinc-900">{step.name}</h3>
            {statusPill}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
            <OwnerLine owner={step.owner} />
            {step.deadline && (
              <>
                <span className="text-zinc-300">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {step.deadline}
                </span>
              </>
            )}
          </div>
          {step.description && (
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">{step.description}</p>
          )}
          {isBlocked && (
            <div className="mt-2 inline-flex items-start gap-1.5 rounded bg-red-50 border border-red-200 px-2 py-1 text-[11px] text-red-700">
              <WarningCircle className="h-3 w-3 mt-0.5 shrink-0" weight="fill" />
              <span>
                <span className="font-semibold">Blocker:</span> {step.blocker}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isAgent && step.agentThreadId && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs text-zinc-700"
              onClick={() => onSelectAgent(step.agentThreadId!)}
            >
              <ChatCircleText className="h-3.5 w-3.5" />
              Open thread
            </Button>
          )}
          {step.owner.kind === "human" && (
            <Button size="sm" className="h-7 gap-1.5 text-xs bg-blue-800 hover:bg-blue-900">
              <CheckCircle className="h-3.5 w-3.5" weight="fill" />
              Mark complete
            </Button>
          )}
          <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500">
            <DotsThreeVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Operator Actions ──────────────────────────────────────────────────

function OperatorActions() {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
        <Pause className="h-3.5 w-3.5" />
        Pause
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
        <ArrowsClockwise className="h-3.5 w-3.5" />
        Override state
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
        <PencilSimple className="h-3.5 w-3.5" />
        Add note
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
        <User className="h-3.5 w-3.5" />
        Escalate
      </Button>
    </div>
  )
}

// ── History Feed ──────────────────────────────────────────────────────

function HistoryFeed({ events }: { events: HistoryEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? events : events.slice(0, 6)
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">History</h2>
        <span className="text-[11px] text-zinc-500">{events.length} events</span>
      </div>
      <div className="px-4 py-3">
        <div className="relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" />
          <div className="space-y-3">
            {visible.map((ev) => (
              <HistoryRow key={ev.id} event={ev} />
            ))}
          </div>
        </div>
        {events.length > 6 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 inline-flex items-center gap-1 text-xs text-blue-800 font-medium hover:underline"
          >
            {expanded ? (
              <>
                <CaretUp className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <CaretDown className="h-3 w-3" />
                Show all {events.length} events
              </>
            )}
          </button>
        )}
      </div>
    </section>
  )
}

function HistoryRow({ event }: { event: HistoryEvent }) {
  const iconConfig: Record<HistoryEvent["kind"], { icon: typeof CheckCircle; bg: string; text: string }> = {
    state_transition: { icon: ArrowsClockwise, bg: "bg-blue-100", text: "text-blue-700" },
    step_completed: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700" },
    step_started: { icon: PlayCircle, bg: "bg-amber-100", text: "text-amber-700" },
    note_added: { icon: PencilSimple, bg: "bg-zinc-100", text: "text-zinc-700" },
    manual_override: { icon: WarningCircle, bg: "bg-rose-100", text: "text-rose-700" },
    trigger: { icon: Sparkle, bg: "bg-violet-100", text: "text-violet-700" },
  }
  const cfg = iconConfig[event.kind]
  const Icon = cfg.icon

  return (
    <div className="flex items-start gap-3 relative">
      <div className={`flex items-center justify-center h-6 w-6 rounded-full ${cfg.bg} relative z-[1]`}>
        <Icon className={`h-3 w-3 ${cfg.text}`} weight="fill" />
      </div>
      <div className="min-w-0 flex-1 -mt-0.5">
        <div className="text-sm text-zinc-900">{event.title}</div>
        {event.detail && <div className="text-[11px] text-zinc-500 mt-0.5">{event.detail}</div>}
        <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
          <OwnerLine owner={event.actor} />
          <span className="text-zinc-300">·</span>
          <span>{event.at}</span>
        </div>
      </div>
    </div>
  )
}

// ── Entity Context Sidebar ────────────────────────────────────────────

function EntityContextSidebar({ context, entityType, entityId }: { context: ProcessDef["context"]; entityType: string; entityId: string }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">{entityType} context</h3>
        <Link
          href="#"
          className="inline-flex items-center gap-1 text-[11px] text-blue-800 font-medium hover:underline"
        >
          Open {entityType.toLowerCase()}
          <ArrowSquareOut className="h-3 w-3" />
        </Link>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 rounded px-1.5 py-0.5 text-xs font-medium">
            <SuitcaseSimple className="h-3 w-3" weight="bold" />
            {entityId}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-zinc-900 mb-2">{context.title}</h4>
        <dl className="space-y-1.5">
          {context.facts.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-2 text-xs">
              <dt className="text-zinc-500 shrink-0">{f.label}</dt>
              <dd className="text-zinc-900 text-right truncate">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ── Agent Thread Drawer (when an agent step is opened) ────────────────

function AgentThreadDrawer({ threadId, onClose }: { threadId: string | null; onClose: () => void }) {
  if (!threadId) return null
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-zinc-900/15 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-violet-100">
              <Robot className="h-3.5 w-3.5 text-violet-700" weight="bold" />
            </span>
            <div>
              <div className="text-sm font-semibold text-zinc-900">Medical Records Chaser</div>
              <div className="text-[11px] text-zinc-500">Agent thread · {threadId}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900">
            <Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
          <ChatBubble who="agent" time="11/04 · 9:14 AM">
            HIPAA-compliant request faxed to Westside Imaging. Confirmation #WSI-22841.
          </ChatBubble>
          <ChatBubble who="agent" time="11/09 · 9:00 AM">
            Follow-up #1 sent via portal. No response.
          </ChatBubble>
          <ChatBubble who="agent" time="11/14 · 9:00 AM">
            Follow-up #2 sent via portal + voice call left with records dept.
          </ChatBubble>
          <ChatBubble who="agent" time="11/19 · 9:00 AM">
            Follow-up #3 — switched to fax. Still no response. Escalating to operator.
          </ChatBubble>
          <ChatBubble who="system" time="11/20 · 9:14 AM">
            Status changed to <strong>Waiting</strong>. Operator action recommended.
          </ChatBubble>
        </div>
        <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5">
            Send message
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 bg-blue-800 hover:bg-blue-900">
            Take over from agent
          </Button>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ who, time, children }: { who: "agent" | "system" | "operator"; time: string; children: React.ReactNode }) {
  const styles = {
    agent: "bg-white border border-gray-200",
    system: "bg-violet-50 border border-violet-200",
    operator: "bg-blue-50 border border-blue-200 ml-8",
  }[who]
  return (
    <div className={`rounded-md px-3 py-2 ${styles}`}>
      <div className="text-xs text-zinc-700 leading-relaxed">{children}</div>
      <div className="text-[10px] text-zinc-400 mt-1">{time}</div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────

export function ProcessInstance({ process }: { process: ProcessDef }) {
  const [agentThreadId, setAgentThreadId] = useState<string | null>(null)
  const currentState = process.states.find((s) => s.status === "current")

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
        <span className="text-sm text-zinc-500">{process.templateName}</span>
        <span className="text-zinc-400 text-sm">/</span>
        <span className="text-sm font-semibold text-zinc-900">
          {process.entityType} {process.entityId}
        </span>
        <span className="text-sm text-zinc-500">· {process.entityLabel}</span>
        {currentState && (
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {currentState.name}
          </span>
        )}
        <span className="text-xs text-zinc-500">· {process.ageDays} days old</span>
        {process.slaLabel && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
              process.slaTone === "warning"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : process.slaTone === "danger"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-gray-50 text-zinc-600 border-gray-200"
            }`}
          >
            <Clock className="h-3 w-3" />
            {process.slaLabel}
          </span>
        )}
        <div className="flex-1" />
        <OperatorActions />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-4 space-y-4">
          <StateTimeline states={process.states} />

          <div className="grid grid-cols-[1fr_320px] gap-4">
            <div className="space-y-4 min-w-0">
              <ActiveStepsPanel steps={process.activeSteps} onSelectAgent={setAgentThreadId} />
              <HistoryFeed events={process.history} />
            </div>
            <div className="space-y-4 min-w-0">
              <EntityContextSidebar context={process.context} entityType={process.entityType} entityId={process.entityId} />
              <DefinitionLink templateName={process.templateName} version={process.version} templateId={process.templateId} />
            </div>
          </div>
        </div>
      </div>

      <AgentThreadDrawer threadId={agentThreadId} onClose={() => setAgentThreadId(null)} />
    </div>
  )
}

function DefinitionLink({ templateName, version, templateId }: { templateName: string; version: string; templateId: string }) {
  return (
    <Link
      href={`/workflows/templates/${templateId}`}
      className="group block rounded-[10px] border border-gray-200 bg-white p-3 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-50">
          <ChartBar className="h-3.5 w-3.5 text-blue-800" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900 group-hover:text-blue-800 transition-colors">
            View definition
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            {templateName} · {version}
          </div>
        </div>
        <ArrowSquareOut className="h-3.5 w-3.5 text-zinc-400 group-hover:text-blue-800 transition-colors" />
      </div>
    </Link>
  )
}

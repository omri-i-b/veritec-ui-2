"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Plus,
  DotsSixVertical,
  CaretDown,
  CaretUp,
  TextT,
  Hash,
  Calendar,
  FilePdf,
  SuitcaseSimple,
  ListBullets,
  CheckSquare,
  Database,
  Sparkle,
  Code,
  GitBranch,
  Play,
  FloppyDisk,
  DotsThreeVertical,
  Trash,
  Copy,
  Warning,
  ArrowSquareOut,
  CircleNotch,
  CheckCircle,
  ArrowClockwise,
  X,
  Books,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { getPlaybook, type Field, type FieldType, type Step, type StepType } from "@/lib/playbook-data"

// ── Field type config ──────────────────────────────────────────────────

const FIELD_TYPES: Record<FieldType, { icon: typeof TextT; label: string; color: string }> = {
  text: { icon: TextT, label: "Text", color: "text-zinc-600" },
  number: { icon: Hash, label: "Number", color: "text-emerald-700" },
  date: { icon: Calendar, label: "Date", color: "text-amber-700" },
  file: { icon: FilePdf, label: "File", color: "text-rose-700" },
  "case-ref": { icon: SuitcaseSimple, label: "Case", color: "text-blue-800" },
  enum: { icon: CheckSquare, label: "Enum", color: "text-purple-700" },
  list: { icon: ListBullets, label: "List", color: "text-sky-700" },
  "kb-ref": { icon: Books, label: "Knowledge Base", color: "text-indigo-700" },
}

// ── Step type config ───────────────────────────────────────────────────

const STEP_TYPES: Record<
  StepType,
  { icon: typeof Database; label: string; iconColor: string; iconBg: string; accent: string }
> = {
  fetch: {
    icon: Database,
    label: "Fetch",
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    accent: "border-l-amber-500",
  },
  prompt: {
    icon: Sparkle,
    label: "Prompt",
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    accent: "border-l-blue-500",
  },
  extract: {
    icon: Code,
    label: "Extract",
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    accent: "border-l-purple-500",
  },
  condition: {
    icon: GitBranch,
    label: "Condition",
    iconColor: "text-zinc-600",
    iconBg: "bg-gray-50",
    accent: "border-l-zinc-400",
  },
}

// ── Hook to get the current playbook from URL ─────────────────────────

function useCurrentPlaybook() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "medical-records-summary"
  return getPlaybook(id)
}

// ── Field Row ──────────────────────────────────────────────────────────

function FieldRow({ field }: { field: Field }) {
  const typeConfig = FIELD_TYPES[field.type]
  const Icon = typeConfig.icon
  return (
    <div className="group flex items-center gap-2 px-2.5 py-2 rounded-md border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
      <DotsSixVertical className="h-3.5 w-3.5 text-zinc-300 cursor-grab shrink-0" />
      <div className={`flex items-center justify-center h-6 w-6 rounded-md bg-gray-50 shrink-0`}>
        <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} weight="bold" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-zinc-900">{field.name}</span>
          {field.required && (
            <span className="text-[10px] font-medium text-rose-600 bg-rose-50 rounded px-1 py-0">required</span>
          )}
        </div>
        {field.description && (
          <div className="text-[11px] text-zinc-500 truncate">{field.description}</div>
        )}
      </div>
      <div className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shrink-0">
        <Icon className={`h-3 w-3 ${typeConfig.color}`} weight="bold" />
        {typeConfig.label}
      </div>
      <button className="flex items-center justify-center h-6 w-6 rounded hover:bg-gray-100 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <DotsThreeVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── Inputs Section ─────────────────────────────────────────────────────

function InputsSection({ inputs }: { inputs: Field[] }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Inputs</h3>
          <span className="inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-zinc-600">
            {inputs.length}
          </span>
          <span className="text-[11px] text-zinc-500">What users fill in when they run this playbook</span>
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        {inputs.map((f) => (
          <FieldRow key={f.id} field={f} />
        ))}
        <button className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border border-dashed border-gray-300 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add input
        </button>
      </div>
    </section>
  )
}

// ── Prompt with variable chips ─────────────────────────────────────────

function PromptWithChips({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  return (
    <div className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap font-mono">
      {parts.map((part, i) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          const name = part.slice(2, -2)
          return (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 mx-0.5 rounded bg-blue-100 text-blue-800 px-1.5 py-0 text-[12px] font-medium font-sans"
            >
              {name}
            </span>
          )
        }
        return (
          <span key={i} className="font-sans">
            {part}
          </span>
        )
      })}
    </div>
  )
}

// ── Step Row ───────────────────────────────────────────────────────────

function StepRow({
  step,
  index,
  onToggle,
}: {
  step: Step
  index: number
  onToggle: () => void
}) {
  const config = STEP_TYPES[step.type]
  const Icon = config.icon
  return (
    <div className={`rounded-md border border-gray-200 bg-white border-l-4 ${config.accent} overflow-hidden`}>
      <div
        className="group flex items-center gap-2 px-2.5 py-2 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <DotsSixVertical className="h-3.5 w-3.5 text-zinc-300 cursor-grab shrink-0" />
        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-[10px] font-semibold text-zinc-600 shrink-0">
          {index + 1}
        </span>
        <div className={`flex items-center justify-center h-6 w-6 rounded-md ${config.iconBg} shrink-0`}>
          <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-zinc-900">{step.name}</span>
            <span className={`inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1 py-0 text-[10px] font-medium ${config.iconColor}`}>
              {config.label}
            </span>
          </div>
          {!step.expanded && <div className="text-[11px] text-zinc-500 truncate">{step.detail}</div>}
        </div>
        {step.expanded ? (
          <CaretUp className="h-3.5 w-3.5 text-zinc-400" />
        ) : (
          <CaretDown className="h-3.5 w-3.5 text-zinc-400" />
        )}
      </div>
      {step.expanded && (
        <div className="border-t border-gray-200 bg-gray-50/50 p-3">
          {step.type === "prompt" ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Prompt</span>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <span>Model:</span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-zinc-700">
                    Claude Sonnet 4.7
                    <CaretDown className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <PromptWithChips text={step.detail} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                <span>Insert:</span>
                <button className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-800 px-1.5 py-0.5 font-medium hover:bg-blue-100">
                  Case
                </button>
                <button className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-800 px-1.5 py-0.5 font-medium hover:bg-blue-100">
                  Records
                </button>
                <button className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-800 px-1.5 py-0.5 font-medium hover:bg-blue-100">
                  Plaintiff
                </button>
                <button className="text-zinc-400 hover:text-zinc-700">+ more</button>
              </div>
            </>
          ) : step.type === "extract" ? (
            <div className="font-mono text-xs text-zinc-700 rounded-md bg-zinc-900 text-zinc-100 p-3 leading-relaxed">
              <div className="text-zinc-400">// Extract these fields from LLM response</div>
              {`{
  "summary": `}<span className="text-emerald-300">string</span>{`,
  "gaps_found": `}<span className="text-emerald-300">number</span>{`,
  "confidence": `}<span className="text-emerald-300">number</span>{`
}`}
            </div>
          ) : (
            <p className="text-sm text-zinc-700">{step.detail}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Steps Section ──────────────────────────────────────────────────────

function StepsSection({ steps, onToggle }: { steps: Step[]; onToggle: (id: string) => void }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Steps</h3>
          <span className="inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-zinc-600">
            {steps.length}
          </span>
          <span className="text-[11px] text-zinc-500">The AI logic that transforms inputs into outputs</span>
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        {steps.map((step, i) => (
          <StepRow key={step.id} step={step} index={i} onToggle={() => onToggle(step.id)} />
        ))}
        <div className="flex items-center gap-1.5">
          {(["fetch", "prompt", "extract", "condition"] as StepType[]).map((t) => {
            const c = STEP_TYPES[t]
            const Icon = c.icon
            return (
              <button
                key={t}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md border border-dashed border-gray-300 text-[11px] font-medium text-zinc-600 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors"
              >
                <Icon className={`h-3.5 w-3.5 ${c.iconColor}`} weight="bold" />
                Add {c.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Outputs Section ────────────────────────────────────────────────────

function OutputsSection({ outputs }: { outputs: Field[] }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Outputs</h3>
          <span className="inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-zinc-600">
            {outputs.length}
          </span>
          <span className="text-[11px] text-zinc-500">These become columns in the Runs grid</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-800">
          <ArrowSquareOut className="h-3 w-3" />
          Live preview
        </span>
      </div>
      <div className="p-2 space-y-1.5">
        {outputs.map((f) => (
          <FieldRow key={f.id} field={f} />
        ))}
        <button className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border border-dashed border-gray-300 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          Add output
        </button>
      </div>
    </section>
  )
}

// ── Test Panel ─────────────────────────────────────────────────────────

type TestStatus = "idle" | "running" | "success"

// ── Sample input field (renders differently by type) ─────────────────

function SampleInput({ field }: { field: Field }) {
  const typeConfig = FIELD_TYPES[field.type]
  const Icon = typeConfig.icon
  const sample = field.sample ?? ""

  if (field.type === "text") {
    return (
      <div>
        <label className="text-[11px] font-medium text-zinc-500 block mb-1">
          {field.name}
          {field.required && <span className="text-rose-600 ml-1">*</span>}
        </label>
        <input
          type="text"
          defaultValue={sample}
          className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    )
  }

  if (field.type === "enum") {
    return (
      <div>
        <label className="text-[11px] font-medium text-zinc-500 block mb-1">
          {field.name}
          {field.required && <span className="text-rose-600 ml-1">*</span>}
        </label>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm">
          <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} weight="bold" />
          <span className="flex-1 text-zinc-900 font-medium">{sample}</span>
          <CaretDown className="h-3 w-3 text-zinc-400" />
        </div>
      </div>
    )
  }

  if (field.type === "list") {
    const items = sample ? sample.split(",").map((s) => s.trim()) : []
    return (
      <div>
        <label className="text-[11px] font-medium text-zinc-500 block mb-1">
          {field.name}
          {field.required && <span className="text-rose-600 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-1 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 min-h-[32px]">
          {items.map((it) => (
            <span
              key={it}
              className="inline-flex items-center gap-1 rounded bg-white border border-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-700"
            >
              {it}
              <X className="h-2.5 w-2.5 text-zinc-400" />
            </span>
          ))}
        </div>
      </div>
    )
  }

  // case-ref, file, kb-ref — card style
  return (
    <div>
      <label className="text-[11px] font-medium text-zinc-500 block mb-1">
        {field.name}
        {field.required && <span className="text-rose-600 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50 text-sm">
        <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} weight="bold" />
        <span className="flex-1 text-zinc-900 font-medium truncate">{sample}</span>
        <CaretDown className="h-3 w-3 text-zinc-400" />
      </div>
    </div>
  )
}

// ── Live output field (renders per output type) ──────────────────────

function LiveOutputValue({ field, playbookId }: { field: Field; playbookId: string }) {
  // Sample values per playbook per field
  const sampleValues: Record<string, Record<string, string | string[]>> = {
    "medical-records-summary": {
      summary: "Plaintiff received continuous care from 2023-07 to 2024-03 with documented treatment for lumbar strain and cervical injury. Three gaps in documentation identified...",
      gaps_found: "3",
      confidence: "94%",
    },
    "depo-prep": {
      questions: [
        "On the date of the incident, were you using your phone in the 60 seconds leading up to the impact?",
        "You previously testified you were in severe pain. Can you explain the Facebook photo dated March 3, 2024 showing you dancing at a wedding?",
        "Between January 15 and April 22, you had no documented medical treatment. Can you describe the nature of your pain during that 97-day gap?",
        "Dr. Roberts recommended you undergo steroid injections. You declined. What prompted that decision?",
      ] as string[],
      weaknesses: [
        "Phone records show texting at 2:47pm, 30 seconds before impact — source: phone_records.pdf p.14",
        "97-day treatment gap (Jan 15 - Apr 22) inconsistent with claimed severe pain — source: medical_timeline.pdf p.8",
        "Social media shows physical activity during claimed injury period — source: investigation_report.pdf p.23",
        "Declined steroid injection despite doctor recommendation — source: dr_roberts_notes.pdf p.4",
      ] as string[],
      treatment_gaps: "3",
      estimated_duration: "3-4 hours",
      question_count: "127",
    },
  }

  const values = sampleValues[playbookId] ?? sampleValues["medical-records-summary"]
  const value = values[field.name]
  const typeConfig = FIELD_TYPES[field.type]
  const Icon = typeConfig.icon

  if (field.type === "list" && Array.isArray(value)) {
    return (
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1">
          <Icon className={`h-2.5 w-2.5 ${typeConfig.color}`} /> {field.name}
          <span className="ml-auto text-zinc-400 tabular-nums">{value.length} items</span>
        </div>
        <div className="space-y-1 pl-1">
          {value.slice(0, 4).map((item, i) => (
            <div key={i} className="text-xs text-zinc-700 leading-snug flex items-start gap-1.5">
              <span className="text-zinc-400 tabular-nums shrink-0">{i + 1}.</span>
              <span className="flex-1 min-w-0">{item}</span>
            </div>
          ))}
          {value.length > 4 && (
            <div className="text-[11px] text-zinc-500 italic pl-4">+{value.length - 4} more…</div>
          )}
        </div>
      </div>
    )
  }

  if (field.type === "number") {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
        <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-0.5 flex items-center gap-1">
          <Icon className={`h-2.5 w-2.5 ${typeConfig.color}`} /> {field.name}
        </div>
        <div className="text-lg font-semibold text-zinc-900 tabular-nums">{value ?? "—"}</div>
      </div>
    )
  }

  // text
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1">
        <Icon className={`h-2.5 w-2.5 ${typeConfig.color}`} /> {field.name}
      </div>
      <div className="text-sm text-zinc-900 leading-relaxed">{typeof value === "string" ? value : ""}</div>
    </div>
  )
}

function TestPanel() {
  const playbook = useCurrentPlaybook()
  const [status, setStatus] = useState<TestStatus>("success")

  const numericOutputs = playbook.outputs.filter((o) => o.type === "number")
  const otherOutputs = playbook.outputs.filter((o) => o.type !== "number")

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-zinc-500" weight="fill" />
          <h3 className="text-sm font-semibold text-zinc-900">Test</h3>
          <span className="text-[11px] text-zinc-500">Try your playbook with sample data</span>
        </div>
        <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-400">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Test inputs */}
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">Sample inputs</h4>
          <div className="rounded-[10px] border border-gray-200 bg-white p-3 space-y-2.5">
            {playbook.inputs.map((f) => (
              <SampleInput key={f.id} field={f} />
            ))}
          </div>
          <button
            onClick={() => {
              setStatus("running")
              setTimeout(() => setStatus("success"), 2000)
            }}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-800 text-white px-3 py-2 text-sm font-medium hover:bg-blue-900 transition-colors"
          >
            {status === "running" ? (
              <>
                <CircleNotch className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" weight="fill" />
                Run test
              </>
            )}
          </button>
        </section>

        {/* Live output */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Live output</h4>
            {status === "success" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                <CheckCircle className="h-2.5 w-2.5" weight="fill" />
                Success · 18.2s
              </span>
            )}
            {status === "running" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                <CircleNotch className="h-2.5 w-2.5 animate-spin" weight="bold" />
                Running
              </span>
            )}
          </div>

          <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Preview as it'll appear in the Runs grid
            </div>

            <div className="p-3 space-y-3">
              {status === "running" ? (
                <>
                  <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                </>
              ) : (
                <>
                  {otherOutputs.map((f) => (
                    <LiveOutputValue key={f.id} field={f} playbookId={playbook.id} />
                  ))}
                  {numericOutputs.length > 0 && (
                    <div className={`grid grid-cols-${Math.min(numericOutputs.length, 3)} gap-2`}>
                      {numericOutputs.map((f) => (
                        <LiveOutputValue key={f.id} field={f} playbookId={playbook.id} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Token/cost hint */}
        <div className="rounded-md border border-gray-200 bg-white p-2.5 text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkle className="h-3 w-3" />
            Est. cost per run
          </span>
          <span className="tabular-nums font-medium text-zinc-700">~$0.04 · 12.3k tokens</span>
        </div>
      </div>
    </div>
  )
}

// ── Builder View (standalone, kept for direct embeds) ──────────────────

export function WorkflowBuilder() {
  const playbook = useCurrentPlaybook()
  const [inputs] = useState(playbook.inputs)
  const [outputs] = useState(playbook.outputs)
  const [steps, setSteps] = useState(playbook.steps)

  const toggleStep = (id: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s)))
  }

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex flex-col flex-1 min-w-0 bg-gray-50">
        <div className="flex items-center gap-2 px-4 h-11 border-b border-gray-200 bg-white shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            <Warning className="h-3 w-3" weight="fill" />
            Unsaved changes
          </span>
          <span className="text-[11px] text-zinc-500">Last saved 3 minutes ago</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
            <ArrowClockwise className="h-3.5 w-3.5" />
            Revert
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
            <FloppyDisk className="h-3.5 w-3.5" />
            Save draft
          </Button>
          <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
            Publish
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3 max-w-[920px] w-full mx-auto">
          <InputsSection inputs={inputs} />
          <div className="flex items-center justify-center py-1">
            <div className="h-5 w-px bg-gray-200" />
          </div>
          <StepsSection steps={steps} onToggle={toggleStep} />
          <div className="flex items-center justify-center py-1">
            <div className="h-5 w-px bg-gray-200" />
          </div>
          <OutputsSection outputs={outputs} />
        </div>
      </div>
      <div className="w-[420px] shrink-0">
        <TestPanel />
      </div>
    </div>
  )
}

// ── Inline Definition Panel (for embedding in workflow detail) ─────────

export function DefinitionPanel() {
  const playbook = useCurrentPlaybook()
  const [steps, setSteps] = useState(playbook.steps)
  const toggleStep = (id: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s)))

  return (
    <div className="flex h-full w-full min-h-0 min-w-0">
      {/* Left: definition sections */}
      <div className="flex-1 min-w-0 overflow-auto p-4 space-y-3 bg-gray-50">
        <InputsSection inputs={playbook.inputs} />
        <div className="flex items-center justify-center py-1">
          <div className="h-5 w-px bg-gray-200" />
        </div>
        <StepsSection steps={steps} onToggle={toggleStep} />
        <div className="flex items-center justify-center py-1">
          <div className="h-5 w-px bg-gray-200" />
        </div>
        <OutputsSection outputs={playbook.outputs} />
      </div>
      {/* Right: test panel */}
      <div className="w-[380px] shrink-0 border-l border-gray-200">
        <TestPanel />
      </div>
    </div>
  )
}

// ── Expanded Definition Header (shown when expanded) ───────────────────

export function ExpandedDefinitionHeader({ onCollapse }: { onCollapse: () => void }) {
  return (
    <div className="flex items-center gap-2 px-4 h-12 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <Code className="h-4 w-4 text-blue-800" />
        <span className="text-sm font-semibold text-zinc-900">Definition</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          <Warning className="h-3 w-3" weight="fill" />
          Unsaved changes
        </span>
        <span className="text-[11px] text-zinc-500">Last saved 3m ago</span>
      </div>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <ArrowClockwise className="h-3.5 w-3.5" />
        Revert
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <FloppyDisk className="h-3.5 w-3.5" />
        Save draft
      </Button>
      <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
        Publish
      </Button>
      <div className="h-5 w-px bg-gray-200 mx-1" />
      <button
        onClick={onCollapse}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-800 transition-colors"
      >
        <CaretUp className="h-3.5 w-3.5" />
        Collapse
      </button>
    </div>
  )
}

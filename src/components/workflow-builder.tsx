"use client"

import { Fragment, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  DotsSixVertical,
  TextT,
  Hash,
  Calendar,
  CaretDown,
  FilePdf,
  SuitcaseSimple,
  ListBullets,
  CheckSquare,
  Database,
  Sparkle,
  ArrowsOut,
  X,
  Books,
  Trash,
  Stack,
  ArrowSquareOut,
  PencilSimple,
  Table,
  CheckCircle,
  ArrowLeft,
  MagnifyingGlass,
  Play,
  PhoneCall,
  Plug,
  Globe,
  Clock,
  Lightning,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { getPlaybook, getStepMemoryName, getStepReturns, type Field, type FieldType, type Step, type StepType } from "@/lib/playbook-data"
import { getTemplate, TEMPLATES } from "@/lib/template-data"

// ── Field type config ──────────────────────────────────────────────────

const FIELD_TYPES: Record<
  FieldType,
  { icon: typeof TextT; label: string; color: string; description: string }
> = {
  text: { icon: TextT, label: "Short text", color: "text-zinc-600", description: "A few words or a sentence" },
  long_text: { icon: TextT, label: "Long text", color: "text-zinc-600", description: "A paragraph or longer — summaries, narratives" },
  number: { icon: Hash, label: "Number", color: "text-emerald-700", description: "Any number — count, amount, score" },
  date: { icon: Calendar, label: "Date", color: "text-amber-700", description: "A calendar date" },
  phone: { icon: PhoneCall, label: "Phone", color: "text-violet-700", description: "A phone number — formatted, dialable" },
  list: { icon: ListBullets, label: "List", color: "text-sky-700", description: "A list of items — questions, providers, citations" },
  file: { icon: FilePdf, label: "File", color: "text-rose-700", description: "One or more documents" },
  "case-ref": { icon: SuitcaseSimple, label: "Case", color: "text-blue-800", description: "A case from the system" },
  enum: { icon: CheckSquare, label: "Choice", color: "text-purple-700", description: "Pick one from a list you define" },
  "kb-ref": { icon: Books, label: "Knowledge Base", color: "text-indigo-700", description: "A reference library (prior depos, templates, etc.)" },
  document: {
    icon: Stack,
    label: "Document",
    color: "text-teal-700",
    description: "A formatted deliverable — the extractions fill a template",
  },
  records: {
    icon: Table,
    label: "Records",
    color: "text-violet-700",
    description: "A table of rows — each with typed columns you define",
  },
}

/** Types valid for playbook inputs (what the user fills in to run) */
const INPUT_TYPES: FieldType[] = ["text", "number", "date", "phone", "case-ref", "file", "enum", "list", "kb-ref"]

/** Types valid for playbook outputs (what the AI extracts + the final deliverable) */
const OUTPUT_TYPES: FieldType[] = ["text", "long_text", "number", "date", "list", "records", "document"]

/** Types valid for columns inside a Records field (simpler subset — no nesting) */
const COLUMN_TYPES: FieldType[] = ["text", "long_text", "number", "date", "enum"]

// ── Step type config ───────────────────────────────────────────────────

const STEP_TYPES: Record<
  StepType,
  { icon: typeof Database; label: string; description: string; iconColor: string; iconBg: string; accent: string }
> = {
  fetch: {
    icon: Database,
    label: "Fetch",
    description: "Pull data from the case, files, or a knowledge base",
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    accent: "border-l-amber-500",
  },
  prompt: {
    icon: Sparkle,
    label: "Prompt",
    description: "Ask an AI to analyze or generate something",
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    accent: "border-l-blue-500",
  },
  format: {
    icon: Stack,
    label: "Format",
    description: "Apply prior step outputs to a document template",
    iconColor: "text-teal-700",
    iconBg: "bg-teal-50",
    accent: "border-l-teal-500",
  },
  voice: {
    icon: PhoneCall,
    label: "Outbound Voice",
    description: "Place a phone call. Agent runs goals + extracts structured fields.",
    iconColor: "text-violet-700",
    iconBg: "bg-violet-50",
    accent: "border-l-violet-500",
  },
}

// ── Hook to get current playbook ──────────────────────────────────────

function useCurrentPlaybook(playbookIdProp?: string) {
  const params = useParams()
  const id =
    playbookIdProp ?? (params?.id as string | undefined) ?? "medical-records-summary"
  return getPlaybook(id)
}

// ── Field Row (click to edit) ─────────────────────────────────────────

function FieldRow({ field, onClick }: { field: Field; onClick: () => void }) {
  const typeConfig = FIELD_TYPES[field.type]
  const Icon = typeConfig.icon
  const isDocument = field.type === "document"
  const isRecords = field.type === "records"
  const template = field.templateId ? getTemplate(field.templateId) : undefined
  const columns = field.itemSchema ?? []
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex flex-col rounded-md border text-left transition-all ${
        isDocument
          ? "border-teal-200 bg-teal-50/40 hover:border-teal-400 hover:shadow-sm"
          : isRecords
            ? "border-violet-200 bg-violet-50/30 hover:border-violet-400 hover:shadow-sm"
            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 px-2.5 py-2 w-full">
        <div
          className={`flex items-center justify-center h-6 w-6 rounded-md shrink-0 ${
            isDocument ? "bg-teal-100" : isRecords ? "bg-violet-100" : "bg-gray-50"
          }`}
        >
          <Icon className={`h-3.5 w-3.5 ${typeConfig.color}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-zinc-900">{field.name}</span>
            {field.required && (
              <span className="text-[10px] font-medium text-rose-600 bg-rose-50 rounded px-1 py-0">required</span>
            )}
            {isDocument && (
              <span className="inline-flex items-center gap-1 rounded bg-teal-100 text-teal-800 px-1 py-0 text-[10px] font-semibold">
                Deliverable
              </span>
            )}
            {isRecords && (
              <span className="inline-flex items-center gap-1 rounded bg-violet-100 text-violet-800 px-1 py-0 text-[10px] font-semibold">
                {columns.length} column{columns.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {field.description && (
            <div className="text-[11px] text-zinc-500 truncate">{field.description}</div>
          )}
        </div>
        {isDocument && template ? (
          <div className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-teal-800 shrink-0">
            <template.icon className={`h-3 w-3 ${template.iconColor}`} />
            {template.name}
            <span className="text-[10px] text-zinc-400">· {template.format}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 shrink-0">
            <Icon className={`h-3 w-3 ${typeConfig.color}`} weight="bold" />
            {typeConfig.label}
          </div>
        )}
      </div>
      {/* Records: inline column preview strip */}
      {isRecords && columns.length > 0 && (
        <div className="flex items-center gap-1 px-2.5 pb-2 pt-0 flex-wrap">
          {columns.map((col) => {
            const cfg = FIELD_TYPES[col.type]
            const ColIcon = cfg.icon
            return (
              <span
                key={col.id}
                className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-700"
              >
                <ColIcon className={`h-2.5 w-2.5 ${cfg.color}`} weight="bold" />
                <span className="font-medium">{col.name}</span>
                <span className="text-zinc-400">{cfg.label.toLowerCase()}</span>
              </span>
            )
          })}
        </div>
      )}
    </button>
  )
}

// ── Prompt with variable chips ────────────────────────────────────────

function PromptWithChips({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  return (
    <div className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap font-sans">
      {parts.map((part, i) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          const name = part.slice(2, -2)
          return (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 mx-0.5 rounded bg-blue-100 text-blue-800 px-1.5 py-0 text-[12px] font-medium"
            >
              {name}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

// ── Step Row (with drag handle; click to edit) ────────────────────────

function StepRow({
  step,
  index,
  onClick,
}: {
  step: Step
  index: number
  onClick: () => void
}) {
  const config = STEP_TYPES[step.type]
  const Icon = config.icon
  return (
    <div className={`rounded-md border border-gray-200 bg-white border-l-4 ${config.accent} overflow-hidden`}>
      <button
        type="button"
        onClick={onClick}
        className="group w-full flex items-center gap-2 px-2.5 py-2.5 hover:bg-gray-50 text-left"
      >
        <DotsSixVertical
          className="h-3.5 w-3.5 text-zinc-300 cursor-grab shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-[10px] font-semibold text-zinc-600 shrink-0">
          {index + 1}
        </span>
        <div className={`flex items-center justify-center h-6 w-6 rounded-md ${config.iconBg} shrink-0`}>
          <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-zinc-900">{step.name}</span>
            <span
              className={`inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1 py-0 text-[10px] font-medium ${config.iconColor}`}
            >
              {config.label}
            </span>
          </div>
          {step.type === "prompt" ? (
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">
              <PromptPreview text={step.detail} />
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">{step.detail}</div>
          )}
        </div>
      </button>
    </div>
  )
}

function PromptPreview({ text }: { text: string }) {
  // Render a truncated one-line preview, showing chips inline
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("{{") && part.endsWith("}}")) {
          return (
            <span
              key={i}
              className="inline-flex items-center rounded bg-blue-50 text-blue-800 px-1 py-0 text-[10px] font-medium mx-0.5"
            >
              {part.slice(2, -2)}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

// ── Sections (no counts, callbacks instead of inline forms) ────────────

function InputsSection({
  inputs,
  onEdit,
  onAdd,
}: {
  inputs: Field[]
  onEdit: (field: Field) => void
  onAdd: () => void
}) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Inputs</h3>
          <span className="text-[11px] text-zinc-500">What users fill in when they run this playbook</span>
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        {inputs.map((f) => (
          <FieldRow key={f.id} field={f} onClick={() => onEdit(f)} />
        ))}
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border border-dashed border-gray-300 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add input
        </button>
      </div>
    </section>
  )
}

function StepsSection({
  steps,
  onEdit,
  onAdd,
}: {
  steps: Step[]
  onEdit: (step: Step) => void
  onAdd: (type: StepType) => void
}) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Steps</h3>
          <span className="text-[11px] text-zinc-500">The AI logic that transforms inputs into outputs</span>
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        {steps.map((step, i) => (
          <StepRow key={step.id} step={step} index={i} onClick={() => onEdit(step)} />
        ))}
        <div className="flex items-center gap-1.5">
          {(["fetch", "prompt"] as StepType[]).map((t) => {
            const c = STEP_TYPES[t]
            const Icon = c.icon
            return (
              <button
                key={t}
                onClick={() => onAdd(t)}
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


// ── Format Section (applied template) ──────────────────────────────────

function FormatSection({ templateId }: { templateId?: string }) {
  const template = templateId ? getTemplate(templateId) : undefined
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Format</h3>
          <span className="text-[11px] text-zinc-500">
            Apply the outputs above to this template to produce the deliverable
          </span>
        </div>
      </div>
      <div className="p-2">
        {template ? (
          <Link
            href={`/templates/${template.id}`}
            className="group flex items-center gap-3 px-3 py-3 rounded-md border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className={`flex items-center justify-center h-10 w-10 rounded-[10px] ${template.iconBg} shrink-0`}>
              <template.icon className={`h-5 w-5 ${template.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-semibold text-zinc-900 group-hover:text-blue-800 transition-colors">
                  {template.name}
                </span>
                <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                  {template.format}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                    template.sourceType === "placeholder"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-purple-200 bg-purple-50 text-purple-700"
                  }`}
                >
                  {template.sourceType === "placeholder" ? (
                    <>
                      <span className="font-mono text-[10px]">{"{{ }}"}</span>
                      Placeholder
                    </>
                  ) : (
                    "Example-based"
                  )}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-1">{template.description}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Stack className="h-2.5 w-2.5" />
                  {template.sampleCount} sample{template.sampleCount !== 1 ? "s" : ""}
                </span>
                {template.placeholders.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="font-mono text-[10px]">{"{{ }}"}</span>
                    {template.placeholders.length} fields
                  </span>
                )}
              </div>
            </div>
            <ArrowSquareOut className="h-4 w-4 text-zinc-400 group-hover:text-blue-800 transition-colors shrink-0" />
          </Link>
        ) : (
          <button className="w-full flex items-center justify-center gap-1.5 px-2.5 py-3 rounded-md border border-dashed border-gray-300 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            Apply output to a template
          </button>
        )}
      </div>
    </section>
  )
}

// ── Drawer state ──────────────────────────────────────────────────────

type DrawerState =
  | { kind: "input"; existing: Field | null }
  | { kind: "step"; existing: Step | null; stepType?: StepType }
  | null

// ── Columns Editor (for "Records" output type) ────────────────────────

// ── Fetch memory hint (the step name IS the memory variable) ──────────

function FetchMemoryHint({ stepName }: { stepName: string }) {
  const display = stepName.trim() || "name your step"
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/40 px-3 py-2 flex items-center gap-2">
      <Database className="h-3.5 w-3.5 text-amber-700 shrink-0" weight="bold" />
      <div className="text-xs text-zinc-700 leading-snug min-w-0">
        Adds <code className="font-mono bg-white border border-amber-200 px-1.5 py-0.5 rounded text-[11px] text-amber-800 mx-0.5">{`{{${display}}}`}</code>
        to memory. Later steps reference it by the step&rsquo;s name.
      </div>
    </div>
  )
}

function ColumnsEditor({
  columns,
  onChange,
  label = "Columns",
  helper = "One typed field per column. Like a spreadsheet.",
  fieldTypes,
  required = true,
}: {
  columns: Field[]
  onChange: (c: Field[]) => void
  label?: string
  helper?: string
  fieldTypes?: FieldType[]
  required?: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const saveColumn = (col: Field) => {
    if (columns.find((c) => c.id === col.id)) {
      onChange(columns.map((c) => (c.id === col.id ? col : c)))
    } else {
      onChange([...columns, col])
    }
    setEditingId(null)
    setAdding(false)
  }

  const deleteColumn = (id: string) => {
    onChange(columns.filter((c) => c.id !== id))
    setEditingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        <span className="text-[10px] text-zinc-500">{helper}</span>
      </div>
      <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5 space-y-1">
        {columns.map((col) => {
          const cfg = FIELD_TYPES[col.type]
          const ColIcon = cfg.icon
          const isEditing = editingId === col.id
          if (isEditing) {
            return (
              <ColumnForm
                key={col.id}
                existing={col}
                onSave={saveColumn}
                onDelete={() => deleteColumn(col.id)}
                onCancel={() => setEditingId(null)}
                fieldTypes={fieldTypes}
              />
            )
          }
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => {
                setEditingId(col.id)
                setAdding(false)
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded border border-transparent bg-white hover:border-blue-300 transition-colors text-left"
            >
              <DotsSixVertical className="h-3 w-3 text-zinc-300 shrink-0" />
              <div className={`flex items-center justify-center h-5 w-5 rounded bg-gray-50 shrink-0`}>
                <ColIcon className={`h-3 w-3 ${cfg.color}`} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-900 truncate">{col.name}</div>
                {col.description && (
                  <div className="text-[11px] text-zinc-500 truncate">{col.description}</div>
                )}
              </div>
              <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1 py-0 text-[10px] font-medium text-zinc-600 shrink-0">
                {cfg.label}
              </span>
            </button>
          )
        })}

        {adding ? (
          <ColumnForm
            existing={null}
            onSave={saveColumn}
            onCancel={() => setAdding(false)}
            fieldTypes={fieldTypes}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded border border-dashed border-gray-300 text-[11px] font-medium text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add column
          </button>
        )}
      </div>
    </div>
  )
}

// ── Column Form (small inline editor used within ColumnsEditor) ───────

function ColumnForm({
  existing,
  onSave,
  onDelete,
  onCancel,
  fieldTypes,
}: {
  existing: Field | null
  onSave: (f: Field) => void
  onDelete?: () => void
  onCancel: () => void
  fieldTypes?: FieldType[]
}) {
  const TYPES = fieldTypes ?? COLUMN_TYPES
  const [name, setName] = useState(existing?.name ?? "")
  const [type, setType] = useState<FieldType>(existing?.type ?? "text")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [options, setOptions] = useState((existing?.options ?? []).join("\n"))
  const needsOptions = type === "enum"
  const canSave = name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: existing?.id ?? `col_${Date.now()}`,
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      options: needsOptions ? options.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
    })
  }

  return (
    <div className="rounded-md border-2 border-blue-200 bg-white p-2.5 space-y-2.5">
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 block mb-1">
          Column name
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Question, Flag, Reasoning, Source"
          className="w-full h-8 px-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 block mb-1">Type</label>
        <div className="grid grid-cols-5 gap-1">
          {TYPES.map((t) => {
            const cfg = FIELD_TYPES[t]
            const ColIcon = cfg.icon
            const active = type === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded border text-[10px] font-medium transition-all ${
                  active
                    ? "border-blue-800 bg-blue-50/40 text-blue-800 ring-2 ring-blue-100"
                    : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300"
                }`}
              >
                <ColIcon className={`h-3.5 w-3.5 ${active ? "text-blue-800" : cfg.color}`} weight="bold" />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>
      {needsOptions && (
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 block mb-1">
            Options <span className="text-zinc-400 normal-case tracking-normal">· one per line</span>
          </label>
          <textarea
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Discrepancy&#10;Contradiction&#10;Liability&#10;Medical&#10;Standard"
            rows={4}
            className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none font-mono"
          />
        </div>
      )}
      <div>
        <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 block mb-1">
          Description <span className="text-zinc-400 normal-case tracking-normal">· optional</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this column represents"
          rows={2}
          className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed"
        />
      </div>
      <div className="flex items-center gap-1">
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Delete column"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={onCancel}
          className="h-7 px-2 text-xs font-medium text-zinc-600 hover:bg-gray-100 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="h-7 px-2 text-xs font-medium text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          {existing ? "Done" : "Add"}
        </button>
      </div>
    </div>
  )
}

// ── Template Picker (for "Document" output type) ──────────────────────

function TemplatePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const all = Object.values(TEMPLATES)
  const selected = value ? TEMPLATES[value] : undefined
  return (
    <div>
      <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
        Template
      </label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-left transition-all ${
          selected
            ? "border-gray-200 bg-white hover:border-gray-300"
            : "border-dashed border-gray-300 bg-gray-50 text-zinc-500 hover:border-blue-300"
        }`}
      >
        {selected ? (
          <>
            <div className={`flex items-center justify-center h-7 w-7 rounded-md ${selected.iconBg} shrink-0`}>
              <selected.icon className={`h-4 w-4 ${selected.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-900 truncate">{selected.name}</span>
                <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600">
                  {selected.format}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {selected.placeholders.length} placeholder{selected.placeholders.length !== 1 ? "s" : ""}
              </div>
            </div>
          </>
        ) : (
          <>
            <Stack className="h-4 w-4 text-zinc-400 shrink-0" />
            <span className="flex-1">Pick a template…</span>
          </>
        )}
        <CaretDown className="h-3 w-3 text-zinc-400 shrink-0" />
      </button>

      {open && (
        <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden max-h-[260px] overflow-y-auto">
          {all.map((t) => {
            const active = value === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange(t.id)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-sm text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                  active ? "bg-blue-50/40" : ""
                }`}
              >
                <div className={`flex items-center justify-center h-6 w-6 rounded-md ${t.iconBg} shrink-0`}>
                  <t.icon className={`h-3.5 w-3.5 ${t.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-zinc-900 truncate">{t.name}</span>
                    <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1 py-0 text-[10px] font-medium text-zinc-600">
                      {t.format}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{t.description}</div>
                </div>
              </button>
            )
          })}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <Link
              href="/templates"
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-blue-800 hover:bg-white rounded font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              Create new template
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Type select (compact dropdown for picking a FieldType) ────────────

function TypeSelect({
  value,
  onChange,
  options,
}: {
  value: FieldType
  onChange: (t: FieldType) => void
  options: FieldType[]
}) {
  const [open, setOpen] = useState(false)
  const cfg = FIELD_TYPES[value]
  const Icon = cfg.icon
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md border bg-white text-left transition-colors ${
          open ? "border-blue-800 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-center h-6 w-6 rounded bg-gray-50 shrink-0">
          <Icon className={`h-3.5 w-3.5 ${cfg.color}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-zinc-900">{cfg.label}</div>
          <div className="text-[11px] text-zinc-500 truncate">{cfg.description}</div>
        </div>
        <CaretDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden max-h-[320px] overflow-y-auto">
            {options.map((t) => {
              const optCfg = FIELD_TYPES[t]
              const OptIcon = optCfg.icon
              const isActive = value === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onChange(t)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-gray-50 ${
                    isActive ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-center h-6 w-6 rounded bg-gray-50 shrink-0">
                    <OptIcon className={`h-3.5 w-3.5 ${optCfg.color}`} weight="bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-900">{optCfg.label}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{optCfg.description}</div>
                  </div>
                  {isActive && <CheckCircle className="h-3.5 w-3.5 text-blue-800 shrink-0" weight="fill" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Field Form (shared for input & output in drawer) ──────────────────

function FieldForm({
  kind,
  existing,
  onSave,
  onDelete,
  onCancel,
}: {
  kind: "input"
  existing: Field | null
  onSave: (f: Field) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(existing?.name ?? "")
  const [type, setType] = useState<FieldType>(existing?.type ?? "text")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [required, setRequired] = useState(existing?.required ?? false)
  const [options, setOptions] = useState((existing?.options ?? []).join("\n"))
  const [templateId, setTemplateId] = useState(existing?.templateId ?? "")
  const [columns, setColumns] = useState<Field[]>(existing?.itemSchema ?? [])

  const needsOptions = type === "enum"
  const needsTemplate = type === "document"
  const needsColumns = type === "records"
  const canSave =
    name.trim().length > 0 &&
    (!needsTemplate || !!templateId) &&
    (!needsColumns || columns.length > 0)
  const isEditing = existing !== null

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: existing?.id ?? `new_${Date.now()}`,
      name: name.trim(),
      type,
      required: kind === "input" && required,
      description: description.trim() || undefined,
      options: needsOptions ? options.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
      templateId: needsTemplate ? templateId : undefined,
      itemSchema: needsColumns ? columns : undefined,
    })
  }

  const TYPE_ORDER: FieldType[] = kind === "input" ? INPUT_TYPES : OUTPUT_TYPES

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-5 space-y-5">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
            Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "input" ? "e.g. Case, Records, Plaintiff name" : "e.g. summary, gaps_found"}
            className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">Type</label>
          <TypeSelect value={type} onChange={setType} options={TYPE_ORDER} />
        </div>

        {needsOptions && (
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
              Options <span className="text-zinc-400 normal-case tracking-normal">· one per line</span>
            </label>
            <textarea
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Plaintiff&#10;Defendant&#10;Expert witness"
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none font-mono"
            />
          </div>
        )}

        {needsTemplate && <TemplatePicker value={templateId} onChange={setTemplateId} />}

        {needsColumns && <ColumnsEditor columns={columns} onChange={setColumns} />}

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
            Description <span className="text-zinc-400 normal-case tracking-normal">· optional</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Help text shown to the user"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none leading-relaxed"
          />
        </div>

        {kind === "input" && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-800 focus:ring-blue-500"
            />
            <span className="text-sm text-zinc-700">Required</span>
            <span className="text-[11px] text-zinc-500">— the user must fill this in</span>
          </label>
        )}
      </div>

      <div className="border-t border-gray-200 px-5 py-3 flex items-center gap-2 shrink-0 bg-white">
        {isEditing && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Delete"
          >
            <Trash className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onCancel} className="h-9">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          className="h-9 bg-blue-800 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? "Save changes" : `Add ${kind}`}
        </Button>
      </div>
    </div>
  )
}

// ── Inline Step Editor (renders in the canvas, not the rail) ──────────

type VarSource = { label: string; vars: string[] }

function VoiceCallConfig({
  voice,
  onChange,
  phoneInputNames,
}: {
  voice: NonNullable<Step["voice"]>
  onChange: (v: NonNullable<Step["voice"]>) => void
  phoneInputNames: string[]
}) {
  const update = (patch: Partial<NonNullable<Step["voice"]>>) => onChange({ ...voice, ...patch })
  return (
    <div className="rounded-md border border-violet-200 bg-violet-50/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <PhoneCall className="h-3.5 w-3.5 text-violet-700" weight="bold" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-800">
          Call configuration
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {/* Dials */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 block mb-1">
            Dials
          </label>
          {phoneInputNames.length > 0 ? (
            <select
              value={voice.phoneInput ?? ""}
              onChange={(e) => update({ phoneInput: e.target.value || undefined })}
              className="w-full h-8 px-2 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">— pick a phone input —</option>
              {phoneInputNames.map((n) => (
                <option key={n} value={n}>
                  {`{{${n}}}`}
                </option>
              ))}
            </select>
          ) : (
            <div className="h-8 flex items-center px-2 text-[11px] rounded border border-dashed border-gray-300 bg-white text-zinc-500">
              Add a Phone-typed input first
            </div>
          )}
        </div>
        {/* Language */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 block mb-1">
            Language
          </label>
          <select
            value={voice.language ?? "auto"}
            onChange={(e) => update({ language: e.target.value as "en" | "es" | "auto" })}
            className="w-full h-8 px-2 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
          >
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        {/* Max duration */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 block mb-1">
            Max duration
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={60}
              value={Math.round((voice.maxDurationSec ?? 600) / 60)}
              onChange={(e) =>
                update({ maxDurationSec: Math.max(1, Number(e.target.value || 1)) * 60 })
              }
              className="w-16 h-8 px-2 text-xs rounded border border-gray-200 bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
            <span className="text-[11px] text-zinc-500">min</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepEditor({
  existing,
  stepType,
  index,
  varSources,
  phoneInputNames,
  onSave,
  onDelete,
  onCancel,
}: {
  existing: Step | null
  stepType: StepType
  index: number
  varSources: VarSource[]
  phoneInputNames: string[]
  onSave: (s: Step) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(existing?.name ?? "")
  const [detail, setDetail] = useState(existing?.detail ?? "")
  const [returns, setReturns] = useState<Field[]>(existing?.returns ?? [])
  const [voiceConfig, setVoiceConfig] = useState<NonNullable<Step["voice"]>>(
    existing?.voice ?? {
      phoneInput: undefined,
      goals: [],
      maxDurationSec: 600,
      language: "auto",
    }
  )
  const [templateId, setTemplateId] = useState(existing?.templateId ?? "")
  const type = existing?.type ?? stepType
  const cfg = STEP_TYPES[type]
  const Icon = cfg.icon
  const isFormat = type === "format"
  const isFetch = type === "fetch"
  const isVoice = type === "voice"
  const isEditing = existing !== null
  const canSave =
    name.trim().length > 0 &&
    detail.trim().length > 0 &&
    (!isFormat || !!templateId)

  const detailRef = useRef<HTMLTextAreaElement | null>(null)
  const insertVariable = (v: string) => {
    const token = `{{${v}}}`
    const ta = detailRef.current
    // Insert at cursor if textarea is focused; otherwise append with a space.
    if (ta && document.activeElement === ta) {
      const start = ta.selectionStart ?? ta.value.length
      const end = ta.selectionEnd ?? ta.value.length
      const next = ta.value.slice(0, start) + token + ta.value.slice(end)
      setDetail(next)
      // Restore cursor just after the inserted token
      requestAnimationFrame(() => {
        if (!ta) return
        const pos = start + token.length
        ta.focus()
        ta.setSelectionRange(pos, pos)
      })
      return
    }
    setDetail((prev) => (prev ? `${prev} ${token}` : token))
  }

  // Format steps auto-synthesize a single `document` return from the template.
  // Other types use the user-edited returns array.
  const computeReturns = (): Field[] | undefined => {
    if (isFormat) {
      const tpl = templateId ? getTemplate(templateId) : undefined
      if (!tpl) return undefined
      return [
        {
          id: existing?.returns?.[0]?.id ?? `ret_doc_${Date.now()}`,
          name: tpl.name,
          type: "document",
          templateId: tpl.id,
          description: `Filled ${tpl.format} based on this step's prompt`,
        },
      ]
    }
    return returns.length > 0 ? returns : undefined
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: existing?.id ?? `new_${Date.now()}`,
      type,
      name: name.trim(),
      detail: detail.trim(),
      // Fetch steps write to memory implicitly (memory name = step name).
      // Prompt/Format/Voice steps write typed returns.
      returns: isFetch ? undefined : computeReturns(),
      templateId: isFormat ? templateId : undefined,
      voice: isVoice ? voiceConfig : undefined,
    })
  }

  // Type constraints per step type
  const RETURN_TYPES: FieldType[] = isFetch
    ? ["long_text", "records", "list"]
    : ["text", "long_text", "number", "date", "list", "records"]

  return (
    <div className={`w-full rounded-[10px] border border-blue-500 bg-white shadow-[0_0_0_3px_rgba(30,64,175,0.12)] overflow-hidden border-l-4 ${cfg.accent}`}>
      {/* Header strip */}
      <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
        <div className={`flex items-center justify-center h-6 w-6 rounded-md ${cfg.iconBg}`}>
          <Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.iconColor}`}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-zinc-300">·</span>
          <span className="text-[10px] font-medium text-zinc-500">
            Step {index + 1}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center justify-center h-6 w-6 rounded text-zinc-400 hover:text-zinc-700 hover:bg-gray-100 transition-colors"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-4">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
            Name
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "fetch"
                ? "e.g. Fetch case records"
                : type === "format"
                  ? "e.g. Fill demand letter"
                  : type === "voice"
                    ? "e.g. Qualify and book consult"
                    : "e.g. Analyze case for weaknesses"
            }
            className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {isVoice && (
          <VoiceCallConfig
            voice={voiceConfig}
            onChange={setVoiceConfig}
            phoneInputNames={phoneInputNames}
          />
        )}

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
            {type === "fetch"
              ? "What to load"
              : type === "format"
                ? "How to fill the template"
                : type === "voice"
                  ? "What the agent says"
                  : "Prompt"}
          </label>
          <div className="rounded-md border border-gray-200 bg-white overflow-hidden focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
            <textarea
              ref={detailRef}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={
                type === "fetch"
                  ? "e.g. Load all PDFs from {{Records}} and extract text"
                  : type === "format"
                    ? "e.g. Fill the demand letter using {{Facts}} and {{Damages}}"
                    : type === "voice"
                      ? "You are an intake specialist for...\n\nGOALS:\n  1. Confirm identity\n  2. Get incident date\n  3. Confirm injury\n  4. Book consult"
                      : "e.g. Analyze the records for {{Case}} and identify treatment gaps..."
              }
              rows={6}
              className="w-full px-3 py-2 text-sm bg-white focus:outline-none resize-none leading-relaxed"
            />
            {varSources.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 px-2 py-1.5 space-y-1">
                {varSources.map((group) => (
                  <div key={group.label} className="flex items-start gap-1.5 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 mr-1 mt-1 shrink-0">
                      {group.label}:
                    </span>
                    {group.vars.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onMouseDown={(e) => {
                          // Prevent the textarea from losing focus before insertVariable runs
                          e.preventDefault()
                          insertVariable(v)
                        }}
                        className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-800 px-1.5 py-0.5 text-[11px] font-medium hover:bg-blue-100 transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Variables you reference here become available to later steps via
            this step&apos;s <span className="font-medium">Returns</span>.
          </p>
        </div>

        {isFormat && <TemplatePicker value={templateId} onChange={setTemplateId} />}

        {isFormat ? null : isFetch ? (
          <FetchMemoryHint stepName={name} />
        ) : (
          <ColumnsEditor
            columns={returns}
            onChange={setReturns}
            label="Returns"
            helper="What this step produces. Later steps reference these by name."
            fieldTypes={RETURN_TYPES}
            required={false}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-1.5 bg-gray-50/60">
        {isEditing && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Delete step"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={onCancel} className="h-7 text-xs">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          className="h-7 text-xs bg-blue-800 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? "Save changes" : `Add ${cfg.label.toLowerCase()}`}
        </Button>
      </div>
    </div>
  )
}

// ── Main: Inline Definition Panel ─────────────────────────────────────

export function DefinitionPanel({ playbookId }: { playbookId?: string } = {}) {
  const playbook = useCurrentPlaybook(playbookId)
  const [inputs, setInputs] = useState<Field[]>(playbook.inputs)
  const [steps, setSteps] = useState<Step[]>(playbook.steps)
  const [selection, setSelection] = useState<DrawerState>(null)

  const lastStep = steps[steps.length - 1]
  const deliverable = lastStep ? getStepReturns(lastStep) : []
  const phoneInputNames = inputs.filter((i) => i.type === "phone").map((i) => i.name)

  // Build available variable sources for a step at the given index.
  // A step can reference:
  //   - Inputs (run-time arguments)
  //   - Memory (unstructured context loaded by prior fetch steps + KB inputs)
  //   - Data  (typed returns from prior prompt/format steps)
  const varSourcesFor = (stepIndex: number): VarSource[] => {
    const inputVars = inputs.filter((i) => i.type !== "kb-ref").map((i) => i.name)
    const kbVars = inputs.filter((i) => i.type === "kb-ref").map((i) => i.name)

    const memoryVars: string[] = [...kbVars]
    const dataVars: string[] = []

    for (let i = 0; i < stepIndex; i++) {
      const s = steps[i]
      const mem = getStepMemoryName(s)
      if (mem) memoryVars.push(mem)
      getStepReturns(s).forEach((r) => dataVars.push(r.name))
    }

    const sources: VarSource[] = []
    if (inputVars.length > 0) sources.push({ label: "Inputs", vars: inputVars })
    if (memoryVars.length > 0) sources.push({ label: "Memory", vars: memoryVars })
    if (dataVars.length > 0) sources.push({ label: "Data", vars: dataVars })
    return sources
  }

  const saveField = (f: Field) => {
    setInputs((prev) => {
      const idx = prev.findIndex((x) => x.id === f.id)
      if (idx === -1) return [...prev, f]
      const next = [...prev]
      next[idx] = f
      return next
    })
    setSelection(null)
  }

  const deleteField = (f: Field) => {
    setInputs((prev) => prev.filter((x) => x.id !== f.id))
    setSelection(null)
  }

  const saveStep = (s: Step) => {
    setSteps((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id)
      if (idx === -1) return [...prev, s]
      const next = [...prev]
      next[idx] = s
      return next
    })
    setSelection(null)
  }

  const deleteStep = (s: Step) => {
    setSteps((prev) => prev.filter((x) => x.id !== s.id))
    setSelection(null)
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Canvas — dot grid bg */}
      <div
        className="flex-1 min-w-0 overflow-auto relative bg-white"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15, 23, 42, 0.08) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        <div
          className="mx-auto pt-12 pb-12 px-6 flex flex-col items-stretch w-full"
        >
          {/* Trigger node — shown when the playbook is event-triggered */}
          {playbook.trigger && playbook.trigger.kind !== "manual" && (
            <>
              <div className="w-full max-w-[640px] mx-auto">
                <TriggerNode trigger={playbook.trigger} />
              </div>
              <FlowConnector />
            </>
          )}

          {/* Trigger / Inputs */}
          <div className="w-full max-w-[640px] mx-auto">
          <FlowNode
            icon={SuitcaseSimple}
            iconBg="bg-blue-50"
            iconColor="text-blue-800"
            title="Inputs collected"
            subtitle={
              inputs.length === 0
                ? "Add the fields the user provides"
                : `${inputs.length} field${inputs.length !== 1 ? "s" : ""}`
            }
            isSelected={selection?.kind === "input" && selection.existing === null}
          >
            <div className="space-y-0.5">
              {inputs.map((f) => (
                <CompactFieldRow
                  key={f.id}
                  field={f}
                  selected={selection?.kind === "input" && selection.existing?.id === f.id}
                  onClick={() => setSelection({ kind: "input", existing: f })}
                />
              ))}
              <button
                onClick={() => setSelection({ kind: "input", existing: null })}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-dashed border-gray-300 text-[11px] font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add input
              </button>
            </div>
          </FlowNode>
          </div>

          <FlowConnector />

          {/* Step nodes */}
          {steps.map((step, i) => {
            const stepCfg = STEP_TYPES[step.type]
            const StepIcon = stepCfg.icon
            const editingThis =
              selection?.kind === "step" && selection.existing?.id === step.id
            const isLast = i === steps.length - 1
            return (
              <Fragment key={step.id}>
                {editingThis ? (
                  <div className="w-full max-w-[960px] mx-auto">
                    <StepEditor
                      existing={step}
                      stepType={step.type}
                      index={i}
                      varSources={varSourcesFor(i)}
                      phoneInputNames={phoneInputNames}
                      onSave={saveStep}
                      onDelete={() => deleteStep(step)}
                      onCancel={() => setSelection(null)}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[640px] mx-auto">
                    <FlowNode
                      icon={StepIcon}
                      iconBg={stepCfg.iconBg}
                      iconColor={stepCfg.iconColor}
                      title={step.name}
                      subtitle={step.detail || "No description"}
                      onClick={() => setSelection({ kind: "step", existing: step })}
                      returns={getStepReturns(step)}
                      memoryName={getStepMemoryName(step)}
                      isLast={isLast}
                    />
                  </div>
                )}
                <FlowConnector />
              </Fragment>
            )
          })}

          {/* New step being added — appears at end */}
          {selection?.kind === "step" && selection.existing === null && (
            <>
              <div className="w-full max-w-[960px] mx-auto">
                <StepEditor
                  existing={null}
                  stepType={selection.stepType ?? "prompt"}
                  index={steps.length}
                  varSources={varSourcesFor(steps.length)}
                  phoneInputNames={phoneInputNames}
                  onSave={saveStep}
                  onDelete={() => setSelection(null)}
                  onCancel={() => setSelection(null)}
                />
              </div>
              <FlowConnector />
            </>
          )}

          {/* Add step buttons — hidden while editing/adding a step */}
          {selection?.kind !== "step" && (
            <div className="flex items-center justify-center gap-2 my-1 mb-3 flex-wrap">
              <button
                onClick={() => setSelection({ kind: "step", existing: null, stepType: "fetch" })}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white/80 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                <Database className="h-3.5 w-3.5" weight="bold" />
                Add Fetch
              </button>
              <button
                onClick={() => setSelection({ kind: "step", existing: null, stepType: "prompt" })}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white/80 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Sparkle className="h-3.5 w-3.5" weight="bold" />
                Add Prompt
              </button>
              <button
                onClick={() => setSelection({ kind: "step", existing: null, stepType: "format" })}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white/80 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <Stack className="h-3.5 w-3.5" weight="bold" />
                Add Format
              </button>
              <button
                onClick={() => setSelection({ kind: "step", existing: null, stepType: "voice" })}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white/80 backdrop-blur px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" weight="bold" />
                Add Outbound Voice
              </button>
            </div>
          )}

          {/* Terminator — always closes the flow visually, even on a blank canvas. */}
          <FlowConnector />
          <FlowTerminator playbookId={playbook.id} />

        </div>
      </div>

      {/* Right sidebar (swaps between Overview and Editor) */}
      <RightSidebar
        playbook={playbook}
        inputCount={inputs.length}
        stepCount={steps.length}
        deliverable={deliverable}
        selection={selection}
        onBack={() => setSelection(null)}
        onSaveField={saveField}
        onDeleteField={deleteField}
      />
    </div>
  )
}


// ── Flow node card (the visual building block) ────────────────────────

function FlowNode({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  isSelected = false,
  children,
  onClick,
  returns,
  memoryName,
  isLast = false,
}: {
  icon: typeof Plus
  iconBg: string
  iconColor: string
  title: string
  subtitle?: string
  isSelected?: boolean
  children?: React.ReactNode
  onClick?: () => void
  returns?: Field[]
  memoryName?: string | null
  isLast?: boolean
}) {
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper
      onClick={onClick}
      className={`relative w-full text-left rounded-[10px] border bg-white overflow-hidden transition-all ${
        isSelected
          ? "border-blue-500 shadow-[0_0_0_3px_rgba(30,64,175,0.12)]"
          : "border-gray-200 " + (onClick ? "hover:border-blue-300 hover:shadow-sm cursor-pointer" : "")
      }`}
    >
      <div className="px-3 py-2.5 flex items-start gap-2.5">
        <div className={`flex items-center justify-center h-6 w-6 rounded-md ${iconBg} shrink-0 mt-0.5`}>
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900 truncate">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {children && <div className="border-t border-gray-100 px-3 py-2">{children}</div>}
      {memoryName && (
        <div className="border-t border-amber-100 bg-amber-50/40 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 mb-1">
            Adds to memory
          </div>
          <span className="inline-flex items-center rounded border border-amber-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-700">
            <span className="font-medium font-mono">{`{{${memoryName}}}`}</span>
          </span>
        </div>
      )}
      {returns && returns.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">
            Returns
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {returns.map((r) => {
              const rcfg = FIELD_TYPES[r.type]
              const RIcon = rcfg.icon
              return (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-700"
                >
                  <RIcon className={`h-2.5 w-2.5 ${rcfg.color}`} weight="bold" />
                  <span className="font-medium">{r.name}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </Wrapper>
  )
}

function TriggerNode({ trigger }: { trigger: NonNullable<ReturnType<typeof useCurrentPlaybook>["trigger"]> }) {
  const Icon =
    trigger.kind === "integration"
      ? Plug
      : trigger.kind === "webform"
        ? Globe
        : trigger.kind === "cadence"
          ? Clock
          : trigger.kind === "webhook"
            ? Lightning
            : Lightning
  return (
    <div className="rounded-[10px] border border-violet-300 bg-violet-50/40 overflow-hidden">
      <div className="px-3 py-2.5 flex items-start gap-2.5">
        <div className="flex items-center justify-center h-6 w-6 rounded-md bg-violet-100 shrink-0 mt-0.5">
          <Icon className="h-3.5 w-3.5 text-violet-700" weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">
              Triggered by
            </span>
            {trigger.source && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                · {trigger.source}
              </span>
            )}
          </div>
          {trigger.event && (
            <div className="text-sm font-semibold text-zinc-900">{trigger.event}</div>
          )}
          {trigger.description && (
            <div className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
              {trigger.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FlowConnector() {
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <div className="h-5 w-px bg-gray-300" />
    </div>
  )
}

function FlowTerminator({ playbookId }: { playbookId: string }) {
  return (
    <div className="flex justify-center">
      <Link
        href={`/playbooks?p=${playbookId}`}
        className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 hover:border-blue-300 hover:text-blue-800 transition-colors shadow-sm"
      >
        <span className="flex items-center justify-center h-4 w-4 rounded-full bg-zinc-100 group-hover:bg-blue-50 transition-colors">
          <CheckCircle className="h-2.5 w-2.5 text-zinc-500 group-hover:text-blue-800" weight="fill" />
        </span>
        <span>Ends &mdash; result is saved to the Runs table</span>
        <ArrowSquareOut className="h-3 w-3 text-zinc-400 group-hover:text-blue-800" weight="bold" />
      </Link>
    </div>
  )
}

function CompactFieldRow({
  field,
  onClick,
  selected = false,
}: {
  field: Field
  onClick: () => void
  selected?: boolean
}) {
  const cfg = FIELD_TYPES[field.type]
  const Icon = cfg.icon
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border text-left transition-colors ${
        selected
          ? "border-blue-300 bg-blue-50/40"
          : "border-transparent hover:border-gray-200 hover:bg-gray-50/80"
      }`}
    >
      <Icon className={`h-3 w-3 ${cfg.color} shrink-0`} weight="bold" />
      <span className="text-xs text-zinc-800 flex-1 truncate">{field.name}</span>
      {field.required && (
        <span className="text-[9px] font-semibold text-rose-600 uppercase tracking-wide">req</span>
      )}
      <span className="text-[10px] text-zinc-400 uppercase tracking-wide">{cfg.label}</span>
    </button>
  )
}

// ── Right sidebar (swaps between Overview and inline editor) ──────────

function RightSidebar({
  playbook,
  inputCount,
  stepCount,
  deliverable,
  selection,
  onBack,
  onSaveField,
  onDeleteField,
}: {
  playbook: ReturnType<typeof useCurrentPlaybook>
  inputCount: number
  stepCount: number
  deliverable: Field[]
  selection: DrawerState
  onBack: () => void
  onSaveField: (f: Field) => void
  onDeleteField: (f: Field) => void
}) {
  const deliverableCount = deliverable.length
  // EDIT MODE — sidebar swaps only for input editing. Step editing happens inline in the canvas.
  if (selection && selection.kind === "input") {
    return (
      <div className="w-[360px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <SidebarEditHeader selection={selection} onBack={onBack} />
        <div className="flex-1 min-h-0 flex flex-col">
          <FieldForm
            key={`input-${selection.existing?.id ?? "new"}`}
            kind="input"
            existing={selection.existing}
            onSave={onSaveField}
            onDelete={() => selection.existing && onDeleteField(selection.existing)}
            onCancel={onBack}
          />
        </div>
      </div>
    )
  }

  // OVERVIEW MODE — playbook details
  return (
    <div className="w-[360px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">{playbook.name}</h3>
          <p className="text-xs text-zinc-600 leading-relaxed line-clamp-4">{playbook.description}</p>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
            Stats
          </h4>
          <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Inputs</span>
              <span className="text-zinc-900 font-medium tabular-nums">{inputCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Steps</span>
              <span className="text-zinc-900 font-medium tabular-nums">{stepCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Deliverable</span>
              <span className="text-zinc-900 font-medium tabular-nums">
                {deliverableCount} field{deliverableCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Helpful resources at bottom */}
      <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
          Helpful resources
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <ResourceCard icon={PencilSimple} label="Documentation" hint="How playbooks work" />
          <ResourceCard icon={Stack} label="Templates" hint="Start from a template" />
        </div>
      </div>
    </div>
  )
}

function SidebarEditHeader({
  selection,
  onBack,
}: {
  selection: NonNullable<DrawerState>
  onBack: () => void
}) {
  const title = (() => {
    if (selection.kind === "input") return selection.existing ? "Edit input" : "New input"
    return selection.existing ? "Edit step" : "New step"
  })()
  const subtitle = (() => {
    if (selection.kind === "input") return "A field the user will fill in"
    return "A step in your AI logic"
  })()
  return (
    <div className="flex items-center gap-2 px-3 h-12 border-b border-gray-200 shrink-0 bg-white">
      <button
        onClick={onBack}
        className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
        title="Back to overview"
      >
        <ArrowLeft className="h-4 w-4" weight="bold" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-900 leading-tight">{title}</div>
        <div className="text-[11px] text-zinc-500 leading-tight truncate">{subtitle}</div>
      </div>
      <button
        onClick={onBack}
        className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500"
        title="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}


function ResourceCard({ icon: Icon, label, hint }: { icon: typeof PencilSimple; label: string; hint: string }) {
  return (
    <button className="flex flex-col items-start gap-1 px-2.5 py-2 rounded-md border border-gray-200 bg-white hover:border-blue-300 transition-colors text-left">
      <Icon className="h-4 w-4 text-blue-800" />
      <span className="text-xs font-semibold text-zinc-900">{label}</span>
      <span className="text-[10px] text-zinc-500">{hint}</span>
    </button>
  )
}

// ── Back-compat: WorkflowBuilder (exported, kept minimal) ─────────────

export function WorkflowBuilder() {
  return <DefinitionPanel />
}

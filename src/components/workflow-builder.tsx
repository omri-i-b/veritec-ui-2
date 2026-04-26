"use client"

import { Fragment, useState } from "react"
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
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { getPlaybook, type Field, type FieldType, type Step, type StepType } from "@/lib/playbook-data"
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
const INPUT_TYPES: FieldType[] = ["text", "number", "date", "case-ref", "file", "enum", "list", "kb-ref"]

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
}

// ── Hook to get current playbook ──────────────────────────────────────

function useCurrentPlaybook() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "medical-records-summary"
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

function OutputsSection({
  outputs,
  onEdit,
  onAdd,
}: {
  outputs: Field[]
  onEdit: (field: Field) => void
  onAdd: () => void
}) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">Outputs</h3>
          <span className="text-[11px] text-zinc-500">These become columns in the Runs grid</span>
        </div>
      </div>
      <div className="p-2 space-y-1.5">
        {outputs.map((f) => (
          <FieldRow key={f.id} field={f} onClick={() => onEdit(f)} />
        ))}
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border border-dashed border-gray-300 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add output
        </button>
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
  | { kind: "output"; existing: Field | null }
  | { kind: "step"; existing: Step | null; stepType?: StepType }
  | null

// ── Columns Editor (for "Records" output type) ────────────────────────

function ColumnsEditor({
  columns,
  onChange,
}: {
  columns: Field[]
  onChange: (c: Field[]) => void
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
          Columns <span className="text-rose-600">*</span>
        </label>
        <span className="text-[10px] text-zinc-500">One typed field per column. Like a spreadsheet.</span>
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
}: {
  existing: Field | null
  onSave: (f: Field) => void
  onDelete?: () => void
  onCancel: () => void
}) {
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
          {COLUMN_TYPES.map((t) => {
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
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this column represents"
          className="w-full h-8 px-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="flex items-center gap-1.5">
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
        <Button variant="outline" size="sm" onClick={onCancel} className="h-7 text-xs">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          className="h-7 text-xs bg-blue-800 hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {existing ? "Save" : "Add column"}
        </Button>
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
        Applied to template <span className="text-rose-600">*</span>
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
      <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
        The extractions above fill this template&apos;s placeholders. Output matches the template format exactly.
      </p>
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
  kind: "input" | "output"
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
          <div className="grid grid-cols-2 gap-1.5">
            {TYPE_ORDER.map((t) => {
              const cfg = FIELD_TYPES[t]
              const Icon = cfg.icon
              const active = type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs font-medium transition-all text-left ${
                    active
                      ? "border-blue-800 bg-blue-50/40 text-blue-800 ring-2 ring-blue-100"
                      : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex items-center justify-center h-7 w-7 rounded-md bg-white border border-gray-200 shrink-0`}>
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-blue-800" : cfg.color}`} weight="bold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{cfg.label}</div>
                    <div className="text-[10px] text-zinc-500 font-normal truncate">{cfg.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
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
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Help text shown to the user"
            className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
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

// ── Step Form (in drawer) ─────────────────────────────────────────────

function StepForm({
  existing,
  stepType,
  availableVars,
  onSave,
  onDelete,
  onCancel,
}: {
  existing: Step | null
  stepType: StepType
  availableVars: string[]
  onSave: (s: Step) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(existing?.name ?? "")
  const [detail, setDetail] = useState(existing?.detail ?? "")
  const isEditing = existing !== null
  const type = existing?.type ?? stepType
  const cfg = STEP_TYPES[type]
  const Icon = cfg.icon
  const canSave = name.trim().length > 0 && detail.trim().length > 0

  const insertVariable = (v: string) => {
    setDetail((prev) => (prev ? `${prev} {{${v}}}` : `{{${v}}}`))
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: existing?.id ?? `new_${Date.now()}`,
      type,
      name: name.trim(),
      detail: detail.trim(),
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-5 space-y-5">
        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">Type</label>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white border-l-4 ${cfg.accent}`}
          >
            <div className={`flex items-center justify-center h-7 w-7 rounded-md ${cfg.iconBg}`}>
              <Icon className={`h-4 w-4 ${cfg.iconColor}`} weight="bold" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-zinc-900">{cfg.label}</div>
              <div className="text-[11px] text-zinc-500">{cfg.description}</div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "fetch" ? "e.g. Fetch case records" : "e.g. Analyze case for weaknesses"}
            className="w-full h-10 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
            {type === "fetch" ? "What to load" : "Prompt"}
          </label>
          <div className="rounded-md border border-gray-200 bg-white overflow-hidden focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={
                type === "fetch"
                  ? "e.g. Load all PDFs from {{Records}} and extract text"
                  : "e.g. Analyze the records for {{Case}} and identify treatment gaps..."
              }
              rows={8}
              className="w-full px-3 py-2 text-sm bg-white focus:outline-none resize-none leading-relaxed"
            />
            {availableVars.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 px-2 py-1.5 flex items-center gap-1 flex-wrap">
                <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 mr-1">Insert variable:</span>
                {availableVars.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-800 px-1.5 py-0.5 text-[11px] font-medium hover:bg-blue-100 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Use <span className="font-mono bg-gray-100 px-1 rounded">{`{{ }}`}</span> to reference inputs from above.
          </p>
        </div>
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
          {isEditing ? "Save changes" : `Add ${cfg.label.toLowerCase()}`}
        </Button>
      </div>
    </div>
  )
}

// ── Drawer shell ──────────────────────────────────────────────────────

function EditorDrawer({
  state,
  availableVars,
  onClose,
  onSaveField,
  onDeleteField,
  onSaveStep,
  onDeleteStep,
}: {
  state: DrawerState
  availableVars: string[]
  onClose: () => void
  onSaveField: (kind: "input" | "output", field: Field) => void
  onDeleteField: (kind: "input" | "output", field: Field) => void
  onSaveStep: (step: Step) => void
  onDeleteStep: (step: Step) => void
}) {
  if (!state) return null

  const title = (() => {
    if (state.kind === "input") return state.existing ? "Edit input" : "New input"
    if (state.kind === "output") return state.existing ? "Edit output" : "New output"
    return state.existing ? "Edit step" : "New step"
  })()

  const subtitle = (() => {
    if (state.kind === "input") return "A field the user will fill in when running this playbook"
    if (state.kind === "output") return "A field this playbook will produce — becomes a column in the Runs grid"
    return "A step in your AI logic"
  })()

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-zinc-900/15 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[520px] bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            <p className="text-[11px] text-zinc-500 truncate">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500"
              title="Expand"
            >
              <ArrowsOut className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {state.kind === "input" && (
          <FieldForm
            kind="input"
            existing={state.existing}
            onSave={(f) => onSaveField("input", f)}
            onDelete={() => state.existing && onDeleteField("input", state.existing)}
            onCancel={onClose}
          />
        )}
        {state.kind === "output" && (
          <FieldForm
            kind="output"
            existing={state.existing}
            onSave={(f) => onSaveField("output", f)}
            onDelete={() => state.existing && onDeleteField("output", state.existing)}
            onCancel={onClose}
          />
        )}
        {state.kind === "step" && (
          <StepForm
            existing={state.existing}
            stepType={state.existing?.type ?? state.stepType ?? "prompt"}
            availableVars={availableVars}
            onSave={onSaveStep}
            onDelete={() => state.existing && onDeleteStep(state.existing)}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  )
}

// ── Main: Inline Definition Panel ─────────────────────────────────────

export function DefinitionPanel() {
  const playbook = useCurrentPlaybook()
  const [inputs, setInputs] = useState<Field[]>(playbook.inputs)
  const [outputs, setOutputs] = useState<Field[]>(playbook.outputs)
  const [steps, setSteps] = useState<Step[]>(playbook.steps)
  const [drawer, setDrawer] = useState<DrawerState>(null)

  const availableVars = inputs.map((i) => i.name)

  const saveField = (kind: "input" | "output", f: Field) => {
    const setter = kind === "input" ? setInputs : setOutputs
    setter((prev) => {
      const idx = prev.findIndex((x) => x.id === f.id)
      if (idx === -1) return [...prev, f]
      const next = [...prev]
      next[idx] = f
      return next
    })
    setDrawer(null)
  }

  const deleteField = (kind: "input" | "output", f: Field) => {
    const setter = kind === "input" ? setInputs : setOutputs
    setter((prev) => prev.filter((x) => x.id !== f.id))
    setDrawer(null)
  }

  const saveStep = (s: Step) => {
    setSteps((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id)
      if (idx === -1) return [...prev, s]
      const next = [...prev]
      next[idx] = s
      return next
    })
    setDrawer(null)
  }

  const deleteStep = (s: Step) => {
    setSteps((prev) => prev.filter((x) => x.id !== s.id))
    setDrawer(null)
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* Canvas */}
      <div className="flex-1 min-w-0 overflow-auto bg-gray-50 relative">
        <div className="max-w-[640px] mx-auto py-10 px-6 flex flex-col items-stretch">
          {/* Inputs node */}
          <FlowNode
            cornerLeft="Inputs"
            cornerRight={inputs.length === 1 ? "1 field" : `${inputs.length} fields`}
            cornerLeftTone="input"
            icon={SuitcaseSimple}
            iconBg="bg-blue-50"
            iconColor="text-blue-800"
            title={inputs.length === 0 ? "No inputs yet" : "Inputs collected from user"}
            subtitle={inputs.length === 0 ? "Add what users will provide" : inputs.map((i) => i.name).join(" · ")}
          >
            <div className="space-y-1">
              {inputs.map((f) => (
                <CompactFieldRow key={f.id} field={f} onClick={() => setDrawer({ kind: "input", existing: f })} />
              ))}
              <button
                onClick={() => setDrawer({ kind: "input", existing: null })}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-dashed border-gray-300 text-[11px] font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add input
              </button>
            </div>
          </FlowNode>

          <FlowConnector />

          {/* Step nodes */}
          {steps.map((step, i) => {
            const stepCfg = STEP_TYPES[step.type]
            const StepIcon = stepCfg.icon
            return (
              <Fragment key={step.id}>
                <FlowNode
                  cornerLeft={stepCfg.label}
                  cornerLeftTone={step.type === "fetch" ? "fetch" : "prompt"}
                  cornerRight={`STEP ${i + 1}`}
                  icon={StepIcon}
                  iconBg={stepCfg.iconBg}
                  iconColor={stepCfg.iconColor}
                  title={step.name}
                  subtitle={step.detail}
                  onClick={() => setDrawer({ kind: "step", existing: step })}
                />
                <FlowConnector />
              </Fragment>
            )
          })}

          {/* Add step buttons */}
          <div className="flex items-center justify-center gap-2 my-2">
            <button
              onClick={() => setDrawer({ kind: "step", existing: null, stepType: "fetch" })}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <Database className="h-3.5 w-3.5" weight="bold" />
              Add Fetch
            </button>
            <button
              onClick={() => setDrawer({ kind: "step", existing: null, stepType: "prompt" })}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Sparkle className="h-3.5 w-3.5" weight="bold" />
              Add Prompt
            </button>
          </div>

          <FlowConnector />

          {/* Outputs node */}
          <FlowNode
            cornerLeft="Outputs"
            cornerLeftTone="output"
            cornerRight={outputs.length === 1 ? "1 field" : `${outputs.length} fields`}
            icon={ListBullets}
            iconBg="bg-green-50"
            iconColor="text-green-700"
            title={outputs.length === 0 ? "No outputs yet" : "Extractions returned"}
            subtitle={
              outputs.length === 0 ? "Define what gets pulled out" : outputs.map((o) => o.name).join(" · ")
            }
          >
            <div className="space-y-1">
              {outputs.map((f) => (
                <CompactFieldRow key={f.id} field={f} onClick={() => setDrawer({ kind: "output", existing: f })} />
              ))}
              <button
                onClick={() => setDrawer({ kind: "output", existing: null })}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded border border-dashed border-gray-300 text-[11px] font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add output
              </button>
            </div>
          </FlowNode>
        </div>

        <FloatingCanvasToolbar />
      </div>

      {/* Right sidebar */}
      <DetailsSidebar
        playbookName={playbook.name}
        playbookDescription={playbook.description}
        inputCount={inputs.length}
        stepCount={steps.length}
        outputCount={outputs.length}
      />

      <EditorDrawer
        state={drawer}
        availableVars={availableVars}
        onClose={() => setDrawer(null)}
        onSaveField={saveField}
        onDeleteField={deleteField}
        onSaveStep={saveStep}
        onDeleteStep={deleteStep}
      />
    </div>
  )
}

// ── Flow node card (the visual building block) ────────────────────────

const CORNER_LEFT_TONES: Record<string, string> = {
  input: "text-blue-800",
  output: "text-green-700",
  fetch: "text-amber-700",
  prompt: "text-blue-800",
}

function FlowNode({
  cornerLeft,
  cornerRight,
  cornerLeftTone = "input",
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
  onClick,
}: {
  cornerLeft: string
  cornerRight: string
  cornerLeftTone?: string
  icon: typeof Plus
  iconBg: string
  iconColor: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  onClick?: () => void
}) {
  const Wrapper = onClick ? "button" : "div"
  const toneClass = CORNER_LEFT_TONES[cornerLeftTone] ?? "text-zinc-700"
  return (
    <Wrapper
      onClick={onClick}
      className={`group relative w-full text-left rounded-[12px] border border-gray-200 bg-white overflow-hidden transition-all ${
        onClick ? "hover:border-blue-300 hover:shadow-sm cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}>
          {cornerLeft}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-400">
          {cornerRight}
        </span>
      </div>
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-start gap-3">
          <div className={`flex items-center justify-center h-7 w-7 rounded-md ${iconBg} shrink-0`}>
            <Icon className={`h-4 w-4 ${iconColor}`} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-900 truncate">{title}</div>
            {subtitle && (
              <div className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mt-0.5">{subtitle}</div>
            )}
          </div>
        </div>
        {children && <div className="mt-3 pt-3 border-t border-gray-100">{children}</div>}
      </div>
    </Wrapper>
  )
}

function FlowConnector() {
  return (
    <div className="flex flex-col items-center py-1 -my-px relative">
      <div className="h-6 w-px bg-gray-300" />
      <div className="h-1.5 w-1.5 rounded-full bg-white border border-gray-300 -my-[3px]" />
      <div className="h-6 w-px bg-gray-300" />
    </div>
  )
}

function CompactFieldRow({ field, onClick }: { field: Field; onClick: () => void }) {
  const cfg = FIELD_TYPES[field.type]
  const Icon = cfg.icon
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded border border-transparent hover:border-gray-200 hover:bg-gray-50/80 text-left transition-colors"
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

// ── Floating bottom toolbar ───────────────────────────────────────────

function FloatingCanvasToolbar() {
  return (
    <div className="sticky bottom-4 mx-auto w-fit flex items-center gap-0.5 rounded-full border border-gray-200 bg-white shadow-lg px-1.5 py-1 mt-6 mb-2">
      <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-gray-100">
        100%
        <CaretDown className="h-3 w-3" />
      </button>
      <div className="h-4 w-px bg-gray-200 mx-1" />
      <ToolbarButton title="Add">
        <Plus className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton title="Test run" tone="primary">
        <Sparkle className="h-3.5 w-3.5" weight="fill" />
      </ToolbarButton>
      <ToolbarButton title="Reset">
        <ArrowsOut className="h-3.5 w-3.5" />
      </ToolbarButton>
      <div className="h-4 w-px bg-gray-200 mx-1" />
      <ToolbarButton title="Duplicate">
        <Plus className="h-3.5 w-3.5 rotate-45" />
      </ToolbarButton>
      <ToolbarButton title="View JSON">
        <Stack className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  title,
  tone = "default",
  children,
}: {
  title: string
  tone?: "default" | "primary"
  children: React.ReactNode
}) {
  const cls =
    tone === "primary"
      ? "bg-blue-800 text-white hover:bg-blue-900"
      : "text-zinc-700 hover:bg-gray-100"
  return (
    <button
      title={title}
      className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors ${cls}`}
    >
      {children}
    </button>
  )
}

// ── Right sidebar (Details) ───────────────────────────────────────────

function DetailsSidebar({
  playbookName,
  playbookDescription,
  inputCount,
  stepCount,
  outputCount,
}: {
  playbookName: string
  playbookDescription: string
  inputCount: number
  stepCount: number
  outputCount: number
}) {
  const [tab, setTab] = useState<"details" | "comments">("details")
  return (
    <div className="w-[320px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center border-b border-gray-200 px-3 gap-0.5 shrink-0">
        {(["details", "comments"] as const).map((t) => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative capitalize ${
                active ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t === "details" ? <PencilSimple className="h-3.5 w-3.5" /> : <ChatBubble />}
              {t}
              {active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {tab === "details" ? (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkle className="h-3.5 w-3.5 text-blue-800" weight="fill" />
                <h3 className="text-sm font-semibold text-zinc-900">{playbookName}</h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{playbookDescription}</p>
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
                  <span className="text-zinc-500">Outputs</span>
                  <span className="text-zinc-900 font-medium tabular-nums">{outputCount}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                Checklist
              </h4>
              <p className="text-[11px] text-zinc-500 mb-2">
                Resolve before publishing
              </p>
              <div className="space-y-1.5">
                <ChecklistRow label="Add inputs" done={inputCount > 0} />
                <ChecklistRow label="Add at least one step" done={stepCount > 0} />
                <ChecklistRow label="Add outputs" done={outputCount > 0} />
                <ChecklistRow label="Run a test" done={false} />
                <ChecklistRow label="Publish v1" done={false} />
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
                Helpful resources
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <ResourceCard icon={PencilSimple} label="Documentation" hint="How playbooks work" />
                <ResourceCard icon={Stack} label="Templates" hint="Start from a template" />
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs text-zinc-500 italic">No comments yet.</div>
        )}
      </div>
    </div>
  )
}

function ChatBubble() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      <path d="M3 3h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8.5l-3 2v-2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    </svg>
  )
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`flex items-center justify-center h-4 w-4 rounded border ${
          done ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-300 text-transparent"
        }`}
      >
        <CheckCircle className="h-3 w-3" weight="fill" />
      </span>
      <span className={done ? "text-zinc-500 line-through" : "text-zinc-800"}>{label}</span>
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

"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  Share,
  DotsThree,
  Clock,
  Info,
  PencilRuler,
  Play,
  CaretRight,
  X,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DefinitionPanel } from "@/components/workflow-builder"
import { getPlaybook, type Field } from "@/lib/playbook-data"
import { UnifiedRuns } from "@/components/unified-runs"

type View = "editor" | "runs"

function PencilRulerIcon({ className }: { className?: string }) {
  return <PencilRuler className={className} />
}

function EditorHeader({
  playbookId,
  onRunClick,
}: {
  playbookId: string
  onRunClick: () => void
}) {
  const pb = getPlaybook(playbookId)
  const Icon = pb.icon
  return (
    <div className="flex h-12 items-center gap-2 border-b border-gray-200 bg-white px-4 shrink-0">
      <Link
        href="/playbooks"
        className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" weight="bold" />
      </Link>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
        <CaretRight className="h-3 w-3 text-zinc-300" weight="bold" />
        <span>Playbooks</span>
      </div>
      <span className="text-zinc-300">/</span>
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center justify-center h-5 w-5 rounded ${pb.iconBg}`}>
          <Icon className={`h-3 w-3 ${pb.iconColor}`} weight="bold" />
        </div>
        <span className="text-sm font-semibold text-zinc-900 truncate max-w-[260px]">{pb.name}</span>
      </div>
      <button className="flex items-center justify-center h-6 w-6 rounded text-zinc-400 hover:text-amber-500 transition-colors" title="Favorite">
        <Star className="h-3.5 w-3.5" />
      </button>
      <div className="flex-1" />
      <Button
        size="sm"
        className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900"
        onClick={onRunClick}
      >
        <Play className="h-3.5 w-3.5" weight="fill" />
        Run
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <Share className="h-3.5 w-3.5" />
        Share
      </Button>
      <button className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500">
        <DotsThree className="h-4 w-4" weight="bold" />
      </button>
    </div>
  )
}

function ViewTabs({ active, onChange, dirty }: { active: View; onChange: (v: View) => void; dirty: boolean }) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200 bg-white px-4 shrink-0">
      <TabButton
        active={active === "editor"}
        onClick={() => onChange("editor")}
        icon={<PencilRulerIcon className="h-3.5 w-3.5" />}
        label="Editor"
      />
      <TabButton
        active={active === "runs"}
        onClick={() => onChange("runs")}
        icon={<Play className="h-3.5 w-3.5" weight="fill" />}
        label="Runs"
      />
      <div className="flex-1" />
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span>Live</span>
        </div>
        <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-blue-800 transition-colors">
          <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white translate-x-[18px] shadow" />
        </button>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
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
      {active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
    </button>
  )
}

function StatusBanner({ onPublish, onDiscard }: { onPublish: () => void; onDiscard: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
          <Info className="h-3.5 w-3.5 text-blue-800" weight="fill" />
        </span>
        <span className="text-zinc-700">This playbook has unpublished changes</span>
      </div>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700" onClick={onDiscard}>
        Discard changes
      </Button>
      <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900" onClick={onPublish}>
        Publish changes
      </Button>
    </div>
  )
}

function RunsTabBody({ playbookId }: { playbookId: string }) {
  return <UnifiedRuns initialPlaybookFilter={playbookId} />
}

const VOICE_PLAYBOOK_IDS = new Set([
  "intake-callback-voice",
  "med-treatment-verification-voice",
])

/** Maps a playbook id to a sample run id we already have a fixture for.
 *  In production this would create a real run record; for the mockup we
 *  navigate to a representative existing one. */
function sampleRunDestinationFor(playbookId: string): string {
  switch (playbookId) {
    case "med-treatment-verification-voice":
      return "/voice/calls/vc_004" // in-flight: Maria Lopez weekly check-in
    case "intake-callback-voice":
      return "/voice/calls/vc_001" // recently completed intake callback
    case "depo-prep":
      return "/runs/run_03DPT"
    case "demand-letter-draft":
      return "/runs/run_02DLD"
    default:
      return `/playbooks?p=${playbookId}`
  }
}

function RunDrawer({
  playbookId,
  onClose,
}: {
  playbookId: string
  onClose: () => void
}) {
  const router = useRouter()
  const pb = getPlaybook(playbookId)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(pb.inputs.map((f) => [f.id, f.sample ?? ""]))
  )
  const isVoice = VOICE_PLAYBOOK_IDS.has(playbookId)
  const handleRun = () => {
    router.push(sampleRunDestinationFor(playbookId))
  }
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-zinc-900/15 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="w-[480px] max-w-[92vw] bg-white border-l border-gray-200 shadow-xl flex flex-col overflow-hidden">
        <header className="flex items-center gap-2 px-4 h-12 border-b border-gray-200 shrink-0">
          <div className={`flex items-center justify-center h-6 w-6 rounded ${pb.iconBg}`}>
            <pb.icon className={`h-3.5 w-3.5 ${pb.iconColor}`} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              Run {pb.name}
            </div>
            <div className="text-[11px] text-zinc-500">
              {isVoice
                ? "Fill in the fields below and the voice agent will dial."
                : "Fill in the fields below and the playbook will run."}
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
          {pb.inputs.map((field) => (
            <InputField
              key={field.id}
              field={field}
              value={values[field.id] ?? ""}
              onChange={(v) => setValues((s) => ({ ...s, [field.id]: v }))}
            />
          ))}
        </div>

        <footer className="border-t border-gray-200 px-4 py-3 flex items-center gap-2 shrink-0 bg-white">
          <span className="text-[11px] text-zinc-500">
            {isVoice
              ? "Call will fire within ~10s of submission"
              : "Run typically completes in under 1 minute"}
          </span>
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
            {isVoice ? "Place call" : "Run"}
          </Button>
        </footer>
      </div>
    </div>
  )
}

function InputField({
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
        <div className="text-[11px] text-zinc-500 leading-relaxed mb-1.5">
          {field.description}
        </div>
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

export function WorkflowEditor() {
  const params = useParams()
  const playbookId = (params?.id as string | undefined) ?? "medical-records-summary"
  const [view, setView] = useState<View>("editor")
  const [dirty, setDirty] = useState(true)
  const [runDrawerOpen, setRunDrawerOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      <EditorHeader playbookId={playbookId} onRunClick={() => setRunDrawerOpen(true)} />
      <ViewTabs active={view} onChange={setView} dirty={dirty} />
      {dirty && view === "editor" && (
        <StatusBanner onPublish={() => setDirty(false)} onDiscard={() => setDirty(false)} />
      )}
      <div className="flex-1 min-h-0 flex">
        {view === "editor" ? <DefinitionPanel /> : <RunsTabBody playbookId={playbookId} />}
      </div>
      {runDrawerOpen && (
        <RunDrawer playbookId={playbookId} onClose={() => setRunDrawerOpen(false)} />
      )}
    </div>
  )
}

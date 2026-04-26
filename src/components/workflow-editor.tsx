"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Star,
  Share,
  DotsThree,
  ChartBar,
  Clock,
  Info,
  PencilRuler,
  Play,
  CaretRight,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DefinitionPanel } from "@/components/workflow-builder"
import { getPlaybook } from "@/lib/playbook-data"

type View = "editor" | "runs"

function PencilRulerIcon({ className }: { className?: string }) {
  return <PencilRuler className={className} />
}

function EditorHeader({ playbookId }: { playbookId: string }) {
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
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <Clock className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">View runs of this playbook</h3>
        <p className="text-xs text-zinc-500 leading-relaxed mb-4">
          See every execution, filter by status, and open any run to inspect its outputs.
        </p>
        <Link
          href={`/playbooks?p=${playbookId}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-800 text-white hover:bg-blue-900 h-8 px-3 text-sm font-medium transition-colors"
        >
          Open Runs grid
        </Link>
      </div>
    </div>
  )
}

export function WorkflowEditor() {
  const params = useParams()
  const playbookId = (params?.id as string | undefined) ?? "medical-records-summary"
  const [view, setView] = useState<View>("editor")
  const [dirty, setDirty] = useState(true)

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      <EditorHeader playbookId={playbookId} />
      <ViewTabs active={view} onChange={setView} dirty={dirty} />
      {dirty && view === "editor" && (
        <StatusBanner onPublish={() => setDirty(false)} onDiscard={() => setDirty(false)} />
      )}
      <div className="flex-1 min-h-0 flex">
        {view === "editor" ? <DefinitionPanel /> : <RunsTabBody playbookId={playbookId} />}
      </div>
    </div>
  )
}

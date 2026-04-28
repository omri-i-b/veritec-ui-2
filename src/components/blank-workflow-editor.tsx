"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CaretRight,
  Star,
  Share,
  DotsThree,
  PencilRuler,
  Play,
  Info,
  Gear,
  MagnifyingGlass,
  Database,
  ListBullets,
  Stack,
  CheckSquare,
  CursorClick,
  Clock,
  GlobeHemisphereWest,
  Plug,
  Books,
  PlugsConnected,
  Target,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type TriggerCategory = "Records" | "Lists" | "Data" | "Tasks" | "Utilities"

interface Trigger {
  id: string
  category: TriggerCategory
  name: string
  icon: typeof Database
}

const TRIGGERS: Trigger[] = [
  { id: "record_command", category: "Records", name: "Record command", icon: Database },
  { id: "record_created", category: "Records", name: "Record created", icon: Database },
  { id: "record_updated", category: "Records", name: "Record updated", icon: Database },
  { id: "list_entry_command", category: "Lists", name: "List entry command", icon: ListBullets },
  { id: "list_entry_updated", category: "Lists", name: "List entry updated", icon: ListBullets },
  { id: "record_added_to_list", category: "Lists", name: "Record added to list", icon: ListBullets },
  { id: "attribute_updated", category: "Data", name: "Attribute updated", icon: Stack },
  { id: "task_created", category: "Tasks", name: "Task created", icon: CheckSquare },
  { id: "manual_run", category: "Utilities", name: "Manually run", icon: CursorClick },
  { id: "recurring", category: "Utilities", name: "Recurring schedule", icon: Clock },
  { id: "webhook", category: "Utilities", name: "Webhook received", icon: GlobeHemisphereWest },
]

const CATEGORY_ORDER: TriggerCategory[] = ["Records", "Lists", "Data", "Tasks", "Utilities"]

export function BlankWorkflowEditor() {
  const [view, setView] = useState<"editor" | "runs" | "settings">("editor")
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>("record_created")
  const [query, setQuery] = useState("")

  const filtered = TRIGGERS.filter((t) =>
    !query.trim() || t.name.toLowerCase().includes(query.toLowerCase())
  )
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: filtered.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      {/* Header */}
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
        <span className="text-sm font-semibold text-zinc-900">Untitled Workflow</span>
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

      {/* Tabs */}
      <nav className="flex items-center gap-0 border-b border-gray-200 bg-white px-4 shrink-0">
        <ShellTab
          active={view === "editor"}
          onClick={() => setView("editor")}
          icon={<PencilRuler className="h-3.5 w-3.5" />}
          label="Editor"
        />
        <ShellTab
          active={view === "runs"}
          onClick={() => setView("runs")}
          icon={<Play className="h-3.5 w-3.5" weight="fill" />}
          label="Runs"
          badge="—"
        />
        <ShellTab
          active={view === "settings"}
          onClick={() => setView("settings")}
          icon={<Gear className="h-3.5 w-3.5" />}
          label="Settings"
        />
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
            Draft
          </span>
          <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 transition-colors">
            <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white translate-x-[2px] shadow" />
          </button>
        </div>
      </nav>

      {/* Status banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-blue-50/40 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
            <Info className="h-3.5 w-3.5 text-blue-800" weight="fill" />
          </span>
          <span className="text-blue-800 font-medium">This workflow has not yet been published</span>
        </div>
        <div className="flex-1" />
        <Button size="sm" className="h-8 gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 border-0" disabled>
          Publish workflow
        </Button>
      </div>

      {/* Body: canvas + trigger picker */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div
          className="flex-1 min-w-0 overflow-auto relative bg-white"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(15, 23, 42, 0.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
            <div className="w-full max-w-[420px] flex flex-col items-center gap-3">
              <div className="w-full rounded-[10px] border-2 border-blue-300 bg-blue-50/30 px-4 py-8 flex items-center justify-center text-center">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Target className="h-4 w-4 text-zinc-400" weight="bold" />
                  <span className="text-sm">Set a trigger in the sidebar</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button className="w-full rounded-md border border-dashed border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-800 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors flex items-center justify-center gap-2">
                <Books className="h-4 w-4" weight="bold" />
                Start with a template
              </button>
            </div>
          </div>
        </div>

        {/* Right rail — trigger picker */}
        <aside className="w-[360px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <header className="px-4 pt-4 pb-3 border-b border-gray-200 shrink-0">
            <h2 className="text-sm font-semibold text-zinc-900 mb-0.5">Select trigger</h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Pick an event to start this workflow
            </p>
          </header>

          <div className="px-4 py-2 border-b border-gray-200 shrink-0">
            <div className="relative">
              <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search triggers…"
                className="w-full h-8 pl-8 pr-2 text-sm rounded-md border border-blue-300 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto px-3 py-3 space-y-3">
            {grouped.map((g) => (
              <div key={g.category}>
                <div className="text-[11px] font-medium text-zinc-500 px-1 mb-1">
                  {g.category}
                </div>
                <div className="space-y-1">
                  {g.items.map((t) => {
                    const Icon = t.icon
                    const active = selectedTrigger === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTrigger(t.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md border text-sm text-left transition-colors ${
                          active
                            ? "border-gray-300 bg-gray-100 text-zinc-900"
                            : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" weight="bold" />
                        <span className="flex-1 truncate">{t.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md border border-gray-200 bg-white text-sm text-zinc-700 hover:border-gray-300 transition-colors mt-2">
              <PlugsConnected className="h-3.5 w-3.5 text-blue-700 shrink-0" weight="bold" />
              <span className="flex-1 text-left">Connect more integrations</span>
              <CaretRight className="h-3 w-3 text-zinc-400" weight="bold" />
            </button>
          </div>

          {/* Helpful resources */}
          <div className="shrink-0 border-t border-gray-200 px-3 py-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2 px-1">
              Helpful resources
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <ResourceTile icon={Books} label="Documentation" hint="Find out more about how to best setup workflows" />
              <ResourceTile icon={Stack} label="Templates" hint="Get started with ready-made workflow templates" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ShellTab({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: string
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
      {typeof badge === "string" && (
        <span className="text-[10px] px-1.5 py-0 rounded-full bg-gray-100 text-zinc-600 font-semibold tabular-nums">
          {badge}
        </span>
      )}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
    </button>
  )
}

function ResourceTile({
  icon: Icon,
  label,
  hint,
}: {
  icon: typeof Books
  label: string
  hint: string
}) {
  return (
    <button className="flex flex-col items-start gap-1 px-2.5 py-2 rounded-md border border-gray-200 bg-white hover:border-blue-300 transition-colors text-left">
      <Icon className="h-4 w-4 text-blue-800" weight="bold" />
      <span className="text-xs font-semibold text-zinc-900">{label}</span>
      <span className="text-[10px] text-zinc-500 leading-snug">{hint}</span>
    </button>
  )
}

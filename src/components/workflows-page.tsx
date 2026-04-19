"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FlowArrow,
  Plus,
  Compass,
  Sparkle,
  Clock,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { UnifiedRuns } from "@/components/unified-runs"
import { PlaybooksLibrary } from "@/components/playbooks-library"

type View = "runs" | "playbooks"

// ── Top header ─────────────────────────────────────────────────────────

function WorkflowsHeader({ view }: { view: View }) {
  return (
    <div className="flex h-12 items-center border-b border-gray-200 bg-gray-50 px-4 gap-2 shrink-0">
      <FlowArrow className="h-4 w-4 text-zinc-500" />
      <h1 className="text-sm font-semibold text-zinc-900">Workflows</h1>
      <span className="text-xs text-zinc-400 ml-1">
        {view === "runs"
          ? "Every playbook run across your firm"
          : "Reusable AI procedures that produce structured outputs"}
      </span>
      <div className="flex-1" />
      {view === "runs" ? (
        <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
          <Plus className="h-4 w-4" />
          New run
        </Button>
      ) : (
        <>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Compass className="h-4 w-4" />
            Discover
          </Button>
          <Link
            href="/workflows/new/edit"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-800 text-white hover:bg-blue-900 h-8 px-3 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create playbook
          </Link>
        </>
      )}
    </div>
  )
}

// ── View toggle ────────────────────────────────────────────────────────

function ViewTabs({ active, onChange }: { active: View; onChange: (v: View) => void }) {
  const tabs: { id: View; label: string; icon: typeof Clock; count?: string }[] = [
    { id: "runs", label: "Runs", icon: Clock, count: "12.4k" },
    { id: "playbooks", label: "Playbooks", icon: Sparkle, count: "9" },
  ]
  return (
    <div className="flex items-center border-b border-gray-200 bg-white px-4 gap-0.5 shrink-0">
      {tabs.map((t) => {
        const isActive = active === t.id
        const Icon = t.icon
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
              isActive ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
            {t.count && (
              <span className={`inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full px-1.5 text-[11px] font-medium ${
                isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
              }`}>
                {t.count}
              </span>
            )}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
          </button>
        )
      })}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────

export function WorkflowsPage() {
  const [view, setView] = useState<View>("runs")

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <WorkflowsHeader view={view} />
      <ViewTabs active={view} onChange={setView} />
      {view === "runs" ? <UnifiedRuns /> : <PlaybooksLibrary embedded />}
    </div>
  )
}

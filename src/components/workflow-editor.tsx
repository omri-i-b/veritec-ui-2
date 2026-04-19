"use client"

import Link from "next/link"
import {
  ArrowLeft,
  FileText,
  Warning,
  FloppyDisk,
  ArrowClockwise,
  DotsThreeVertical,
  Clock,
  CheckCircle,
  PencilSimple,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DefinitionPanel } from "@/components/workflow-builder"

// ── Playbook identity (would come from API) ────────────────────────────

const PLAYBOOK = {
  id: "medical-records-summary",
  name: "Medical Records Summary",
  description: "Analyzes uploaded medical records, extracts chronological treatment history, and flags gaps in documentation.",
  category: "Discovery",
  status: "Published",
  version: "v8",
  icon: FileText,
  iconColor: "text-blue-800",
  iconBg: "bg-blue-50",
  totalRuns: 1847,
  lastRun: "12s ago",
}

// ── Strong identity header ─────────────────────────────────────────────

function EditorIdentityHeader() {
  const Icon = PLAYBOOK.icon
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-start gap-3">
        {/* Back */}
        <Link
          href={`/workflows/${PLAYBOOK.id}`}
          className="shrink-0 mt-1 flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          title="Back to runs"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" />
        </Link>

        {/* Icon */}
        <div className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-[10px] ${PLAYBOOK.iconBg}`}>
          <Icon className={`h-5 w-5 ${PLAYBOOK.iconColor}`} />
        </div>

        {/* Name + metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 flex items-center gap-1">
              <PencilSimple className="h-3 w-3" />
              Editing playbook
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-zinc-900">{PLAYBOOK.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {PLAYBOOK.status}
            </span>
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
              {PLAYBOOK.version}
            </span>
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
              {PLAYBOOK.category}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-[720px] leading-relaxed">{PLAYBOOK.description}</p>
        </div>

        {/* Right side: stats + actions */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={`/workflows/${PLAYBOOK.id}`}
            className="flex flex-col items-end hover:opacity-70 transition-opacity"
          >
            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Clock className="h-3 w-3" />
              Last run {PLAYBOOK.lastRun}
            </div>
            <div className="text-sm font-semibold text-zinc-900 tabular-nums">
              {PLAYBOOK.totalRuns.toLocaleString()} total runs
            </div>
          </Link>
          <div className="h-8 w-px bg-gray-200" />
          <button className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500">
            <DotsThreeVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Draft toolbar ──────────────────────────────────────────────────────

function EditorToolbar() {
  return (
    <div className="flex items-center gap-2 px-4 h-11 border-b border-gray-200 bg-amber-50/40 shrink-0">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        <Warning className="h-3 w-3" weight="fill" />
        Draft
      </span>
      <span className="text-[11px] text-zinc-500">
        <span className="font-medium text-zinc-700">3 changes</span> since last publish • auto-saved 12s ago
      </span>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <ArrowClockwise className="h-3.5 w-3.5" />
        Revert to published
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <FloppyDisk className="h-3.5 w-3.5" />
        Save draft
      </Button>
      <Link
        href={`/workflows/${PLAYBOOK.id}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-800 text-white hover:bg-blue-900 h-8 px-3 text-sm font-medium transition-colors"
      >
        <CheckCircle className="h-3.5 w-3.5" weight="fill" />
        Publish v9
      </Link>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────

export function WorkflowEditor() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      <EditorIdentityHeader />
      <EditorToolbar />
      <div className="flex-1 min-h-0">
        <DefinitionPanel />
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Stack,
  Plus,
  MagnifyingGlass,
  DotsThreeVertical,
  CaretRight,
  Clock,
  FilePdf,
  FileText,
  Table,
  FileDoc,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { TEMPLATES, type Template, type TemplateFormat } from "@/lib/template-data"

function FormatBadge({ format }: { format: TemplateFormat }) {
  const cfg = {
    DOCX: { icon: FileDoc, cls: "bg-blue-50 text-blue-700 border-blue-200" },
    PDF: { icon: FilePdf, cls: "bg-red-50 text-red-700 border-red-200" },
    Markdown: { icon: FileText, cls: "bg-zinc-100 text-zinc-700 border-zinc-200" },
    Table: { icon: Table, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  }[format]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${cfg.cls}`}>
      <Icon className="h-3 w-3" weight="bold" />
      {format}
    </span>
  )
}

function TemplateCard({ t }: { t: Template }) {
  const Icon = t.icon
  return (
    <Link
      href={`/templates/${t.id}`}
      className="group relative flex flex-col rounded-[10px] border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-[0_2px_8px_rgba(30,64,175,0.08)] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center h-10 w-10 rounded-[10px] ${t.iconBg}`}>
          <Icon className={`h-5 w-5 ${t.iconColor}`} />
        </div>
        <div className="flex items-center gap-1">
          <FormatBadge format={t.format} />
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-400 hover:text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <DotsThreeVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 mb-3">
        <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-800 transition-colors mb-1">
          {t.name}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{t.description}</p>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-3">
        <span className="flex items-center gap-1">
          <Stack className="h-3 w-3" />
          <span className="font-medium text-zinc-700 tabular-nums">{t.sampleCount}</span>
          {t.sourceType === "placeholder" ? "sample" : "example"}
          {t.sampleCount !== 1 ? "s" : ""}
        </span>
        {t.placeholders.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="font-mono text-[10px]">{"{{ }}"}</span>
            <span className="font-medium text-zinc-700 tabular-nums">{t.placeholders.length}</span>
            fields
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {t.lastUpdated}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 flex-wrap">
          {t.usedBy.length > 0 ? (
            <>
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mr-1">Used by</span>
              {t.usedBy.slice(0, 2).map((u) => (
                <span
                  key={u}
                  className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600"
                >
                  {u}
                </span>
              ))}
              {t.usedBy.length > 2 && (
                <span className="text-[10px] text-zinc-400">+{t.usedBy.length - 2}</span>
              )}
            </>
          ) : (
            <span className="text-[10px] text-zinc-400 italic">Not linked to any playbook</span>
          )}
        </div>
        <CaretRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-blue-800 transition-colors" />
      </div>
    </Link>
  )
}

function CreateCard() {
  return (
    <button className="group flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-gray-200 bg-white/50 p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all min-h-[220px]">
      <div className="flex items-center justify-center h-10 w-10 rounded-[10px] bg-blue-50 mb-3 group-hover:bg-blue-100 transition-colors">
        <Plus className="h-5 w-5 text-blue-800" weight="bold" />
      </div>
      <div className="text-sm font-semibold text-zinc-900 mb-1">Create template</div>
      <div className="text-xs text-zinc-500 text-center max-w-[220px]">
        Upload an example document, or start from a placeholder template
      </div>
    </button>
  )
}

export function TemplatesList() {
  const [query, setQuery] = useState("")
  const all = Object.values(TEMPLATES)
  const filtered = all.filter(
    (t) => !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase())
  )
  const totalSamples = all.reduce((s, t) => s + t.sampleCount, 0)

  return (
    <div className="flex flex-1 flex-col bg-gray-50 min-h-0">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-gray-200 bg-gray-50 px-4 gap-2 shrink-0">
        <Stack className="h-4 w-4 text-zinc-500" />
        <h1 className="text-sm font-semibold text-zinc-900">Templates</h1>
        <span className="text-xs text-zinc-400 ml-1">
          Output formats — playbooks apply their extractions to these
        </span>
        <div className="flex-1" />
        <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
          <Plus className="h-4 w-4" />
          New template
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 bg-white text-xs shrink-0">
        <div>
          <span className="text-zinc-400">Total templates</span>{" "}
          <span className="font-semibold text-zinc-900 tabular-nums">{all.length}</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <span className="text-zinc-400">Total samples</span>{" "}
          <span className="font-semibold text-zinc-900 tabular-nums">{totalSamples}</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <span className="text-zinc-400">Used by playbooks</span>{" "}
          <span className="font-semibold text-zinc-900 tabular-nums">
            {all.filter((t) => t.usedBy.length > 0).length}
          </span>
        </div>
        <div className="flex-1" />
        <div className="relative w-[280px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-7 pl-8 pr-3 text-xs rounded-md border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}
          <CreateCard />
        </div>
      </div>
    </div>
  )
}

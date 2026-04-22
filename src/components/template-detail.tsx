"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Stack,
  ArrowLeft,
  UploadSimple,
  DotsThreeVertical,
  DownloadSimple,
  Trash,
  FolderOpen,
  FileText,
  Eye,
  Gear,
  FilePdf,
  FileDoc,
  Plus,
  ArrowSquareOut,
  PencilSimple,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTemplate } from "@/lib/template-data"

type Tab = "samples" | "preview" | "settings"

const SAMPLES = [
  { id: "s1", name: "Depo Outline — Rodriguez Lumbar 2024.docx", size: "34 KB", uploadedAt: "3d ago", initials: "JL", color: "bg-blue-100 text-blue-800" },
  { id: "s2", name: "Depo Outline — Chen Cervical 2024.docx", size: "42 KB", uploadedAt: "3d ago", initials: "JL", color: "bg-blue-100 text-blue-800" },
  { id: "s3", name: "Depo Outline — Williams TBI 2023.docx", size: "56 KB", uploadedAt: "1w ago", initials: "JR", color: "bg-purple-100 text-purple-700" },
  { id: "s4", name: "Depo Outline — Patel Shoulder 2024.docx", size: "38 KB", uploadedAt: "1w ago", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
  { id: "s5", name: "Depo Outline — Garcia Multiple 2023.docx", size: "61 KB", uploadedAt: "2w ago", initials: "DP", color: "bg-amber-100 text-amber-700" },
]

function IdentityHeader() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "depo-outline"
  const t = getTemplate(id) ?? getTemplate("depo-outline")!
  const Icon = t.icon
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-start gap-3">
        <Link
          href="/templates"
          className="shrink-0 mt-1 flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          title="Back to templates"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" />
        </Link>
        <div className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-[10px] ${t.iconBg}`}>
          <Icon className={`h-5 w-5 ${t.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Stack className="h-3 w-3 text-zinc-400" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Template</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-zinc-900">{t.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
              {t.format}
            </span>
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
              {t.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
                t.sourceType === "placeholder"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-purple-200 bg-purple-50 text-purple-700"
              }`}
            >
              {t.sourceType === "placeholder" ? "Placeholder template" : "Example-based"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-[720px] leading-relaxed">{t.description}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Samples</div>
              <div className="text-sm font-semibold text-zinc-900 tabular-nums">{t.sampleCount}</div>
            </div>
            {t.placeholders.length > 0 && (
              <div className="text-right">
                <div className="text-[11px] text-zinc-500">Fields</div>
                <div className="text-sm font-semibold text-zinc-900 tabular-nums">{t.placeholders.length}</div>
              </div>
            )}
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <button className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500">
            <DotsThreeVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Tabs({ active, onChange, sampleCount }: { active: Tab; onChange: (t: Tab) => void; sampleCount: number }) {
  const tabs: { id: Tab; label: string; icon: typeof FolderOpen; count?: number }[] = [
    { id: "samples", label: "Samples", icon: FolderOpen, count: sampleCount },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "settings", label: "Settings", icon: Gear },
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
            {t.count !== undefined && (
              <span
                className={`inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full px-1.5 text-[11px] font-medium ${
                  isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
                }`}
              >
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

function SamplesTab() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="px-4 pt-4 pb-3">
        <div className="rounded-[10px] border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-colors p-6 flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-[10px] bg-white border border-gray-200">
            <UploadSimple className="h-6 w-6 text-blue-800" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-zinc-900 mb-0.5">Upload sample documents</div>
            <div className="text-xs text-zinc-500">
              DOCX, PDF up to 20MB each. These are the reference examples the AI will match when applying extractions to this template.
            </div>
          </div>
          <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
            <UploadSimple className="h-4 w-4" />
            Browse files
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-transparent border-b border-gray-200">
                <TableHead className="w-10" />
                <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Size</TableHead>
                <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Uploaded</TableHead>
                <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">By</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLES.map((s) => (
                <TableRow key={s.id} className="group/row hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="py-2">
                    <FileDoc className="h-4 w-4 text-blue-600" weight="fill" />
                  </TableCell>
                  <TableCell className="py-2 text-sm text-zinc-900 font-medium">{s.name}</TableCell>
                  <TableCell className="py-2 text-right text-sm text-zinc-600 tabular-nums">{s.size}</TableCell>
                  <TableCell className="py-2 text-sm text-zinc-600 whitespace-nowrap">{s.uploadedAt}</TableCell>
                  <TableCell className="py-2">
                    <div className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[9px] font-semibold ${s.color}`}>
                      {s.initials}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-200 text-zinc-500" title="Download">
                        <DownloadSimple className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-200 text-red-600" title="Delete">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function PreviewTab() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "depo-outline"
  const t = getTemplate(id) ?? getTemplate("depo-outline")!

  return (
    <div className="flex-1 overflow-auto p-4 bg-gray-50">
      <div className="max-w-[880px] mx-auto grid grid-cols-[1fr_260px] gap-4">
        {/* Document preview */}
        <div className="rounded-[10px] border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Template preview</span>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-zinc-700">
              <PencilSimple className="h-3 w-3" />
              Edit template
            </Button>
          </div>
          <div className="p-8 font-serif text-sm text-zinc-800 leading-relaxed space-y-4 min-h-[500px]">
            <div className="text-center">
              <div className="text-lg font-bold uppercase tracking-wider">Deposition Outline</div>
              <div className="text-xs text-zinc-500 mt-1">
                <Chip text="case_name" /> — <Chip text="deponent_type" />
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3 space-y-1">
              <div className="flex">
                <span className="w-32 font-semibold text-zinc-600">Deponent:</span>
                <Chip text="deponent_name" />
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-zinc-600">Date:</span>
                <Chip text="deposition_date" />
              </div>
              <div className="flex">
                <span className="w-32 font-semibold text-zinc-600">Case:</span>
                <Chip text="case_name" />
              </div>
            </div>

            <div>
              <div className="font-bold mb-2">I. Objectives</div>
              <div className="pl-4 text-zinc-700">
                <Chip text="objectives" />
              </div>
            </div>

            <div>
              <div className="font-bold mb-2">II. Questions by Category</div>
              <div className="pl-4 text-zinc-700">
                <Chip text="questions" />
              </div>
            </div>

            <div>
              <div className="font-bold mb-2">III. Weaknesses to Exploit</div>
              <div className="pl-4 text-zinc-700">
                <Chip text="weaknesses" />
              </div>
            </div>

            <div>
              <div className="font-bold mb-2">IV. Exhibits</div>
              <div className="pl-4 text-zinc-700">
                <Chip text="exhibits" />
              </div>
            </div>
          </div>
        </div>

        {/* Placeholders panel */}
        <div className="space-y-3">
          <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span className="font-mono text-[11px] text-blue-800">{"{{ }}"}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Placeholders
              </span>
              <span className="text-[11px] text-zinc-400">({t.placeholders.length})</span>
            </div>
            <div className="p-2 space-y-1">
              {t.placeholders.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-mono text-blue-800 bg-blue-50/50 border border-blue-100"
                >
                  <span className="flex-1 truncate">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[10px] border border-blue-200 bg-blue-50/40 p-3 text-[11px] text-zinc-600 leading-relaxed">
            <div className="font-semibold text-zinc-900 mb-1">How this works</div>
            Playbooks that use this template will populate these placeholders with their AI extractions. Output looks
            exactly like the template — just with the variables filled in.
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded bg-blue-100 text-blue-800 px-1.5 py-0 text-[11px] font-mono font-medium mx-0.5">
      {`{{${text}}}`}
    </span>
  )
}

function SettingsTab() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "depo-outline"
  const t = getTemplate(id) ?? getTemplate("depo-outline")!

  return (
    <div className="flex-1 overflow-auto p-4 bg-gray-50">
      <div className="max-w-[720px] space-y-3">
        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">General</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1 block">Name</label>
              <input
                type="text"
                defaultValue={t.name}
                className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1 block">Description</label>
              <textarea
                defaultValue={t.description}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1 block">Format</label>
                <div className="h-9 px-3 flex items-center text-sm rounded-md border border-gray-200 bg-gray-50 text-zinc-700">
                  {t.format}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1 block">Category</label>
                <div className="h-9 px-3 flex items-center text-sm rounded-md border border-gray-200 bg-gray-50 text-zinc-700">
                  {t.category}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-zinc-900">Source type</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`rounded-md border p-3 ${
                t.sourceType === "placeholder" ? "border-blue-800 bg-blue-50/30 ring-2 ring-blue-100" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-blue-800">{"{{ }}"}</span>
                <span className="text-sm font-semibold text-zinc-900">Placeholder template</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                A single document with <span className="font-mono">{`{{variables}}`}</span> that get filled in.
              </p>
            </div>
            <div
              className={`rounded-md border p-3 ${
                t.sourceType === "examples" ? "border-blue-800 bg-blue-50/30 ring-2 ring-blue-100" : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FilePdf className="h-4 w-4 text-rose-600" />
                <span className="text-sm font-semibold text-zinc-900">Example-based</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Multiple sample documents. AI infers the format and matches their style.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Used by</h3>
          {t.usedBy.length > 0 ? (
            <div className="space-y-1.5">
              {t.usedBy.map((u) => (
                <div key={u} className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-gray-50">
                  <span className="text-sm text-zinc-900 font-medium">{u}</span>
                  <Link
                    href={`/workflows/${u.toLowerCase().replace(/\s+/g, "-")}/edit`}
                    className="flex items-center gap-1 text-xs text-blue-800 hover:underline"
                  >
                    Open playbook
                    <ArrowSquareOut className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No playbooks are using this template yet.</p>
          )}
        </section>

        <section className="rounded-[10px] border border-red-200 bg-red-50/30 p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-1">Danger zone</h3>
          <p className="text-xs text-red-700 mb-3">
            Deleting this template will break any playbook output formats currently referencing it.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
          >
            <Trash className="h-4 w-4" />
            Delete template
          </Button>
        </section>
      </div>
    </div>
  )
}

export function TemplateDetail() {
  const [tab, setTab] = useState<Tab>("preview")
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "depo-outline"
  const t = getTemplate(id) ?? getTemplate("depo-outline")!

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <IdentityHeader />
      <Tabs active={tab} onChange={setTab} sampleCount={t.sampleCount} />
      {tab === "samples" && <SamplesTab />}
      {tab === "preview" && <PreviewTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  )
}

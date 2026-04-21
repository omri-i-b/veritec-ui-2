"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Books,
  Plus,
  MagnifyingGlass,
  FilePdf,
  FileText,
  Gavel,
  Scales,
  Notepad,
  Stethoscope,
  Shield,
  CaretRight,
  Clock,
  HardDrives,
  DotsThreeVertical,
  CheckCircle,
  CircleNotch,
  Warning,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type KnowledgeStatus = "ready" | "indexing" | "error"

interface KnowledgeBase {
  id: string
  name: string
  description: string
  icon: typeof Books
  iconColor: string
  iconBg: string
  fileCount: number
  totalSize: string
  status: KnowledgeStatus
  progress?: number
  updatedAt: string
  usedBy: string[]
}

const KBS: KnowledgeBase[] = [
  {
    id: "plaintiff-depositions",
    name: "Plaintiff Depositions",
    description: "Prior plaintiff depositions used as tone/style samples for depo prep. Organized by injury type.",
    icon: Notepad,
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    fileCount: 23,
    totalSize: "142 MB",
    status: "ready",
    updatedAt: "3d ago",
    usedBy: ["Depo Prep", "Transcript Review"],
  },
  {
    id: "medical-expert-depositions",
    name: "Medical Expert Depositions",
    description: "Orthopedic, neurology, and pain management expert deposition samples.",
    icon: Stethoscope,
    iconColor: "text-rose-700",
    iconBg: "bg-rose-50",
    fileCount: 47,
    totalSize: "312 MB",
    status: "ready",
    updatedAt: "1w ago",
    usedBy: ["Depo Prep"],
  },
  {
    id: "police-officer-depositions",
    name: "Police Officer Depositions",
    description: "Cross-examination samples for responding officers in MVA and liability cases.",
    icon: Shield,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    fileCount: 14,
    totalSize: "89 MB",
    status: "ready",
    updatedAt: "2w ago",
    usedBy: ["Depo Prep"],
  },
  {
    id: "defense-witness-depositions",
    name: "Defense Witness Depositions",
    description: "Templates for cross-examining defense-side lay witnesses.",
    icon: Gavel,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    fileCount: 18,
    totalSize: "124 MB",
    status: "indexing",
    progress: 68,
    updatedAt: "Just now",
    usedBy: ["Depo Prep"],
  },
  {
    id: "case-law-pi",
    name: "Case Law — PI Jurisdictions",
    description: "State supreme court and appellate decisions across PI matters, indexed by holding.",
    icon: Scales,
    iconColor: "text-indigo-700",
    iconBg: "bg-indigo-50",
    fileCount: 203,
    totalSize: "1.2 GB",
    status: "ready",
    updatedAt: "1mo ago",
    usedBy: ["Similar Case Finder", "Drafting"],
  },
  {
    id: "demand-letter-templates",
    name: "Demand Letter Templates",
    description: "Firm's sample demand letters by injury severity and settlement range.",
    icon: FileText,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-50",
    fileCount: 34,
    totalSize: "8.2 MB",
    status: "ready",
    updatedAt: "5d ago",
    usedBy: ["Demand Letter Draft"],
  },
  {
    id: "medical-billing-codes",
    name: "Medical Billing Codes",
    description: "CPT codes, Medicare rates, and ICD-10 references for damages calculation.",
    icon: FilePdf,
    iconColor: "text-teal-700",
    iconBg: "bg-teal-50",
    fileCount: 120,
    totalSize: "45 MB",
    status: "error",
    updatedAt: "3mo ago",
    usedBy: ["Damages Calculator"],
  },
]

function StatusPill({ status, progress }: { status: KnowledgeStatus; progress?: number }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
        <CheckCircle className="h-2.5 w-2.5" weight="fill" />
        Ready
      </span>
    )
  }
  if (status === "indexing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
        <CircleNotch className="h-2.5 w-2.5 animate-spin" weight="bold" />
        Indexing {progress ? `${progress}%` : ""}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
      <Warning className="h-2.5 w-2.5" weight="fill" />
      Error
    </span>
  )
}

function KBCard({ kb }: { kb: KnowledgeBase }) {
  const Icon = kb.icon
  return (
    <Link
      href={`/knowledge/${kb.id}`}
      className="group relative flex flex-col rounded-[10px] border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-[0_2px_8px_rgba(30,64,175,0.08)] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center h-10 w-10 rounded-[10px] ${kb.iconBg}`}>
          <Icon className={`h-5 w-5 ${kb.iconColor}`} />
        </div>
        <div className="flex items-center gap-1">
          <StatusPill status={kb.status} progress={kb.progress} />
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
          {kb.name}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{kb.description}</p>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-3">
        <span className="flex items-center gap-1">
          <FilePdf className="h-3 w-3" />
          <span className="font-medium text-zinc-700 tabular-nums">{kb.fileCount}</span>
          files
        </span>
        <span className="flex items-center gap-1">
          <HardDrives className="h-3 w-3" />
          <span className="font-medium text-zinc-700 tabular-nums">{kb.totalSize}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {kb.updatedAt}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mr-1">Used by</span>
          {kb.usedBy.slice(0, 2).map((u) => (
            <span
              key={u}
              className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600"
            >
              {u}
            </span>
          ))}
          {kb.usedBy.length > 2 && (
            <span className="text-[10px] text-zinc-400">+{kb.usedBy.length - 2}</span>
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
      <div className="text-sm font-semibold text-zinc-900 mb-1">Create knowledge base</div>
      <div className="text-xs text-zinc-500 text-center max-w-[220px]">
        Upload documents to create a reusable reference library your playbooks can query
      </div>
    </button>
  )
}

export function KnowledgeList() {
  const [query, setQuery] = useState("")
  const filtered = KBS.filter(
    (k) =>
      !query || k.name.toLowerCase().includes(query.toLowerCase()) || k.description.toLowerCase().includes(query.toLowerCase())
  )

  const totalFiles = KBS.reduce((s, k) => s + k.fileCount, 0)

  return (
    <div className="flex flex-1 flex-col bg-gray-50 min-h-0">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-gray-200 bg-gray-50 px-4 gap-2 shrink-0">
        <Books className="h-4 w-4 text-zinc-500" />
        <h1 className="text-sm font-semibold text-zinc-900">Knowledge Base</h1>
        <span className="text-xs text-zinc-400 ml-1">Reference libraries your playbooks can query at runtime</span>
        <div className="flex-1" />
        <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
          <Plus className="h-4 w-4" />
          New knowledge base
        </Button>
      </div>

      {/* Stats band */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-gray-200 bg-white text-xs shrink-0">
        <div>
          <span className="text-zinc-400">Total knowledge bases</span>{" "}
          <span className="font-semibold text-zinc-900 tabular-nums">{KBS.length}</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <span className="text-zinc-400">Total files</span>{" "}
          <span className="font-semibold text-zinc-900 tabular-nums">{totalFiles.toLocaleString()}</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div>
          <span className="text-zinc-400">Total size</span>{" "}
          <span className="font-semibold text-zinc-900 tabular-nums">1.84 GB</span>
        </div>
        <div className="flex-1" />
        <div className="relative w-[280px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge bases..."
            className="w-full h-7 pl-8 pr-3 text-xs rounded-md border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((kb) => (
            <KBCard key={kb.id} kb={kb} />
          ))}
          <CreateCard />
        </div>
      </div>
    </div>
  )
}

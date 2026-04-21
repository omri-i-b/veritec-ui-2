"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Books,
  ArrowLeft,
  FilePdf,
  Notepad,
  UploadSimple,
  MagnifyingGlass,
  DotsThreeVertical,
  Trash,
  DownloadSimple,
  CheckCircle,
  CircleNotch,
  Warning,
  ArrowClockwise,
  FolderOpen,
  Plus,
  Lightning,
  Brain,
  Gear,
  Copy,
  FileText,
  Play,
  Clock,
  HardDrives,
  Users,
  Link as LinkIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ── Types ──────────────────────────────────────────────────────────────

type FileStatus = "indexed" | "indexing" | "failed" | "pending"

interface KBFile {
  id: string
  name: string
  type: string
  size: string
  chunks: number | null
  status: FileStatus
  uploadedAt: string
  uploadedBy: { initials: string; color: string }
}

// ── Sample data ────────────────────────────────────────────────────────

const PLAYBOOK = {
  id: "plaintiff-depositions",
  name: "Plaintiff Depositions",
  description: "Prior plaintiff depositions used as tone/style samples for depo prep. Organized by injury type.",
  icon: Notepad,
  iconColor: "text-blue-800",
  iconBg: "bg-blue-50",
}

const FILES: KBFile[] = [
  { id: "f1", name: "Depo_Rodriguez_Lumbar_2024.pdf", type: "PDF", size: "3.2 MB", chunks: 142, status: "indexed", uploadedAt: "3d ago", uploadedBy: { initials: "JL", color: "bg-blue-100 text-blue-800" } },
  { id: "f2", name: "Depo_Chen_Cervical_2024.pdf", type: "PDF", size: "2.8 MB", chunks: 118, status: "indexed", uploadedAt: "3d ago", uploadedBy: { initials: "JL", color: "bg-blue-100 text-blue-800" } },
  { id: "f3", name: "Depo_Williams_TBI_2023.pdf", type: "PDF", size: "5.1 MB", chunks: 231, status: "indexed", uploadedAt: "1w ago", uploadedBy: { initials: "JR", color: "bg-purple-100 text-purple-700" } },
  { id: "f4", name: "Depo_Patel_Shoulder_2024.pdf", type: "PDF", size: "4.3 MB", chunks: 187, status: "indexed", uploadedAt: "1w ago", uploadedBy: { initials: "BC", color: "bg-emerald-100 text-emerald-700" } },
  { id: "f5", name: "Depo_Thompson_Knee_2024.pdf", type: "PDF", size: "3.7 MB", chunks: 156, status: "indexed", uploadedAt: "2w ago", uploadedBy: { initials: "DP", color: "bg-amber-100 text-amber-700" } },
  { id: "f6", name: "Depo_Garcia_Multiple_2023.pdf", type: "PDF", size: "6.2 MB", chunks: 287, status: "indexed", uploadedAt: "2w ago", uploadedBy: { initials: "JL", color: "bg-blue-100 text-blue-800" } },
  { id: "f7", name: "Depo_Anderson_Back_2024.pdf", type: "PDF", size: "4.8 MB", chunks: 203, status: "indexed", uploadedAt: "3w ago", uploadedBy: { initials: "ST", color: "bg-rose-100 text-rose-700" } },
  { id: "f8", name: "Depo_Martinez_Neck_2024.pdf", type: "PDF", size: "3.4 MB", chunks: 147, status: "indexing", uploadedAt: "2m ago", uploadedBy: { initials: "JL", color: "bg-blue-100 text-blue-800" } },
  { id: "f9", name: "Depo_Wilson_Arm_2023.pdf", type: "PDF", size: "2.9 MB", chunks: null, status: "indexing", uploadedAt: "4m ago", uploadedBy: { initials: "JJ", color: "bg-indigo-100 text-indigo-700" } },
  { id: "f10", name: "Depo_Brown_Ankle_2023.pdf", type: "PDF", size: "3.1 MB", chunks: null, status: "pending", uploadedAt: "6m ago", uploadedBy: { initials: "BC", color: "bg-emerald-100 text-emerald-700" } },
  { id: "f11", name: "Depo_Davis_Scarring_2024.pdf", type: "PDF", size: "2.4 MB", chunks: null, status: "failed", uploadedAt: "1d ago", uploadedBy: { initials: "DP", color: "bg-amber-100 text-amber-700" } },
]

// ── File Status ────────────────────────────────────────────────────────

function FileStatusPill({ status }: { status: FileStatus }) {
  const cfg = {
    indexed: { icon: CheckCircle, cls: "bg-green-50 text-green-700 border-green-200", label: "Indexed", weight: "fill" as const, spin: false },
    indexing: { icon: CircleNotch, cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Indexing", weight: "bold" as const, spin: true },
    pending: { icon: Clock, cls: "bg-gray-50 text-zinc-600 border-gray-200", label: "Pending", weight: "bold" as const, spin: false },
    failed: { icon: Warning, cls: "bg-red-50 text-red-700 border-red-200", label: "Failed", weight: "fill" as const, spin: false },
  }[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      <Icon className={`h-2.5 w-2.5 ${cfg.spin ? "animate-spin" : ""}`} weight={cfg.weight} />
      {cfg.label}
    </span>
  )
}

// ── Avatar ─────────────────────────────────────────────────────────────

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[9px] font-semibold ${color}`}>
      {initials}
    </div>
  )
}

// ── Identity Header ────────────────────────────────────────────────────

function IdentityHeader() {
  const Icon = PLAYBOOK.icon
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-start gap-3">
        <Link
          href="/knowledge"
          className="shrink-0 mt-1 flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          title="Back to knowledge bases"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" />
        </Link>
        <div className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-[10px] ${PLAYBOOK.iconBg}`}>
          <Icon className={`h-5 w-5 ${PLAYBOOK.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Books className="h-3 w-3 text-zinc-400" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Knowledge Base</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-zinc-900">{PLAYBOOK.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Ready
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-[720px] leading-relaxed">{PLAYBOOK.description}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Files</div>
              <div className="text-sm font-semibold text-zinc-900 tabular-nums">23</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Chunks</div>
              <div className="text-sm font-semibold text-zinc-900 tabular-nums">3,421</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-zinc-500">Size</div>
              <div className="text-sm font-semibold text-zinc-900 tabular-nums">142 MB</div>
            </div>
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

// ── Tabs ───────────────────────────────────────────────────────────────

type Tab = "files" | "search" | "settings"

function Tabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: typeof FolderOpen; count?: string }[] = [
    { id: "files", label: "Files", icon: FolderOpen, count: "23" },
    { id: "search", label: "Test & Search", icon: MagnifyingGlass },
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

// ── Files Tab ──────────────────────────────────────────────────────────

function FilesTab() {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Upload zone */}
      <div className="px-4 pt-4 pb-3">
        <div className="rounded-[10px] border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-colors p-6 flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-[10px] bg-white border border-gray-200">
            <UploadSimple className="h-6 w-6 text-blue-800" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-zinc-900 mb-0.5">Drop files here or click to upload</div>
            <div className="text-xs text-zinc-500">PDF, DOCX, TXT, MD up to 50MB each. Files are automatically chunked and indexed.</div>
          </div>
          <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
            <UploadSimple className="h-4 w-4" />
            Browse files
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Filter files..."
            className="w-full h-7 pl-8 pr-3 text-xs rounded-md border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-zinc-700">
          Status: All
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-zinc-700">
          <ArrowClockwise className="h-3 w-3" />
          Reindex all
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Size</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide text-right">Chunks</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Uploaded</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide">By</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {FILES.map((f) => (
              <TableRow key={f.id} className="group/row hover:bg-gray-50 border-b border-gray-100">
                <TableCell className="py-2">
                  <FilePdf className="h-4 w-4 text-rose-600" weight="fill" />
                </TableCell>
                <TableCell className="py-2 text-sm text-zinc-900 font-medium">
                  {f.name}
                </TableCell>
                <TableCell className="py-2">
                  <FileStatusPill status={f.status} />
                </TableCell>
                <TableCell className="py-2 text-right text-sm text-zinc-600 tabular-nums">{f.size}</TableCell>
                <TableCell className="py-2 text-right text-sm text-zinc-600 tabular-nums">
                  {f.chunks ?? <span className="text-zinc-300">—</span>}
                </TableCell>
                <TableCell className="py-2 text-sm text-zinc-600 whitespace-nowrap">{f.uploadedAt}</TableCell>
                <TableCell className="py-2">
                  <Avatar initials={f.uploadedBy.initials} color={f.uploadedBy.color} />
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-200 text-zinc-500" title="Download">
                      <DownloadSimple className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-200 text-zinc-500" title="Reindex">
                      <ArrowClockwise className="h-3.5 w-3.5" />
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
  )
}

// ── Search Tab ─────────────────────────────────────────────────────────

const SAMPLE_RESULTS = [
  {
    file: "Depo_Rodriguez_Lumbar_2024.pdf",
    page: 47,
    score: 0.92,
    snippet: "Q. And after the incident, did you experience any pain in your lower back?\nA. Yes, immediately after the impact I felt a sharp pain radiating down my left leg. I could barely stand up from the driver's seat.",
    highlight: "lower back",
  },
  {
    file: "Depo_Chen_Cervical_2024.pdf",
    page: 23,
    score: 0.87,
    snippet: "Q. Can you describe the treatment you received for your back pain?\nA. I was prescribed physical therapy twice a week for three months, and I took medication for the inflammation.",
    highlight: "back pain",
  },
  {
    file: "Depo_Garcia_Multiple_2023.pdf",
    page: 112,
    score: 0.84,
    snippet: "Q. Have you experienced any back pain or discomfort since the accident?\nA. Every day. Some days are worse than others. When I sit for too long, I have to stand up and stretch.",
    highlight: "back pain",
  },
  {
    file: "Depo_Anderson_Back_2024.pdf",
    page: 18,
    score: 0.79,
    snippet: "Q. Before the accident, did you have any pre-existing back conditions?\nA. No, I had never had back issues before this. I was an avid runner and hiker.",
    highlight: "back",
  },
]

function SearchTab() {
  const [query, setQuery] = useState("back pain treatment")
  const [searched, setSearched] = useState(true)

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      {/* Search bar */}
      <div className="px-4 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Lightning className="h-4 w-4 text-amber-500" weight="fill" />
          <h3 className="text-sm font-semibold text-zinc-900">Test retrieval</h3>
          <span className="text-[11px] text-zinc-500">
            Run a sample query the same way your playbooks will. Returns top chunks ranked by semantic similarity.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearched(true)}
              placeholder='Try: "questions about treatment gaps" or "pain level inconsistencies"'
              className="w-full h-10 pl-10 pr-3 text-sm rounded-[10px] border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <Button size="sm" className="h-10 gap-1.5 bg-blue-800 hover:bg-blue-900 px-4">
            <Play className="h-3.5 w-3.5" weight="fill" />
            Search
          </Button>
        </div>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-zinc-500">
          <span>Top results:</span>
          {[3, 5, 10, 20].map((n) => (
            <button
              key={n}
              className={`px-1.5 py-0.5 rounded ${n === 5 ? "bg-blue-100 text-blue-800 font-medium" : "hover:bg-gray-100"}`}
            >
              {n}
            </button>
          ))}
          <div className="h-3 w-px bg-gray-200" />
          <span>Model:</span>
          <span className="font-medium text-zinc-700">text-embedding-3-large</span>
          <div className="h-3 w-px bg-gray-200" />
          <span>Index:</span>
          <span className="font-medium text-zinc-700">3,421 chunks</span>
        </div>
      </div>

      {/* Results */}
      {searched ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" weight="fill" />
            <span>Found {SAMPLE_RESULTS.length} results for</span>
            <span className="font-mono text-zinc-900 bg-amber-100 px-1 rounded">{query}</span>
            <span>in 87ms</span>
          </div>

          <div className="space-y-2">
            {SAMPLE_RESULTS.map((r, i) => {
              const parts = r.snippet.split(new RegExp(`(${r.highlight})`, "gi"))
              return (
                <div
                  key={i}
                  className="rounded-[10px] border border-gray-200 bg-white p-3 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[10px] font-semibold text-blue-800">
                        {i + 1}
                      </span>
                      <FilePdf className="h-3.5 w-3.5 text-rose-600" weight="fill" />
                      <span className="text-sm font-medium text-zinc-900">{r.file}</span>
                      <span className="text-[11px] text-zinc-500">· page {r.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="relative h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                            style={{ width: `${r.score * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-zinc-600 tabular-nums">{r.score.toFixed(2)}</span>
                      </div>
                      <button className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-gray-100 text-zinc-400" title="Copy">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button className="flex items-center justify-center h-6 w-6 rounded-md hover:bg-gray-100 text-zinc-400" title="Open source">
                        <LinkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="pl-7 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {parts.map((p, pi) =>
                      p.toLowerCase() === r.highlight.toLowerCase() ? (
                        <mark key={pi} className="bg-amber-100 text-amber-900 rounded px-0.5">
                          {p}
                        </mark>
                      ) : (
                        <span key={pi}>{p}</span>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">
          Enter a query to test retrieval
        </div>
      )}
    </div>
  )
}

// ── Settings Tab ───────────────────────────────────────────────────────

function SettingsTab() {
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
                defaultValue={PLAYBOOK.name}
                className="w-full h-9 px-3 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1 block">Description</label>
              <textarea
                defaultValue={PLAYBOOK.description}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-blue-800" />
            <h3 className="text-sm font-semibold text-zinc-900">Indexing</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200">
              <div>
                <div className="text-sm font-medium text-zinc-900">Embedding model</div>
                <div className="text-xs text-zinc-500">Used to convert text into searchable vectors</div>
              </div>
              <span className="text-sm font-medium text-zinc-700">text-embedding-3-large</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200">
              <div>
                <div className="text-sm font-medium text-zinc-900">Chunk size</div>
                <div className="text-xs text-zinc-500">Size of each indexed segment in tokens</div>
              </div>
              <span className="text-sm font-medium text-zinc-700 tabular-nums">1,024 tokens</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200">
              <div>
                <div className="text-sm font-medium text-zinc-900">Overlap</div>
                <div className="text-xs text-zinc-500">How much consecutive chunks overlap</div>
              </div>
              <span className="text-sm font-medium text-zinc-700 tabular-nums">128 tokens</span>
            </div>
          </div>
        </section>

        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-800" />
            <h3 className="text-sm font-semibold text-zinc-900">Access</h3>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200">
            <div>
              <div className="text-sm font-medium text-zinc-900">Firm-wide</div>
              <div className="text-xs text-zinc-500">All users can query this knowledge base</div>
            </div>
            <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700">
              Public
            </span>
          </div>
        </section>

        <section className="rounded-[10px] border border-red-200 bg-red-50/30 p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-1">Danger zone</h3>
          <p className="text-xs text-red-700 mb-3">Deleting this knowledge base will break any playbooks currently referencing it.</p>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800">
            <Trash className="h-4 w-4" />
            Delete knowledge base
          </Button>
        </section>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────

export function KnowledgeDetail() {
  const [tab, setTab] = useState<Tab>("files")

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <IdentityHeader />
      <Tabs active={tab} onChange={setTab} />
      {tab === "files" && <FilesTab />}
      {tab === "search" && <SearchTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FlowArrow,
  MagnifyingGlass,
  Plus,
  Sparkle,
  FileText,
  Clock,
  Scales,
  Gavel,
  Notepad,
  PhoneCall,
  ChartLineUp,
  Calculator,
  Timer,
  UsersThree,
  PushPin,
  DotsThreeVertical,
  CaretRight,
  Compass,
  TrendUp,
  Star,
  ArrowUpRight,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────

type Category = "Discovery" | "Litigation" | "Filing" | "Pre-litigation" | "Intake"

interface Playbook {
  id: string
  name: string
  description: string
  category: Category
  icon: typeof FileText
  iconColor: string
  iconBg: string
  inputs: number
  outputs: number
  runs: number
  lastRun: string
  creator: { name: string; initials: string; color: string }
  pinned?: boolean
  trending?: boolean
}

// ── Sample Data ────────────────────────────────────────────────────────

const PLAYBOOKS: Playbook[] = [
  {
    id: "medical-records-summary",
    name: "Medical Records Summary",
    description: "Analyzes uploaded medical records, extracts chronological treatment history, and flags gaps in documentation.",
    category: "Discovery",
    icon: FileText,
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    inputs: 3,
    outputs: 5,
    runs: 1847,
    lastRun: "12s ago",
    creator: { name: "John Lawyer", initials: "JL", color: "bg-blue-100 text-blue-800" },
    pinned: true,
    trending: true,
  },
  {
    id: "demand-letter-draft",
    name: "Demand Letter Draft",
    description: "Generates a first-draft demand letter using case facts, damages calculations, and precedent language.",
    category: "Pre-litigation",
    icon: Notepad,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    inputs: 4,
    outputs: 2,
    runs: 2341,
    lastRun: "3m ago",
    creator: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    pinned: true,
  },
  {
    id: "case-timeline",
    name: "Case Timeline Generator",
    description: "Builds a chronological timeline of events across all records, depositions, and filings.",
    category: "Litigation",
    icon: Timer,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    inputs: 2,
    outputs: 1,
    runs: 847,
    lastRun: "28m ago",
    creator: { name: "Bob Chen", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
    trending: true,
  },
  {
    id: "damage-calculator",
    name: "Damages Calculator",
    description: "Itemizes economic and non-economic damages from medical bills, lost wages, and pain/suffering frameworks.",
    category: "Litigation",
    icon: Calculator,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-50",
    inputs: 5,
    outputs: 4,
    runs: 1204,
    lastRun: "1h ago",
    creator: { name: "Dylan Park", initials: "DP", color: "bg-amber-100 text-amber-700" },
  },
  {
    id: "similar-case-finder",
    name: "Similar Case Finder",
    description: "Searches precedent database for factually similar cases with comparable outcomes and settlement values.",
    category: "Discovery",
    icon: Scales,
    iconColor: "text-indigo-700",
    iconBg: "bg-indigo-50",
    inputs: 3,
    outputs: 3,
    runs: 612,
    lastRun: "2h ago",
    creator: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
  {
    id: "discovery-response",
    name: "Discovery Response Drafter",
    description: "Responds to interrogatories and requests for production using pre-approved firm objection language.",
    category: "Discovery",
    icon: Gavel,
    iconColor: "text-rose-700",
    iconBg: "bg-rose-50",
    inputs: 2,
    outputs: 1,
    runs: 423,
    lastRun: "5h ago",
    creator: { name: "John Johnson", initials: "JJ", color: "bg-indigo-100 text-indigo-700" },
  },
  {
    id: "intake-voice",
    name: "Voice Intake to Case",
    description: "Transcribes client intake calls and auto-generates a new case file with extracted facts and parties.",
    category: "Intake",
    icon: PhoneCall,
    iconColor: "text-sky-700",
    iconBg: "bg-sky-50",
    inputs: 1,
    outputs: 6,
    runs: 1567,
    lastRun: "45m ago",
    creator: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    trending: true,
  },
  {
    id: "witness-list",
    name: "Witness List Builder",
    description: "Compiles witness list from case records with contact info, relationship to parties, and testimony topics.",
    category: "Litigation",
    icon: UsersThree,
    iconColor: "text-teal-700",
    iconBg: "bg-teal-50",
    inputs: 2,
    outputs: 3,
    runs: 289,
    lastRun: "Yesterday",
    creator: { name: "Bob Chen", initials: "BC", color: "bg-emerald-100 text-emerald-700" },
  },
  {
    id: "filing-checker",
    name: "Filing Compliance Check",
    description: "Reviews draft filings against court-specific formatting rules, deadlines, and required exhibits.",
    category: "Filing",
    icon: ChartLineUp,
    iconColor: "text-fuchsia-700",
    iconBg: "bg-fuchsia-50",
    inputs: 2,
    outputs: 4,
    runs: 734,
    lastRun: "Yesterday",
    creator: { name: "Sam Torres", initials: "ST", color: "bg-rose-100 text-rose-700" },
  },
]

const CATEGORIES: { label: string; count?: number }[] = [
  { label: "All", count: PLAYBOOKS.length },
  { label: "My Playbooks", count: 4 },
  { label: "Discovery", count: 3 },
  { label: "Litigation", count: 3 },
  { label: "Filing", count: 1 },
  { label: "Pre-litigation", count: 1 },
  { label: "Intake", count: 1 },
]

// ── Header ──────────────────────────────────────────────────────────────

function LibraryHeader() {
  return (
    <div className="flex h-12 items-center border-b border-gray-200 bg-gray-50 px-4 gap-2">
      <FlowArrow className="h-4 w-4 text-zinc-500" />
      <h1 className="text-sm font-semibold text-zinc-900">Playbooks</h1>
      <span className="text-xs text-zinc-400 ml-1">Reusable AI procedures that produce structured outputs</span>
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-8 gap-1.5">
        <Compass className="h-4 w-4" />
        Discover
      </Button>
      <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
        <Plus className="h-4 w-4" />
        Create playbook
      </Button>
    </div>
  )
}

// ── Category Tabs ───────────────────────────────────────────────────────

function CategoryTabs({ active, onChange }: { active: string; onChange: (c: string) => void }) {
  return (
    <div className="flex items-center border-b border-gray-200 bg-white px-4 gap-0.5">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.label
        return (
          <button
            key={cat.label}
            onClick={() => onChange(cat.label)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
              isActive ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {cat.label}
            {cat.count !== undefined && (
              <span className={`inline-flex items-center justify-center h-[18px] min-w-[22px] rounded-full px-1.5 text-[11px] font-medium ${
                isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-zinc-600"
              }`}>
                {cat.count}
              </span>
            )}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
          </button>
        )
      })}
    </div>
  )
}

// ── Toolbar ─────────────────────────────────────────────────────────────

function LibraryToolbar({
  query,
  setQuery,
  view,
  setView,
}: {
  query: string
  setQuery: (q: string) => void
  view: "grid" | "list"
  setView: (v: "grid" | "list") => void
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="relative flex-1 max-w-sm">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search playbooks..."
          className="w-full h-8 pl-9 pr-3 text-sm rounded-[10px] border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="flex-1" />
      <div className="flex items-center rounded-[10px] border border-gray-200 bg-white overflow-hidden">
        <button
          onClick={() => setView("grid")}
          className={`flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium transition-colors ${
            view === "grid" ? "bg-gray-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Grid
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium transition-colors ${
            view === "list" ? "bg-gray-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          List
        </button>
      </div>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        Sort: Most used
      </Button>
    </div>
  )
}

// ── Playbook Card ───────────────────────────────────────────────────────

function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const Icon = playbook.icon
  return (
    <Link
      href={`/workflows/${playbook.id}/edit`}
      className="group relative flex flex-col rounded-[10px] border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-[0_2px_8px_rgba(30,64,175,0.08)] transition-all"
    >
      {/* Top row: icon + badges */}
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center h-10 w-10 rounded-[10px] ${playbook.iconBg}`}>
          <Icon className={`h-5 w-5 ${playbook.iconColor}`} weight="regular" />
        </div>
        <div className="flex items-center gap-1">
          {playbook.trending && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              <TrendUp className="h-3 w-3" weight="bold" />
              Trending
            </span>
          )}
          {playbook.pinned && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-blue-800"
            >
              <PushPin className="h-4 w-4" weight="fill" />
            </button>
          )}
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

      {/* Name + description */}
      <div className="flex-1 mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-800 transition-colors">
            {playbook.name}
          </h3>
        </div>
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{playbook.description}</p>
      </div>

      {/* Category tag */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
          {playbook.category}
        </span>
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <span className="tabular-nums">{playbook.inputs}</span>
          <span className="text-zinc-300">in</span>
          <CaretRight className="h-2.5 w-2.5 text-zinc-300" weight="bold" />
          <span className="tabular-nums">{playbook.outputs}</span>
          <span className="text-zinc-300">out</span>
        </span>
      </div>

      {/* Footer: stats + creator */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkle className="h-3 w-3" weight="fill" />
            <span className="font-medium text-zinc-700 tabular-nums">
              {playbook.runs >= 1000 ? `${(playbook.runs / 1000).toFixed(1)}k` : playbook.runs}
            </span>
            runs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {playbook.lastRun}
          </span>
        </div>
        <div className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[9px] font-semibold ${playbook.creator.color}`}>
          {playbook.creator.initials}
        </div>
      </div>
    </Link>
  )
}

// ── Create New Card ─────────────────────────────────────────────────────

function CreateCard() {
  return (
    <button className="group flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-gray-200 bg-white/50 p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all min-h-[200px]">
      <div className="flex items-center justify-center h-10 w-10 rounded-[10px] bg-blue-50 mb-3 group-hover:bg-blue-100 transition-colors">
        <Plus className="h-5 w-5 text-blue-800" weight="bold" />
      </div>
      <div className="text-sm font-semibold text-zinc-900 mb-1">Create playbook</div>
      <div className="text-xs text-zinc-500 text-center max-w-[200px]">
        Build a new AI procedure from scratch or start from a template
      </div>
    </button>
  )
}

// ── Featured Strip ──────────────────────────────────────────────────────

function FeaturedStrip() {
  return (
    <div className="mx-4 mt-4 rounded-[10px] border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 flex items-center gap-4">
      <div className="flex items-center justify-center h-12 w-12 rounded-[10px] bg-blue-800 shadow-sm">
        <Sparkle className="h-6 w-6 text-white" weight="fill" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-sm font-semibold text-zinc-900">New: Playbook Templates</h2>
          <span className="inline-flex items-center rounded-full bg-blue-800 px-1.5 py-0.5 text-[10px] font-medium text-white">NEW</span>
        </div>
        <p className="text-xs text-zinc-600">
          Start from 40+ pre-built templates for common legal procedures. One click to customize and deploy.
        </p>
      </div>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-white">
        Browse templates
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────

export function PlaybooksLibrary({ embedded = false }: { embedded?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = PLAYBOOKS.filter((p) => {
    if (activeCategory !== "All" && activeCategory !== "My Playbooks" && p.category !== activeCategory) return false
    if (activeCategory === "My Playbooks" && !p.pinned) return false
    if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.description.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const pinned = filtered.filter((p) => p.pinned)
  const rest = filtered.filter((p) => !p.pinned)

  return (
    <div className="flex flex-1 flex-col bg-gray-50 min-h-0">
      {!embedded && <LibraryHeader />}
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <LibraryToolbar query={query} setQuery={setQuery} view={view} setView={setView} />

      <div className="flex-1 overflow-auto">
        <FeaturedStrip />

        {/* Pinned section */}
        {pinned.length > 0 && activeCategory === "All" && (
          <div className="px-4 pt-6 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <PushPin className="h-3.5 w-3.5 text-blue-800" weight="fill" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Pinned</h2>
              <span className="text-[11px] text-zinc-400">({pinned.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {pinned.map((p) => (
                <PlaybookCard key={p.id} playbook={p} />
              ))}
            </div>
          </div>
        )}

        {/* All / filtered */}
        <div className="px-4 pt-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="h-3.5 w-3.5 text-zinc-400" weight="fill" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {activeCategory === "All" ? "All playbooks" : activeCategory}
            </h2>
            <span className="text-[11px] text-zinc-400">({activeCategory === "All" ? rest.length : filtered.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(activeCategory === "All" ? rest : filtered).map((p) => (
              <PlaybookCard key={p.id} playbook={p} />
            ))}
            <CreateCard />
          </div>
        </div>
      </div>
    </div>
  )
}

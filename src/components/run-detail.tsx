"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowSquareOut,
  Clock,
  Copy,
  ArrowClockwise,
  DownloadSimple,
  Printer,
  CheckCircle,
  XCircle,
  CircleNotch,
  SuitcaseSimple,
  PencilSimple,
  FilePdf,
  FileDoc,
  FileCsv,
  Table as TableIcon,
  MagnifyingGlass,
  FunnelSimple,
  CaretDown,
  Hash,
  TextT,
  ListBullets,
  Stack,
  FileText,
  Notepad,
  Warning,
  Siren,
  PhoneCall,
  Scales,
  Heartbeat,
  Bookmark,
  Lightning,
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

type RunStatus = "success" | "running" | "failed" | "queued"
type Tone = "neutral" | "success" | "warning" | "danger"

interface RunScalar {
  name: string
  value: string
  tone?: Tone
  icon?: typeof TextT
}

interface QuestionRow {
  question: string
  flag: string
  reasoning: string
  source: string
}

interface RunDocument {
  name: string
  format: string // "DOCX" | "PDF" | "Markdown"
  pageCount: number
  bodyMarkdown: string
}

interface RunData {
  id: string
  playbookId: string
  playbookName: string
  playbookIcon: typeof Notepad
  playbookIconColor: string
  playbookIconBg: string
  status: RunStatus
  case: string
  started: string
  duration: string
  triggeredBy: { name: string; initials: string; color: string }
  inputs: { label: string; value: string; icon?: typeof TextT }[]
  scalars: RunScalar[]
  questions?: QuestionRow[]
  document?: RunDocument
  logSteps: { name: string; duration: string; status: "success" | "failed" }[]
}

// ── Sample data ────────────────────────────────────────────────────────

const QUESTIONS: QuestionRow[] = [
  {
    question: "Ms. Lopez, when you spoke to Officer Martinez at the scene, do you recall telling him you were looking for your phone?",
    flag: "Contradiction",
    reasoning: "Pin down the admission made at the scene before confronting with the denial in interrogatories.",
    source: "Police Report p.4",
  },
  {
    question: "In your interrogatory responses, you stated you were not using your phone at the time of impact. Is that accurate?",
    flag: "Contradiction",
    reasoning: "Pin down the second version to establish the contradiction.",
    source: "Interrogatories #12",
  },
  {
    question: "Can you explain the difference between what you told the officer and what you stated in your interrogatories?",
    flag: "Contradiction",
    reasoning: "Force the deponent to reconcile two incompatible statements.",
    source: "Police Report p.4 + Interrog. #12",
  },
  {
    question: "At approximately what speed were you traveling just before the collision?",
    flag: "Discrepancy",
    reasoning: "Obtain a third speed statement to compare against the two existing ones.",
    source: "Police Report p.3 + Interrog. #7",
  },
  {
    question: "Were you cited at the scene? And do you know what the citation was for?",
    flag: "Liability",
    reasoning: "Lock down under oath that she received a citation — evidence of negligence.",
    source: "Police Report p.5",
  },
  {
    question: "When did you first seek medical treatment after the accident?",
    flag: "Medical",
    reasoning: "Establish the 4-month gap between the accident and the first medical visit.",
    source: "Medical Records p.1",
  },
  {
    question: "Why didn't you seek medical attention for four months after the accident?",
    flag: "Medical",
    reasoning: "Force explanation for the treatment gap — attack on damages credibility.",
    source: "Medical Records p.1-4",
  },
  {
    question: "Did you take any photographs at the scene of the accident?",
    flag: "Evidence",
    reasoning: "Document preservation question — check for inconsistent production.",
    source: "RFP Response #7",
  },
  {
    question: "Ms. Lopez, what is your educational background?",
    flag: "Standard",
    reasoning: "Foundational question to establish competence and credibility of the deponent.",
    source: "Knowledge Base",
  },
  {
    question: "Have you ever been involved in any other motor vehicle accidents?",
    flag: "Standard",
    reasoning: "Pattern of conduct — prior accidents may indicate habitual negligence.",
    source: "Knowledge Base",
  },
  {
    question: "Have you ever been convicted of a crime?",
    flag: "Standard",
    reasoning: "Standard credibility question in depositions.",
    source: "Knowledge Base",
  },
  {
    question: "Is the $45,000 future medical cost estimate based on you returning to full-time work?",
    flag: "Damages",
    reasoning: "Economic damages tied to work capacity — critical for case value.",
    source: "Future Cost Report",
  },
]

const POSTURE_MEMO_BODY = `# Smith v. Park — Posture Update

**Case:** CVSA-1189
**As of:** April 28, 2026
**Lookback:** 7 days

---

## Headline

Treatment is on track. Two new providers added to the file. One discovery deadline (RFP responses) due in **9 days**. One decision needed from the attorney before Friday.

## What changed this week

### New documents (4)
- **Medical records** — *Bay Area PT — visit 7 (4/22)*, *Bay Area PT — visit 8 (4/24)*
- **Imaging** — *Cervical MRI report (4/25, SF Sports Medicine)*
- **Insurance** — *Defendant insurer's reservation-of-rights letter (4/23)*

### New providers
- Dr. Chen — Pain management specialist (referral from Dr. Han, first visit 4/26)
- Hand Therapy of SF — Authorized 4/24, first visit scheduled 5/2

### Treatment changes
Pain management referral indicates the soft-tissue injury is not resolving as expected. Dr. Han ordered the MRI; preliminary read shows mild C5-C6 disc bulge consistent with claimed injury. **No gaps flagged.**

## Flags
- **Insurer reservation of rights (4/23)** — challenges scope of treatment as exceeding what's reasonable for the mechanism of injury. Worth a response within 30 days.
- **Pain management referral** — increases the case's medical specials trajectory by ~$12K-$18K on conservative estimate.

## Deadlines (next 30 days)
- **5/7** — RFP responses due (Defendant's first set, served 4/7)
- **5/14** — Plaintiff deposition scheduled at 9am, our office
- **5/22** — Expert disclosure deadline

## Decisions needed
- **Respond to reservation-of-rights letter?** Yes / No / Send to coverage counsel — *needed by Friday 5/2 to preserve options*
- **Add Dr. Chen to expert disclosures?** Recommended given the disc finding and likely need for treating-provider testimony.
`

const DEMAND_LETTER_BODY = `# Smith v. Park, et al. — Demand for Settlement

**Re:** Maria Lopez (Plaintiff) — CVSA-1189
**Date of incident:** March 12, 2024
**Total demand:** $2,400,000

---

## I. Summary

This letter constitutes a formal demand for settlement of all claims arising
from the motor-vehicle collision of March 12, 2024, in which our client
sustained serious bodily injury due to your insured's negligent operation of
his vehicle.

## II. Liability

Liability is clear. Your insured was cited at the scene for failure to obey
a traffic signal and admitted to investigating officers that he was reaching
for his cell phone at the time of impact (Police Report, p. 4). Photographic
evidence and an eyewitness statement corroborate that our client had a green
signal and was traveling within posted limits.

## III. Damages

### Special damages
- Past medical specials: **$184,732**
- Future medical specials (life-care plan): **$612,500**
- Past lost wages: **$48,300**
- Future loss of earning capacity: **$1,210,000**

### General damages
- Pain and suffering, past and future: **$344,468**

**Total demand: $2,400,000**

## IV. Demand and deadline

We demand your insured's policy limits in full settlement of all claims.
This demand will remain open for **thirty (30) days** from the date of this
letter, after which time we will be forced to file suit and proceed with
formal discovery.

We trust that your insurer will evaluate this matter in good faith.

Very truly yours,

**James Rivera, Esq.**
Veritec Law`

const RUNS: Record<string, RunData> = {
  run_17CPU: {
    id: "run_17CPU",
    playbookId: "case-posture-update",
    playbookName: "Case Posture Update",
    playbookIcon: Notepad,
    playbookIconColor: "text-emerald-700",
    playbookIconBg: "bg-emerald-50",
    status: "success",
    case: "CVSA-1189",
    started: "16 minutes ago",
    duration: "27.4s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    inputs: [
      { label: "Case", value: "CVSA-1189", icon: SuitcaseSimple },
      { label: "As-of date", value: "2026-04-28" },
      { label: "Lookback", value: "7 days" },
    ],
    scalars: [
      { name: "New documents", value: "4", icon: Hash },
      { name: "Flags", value: "2", icon: Hash, tone: "warning" },
      { name: "Decisions needed", value: "2", icon: Hash, tone: "warning" },
    ],
    document: {
      name: "Smith v. Park — Posture 04-28.docx",
      format: "DOCX",
      pageCount: 2,
      bodyMarkdown: POSTURE_MEMO_BODY,
    },
    logSteps: [
      { name: "Fetch case file", duration: "2.1s", status: "success" },
      { name: "Fetch recent activity (7 days)", duration: "1.4s", status: "success" },
      { name: "Identify what changed", duration: "14.8s", status: "success" },
      { name: "Compose posture memo", duration: "9.1s", status: "success" },
    ],
  },
  run_02DLD: {
    id: "run_02DLD",
    playbookId: "demand-letter-draft",
    playbookName: "Demand Letter Draft",
    playbookIcon: Notepad,
    playbookIconColor: "text-purple-700",
    playbookIconBg: "bg-purple-50",
    status: "success",
    case: "CVSA-1189",
    started: "8 minutes ago",
    duration: "42.1s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    inputs: [
      { label: "Case", value: "CVSA-1189", icon: SuitcaseSimple },
      { label: "Tone", value: "Firm" },
      { label: "Deadline", value: "30 days" },
    ],
    scalars: [
      { name: "Total demand", value: "$2.4M", icon: Hash, tone: "success" },
      { name: "Pages", value: "5", icon: Hash },
      { name: "Tone", value: "Firm", icon: TextT },
    ],
    document: {
      name: "Smith Demand Letter.docx",
      format: "DOCX",
      pageCount: 5,
      bodyMarkdown: DEMAND_LETTER_BODY,
    },
    logSteps: [
      { name: "Fetch case facts", duration: "0.9s", status: "success" },
      { name: "Extract damages and injuries", duration: "12.4s", status: "success" },
      { name: "Write Demand Letter from template", duration: "28.8s", status: "success" },
    ],
  },
  run_01HMW: {
    id: "run_01HMW",
    playbookId: "depo-prep",
    playbookName: "Deposition Prep",
    playbookIcon: Notepad,
    playbookIconColor: "text-purple-700",
    playbookIconBg: "bg-purple-50",
    status: "success",
    case: "CVSA-1189",
    started: "4 minutes ago",
    duration: "18.2s",
    triggeredBy: { name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    inputs: [
      { label: "Case", value: "CVSA-1189", icon: SuitcaseSimple },
      { label: "Deposition samples", value: "Plaintiff Depositions (23 files)", icon: Stack },
      { label: "Deponent type", value: "Plaintiff" },
    ],
    scalars: [
      { name: "Deponent name", value: "Maria Lopez", icon: TextT },
      { name: "Deponent type", value: "Plaintiff", icon: TextT },
      { name: "Question count", value: "127", icon: Hash, tone: "success" },
    ],
    questions: QUESTIONS,
    logSteps: [
      { name: "Load case context", duration: "1.2s", status: "success" },
      { name: "Retrieve depo samples", duration: "0.8s", status: "success" },
      { name: "Find weaknesses & generate questions", duration: "16.2s", status: "success" },
    ],
  },
}

const DEFAULT_RUN = RUNS.run_01HMW

function getRun(id: string): RunData {
  return RUNS[id] ?? DEFAULT_RUN
}

// ── Flag styling ──────────────────────────────────────────────────────

const FLAG_STYLES: Record<string, { icon: typeof Warning; cls: string }> = {
  Contradiction: { icon: Warning, cls: "bg-red-50 text-red-700 border-red-200" },
  Discrepancy: { icon: Warning, cls: "bg-amber-50 text-amber-700 border-amber-200" },
  Liability: { icon: Scales, cls: "bg-red-50 text-red-700 border-red-200" },
  Medical: { icon: Heartbeat, cls: "bg-teal-50 text-teal-700 border-teal-200" },
  Standard: { icon: Bookmark, cls: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  Evidence: { icon: Lightning, cls: "bg-purple-50 text-purple-700 border-purple-200" },
  Damages: { icon: Hash, cls: "bg-green-50 text-green-700 border-green-200" },
}

function FlagPill({ flag }: { flag: string }) {
  const style = FLAG_STYLES[flag] ?? FLAG_STYLES.Standard
  const Icon = style.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${style.cls}`}>
      <Icon className="h-3 w-3" weight="fill" />
      {flag}
    </span>
  )
}

// ── Status pill ────────────────────────────────────────────────────────

function StatusPill({ status }: { status: RunStatus }) {
  const cfg = {
    success: { icon: CheckCircle, cls: "bg-green-50 text-green-700 border-green-200", label: "Success", weight: "fill" as const, spin: false },
    running: { icon: CircleNotch, cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Running", weight: "bold" as const, spin: true },
    failed: { icon: XCircle, cls: "bg-red-50 text-red-700 border-red-200", label: "Failed", weight: "fill" as const, spin: false },
    queued: { icon: Clock, cls: "bg-gray-50 text-zinc-600 border-gray-200", label: "Queued", weight: "bold" as const, spin: false },
  }[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      <Icon className={`h-3 w-3 ${cfg.spin ? "animate-spin" : ""}`} weight={cfg.weight} />
      {cfg.label}
    </span>
  )
}

// ── Header ────────────────────────────────────────────────────────────

function RunHeader({ run }: { run: RunData }) {
  const Icon = run.playbookIcon
  return (
    <div className="flex h-12 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 shrink-0">
      <Link
        href="/playbooks"
        className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
        title="Back to runs"
      >
        <ArrowLeft className="h-4 w-4" weight="bold" />
      </Link>
      <Link
        href={`/playbooks/${run.playbookId}/edit`}
        className={`flex items-center justify-center h-5 w-5 rounded ${run.playbookIconBg}`}
        title="Open playbook"
      >
        <Icon className={`h-3 w-3 ${run.playbookIconColor}`} weight="bold" />
      </Link>
      <Link
        href={`/playbooks/${run.playbookId}/edit`}
        className="text-sm font-semibold text-zinc-900 hover:text-blue-800 transition-colors"
      >
        {run.playbookName}
      </Link>
      <span className="text-zinc-400 text-sm">/</span>
      <span className="font-mono text-xs text-zinc-600">{run.id}</span>
      <StatusPill status={run.status} />
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <Copy className="h-3.5 w-3.5" />
        Copy
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-700">
        <ArrowClockwise className="h-3.5 w-3.5" />
        Re-run
      </Button>
      <DownloadMenu />
    </div>
  )
}

function DownloadMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-zinc-700"
        onClick={() => setOpen(!open)}
      >
        <DownloadSimple className="h-3.5 w-3.5" />
        Download
        <CaretDown className="h-3 w-3" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-[220px] rounded-md border border-gray-200 bg-white shadow-lg py-1">
            <DownloadItem icon={FileCsv} label="Questions (CSV)" hint="Records table as spreadsheet" />
            <DownloadItem icon={FileDoc} label="Depo outline (DOCX)" hint="Formatted Word document" />
            <DownloadItem icon={FilePdf} label="Full report (PDF)" hint="Inputs, outputs, log" />
            <div className="h-px bg-gray-100 my-1" />
            <DownloadItem icon={Printer} label="Print preview" />
            <DownloadItem icon={ArrowSquareOut} label="Copy shareable link" />
          </div>
        </>
      )}
    </div>
  )
}

function DownloadItem({ icon: Icon, label, hint }: { icon: typeof FileCsv; label: string; hint?: string }) {
  return (
    <button className="w-full flex items-start gap-2 px-2.5 py-1.5 text-left hover:bg-gray-50">
      <Icon className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-zinc-900">{label}</div>
        {hint && <div className="text-[11px] text-zinc-500">{hint}</div>}
      </div>
    </button>
  )
}

// ── Scalar cards ──────────────────────────────────────────────────────

function ScalarCard({ scalar }: { scalar: RunScalar }) {
  const toneClass = {
    neutral: "text-zinc-900",
    success: "text-green-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  }[scalar.tone ?? "neutral"]
  const Icon = scalar.icon ?? TextT
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-1 text-[11px] text-zinc-500 mb-1">
        <Icon className="h-3 w-3" />
        {scalar.name}
      </div>
      <div className={`text-lg font-semibold tabular-nums ${toneClass}`}>{scalar.value}</div>
    </div>
  )
}

// ── Questions Table (Records output rendered as a real table) ─────────

// ── Document Section (for Format-step deliverables) ────────────────────

function DocumentSection({ document: doc }: { document: RunDocument }) {
  const lines = doc.bodyMarkdown.split("\n")
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Deliverable
        </h2>
        <span className="text-[11px] text-zinc-400">· filled {doc.format} document</span>
      </div>
      <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
        {/* Header strip */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-teal-50">
            <FileDoc className="h-4 w-4 text-teal-700" weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-zinc-900 truncate">{doc.name}</span>
              <span className="inline-flex items-center rounded border border-gray-200 bg-white px-1.5 py-0 text-[10px] font-medium text-zinc-600">
                {doc.format}
              </span>
            </div>
            <div className="text-[11px] text-zinc-500">
              {doc.pageCount} page{doc.pageCount !== 1 ? "s" : ""} · generated from template
            </div>
          </div>
          <DocumentActions document={doc} />
        </div>
        {/* Body — paper-style preview */}
        <div className="bg-gray-100 px-6 py-6">
          <div className="mx-auto max-w-[680px] bg-white rounded-md shadow-sm border border-gray-200 px-10 py-10 text-[13px] leading-[1.7] text-zinc-800 font-serif">
            {lines.map((line, i) => {
              if (line.startsWith("# ")) {
                return (
                  <h1 key={i} className="text-[20px] font-semibold text-zinc-900 mb-1 font-sans">
                    {line.slice(2)}
                  </h1>
                )
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-[15px] font-semibold text-zinc-900 mt-5 mb-2 font-sans">
                    {line.slice(3)}
                  </h2>
                )
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-[13px] font-semibold text-zinc-900 mt-3 mb-1 font-sans">
                    {line.slice(4)}
                  </h3>
                )
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-6 list-disc">
                    <MarkdownInline text={line.slice(2)} />
                  </li>
                )
              }
              if (line.startsWith("---")) {
                return <hr key={i} className="my-4 border-gray-200" />
              }
              if (line.trim() === "") {
                return <div key={i} className="h-3" />
              }
              return (
                <p key={i}>
                  <MarkdownInline text={line} />
                </p>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function DocumentActions({ document: doc }: { document: RunDocument }) {
  const [savedToCase, setSavedToCase] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = () => {
    setSavedToCase(true)
    setTimeout(() => setSavedToCase(false), 2200)
  }
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc.bodyMarkdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={handleSave}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
          savedToCase
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
        }`}
        title="Write this memo into the case file in Filevine"
      >
        {savedToCase ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" weight="fill" />
            Saved to case
          </>
        ) : (
          <>
            <SuitcaseSimple className="h-3.5 w-3.5" weight="bold" />
            Save to case
          </>
        )}
      </button>
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
          copied
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-gray-200 bg-white text-zinc-700 hover:border-blue-300 hover:text-blue-800"
        }`}
        title="Copy memo text \u2014 paste anywhere"
      >
        {copied ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" weight="fill" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" weight="bold" />
            Copy
          </>
        )}
      </button>
      <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:border-blue-300 hover:text-blue-800 transition-colors">
        <DownloadSimple className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  )
}

function MarkdownInline({ text }: { text: string }) {
  // Simple **bold** rendering only — keeps the demo lightweight
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-zinc-900">
              {p.slice(2, -2)}
            </strong>
          )
        }
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

function QuestionsTable({ questions }: { questions: QuestionRow[] }) {
  const [activeFlag, setActiveFlag] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const flagCounts = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.flag] = (acc[q.flag] ?? 0) + 1
    return acc
  }, {})

  const filtered = questions.filter((q) => {
    if (activeFlag && q.flag !== activeFlag) return false
    if (query) {
      const needle = query.toLowerCase()
      return (
        q.question.toLowerCase().includes(needle) ||
        q.reasoning.toLowerCase().includes(needle) ||
        q.source.toLowerCase().includes(needle)
      )
    }
    return true
  })

  const flagOrder = ["Contradiction", "Discrepancy", "Liability", "Medical", "Evidence", "Damages", "Standard"]
  const availableFlags = flagOrder.filter((f) => flagCounts[f])

  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-start gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-violet-100 shrink-0">
          <TableIcon className="h-4 w-4 text-violet-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">Questions</h2>
            <span className="inline-flex items-center rounded bg-violet-100 text-violet-800 px-1.5 py-0 text-[10px] font-semibold">
              Records · 4 columns
            </span>
            <span className="text-[11px] text-zinc-500">
              {questions.length} total · showing {filtered.length}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">One row per question — the core deliverable</div>
        </div>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-zinc-700 shrink-0">
          <FileCsv className="h-3.5 w-3.5" />
          CSV
        </Button>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-white flex-wrap">
        <div className="relative max-w-[280px] flex-1">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full h-7 pl-7 pr-3 text-xs rounded-md border border-gray-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveFlag(null)}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
              !activeFlag
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-gray-200 bg-white text-zinc-600 hover:bg-gray-50"
            }`}
          >
            All
            <span className="text-[10px] text-zinc-500">{questions.length}</span>
          </button>
          {availableFlags.map((flag) => {
            const style = FLAG_STYLES[flag]
            const Icon = style.icon
            const active = activeFlag === flag
            return (
              <button
                key={flag}
                onClick={() => setActiveFlag(active ? null : flag)}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  active ? style.cls : "border-gray-200 bg-white text-zinc-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-3 w-3" weight="fill" />
                {flag}
                <span className="text-[10px] opacity-70">{flagCounts[flag]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[640px]">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent border-b border-gray-200">
              <TableHead className="w-10 text-xs font-medium text-zinc-500 uppercase tracking-wide">#</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide min-w-[340px]">
                Question
              </TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide w-[140px]">Flag</TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide min-w-[260px]">
                Reasoning
              </TableHead>
              <TableHead className="text-xs font-medium text-zinc-500 uppercase tracking-wide w-[200px]">
                Source
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((q, i) => (
              <TableRow key={i} className="hover:bg-gray-50 border-b border-gray-100 group">
                <TableCell className="py-3 text-sm text-zinc-400 tabular-nums align-top">
                  {questions.indexOf(q) + 1}
                </TableCell>
                <TableCell className="py-3 text-sm text-zinc-900 leading-relaxed align-top">
                  {q.question}
                </TableCell>
                <TableCell className="py-3 align-top">
                  <FlagPill flag={q.flag} />
                </TableCell>
                <TableCell className="py-3 text-xs text-zinc-600 leading-relaxed align-top">
                  {q.reasoning}
                </TableCell>
                <TableCell className="py-3 text-xs text-zinc-600 align-top">
                  <span className="inline-flex items-center gap-1 rounded bg-gray-50 border border-gray-200 px-1.5 py-0.5 font-medium">
                    <FilePdf className="h-3 w-3 text-rose-600" weight="fill" />
                    {q.source}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                  No questions match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

// ── Right sidebar panels ──────────────────────────────────────────────

function InputsPanel({ run }: { run: RunData }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-zinc-900">Inputs</h3>
        <p className="text-[11px] text-zinc-500">What was passed in</p>
      </div>
      <div className="p-2 space-y-1.5">
        {run.inputs.map((inp, i) => {
          const Icon = inp.icon ?? TextT
          return (
            <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded border border-gray-100 bg-gray-50/50">
              <Icon className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 mb-0.5">
                  {inp.label}
                </div>
                <div className="text-sm text-zinc-900 truncate">{inp.value}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TimelinePanel({ run }: { run: RunData }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-zinc-900">Timeline</h3>
      </div>
      <div className="p-3 space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-[11px]">Started</span>
          <span className="text-zinc-900">{run.started}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-[11px]">Duration</span>
          <span className="text-zinc-900 tabular-nums">{run.duration}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-[11px]">Triggered by</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-semibold ${run.triggeredBy.color}`}
            >
              {run.triggeredBy.initials}
            </span>
            <span className="text-zinc-900 text-sm">{run.triggeredBy.name}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-[11px]">Case</span>
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 rounded px-1.5 py-0 text-xs font-medium">
            <SuitcaseSimple className="h-3 w-3" weight="bold" />
            {run.case}
          </span>
        </div>
      </div>
    </section>
  )
}

function ExecutionLogPanel({ run }: { run: RunData }) {
  return (
    <section className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-zinc-900">Execution log</h3>
        <p className="text-[11px] text-zinc-500">{run.logSteps.length} steps</p>
      </div>
      <div className="p-2 space-y-1.5">
        {run.logSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-xs py-1">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-[10px] font-semibold text-zinc-600 shrink-0">
              {i + 1}
            </span>
            {step.status === "success" ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" weight="fill" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" weight="fill" />
            )}
            <span className="flex-1 text-zinc-700">{step.name}</span>
            <span className="text-zinc-500 tabular-nums">{step.duration}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Main ──────────────────────────────────────────────────────────────

export function RunDetail() {
  const params = useParams()
  const id = (params?.id as string | undefined) ?? "run_01HMW"
  const run = getRun(id)

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-gray-50">
      <RunHeader run={run} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1280px] mx-auto p-4 grid grid-cols-[1fr_300px] gap-4">
          {/* Main area */}
          <div className="space-y-4 min-w-0">
            {/* Scalar metrics */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Outputs</h2>
                <span className="text-[11px] text-zinc-400">· extractions from this run</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {run.scalars.map((s) => (
                  <ScalarCard key={s.name} scalar={s} />
                ))}
              </div>
            </section>

            {/* Document deliverable (Format step output) */}
            {run.document && <DocumentSection document={run.document} />}

            {/* Questions table (records-shaped deliverable) */}
            {run.questions && <QuestionsTable questions={run.questions} />}
          </div>

          {/* Right sidebar */}
          <div className="space-y-3 min-w-0">
            <InputsPanel run={run} />
            <TimelinePanel run={run} />
            <ExecutionLogPanel run={run} />
          </div>
        </div>
      </div>
    </div>
  )
}

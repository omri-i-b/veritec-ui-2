"use client"

import Link from "next/link"
import {
  FlowArrow,
  FileText,
  ArrowRight,
  Play,
  CheckCircle,
  CircleNotch,
  SuitcaseSimple,
  Sparkle,
  Clock,
  ArrowSquareOut,
  Plus,
  Notepad,
  Timer,
} from "@phosphor-icons/react"

// ── Mini card renderings for the visual explainer ─────────────────────

function MiniPlaybookCard({
  icon: Icon,
  iconBg,
  iconColor,
  name,
  desc,
  runs,
  highlight,
}: {
  icon: typeof FileText
  iconBg: string
  iconColor: string
  name: string
  desc: string
  runs: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-[10px] border bg-white p-3 ${highlight ? "border-blue-400 ring-4 ring-blue-100" : "border-gray-200"}`}>
      <div className="flex items-start gap-2 mb-2">
        <div className={`flex items-center justify-center h-7 w-7 rounded-md ${iconBg} shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-zinc-900 truncate">{name}</div>
          <div className="text-[10px] text-zinc-500 line-clamp-1 leading-tight">{desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[9px] text-zinc-500">
        <span className="flex items-center gap-0.5">
          <Sparkle className="h-2.5 w-2.5" weight="fill" />
          {runs}
        </span>
      </div>
    </div>
  )
}

function MiniRunRow({
  status,
  caseName,
  output,
  highlight,
}: {
  status: "success" | "running" | "failed"
  caseName: string
  output: string
  highlight?: boolean
}) {
  const statusConfig = {
    success: { icon: CheckCircle, className: "bg-green-50 text-green-700 border-green-200", label: "Success" },
    running: { icon: CircleNotch, className: "bg-blue-50 text-blue-700 border-blue-200", label: "Running" },
    failed: { icon: CheckCircle, className: "bg-red-50 text-red-700 border-red-200", label: "Failed" },
  }[status]
  const Icon = statusConfig.icon
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 text-[10px] border-b border-gray-100 ${highlight ? "bg-blue-50/50" : ""}`}>
      <span className={`inline-flex items-center gap-0.5 rounded-full border px-1 py-0 text-[9px] font-medium ${statusConfig.className}`}>
        <Icon className={`h-2 w-2 ${status === "running" ? "animate-spin" : ""}`} weight="fill" />
        {statusConfig.label}
      </span>
      <div className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-800 rounded px-1 py-0 text-[9px] font-medium">
        <SuitcaseSimple className="h-2 w-2" weight="bold" />
        {caseName}
      </div>
      <div className="text-zinc-600 truncate flex-1">{output}</div>
    </div>
  )
}

// ── Flow arrow with label ─────────────────────────────────────────────

function FlowArrowLabel({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0 px-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-800">{label}</div>
      <ArrowRight className="h-5 w-5 text-blue-800" weight="bold" />
      {sublabel && <div className="text-[10px] text-zinc-500 max-w-[100px] text-center leading-tight">{sublabel}</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────

export default function PlaybooksFlowExplainer() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto pt-12 px-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-800">
            <FlowArrow className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">How Playbooks &amp; Runs fit together</h1>
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-[640px]">
          The two screens are a <span className="font-semibold text-zinc-900">definition</span> ↔ <span className="font-semibold text-zinc-900">execution</span> pair, like a recipe and the meals you cook from it.
        </p>
      </div>

      {/* Main visual flow */}
      <div className="max-w-[1200px] mx-auto px-6 mt-10">
        <div className="rounded-[14px] bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-stretch gap-2">
            {/* STEP 1: Library */}
            <div className="flex-1">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[11px] font-semibold text-blue-800">1</span>
                  <h3 className="text-sm font-semibold text-zinc-900">Playbooks Library</h3>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  A catalog of <span className="font-semibold">reusable AI procedures</span>. Each card is a template definition — not a result.
                </p>
              </div>
              <div className="rounded-[10px] border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">/workflows</div>
                <div className="grid grid-cols-2 gap-2">
                  <MiniPlaybookCard
                    icon={FileText}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-800"
                    name="Medical Records Summary"
                    desc="Analyzes records, flags gaps"
                    runs="1.8k runs"
                    highlight
                  />
                  <MiniPlaybookCard
                    icon={Notepad}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-700"
                    name="Demand Letter Draft"
                    desc="Generates demand letters"
                    runs="2.3k runs"
                  />
                  <MiniPlaybookCard
                    icon={Timer}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-700"
                    name="Case Timeline"
                    desc="Builds chronologies"
                    runs="847 runs"
                  />
                  <div className="rounded-[10px] border-2 border-dashed border-gray-200 bg-white/50 p-3 flex flex-col items-center justify-center">
                    <Plus className="h-4 w-4 text-blue-800 mb-1" />
                    <div className="text-[10px] font-semibold text-zinc-700">Create</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <FlowArrowLabel label="Click a card" sublabel="Opens that playbook's detail page" />

            {/* STEP 2: One playbook */}
            <div className="w-[280px] shrink-0">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[11px] font-semibold text-blue-800">2</span>
                  <h3 className="text-sm font-semibold text-zinc-900">One Playbook</h3>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  The <span className="font-semibold">template definition</span>: its inputs, outputs, and settings. Click Run to execute.
                </p>
              </div>
              <div className="rounded-[10px] border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">/workflows/medical-records-summary</div>
                <div className="rounded-[10px] border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-800" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-zinc-900">Medical Records Summary</div>
                      <div className="text-[10px] text-zinc-500">Published • 1.8k runs</div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 w-12">Inputs</span>
                      <span className="text-zinc-700 font-medium">Case, Records PDF, Plaintiff</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 w-12">Outputs</span>
                      <span className="text-zinc-700 font-medium">Summary, Gaps, Confidence</span>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-1.5 bg-blue-800 text-white rounded-md py-1.5 text-[11px] font-medium">
                    <Play className="h-3 w-3" weight="fill" />
                    Run workflow
                  </button>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <FlowArrowLabel label="Runs tab" sublabel="Every execution shows as a row" />

            {/* STEP 3: Runs grid */}
            <div className="flex-1">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[11px] font-semibold text-blue-800">3</span>
                  <h3 className="text-sm font-semibold text-zinc-900">Runs Grid</h3>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  A <span className="font-semibold">log of every execution</span> with inline outputs. One row = one run of this playbook.
                </p>
              </div>
              <div className="rounded-[10px] border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">/workflows/medical-records-summary · Runs tab</div>
                <div className="rounded-[10px] border border-gray-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 border-b border-gray-200 text-[9px] font-medium uppercase tracking-wide text-zinc-500">
                    <span className="w-14">Status</span>
                    <span className="w-14">Case</span>
                    <span className="flex-1">Output</span>
                  </div>
                  <MiniRunRow status="running" caseName="CVSA-1234" output="Processing 42 records..." highlight />
                  <MiniRunRow status="success" caseName="CVSA-1189" output="47 records, 3 gaps found, 94%" />
                  <MiniRunRow status="success" caseName="2025CI03480" output="62 records, 0 gaps, 98% conf." />
                  <MiniRunRow status="failed" caseName="DC-24-09558" output="—" />
                  <MiniRunRow status="success" caseName="CVSA-1045" output="31 records, 5 gaps, 87% conf." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mental model */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <h2 className="text-sm font-semibold text-zinc-900 mb-3">Mental model</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[10px] border border-gray-200 bg-white p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Cooking</div>
            <div className="space-y-1.5 text-sm">
              <div><span className="font-semibold text-zinc-900">Playbook</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Recipe</span></div>
              <div><span className="font-semibold text-zinc-900">Run</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">A meal you cooked</span></div>
              <div><span className="font-semibold text-zinc-900">Runs grid</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">History of every meal</span></div>
            </div>
          </div>
          <div className="rounded-[10px] border border-gray-200 bg-white p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Programming</div>
            <div className="space-y-1.5 text-sm">
              <div><span className="font-semibold text-zinc-900">Playbook</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Function definition</span></div>
              <div><span className="font-semibold text-zinc-900">Run</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Function call</span></div>
              <div><span className="font-semibold text-zinc-900">Runs grid</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Call log / results table</span></div>
            </div>
          </div>
          <div className="rounded-[10px] border border-gray-200 bg-white p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Legal practice</div>
            <div className="space-y-1.5 text-sm">
              <div><span className="font-semibold text-zinc-900">Playbook</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Standard procedure</span></div>
              <div><span className="font-semibold text-zinc-900">Run</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Applied to one case</span></div>
              <div><span className="font-semibold text-zinc-900">Runs grid</span> <span className="text-zinc-500">=</span> <span className="text-zinc-700">Caseload outcomes</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="max-w-[1200px] mx-auto px-6 mt-6">
        <div className="rounded-[10px] border border-blue-200 bg-blue-50/40 p-4 flex items-start gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-800 shrink-0">
            <Sparkle className="h-4 w-4 text-white" weight="fill" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">The AirOps insight</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every run produces the <span className="font-semibold text-zinc-900">same shape of output</span> (because they're all executions of one playbook). So the Runs grid can show inline columns for each output field — you get a <span className="font-semibold text-zinc-900">spreadsheet of AI results</span> instead of a generic "click to view" history log.
            </p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8 flex items-center gap-3">
        <Link
          href="/workflows"
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-blue-800 text-white px-4 py-2 text-sm font-medium hover:bg-blue-900 transition-colors"
        >
          <FlowArrow className="h-4 w-4" />
          Open Playbooks library
          <ArrowSquareOut className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/workflows/medical-records-summary"
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white text-zinc-900 px-4 py-2 text-sm font-medium hover:border-gray-300 transition-colors"
        >
          <Clock className="h-4 w-4" />
          Open Runs grid
          <ArrowSquareOut className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

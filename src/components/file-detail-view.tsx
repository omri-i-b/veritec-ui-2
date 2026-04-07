"use client"

import {
  Tray,
  Plus,
  CalendarBlank,
  ArrowsClockwise,
  User,
  ArrowCounterClockwise,
  Eye,
  PaperPlaneTilt,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

// ── Extracted Data Cards (Overview Tab) ──────────────────────────────

const extractedData = [
  {
    label: "DATE",
    value: "2024-03-17",
    hasAlert: true,
  },
  {
    label: "EMAIL SUBJECT",
    value: "Notification of Service – Daniel Jaramillo vs Annet Holdings",
  },
  {
    label: "FILE NAME",
    value: "notification_of_service_2025CI03480.pdf",
  },
  {
    label: "CUSTOMER_TYPE",
    value: "Daniel Jaramillo VS Annet Holdings",
  },
  {
    label: "MEDICAL_FINDINGS",
    value: "Lower back strain and soft tissue injury reported following workplace incident.",
  },
  {
    label: "CASE_SUMMARY",
    value: "Legal notice confirming service of documents to Annet Smith, regarding a workplace injury",
  },
]

// ── Filing Sidebar Data ──────────────────────────────────────────────

const filingInfo = [
  { label: "CLIENT", value: "Company 1" },
  { label: "LOCATION", value: "N/A" },
  { label: "SOURCE", value: "efile" },
  { label: "CASE STYLE", value: "Daniel Jaramillo VS Annet Holdings" },
  { label: "FILING TYPE", value: "No Fee Documents" },
  { label: "STATE", value: "Texas" },
]

// ── Event Reminders (Management Tab) ─────────────────────────────────

const reminders = [
  { date: "02/18/2026", label: "Response deadline – 30 days before trial" },
  { date: "02/18/2026", label: "Discovery cutoff reminder" },
  { date: "02/18/2026", label: "Deposition scheduling deadline" },
]

// ── Overview Tab ─────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-zinc-900">Extracted Data</h3>
      <div className="flex flex-col gap-4">
        {/* Row pairs */}
        {[0, 2, 4].map((startIdx) => (
          <div key={startIdx} className="flex gap-4 h-[104px]">
            {extractedData.slice(startIdx, startIdx + 2).map((item) => (
              <div
                key={item.label}
                className="flex-1 rounded-[10px] border border-gray-200 p-4"
              >
                <div className="flex gap-1 items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-zinc-500">
                      {item.label}
                    </span>
                    <p className="text-sm text-zinc-900 leading-[1.4]">{item.value}</p>
                  </div>
                  {item.hasAlert && (
                    <Button variant="ghost" size="sm" className="h-auto px-2 py-0.5 text-sm text-gray-600 shrink-0">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Alert
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Management Tab ───────────────────────────────────────────────────

function ManagementTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Classification */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Classification</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Name</label>
            <Input
              defaultValue="examplefile.pdf"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Type</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option>Motion</option>
              <option>Affidavit</option>
              <option>Order</option>
              <option>Notice</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Project / Matter</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-zinc-400">
              <option>-</option>
              <option>Company 1 - 0...</option>
            </select>
          </div>
        </div>
      </div>

      {/* Event */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Event</h3>
        <div className="rounded-[10px] border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Date</label>
              <Input
                defaultValue="03/20/2026"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Name</label>
              <Input
                defaultValue="55-0000244540 - Trial - Due Today."
                disabled
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="mb-3">
            <span className="text-xs font-medium text-zinc-500">Other Reminders</span>
          </div>

          <div className="flex flex-col gap-2">
            {reminders.map((reminder, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2"
              >
                <CalendarBlank className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="text-sm text-zinc-500">{reminder.date}</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-zinc-700">{reminder.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <Button variant="outline" size="sm" className="text-sm">
              <ArrowsClockwise className="mr-1.5 h-4 w-4" />
              Resync
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Synced to Calendar
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Right Sidebar Cards ──────────────────────────────────────────────

function RightSidebar() {
  return (
    <div className="w-[420px] shrink-0 flex flex-col gap-4">
      {/* Filing Card */}
      <div className="flex-1 rounded-[10px] border border-gray-200 bg-white overflow-clip pt-4">
        <div className="flex flex-col gap-4 h-full pb-4">
          <div className="px-4">
            <h3 className="text-base font-semibold text-zinc-900">Filling</h3>
          </div>
          <div className="flex flex-col gap-4 px-4">
            {filingInfo.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-zinc-500">
                  {item.label}
                </span>
                <p className="text-sm text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="flex-1 rounded-[10px] border border-gray-200 bg-white overflow-clip pt-4">
        <div className="flex flex-col gap-4 h-full pb-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-base font-semibold text-zinc-900">Preview</h3>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">Full Page Preview</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 px-4">
            {/* Placeholder document previews */}
            <div className="h-[52px] rounded-[10px] bg-gray-50 border border-gray-200" />
            <div className="h-[416px] rounded-[10px] bg-gray-50 border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-zinc-400">Document Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AI Chat Input ────────────────────────────────────────────────────

function AIChatInput() {
  return (
    <div className="rounded-[10px] bg-gray-50 border border-gray-200 overflow-clip">
      <div className="bg-white rounded-[10px] border border-zinc-200 mx-0 flex flex-col justify-between h-[120px] p-3">
        <p className="text-sm text-zinc-500">Ask AI about the file...</p>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-8 text-sm text-zinc-900 pl-1 pr-3">
            <div className="flex items-center justify-center h-5 w-5 rounded-[10px] bg-gray-100 mr-1.5">
              <Plus className="h-3 w-3" />
            </div>
            Add Sources
          </Button>
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-800 opacity-50">
            <PaperPlaneTilt className="h-3.5 w-3.5 text-white" weight="fill" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Custom Tabs ──────────────────────────────────────────────────────

function DetailTabs() {
  const [activeTab, setActiveTab] = useState<"overview" | "management">("overview")

  return (
    <div className="flex flex-col h-full">
      {/* Tab headers */}
      <div className="flex items-start px-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-2 py-[9px] text-sm overflow-clip ${
            activeTab === "overview"
              ? "font-semibold text-blue-800 border-b-3 border-blue-800"
              : "font-normal text-zinc-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("management")}
          className={`px-2 py-[9px] text-sm overflow-clip ${
            activeTab === "management"
              ? "font-semibold text-blue-800 border-b-3 border-blue-800"
              : "font-normal text-zinc-700"
          }`}
        >
          Management
        </button>
      </div>
      <div className="h-px bg-gray-200" />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" ? <OverviewTab /> : <ManagementTab />}
      </div>
    </div>
  )
}

// ── Main Detail View ─────────────────────────────────────────────────

export function FileDetailView() {
  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Top header bar — breadcrumb + review status all in one row */}
      <div className="flex h-12 items-center border-b border-gray-200 px-4 gap-2 bg-gray-50">
        {/* Breadcrumb */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <Tray className="h-4 w-4 text-zinc-900 shrink-0" weight="bold" />
          <a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`} className="text-sm text-zinc-900 hover:text-zinc-700 shrink-0">
            FileFlow Inbox
          </a>
          <span className="text-sm font-semibold text-zinc-900 shrink-0">/</span>
          <h1 className="text-sm font-semibold text-zinc-900 truncate">
            Notification of Service – Daniel Jaram...
          </h1>
        </div>

        {/* Review status */}
        <span className="text-xs text-gray-700 shrink-0">Reviewed by:</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100">
            <User className="h-2.5 w-2.5 text-zinc-500" />
          </div>
          <span className="text-xs font-medium text-gray-700">John Smith</span>
        </div>
        <div className="h-[23px] w-px bg-gray-200 shrink-0" />
        <button className="flex items-center gap-1 shrink-0">
          <ArrowCounterClockwise className="h-4 w-4 text-gray-700" />
          <span className="text-xs font-medium text-gray-700">Undo</span>
        </button>
        <Badge className="bg-green-100 text-green-800 border-transparent rounded-full text-xs font-medium px-2 py-0.5 shrink-0">
          Approved
        </Badge>
      </div>

      {/* Content area — two card columns */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Main content card */}
        <div className="flex-1 min-w-0 rounded-[10px] border border-gray-200 bg-white overflow-clip flex flex-col gap-4 pb-4">
          <div className="flex-1 flex flex-col min-h-0">
            <DetailTabs />
          </div>

          {/* AI Chat Input */}
          <div className="px-4">
            <AIChatInput />
          </div>
        </div>

        {/* Right sidebar cards */}
        <RightSidebar />
      </div>
    </div>
  )
}

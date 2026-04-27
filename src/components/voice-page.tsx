"use client"

import { useState } from "react"
import {
  Tray,
  PhoneIncoming,
  PhoneOutgoing,
} from "@phosphor-icons/react"
import { VoiceCallsInbox } from "@/components/voice-calls-inbox"
import { OutboundCallPipeline } from "@/components/outbound-call-pipeline"
import { InboundCallQueue } from "@/components/inbound-call-queue"

type Tab = "inbox" | "inbound_live" | "outbound"

export function VoicePage() {
  const [tab, setTab] = useState<Tab>("inbox")

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Page header */}
      <header className="flex h-12 items-center gap-3 border-b border-gray-200 bg-white px-4 shrink-0">
        <h1 className="text-base font-semibold text-zinc-900">Voice</h1>
        <span className="text-[11px] text-zinc-500">
          · operator surface for inbound and outbound voice agents
        </span>
      </header>

      {/* Top-level tabs */}
      <nav className="flex items-center gap-0 border-b border-gray-200 bg-white px-4 shrink-0">
        <PrimaryTab
          active={tab === "inbox"}
          onClick={() => setTab("inbox")}
          icon={<Tray className="h-3.5 w-3.5" weight="bold" />}
          label="Inbox"
        />
        <PrimaryTab
          active={tab === "inbound_live"}
          onClick={() => setTab("inbound_live")}
          icon={<PhoneIncoming className="h-3.5 w-3.5" weight="bold" />}
          label="Inbound (live)"
        />
        <PrimaryTab
          active={tab === "outbound"}
          onClick={() => setTab("outbound")}
          icon={<PhoneOutgoing className="h-3.5 w-3.5" weight="bold" />}
          label="Outbound pipeline"
        />
      </nav>

      <div className="flex flex-1 min-h-0 flex-col">
        {tab === "inbox" && <VoiceCallsInbox />}
        {tab === "inbound_live" && <InboundCallQueue />}
        {tab === "outbound" && <OutboundCallPipeline />}
      </div>
    </div>
  )
}

function PrimaryTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors relative ${
        active ? "text-blue-800 font-semibold" : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-800" />}
    </button>
  )
}

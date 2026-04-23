"use client";

import {
  MagnifyingGlass,
  Plus,
  Robot,
  UserPlus,
  FileMagnifyingGlass,
  Gavel,
  CalendarBlank,
  Handshake,
  ChatCircleDots,
  Scales,
  Binoculars,
  CheckCircle,
  PauseCircle,
  WarningCircle,
  DotsThree,
  Clock,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AgentStatus = "active" | "paused" | "error";

type Agent = {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  icon: Icon;
  iconBg: string;
  iconFg: string;
  tasksToday: number;
  successRate: number;
  lastRun: string;
  usedOnCases: number;
};

const AGENTS: Agent[] = [
  {
    id: "intake",
    name: "Intake Agent",
    description: "Monitors incoming leads, qualifies prospects, and books intake calls.",
    status: "active",
    icon: UserPlus,
    iconBg: "bg-[#eef2ff]",
    iconFg: "text-[#4338ca]",
    tasksToday: 42,
    successRate: 97,
    lastRun: "2 min ago",
    usedOnCases: 318,
  },
  {
    id: "records",
    name: "Medical Records Chaser",
    description: "Tracks record requests, follows up with providers, and ingests returned records.",
    status: "active",
    icon: FileMagnifyingGlass,
    iconBg: "bg-[#f5f3ff]",
    iconFg: "text-[#6d28d9]",
    tasksToday: 128,
    successRate: 91,
    lastRun: "6 min ago",
    usedOnCases: 214,
  },
  {
    id: "filing",
    name: "Filing Agent",
    description: "Watches court deadlines, prepares filings, and submits documents to e-file portals.",
    status: "active",
    icon: Gavel,
    iconBg: "bg-[#f0fdfa]",
    iconFg: "text-[#0f766e]",
    tasksToday: 9,
    successRate: 100,
    lastRun: "24 min ago",
    usedOnCases: 67,
  },
  {
    id: "demand",
    name: "Demand Calendar Agent",
    description: "Tracks 30-day demand windows per carrier and escalates approaching expirations.",
    status: "active",
    icon: CalendarBlank,
    iconBg: "bg-[#fffbeb]",
    iconFg: "text-[#b45309]",
    tasksToday: 23,
    successRate: 99,
    lastRun: "1 hr ago",
    usedOnCases: 142,
  },
  {
    id: "negotiator",
    name: "Settlement Negotiator",
    description: "Drafts counter-offers grounded in case value models and recent comparable settlements.",
    status: "paused",
    icon: Handshake,
    iconBg: "bg-[#f0f9ff]",
    iconFg: "text-[#0369a1]",
    tasksToday: 0,
    successRate: 88,
    lastRun: "Yesterday",
    usedOnCases: 54,
  },
  {
    id: "comms",
    name: "Client Comms Agent",
    description: "Sends proactive status updates and answers routine client questions over SMS and email.",
    status: "active",
    icon: ChatCircleDots,
    iconBg: "bg-[#faf5ff]",
    iconFg: "text-[#7e22ce]",
    tasksToday: 311,
    successRate: 96,
    lastRun: "Just now",
    usedOnCases: 489,
  },
  {
    id: "lien",
    name: "Lien Resolution Agent",
    description: "Tracks active liens, negotiates reductions with providers, and reconciles payoff letters.",
    status: "error",
    icon: Scales,
    iconBg: "bg-[#fff1f2]",
    iconFg: "text-[#be123c]",
    tasksToday: 4,
    successRate: 82,
    lastRun: "12 min ago",
    usedOnCases: 73,
  },
  {
    id: "discovery",
    name: "Discovery Monitor",
    description: "Watches case folders for new documents, flags substantive changes, and routes to the handling attorney.",
    status: "active",
    icon: Binoculars,
    iconBg: "bg-[#ecfdf5]",
    iconFg: "text-[#047857]",
    tasksToday: 57,
    successRate: 94,
    lastRun: "3 min ago",
    usedOnCases: 201,
  },
  {
    id: "damages",
    name: "Damages Drafting Agent",
    description: "Assembles special damages tables from medical bills, liens, and wage-loss records.",
    status: "active",
    icon: Sparkle,
    iconBg: "bg-[#fdf4ff]",
    iconFg: "text-[#a21caf]",
    tasksToday: 18,
    successRate: 93,
    lastRun: "38 min ago",
    usedOnCases: 96,
  },
];

const FILTERS = [
  { label: "All", count: 9, active: true },
  { label: "Active", count: 7, active: false },
  { label: "Paused", count: 1, active: false },
  { label: "Error", count: 1, active: false },
];

function StatusPill({ status }: { status: AgentStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-[2px] text-[11px] font-medium leading-4 text-[#15803d]">
        <CheckCircle size={12} weight="fill" />
        Active
      </span>
    );
  }
  if (status === "paused") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#fde68a] bg-[#fffbeb] px-2 py-[2px] text-[11px] font-medium leading-4 text-[#b45309]">
        <PauseCircle size={12} weight="fill" />
        Paused
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#fecaca] bg-[#fef2f2] px-2 py-[2px] text-[11px] font-medium leading-4 text-[#b91c1c]">
      <WarningCircle size={12} weight="fill" />
      Error
    </span>
  );
}

function StatBlock({
  eyebrow,
  value,
  hint,
}: {
  eyebrow: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex-1 border-r border-[#e5e7eb] px-4 py-3 last:border-r-0">
      <div className="text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-zinc-500">
        {eyebrow}
      </div>
      <div className="mt-1 text-[18px] font-semibold leading-6 tracking-[-0.005em] text-zinc-900 tabular-nums">
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[11px] leading-4 text-zinc-500">{hint}</div>
      ) : null}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  return (
    <div className="group relative flex flex-col rounded-[10px] border border-[#e5e7eb] bg-white p-4 transition-shadow hover:border-[#dbeafe] hover:shadow-[0_2px_8px_rgba(30,64,175,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${agent.iconBg}`}
          >
            <Icon size={20} className={agent.iconFg} weight="regular" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold leading-5 text-zinc-900">
              {agent.name}
            </div>
            <div className="mt-0.5">
              <StatusPill status={agent.status} />
            </div>
          </div>
        </div>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-zinc-500 opacity-0 transition-opacity hover:bg-gray-100 hover:text-zinc-900 group-hover:opacity-100"
          aria-label="Agent actions"
        >
          <DotsThree size={16} weight="bold" />
        </button>
      </div>

      <p className="mt-3 line-clamp-2 text-[12px] leading-4 text-zinc-500">
        {agent.description}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-[6px] border border-[#f1f5f9] bg-[#f9fafb] px-3 py-2">
        <div>
          <div className="text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-zinc-500">
            Today
          </div>
          <div className="mt-0.5 text-[14px] font-semibold leading-5 text-zinc-900 tabular-nums">
            {agent.tasksToday}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-zinc-500">
            Success
          </div>
          <div className="mt-0.5 text-[14px] font-semibold leading-5 text-zinc-900 tabular-nums">
            {agent.successRate}%
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-zinc-500">
            Last run
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] font-medium leading-5 text-zinc-700">
            <Clock size={12} className="text-zinc-400" />
            <span className="truncate">{agent.lastRun}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#f1f5f9] pt-3">
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#eff6ff] px-1.5 py-[2px] text-[12px] font-medium text-[#1e40af]">
          Used on {agent.usedOnCases} cases
        </span>
        <button
          type="button"
          className="text-[12px] font-medium text-zinc-500 hover:text-[#1e40af]"
        >
          View
        </button>
      </div>
    </div>
  );
}

function CreateAgentCard() {
  return (
    <button
      type="button"
      className="group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#d1d5db] bg-transparent p-4 text-zinc-500 transition-colors hover:border-[#dbeafe] hover:bg-[#eff6ff] hover:text-[#1e40af]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-dashed border-[#d1d5db] bg-white text-zinc-400 transition-colors group-hover:border-[#dbeafe] group-hover:bg-white group-hover:text-[#1e40af]">
        <Plus size={20} weight="regular" />
      </div>
      <div className="text-[14px] font-semibold leading-5">Create agent</div>
      <div className="max-w-[220px] text-center text-[12px] leading-4 text-zinc-500">
        Design a new autonomous worker for your firm.
      </div>
    </button>
  );
}

export function AgentsLibrary() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Page header */}
      <header className="flex h-12 items-center justify-between border-b border-[#e5e7eb] bg-[#f9fafb] px-4">
        <div className="flex items-center gap-2">
          <Robot size={16} className="text-zinc-700" weight="regular" />
          <h1 className="text-[14px] font-semibold leading-5 text-zinc-900">
            Agents
          </h1>
          <span className="ml-1 inline-flex items-center rounded-full border border-[#e5e7eb] bg-white px-2 py-[1px] text-[11px] font-medium text-zinc-500">
            9
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 rounded-[6px] border-[#e5e7eb] px-3 text-[14px] font-medium text-zinc-700 hover:bg-[#f9fafb]"
          >
            Documentation
          </Button>
          <Button className="h-8 rounded-[6px] bg-[#1e40af] px-3 text-[14px] font-medium text-white hover:bg-[#1e3a8a]">
            <Plus size={14} weight="bold" className="mr-1" />
            New agent
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-6">
        {/* Title + subtitle */}
        <div className="mb-5">
          <h2 className="text-[18px] font-semibold leading-6 tracking-[-0.005em] text-zinc-900">
            Agent Library
          </h2>
          <p className="mt-1 text-[14px] leading-5 text-zinc-500">
            Autonomous AI workers that run continuously against your case
            inventory. Unlike playbooks, agents monitor, decide, and act over
            days and weeks.
          </p>
        </div>

        {/* Stats band */}
        <div className="mb-5 flex items-stretch rounded-[10px] border border-[#e5e7eb] bg-white">
          <StatBlock eyebrow="Active agents" value="7" hint="of 9 total" />
          <StatBlock eyebrow="Tasks this week" value="4,218" hint="+18% vs last week" />
          <StatBlock eyebrow="Success rate" value="94%" hint="rolling 7 days" />
          <StatBlock eyebrow="Cases covered" value="612" hint="across 9 agents" />
          <StatBlock eyebrow="Hours saved" value="328h" hint="this week, est." />
        </div>

        {/* Filter / search row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                className={
                  f.active
                    ? "inline-flex items-center gap-1.5 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-[2px] text-[11px] font-medium text-[#1e40af]"
                    : "inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-2 py-[2px] text-[11px] font-medium text-zinc-600 hover:border-[#d1d5db] hover:bg-[#f9fafb]"
                }
              >
                {f.label}
                <span
                  className={
                    f.active
                      ? "rounded-full bg-white px-1 text-[10px] font-semibold text-[#1e40af] tabular-nums"
                      : "rounded-full bg-[#f3f4f6] px-1 text-[10px] font-semibold text-zinc-500 tabular-nums"
                  }
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-[300px]">
            <MagnifyingGlass
              size={14}
              weight="regular"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <Input
              placeholder="Search agents"
              className="h-8 rounded-[6px] border-[#e5e7eb] bg-white pl-8 pr-3 text-[14px] text-zinc-900 placeholder:text-zinc-500 focus-visible:border-[#1e40af] focus-visible:ring-[3px] focus-visible:ring-[#dbeafe]"
            />
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AGENTS.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
          <CreateAgentCard />
        </div>
      </div>
    </div>
  );
}

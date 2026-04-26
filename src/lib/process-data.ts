import type { ComponentType } from "react"
import {
  User,
  Robot,
  Gear,
  Plug,
  CheckCircle,
  CircleDashed,
  Circle,
} from "@phosphor-icons/react"

export type StateStatus = "completed" | "current" | "future" | "skipped"
export type OwnerKind = "human" | "agent" | "system" | "integration"

export interface ProcessState {
  id: string
  name: string
  status: StateStatus
  completedAt?: string
  expectedDuration?: string
  description?: string
}

export interface ProcessOwner {
  kind: OwnerKind
  name: string
  initials?: string
  color?: string
  agentType?: string
}

export interface ActiveStep {
  id: string
  stateId: string
  name: string
  description?: string
  owner: ProcessOwner
  status: "in_progress" | "waiting" | "blocked" | "scheduled"
  deadline?: string
  blocker?: string
  agentThreadId?: string
  /** Where the operator can route to */
  href?: string
}

export type HistoryEventKind =
  | "state_transition"
  | "step_completed"
  | "step_started"
  | "note_added"
  | "manual_override"
  | "trigger"

export interface HistoryEvent {
  id: string
  kind: HistoryEventKind
  title: string
  detail?: string
  actor: ProcessOwner
  at: string
}

export interface ProcessDef {
  id: string
  name: string
  templateName: string
  templateId: string
  version: string
  entityType: "Lead" | "Case" | "Matter"
  entityId: string
  entityLabel: string
  startedAt: string
  ageDays: number
  slaLabel?: string
  slaTone?: "neutral" | "warning" | "danger" | "success"
  states: ProcessState[]
  activeSteps: ActiveStep[]
  history: HistoryEvent[]
  context: {
    title: string
    facts: { label: string; value: string }[]
  }
}

// ── Owner kind config ─────────────────────────────────────────────────

export const OWNER_KIND: Record<
  OwnerKind,
  { label: string; icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>; tileBg: string; tileText: string }
> = {
  human: { label: "Person", icon: User, tileBg: "bg-blue-100", tileText: "text-blue-800" },
  agent: { label: "Agent", icon: Robot, tileBg: "bg-violet-100", tileText: "text-violet-700" },
  system: { label: "System", icon: Gear, tileBg: "bg-zinc-100", tileText: "text-zinc-700" },
  integration: { label: "Integration", icon: Plug, tileBg: "bg-emerald-100", tileText: "text-emerald-700" },
}

// ── State status config ───────────────────────────────────────────────

export const STATE_STATUS: Record<
  StateStatus,
  { icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>; ring: string; bg: string; text: string }
> = {
  completed: { icon: CheckCircle, ring: "ring-2 ring-green-200", bg: "bg-green-100 text-green-700", text: "text-zinc-700" },
  current: { icon: Circle, ring: "ring-4 ring-blue-200", bg: "bg-blue-800 text-white", text: "text-blue-800 font-semibold" },
  future: { icon: CircleDashed, ring: "", bg: "bg-white border-2 border-dashed border-gray-300 text-gray-300", text: "text-zinc-400" },
  skipped: { icon: CircleDashed, ring: "", bg: "bg-gray-50 border border-gray-200 text-gray-400", text: "text-zinc-400 line-through" },
}

// ── Sample data: pre-litigation worked example ───────────────────────

export const SAMPLE_PROCESS: ProcessDef = {
  id: "PROC-4127",
  name: "Pre-Litigation",
  templateName: "Pre-Litigation Workflow",
  templateId: "pre-lit-v3",
  version: "v3",
  entityType: "Case",
  entityId: "CVSA-4127",
  entityLabel: "Maria Lopez",
  startedAt: "Oct 15, 2025",
  ageDays: 32,
  slaLabel: "21d to demand window",
  slaTone: "warning",
  states: [
    { id: "s1", name: "Lead intake", status: "completed", completedAt: "Oct 15", description: "Inbound call qualified into a case" },
    { id: "s2", name: "Sign retainer", status: "completed", completedAt: "Oct 17", description: "Retainer sent and e-signed" },
    { id: "s3", name: "Initial medical request", status: "completed", completedAt: "Oct 20", description: "Records request to ER and PCP" },
    { id: "s4", name: "Treatment cycle", status: "current", description: "6-month treatment window — collect records as visits happen" },
    { id: "s5", name: "Records collected", status: "future", description: "All providers responded; record set complete" },
    { id: "s6", name: "Demand prepared", status: "future", description: "Demand letter drafted with damages calc" },
    { id: "s7", name: "Demand sent", status: "future", description: "Demand transmitted to carrier" },
    { id: "s8", name: "Negotiation", status: "future", description: "Counter-offers, mediation if needed" },
    { id: "s9", name: "Settlement / Filed", status: "future", description: "Settlement disbursed or move to litigation" },
  ],
  activeSteps: [
    {
      id: "step1",
      stateId: "s4",
      name: "Chase MRI records from Westside Imaging",
      description: "First request sent 11/04. No response. Auto-following up every 5 business days.",
      owner: { kind: "agent", name: "Medical Records Chaser", agentType: "records" },
      status: "waiting",
      deadline: "Following up 11/22",
      blocker: "Provider hasn't acknowledged 3 prior follow-ups",
      agentThreadId: "thread_01HM",
    },
    {
      id: "step2",
      stateId: "s4",
      name: "Confirm next PT appointment with client",
      description: "Maria has been inconsistent with PT — last visit 11/02. Confirm 11/22 appt.",
      owner: { kind: "human", name: "Vanessa Kim", initials: "VK", color: "bg-rose-100 text-rose-700" },
      status: "in_progress",
      deadline: "Due tomorrow",
    },
    {
      id: "step3",
      stateId: "s4",
      name: "Daily treatment ledger sync",
      description: "Pull new visits from MyChart and EMR feeds; reconcile against billing.",
      owner: { kind: "system", name: "Ledger Service" },
      status: "in_progress",
      deadline: "Last sync 2h ago · runs daily",
    },
    {
      id: "step4",
      stateId: "s4",
      name: "Lien correspondence — Aetna",
      description: "Aetna sent a lien notice 11/08. Awaiting reduction proposal.",
      owner: { kind: "agent", name: "Lien Resolution Agent", agentType: "lien" },
      status: "scheduled",
      deadline: "Next outreach 11/24",
      agentThreadId: "thread_02LR",
    },
  ],
  history: [
    {
      id: "h1",
      kind: "step_started",
      title: "Lien correspondence — Aetna · started",
      detail: "Lien Resolution Agent triggered by inbound mail from Aetna",
      actor: { kind: "agent", name: "Lien Resolution Agent" },
      at: "Nov 20 · 9:14 AM",
    },
    {
      id: "h2",
      kind: "step_completed",
      title: "Follow-up call to Maria · completed",
      detail: "Voice agent confirmed she'll attend the 11/22 PT appointment",
      actor: { kind: "agent", name: "Voice Intake Agent" },
      at: "Nov 4 · 2:48 PM",
    },
    {
      id: "h3",
      kind: "step_started",
      title: "Records request to Westside Imaging · started",
      detail: "Medical Records Chaser submitted HIPAA-compliant request via fax + portal",
      actor: { kind: "agent", name: "Medical Records Chaser" },
      at: "Oct 30 · 10:02 AM",
    },
    {
      id: "h4",
      kind: "step_completed",
      title: "Treatment plan recorded",
      detail: "Initial 26-week PT + chiro plan logged",
      actor: { kind: "human", name: "Vanessa Kim", initials: "VK", color: "bg-rose-100 text-rose-700" },
      at: "Oct 22 · 4:15 PM",
    },
    {
      id: "h5",
      kind: "state_transition",
      title: "Initial medical request → Treatment cycle",
      detail: "Auto-advanced after first treatment visit was recorded",
      actor: { kind: "system", name: "Workflow Engine" },
      at: "Oct 22 · 4:15 PM",
    },
    {
      id: "h6",
      kind: "step_completed",
      title: "Initial medical request · completed",
      detail: "Records request sent to ER and PCP",
      actor: { kind: "agent", name: "Filing Agent" },
      at: "Oct 20 · 11:30 AM",
    },
    {
      id: "h7",
      kind: "state_transition",
      title: "Sign retainer → Initial medical request",
      actor: { kind: "system", name: "Workflow Engine" },
      at: "Oct 17 · 5:50 PM",
    },
    {
      id: "h8",
      kind: "step_completed",
      title: "Retainer signed",
      detail: "Maria signed via DocuSign",
      actor: { kind: "human", name: "Maria Lopez", initials: "ML", color: "bg-amber-100 text-amber-700" },
      at: "Oct 17 · 5:48 PM",
    },
    {
      id: "h9",
      kind: "state_transition",
      title: "Lead intake → Sign retainer",
      actor: { kind: "system", name: "Workflow Engine" },
      at: "Oct 15 · 4:22 PM",
    },
    {
      id: "h10",
      kind: "step_completed",
      title: "Lead qualified",
      detail: "Inbound call from voice intake — auto-PI eligible",
      actor: { kind: "agent", name: "Voice Intake Agent" },
      at: "Oct 15 · 4:18 PM",
    },
    {
      id: "h11",
      kind: "trigger",
      title: "Process started",
      detail: "Triggered by: Inbound voicemail (lead-form-3812)",
      actor: { kind: "system", name: "Workflow Engine" },
      at: "Oct 15 · 4:12 PM",
    },
  ],
  context: {
    title: "Maria Lopez · Case CVSA-4127",
    facts: [
      { label: "Date of incident", value: "Oct 12, 2025" },
      { label: "Mechanism", value: "Rear-end MVA" },
      { label: "Primary contact", value: "(512) 555-0119" },
      { label: "Treating providers", value: "3 active" },
      { label: "Treatment progress", value: "Week 14 of 26" },
      { label: "Documented bills", value: "$18,420" },
      { label: "Open liens", value: "1 (Aetna)" },
      { label: "Lead lawyer", value: "James Rivera" },
    ],
  },
}

// ── Inbox sample data ────────────────────────────────────────────────

export interface ProcessRow {
  id: string
  template: string
  templateColor: string
  entityType: string
  entityId: string
  entityLabel: string
  state: string
  ownerNext: ProcessOwner
  age: number
  due: string
  dueTone: "neutral" | "warning" | "danger" | "success"
  lastActivity: string
}

export const SAMPLE_INBOX: ProcessRow[] = [
  {
    id: "PROC-4127",
    template: "Pre-Litigation",
    templateColor: "bg-amber-100 text-amber-800",
    entityType: "Case",
    entityId: "CVSA-4127",
    entityLabel: "Maria Lopez",
    state: "Treatment cycle",
    ownerNext: { kind: "agent", name: "Medical Records Chaser" },
    age: 32,
    due: "21d to demand window",
    dueTone: "warning",
    lastActivity: "2h ago",
  },
  {
    id: "PROC-3941",
    template: "Pre-Litigation",
    templateColor: "bg-amber-100 text-amber-800",
    entityType: "Case",
    entityId: "CVSA-3941",
    entityLabel: "Trevor Brooks",
    state: "Records collected",
    ownerNext: { kind: "human", name: "Vanessa Kim", initials: "VK", color: "bg-rose-100 text-rose-700" },
    age: 167,
    due: "Demand due 11/24",
    dueTone: "danger",
    lastActivity: "Yesterday",
  },
  {
    id: "PROC-4012",
    template: "Intake",
    templateColor: "bg-blue-100 text-blue-800",
    entityType: "Lead",
    entityId: "LEAD-1129",
    entityLabel: "Janet Patel",
    state: "Awaiting retainer signature",
    ownerNext: { kind: "agent", name: "Client Comms Agent" },
    age: 4,
    due: "Auto-follow-up 11/22",
    dueTone: "neutral",
    lastActivity: "11m ago",
  },
  {
    id: "PROC-4099",
    template: "Litigation",
    templateColor: "bg-rose-100 text-rose-800",
    entityType: "Matter",
    entityId: "DC-24-09812",
    entityLabel: "Reyes v. State Farm",
    state: "Discovery — interrogatories drafted",
    ownerNext: { kind: "human", name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    age: 89,
    due: "Filing due 12/03",
    dueTone: "warning",
    lastActivity: "5h ago",
  },
  {
    id: "PROC-4101",
    template: "Litigation",
    templateColor: "bg-rose-100 text-rose-800",
    entityType: "Matter",
    entityId: "DC-25-00481",
    entityLabel: "Hill v. Allstate",
    state: "Awaiting deposition prep",
    ownerNext: { kind: "agent", name: "Depo Prep Agent" },
    age: 142,
    due: "Depo 12/08",
    dueTone: "warning",
    lastActivity: "Yesterday",
  },
  {
    id: "PROC-4123",
    template: "Pre-Litigation",
    templateColor: "bg-amber-100 text-amber-800",
    entityType: "Case",
    entityId: "CVSA-4123",
    entityLabel: "Daniel Cho",
    state: "Demand prepared",
    ownerNext: { kind: "human", name: "James Rivera", initials: "JR", color: "bg-purple-100 text-purple-700" },
    age: 198,
    due: "Demand send overdue 4d",
    dueTone: "danger",
    lastActivity: "3d ago",
  },
  {
    id: "PROC-4133",
    template: "Intake",
    templateColor: "bg-blue-100 text-blue-800",
    entityType: "Lead",
    entityId: "LEAD-1141",
    entityLabel: "Sandra Wu",
    state: "Initial qualification",
    ownerNext: { kind: "agent", name: "Voice Intake Agent" },
    age: 1,
    due: "Auto qualify",
    dueTone: "neutral",
    lastActivity: "30m ago",
  },
  {
    id: "PROC-4108",
    template: "Pre-Litigation",
    templateColor: "bg-amber-100 text-amber-800",
    entityType: "Case",
    entityId: "CVSA-4108",
    entityLabel: "Olivia Bennett",
    state: "Treatment cycle",
    ownerNext: { kind: "agent", name: "Medical Records Chaser" },
    age: 47,
    due: "—",
    dueTone: "neutral",
    lastActivity: "1h ago",
  },
]

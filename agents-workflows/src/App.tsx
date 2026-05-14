import {
  Archive,
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsClockwise,
  At,
  BellSlash,
  Bookmark,
  Briefcase,
  Calendar,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  ChatCircle,
  Check,
  CheckCircle as CheckCircleIcon,
  Circle,
  CloudArrowDown,
  Copy,
  Database,
  DotsThree,
  DownloadSimple,
  Envelope,
  FileText,
  Gear,
  Globe,
  Hand,
  Heart,
  type Icon,
  Key,
  Lightning,
  Paperclip,
  PaperPlaneTilt,
  Pause,
  PencilSimple,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Plug,
  Plus,
  Robot,
  Scales,
  ShareNetwork,
  Sparkle,
  SpeakerHigh,
  Stack,
  Tag,
  TrashSimple,
  Tray,
  UserCheck,
  Users,
  Warning,
  X,
} from "@phosphor-icons/react"
import { useEffect, useMemo, useState } from "react"
import { Toaster, toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DebouncedSearch } from "@/components/ui/debounced-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollArea,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type PhoneUsage = {
  /** Calls completed in the last 7 days */
  calls7d: number
  /** Human-readable timestamp of the most recent call, or null if none */
  lastCall: string | null
}

type InboundPhone = {
  id: string
  number: string
  label: string
  status: "active" | "paused"
  /** Voice agent IDs that route through this number (display-only) */
  agentIds?: string[]
  usage?: PhoneUsage
}

type OutboundPhone = {
  id: string
  number: string
  label: string
  status: "active" | "paused"
  isDefault: boolean
  maxRetries: number
  callerId?: string
  /** Voice agent IDs that dial out from this number (display-only) */
  agentIds?: string[]
  usage?: PhoneUsage
}

type WeekdaySet = {
  mon: boolean
  tue: boolean
  wed: boolean
  thu: boolean
  fri: boolean
  sat: boolean
  sun: boolean
}

type LanguageOption = {
  id: string
  label: string
  flag: string
}

type ActiveLanguage = {
  id: string
  voice: "female" | "male"
  isPrimary: boolean
}

const LANGUAGES: LanguageOption[] = [
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "es", label: "Spanish", flag: "🇪🇸" },
  { id: "zh", label: "Chinese / Mandarin", flag: "🇨🇳" },
  { id: "tl", label: "Tagalog", flag: "🇵🇭" },
  { id: "vi", label: "Vietnamese", flag: "🇻🇳" },
  { id: "fr", label: "French", flag: "🇫🇷" },
  { id: "ar", label: "Arabic", flag: "🇸🇦" },
  { id: "ko", label: "Korean", flag: "🇰🇷" },
  { id: "ru", label: "Russian", flag: "🇷🇺" },
  { id: "pt", label: "Portuguese", flag: "🇵🇹" },
]

const TIME_OPTIONS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
].map((value) => {
  const [h, m] = value.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { value, label: `${display}:${String(m).padStart(2, "0")} ${period}` }
})

const RETRY_OPTIONS = [
  { value: 1, label: "1 attempt" },
  { value: 2, label: "2 attempts" },
  { value: 3, label: "3 attempts" },
  { value: 5, label: "5 attempts" },
  { value: 7, label: "7 attempts" },
]

type AgentDef = {
  id: string
  label: string
  description: string
  icon: Icon
  /** Categorical chart token (e.g. "--chart-4"). Used for tinted icon tile. */
  colorVar: string
  status: "active" | "paused"
  runCount: number | null
  runUnit: "sessions" | "calls"
  defaultIdentity: { name: string; voice: "female" | "male"; greeting: string }
  defaultPrompt: string
}

const AGENTS: AgentDef[] = [
  {
    id: "demand-letter",
    label: "Demand Letter",
    description:
      "Generates demand letters with med-chron, multiplier calculation, and firm-specific formatting",
    icon: Sparkle,
    colorVar: "--chart-4",
    status: "active",
    runCount: 47,
    runUnit: "sessions",
    defaultIdentity: {
      name: "Morgan",
      voice: "female",
      greeting:
        "Hi, this is Morgan from Veritec Law calling regarding the demand letter for {{client_name}}'s case. Do you have a moment to discuss?",
    },
    defaultPrompt: `You are a legal demand letter drafting assistant for personal-injury cases.

Compose a complete demand letter using:
• The medical chronology and provider list
• The multiplier calculation and special damages summary
• The firm's letterhead, tone, and formatting conventions

Output a polished letter ready for attorney review.`,
  },
  {
    id: "medchron",
    label: "MedChron",
    description:
      "Builds medical chronology from uploaded records with provider timeline and gap detection",
    icon: Stack,
    colorVar: "--chart-1",
    status: "active",
    runCount: 38,
    runUnit: "sessions",
    defaultIdentity: {
      name: "Riley",
      voice: "female",
      greeting:
        "Hi, this is Riley from Veritec Law. I'm calling to request medical records for our client {{client_name}}. May I speak with the records department?",
    },
    defaultPrompt: `You analyze uploaded medical records to construct a chronological treatment timeline.

For each visit, extract:
• Date, provider, and facility
• Diagnoses and ICD codes
• Treatments rendered
• Gaps in care (>30 days between visits)

Flag inconsistencies and surface gaps for attorney review.`,
  },
  {
    id: "voice-intake",
    label: "Voice Intake",
    description:
      "24/7 inbound call handling with auto-extraction, conflict check, and SOL validation",
    icon: Phone,
    colorVar: "--chart-2",
    status: "active",
    runCount: 156,
    runUnit: "calls",
    defaultIdentity: {
      name: "Alex",
      voice: "female",
      greeting:
        "Hi, I'm Alex calling from VeriTec AI. I'm here to help walk you through your intake — this should only take a few minutes.",
    },
    defaultPrompt: `You are a warm, plainspoken intake specialist for Veritec Law.

Your goals on each call:
1. Qualify the lead (matter type, jurisdiction, basic facts)
2. Collect required intake fields
3. Run conflict check against the CRM database
4. Validate SOL for the matter type and incident date
5. Schedule a consult if cleared, otherwise route to attorney review`,
  },
  {
    id: "discovery-response",
    label: "Discovery Response",
    description:
      "Drafts interrogatory, RFA, and RFP responses with per-attorney objection KB",
    icon: PencilSimple,
    colorVar: "--chart-3",
    status: "active",
    runCount: 22,
    runUnit: "sessions",
    defaultIdentity: {
      name: "Jordan",
      voice: "male",
      greeting:
        "Hi, this is Jordan from Veritec Law calling about the discovery responses for case {{case_id}}. Is now a good time to walk through them?",
    },
    defaultPrompt: `You draft discovery responses (interrogatories, RFAs, RFPs).

Use:
• The case file context
• The assigned attorney's objection knowledge base
• Standard form language adapted to the specific request

Output numbered responses with objections preserved and substantive answers where appropriate.`,
  },
  {
    id: "depo-prep",
    label: "Depo Prep",
    description:
      "Analyzes case materials and generates deposition questions with source citations and reasoning",
    icon: Robot,
    colorVar: "--chart-7",
    status: "active",
    runCount: null,
    runUnit: "sessions",
    defaultIdentity: {
      name: "Casey",
      voice: "female",
      greeting:
        "Hi, this is Casey from Veritec Law calling to schedule a deposition for {{matter_name}}. I'd like to coordinate a time that works for you.",
    },
    defaultPrompt: `You generate deposition outlines for plaintiff and defense witnesses.

For each topic area, produce:
• A short list of pointed questions
• A specific record citation (Bates or page reference) supporting the line of questioning
• Brief reasoning for why the question matters

Organize by witness role and topic.`,
  },
  {
    id: "sol-monitor",
    label: "SOL Monitor",
    description:
      "Daily scan of all active cases. Alerts at 90, 60, 30, and 7 day thresholds.",
    icon: Lightning,
    colorVar: "--chart-5",
    status: "active",
    runCount: null,
    runUnit: "sessions",
    defaultIdentity: {
      name: "Sam",
      voice: "male",
      greeting:
        "Hi, this is Sam from Veritec Law calling about case {{case_id}}. We're approaching an important deadline and wanted to give you advance notice.",
    },
    defaultPrompt: `You scan all active matters once daily and surface SOL alerts.

Thresholds: 90 days, 60 days, 30 days, 7 days from the statute date.
Group alerts by responsible attorney. Include matter ID, statute date, and days remaining.
Escalate any 7-day alerts immediately.`,
  },
]

const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]))

type ContactMethod = "phone" | "email" | "sms"
type WorkflowTrigger = "webhook" | "scheduled" | "manual" | "form"
type WorkflowStatus = "active" | "paused"

type WorkflowFieldType =
  | "phone"
  | "text"
  | "long_text"
  | "email"
  | "knowledge_base"
  | "dataset"
  | "number"
  | "date"
  | "boolean"

type WorkflowReturnType =
  | "text"
  | "select"
  | "date"
  | "boolean"
  | "long_text"
  | "number"

type WorkflowStepType =
  | "outbound_voice"
  | "prompt"
  | "fetch"
  | "format"
  | "send_email"
  | "send_sms"
  | "human_review"
  | "integration"

type ReviewerChannel = "email" | "sms" | "phone"

type IntegrationDestination = "dropbox" | "counsel_link" | "filevine"

type WorkflowInput = {
  id: string
  label: string
  key: string
  type: WorkflowFieldType
  required: boolean
}

type WorkflowReturn = {
  id: string
  label: string
  type: WorkflowReturnType
}

type WorkflowStep = {
  id: string
  type: WorkflowStepType
  name: string
  /** Used by outbound_voice, prompt (AI Action), and send_sms — picks
   * which agent (from the Agents page) executes the step. */
  agentId?: string
  prompt?: string
  url?: string
  method?: "GET" | "POST" | "PUT"
  auth?: "none" | "bearer" | "api_key"
  template?: string
  to?: string
  subject?: string
  body?: string
  message?: string
  reviewerId?: string
  reviewerChannel?: ReviewerChannel
  reviewNote?: string
  destination?: IntegrationDestination
  fieldIds?: string[]
  returns: WorkflowReturn[]
}

type Workflow = {
  id: string
  name: string
  status: WorkflowStatus
  contactMethod: ContactMethod
  trigger: WorkflowTrigger
  inputs: WorkflowInput[]
  steps: WorkflowStep[]
}

const WORKFLOW_STEP_META: Record<
  WorkflowStepType,
  { label: string; colorVar: string; icon: Icon }
> = {
  outbound_voice: {
    label: "Outbound Voice",
    colorVar: "--chart-4",
    icon: Phone,
  },
  prompt: { label: "AI Action", colorVar: "--chart-1", icon: Sparkle },
  fetch: { label: "Fetch", colorVar: "--chart-8", icon: CloudArrowDown },
  format: { label: "Format", colorVar: "--chart-3", icon: Stack },
  send_email: { label: "Send Email", colorVar: "--chart-2", icon: Envelope },
  send_sms: { label: "Send SMS", colorVar: "--chart-5", icon: ChatCircle },
  human_review: {
    label: "Human Review",
    colorVar: "--chart-7",
    icon: UserCheck,
  },
  integration: { label: "Integration", colorVar: "--chart-6", icon: Plug },
}

type Reviewer = { id: string; name: string; role: string }

const REVIEWERS: Reviewer[] = [
  { id: "sarah-chen", name: "Sarah Chen", role: "Senior Paralegal" },
  { id: "james-rivera", name: "James Rivera", role: "Attorney" },
  { id: "vanessa-kim", name: "Vanessa Kim", role: "Attorney" },
  { id: "dylan-park", name: "Dylan Park", role: "Attorney" },
  { id: "bob-chen", name: "Bob Chen", role: "Paralegal" },
  { id: "sam-torres", name: "Sam Torres", role: "Intake Specialist" },
]

const REVIEWER_CHANNELS: {
  value: ReviewerChannel
  label: string
  icon: Icon
}[] = [
  { value: "email", label: "Email", icon: Envelope },
  { value: "sms", label: "Text", icon: ChatCircle },
  { value: "phone", label: "Phone call", icon: Phone },
]

const INTEGRATIONS: { value: IntegrationDestination; label: string }[] = [
  { value: "dropbox", label: "Dropbox" },
  { value: "counsel_link", label: "Counsel Link" },
  { value: "filevine", label: "FileVine" },
]

const WORKFLOW_FIELD_TYPE_LABEL: Record<WorkflowFieldType, string> = {
  phone: "PHONE",
  text: "SHORT TEXT",
  long_text: "LONG TEXT",
  email: "EMAIL",
  knowledge_base: "KNOWLEDGE BASE",
  dataset: "DATASET",
  number: "NUMBER",
  date: "DATE",
  boolean: "YES / NO",
}

const WORKFLOW_FIELD_TYPE_ICON: Partial<Record<WorkflowFieldType, Icon>> = {
  phone: Phone,
  email: Envelope,
  knowledge_base: Stack,
  dataset: Database,
  date: Calendar,
}

const WORKFLOW_RETURN_TYPE_LABEL: Record<WorkflowReturnType, string> = {
  text: "Text",
  select: "Select",
  date: "Date",
  boolean: "Bool",
  long_text: "Long",
  number: "Number",
}

const WORKFLOW_TRIGGER_OPTIONS: {
  value: WorkflowTrigger
  label: string
  icon: Icon
}[] = [
  { value: "webhook", label: "Webhook / API trigger", icon: Globe },
  { value: "scheduled", label: "On schedule", icon: Calendar },
  { value: "manual", label: "Manual / on demand", icon: Hand },
  { value: "form", label: "Form submission", icon: ChatCircle },
]

const WORKFLOW_TRIGGER_LABEL: Record<WorkflowTrigger, string> = {
  webhook: "Webhook",
  scheduled: "Scheduled",
  manual: "Manual",
  form: "Form",
}

const WORKFLOW_CONTACT_META: Record<
  ContactMethod,
  { label: string; colorVar: string; icon: Icon }
> = {
  phone: { label: "Outbound Voice", colorVar: "--chart-4", icon: Phone },
  email: { label: "Email", colorVar: "--chart-2", icon: Envelope },
  sms: { label: "SMS", colorVar: "--chart-1", icon: ChatCircle },
}

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "wf1",
    name: "Qualify & Book Consult",
    status: "active",
    contactMethod: "phone",
    trigger: "webhook",
    inputs: [
      {
        id: "i1",
        label: "Lead phone",
        key: "lead_phone",
        type: "phone",
        required: true,
      },
      {
        id: "i2",
        label: "Lead name",
        key: "lead_name",
        type: "text",
        required: true,
      },
      {
        id: "i3",
        label: "Form summary",
        key: "form_summary",
        type: "long_text",
        required: true,
      },
      {
        id: "i4",
        label: "Reference library",
        key: "ref_library",
        type: "knowledge_base",
        required: false,
      },
    ],
    steps: [
      {
        id: "s1",
        type: "outbound_voice",
        name: "Qualify and book consult",
        prompt:
          "You are a warm, plainspoken intake specialist for Veritec Law calling {{Lead name}} back about their inquiry. Your goal is to qualify the lead and book a consult if appropriate.",
        returns: [
          { id: "r1", label: "Caller name", type: "text" },
          { id: "r2", label: "Matter type", type: "select" },
          { id: "r3", label: "Incident date", type: "date" },
          { id: "r4", label: "Injury reported", type: "text" },
          { id: "r5", label: "Treatment started", type: "text" },
          { id: "r6", label: "Already represented", type: "boolean" },
          { id: "r7", label: "Consult booked", type: "boolean" },
          { id: "r8", label: "Outcome", type: "select" },
          { id: "r9", label: "Outcome reason", type: "text" },
        ],
      },
    ],
  },
  {
    id: "wf2",
    name: "Follow-up Reminder",
    status: "active",
    contactMethod: "sms",
    trigger: "scheduled",
    inputs: [
      {
        id: "i1",
        label: "Contact list",
        key: "contact_list",
        type: "dataset",
        required: true,
      },
    ],
    steps: [
      {
        id: "s1",
        type: "prompt",
        name: "Generate reminder",
        prompt:
          "Generate a brief, friendly follow-up message for {{Lead name}} who enquired about {{Matter type}}.",
        returns: [{ id: "r1", label: "Message text", type: "text" }],
      },
    ],
  },
  {
    id: "wf3",
    name: "Document Request",
    status: "paused",
    contactMethod: "email",
    trigger: "manual",
    inputs: [
      {
        id: "i1",
        label: "Client email",
        key: "client_email",
        type: "email",
        required: true,
      },
      {
        id: "i2",
        label: "Case notes",
        key: "case_notes",
        type: "long_text",
        required: false,
      },
    ],
    steps: [
      {
        id: "s1",
        type: "prompt",
        name: "Draft request email",
        prompt:
          "Draft a professional email requesting outstanding documents for a personal injury case.",
        returns: [
          { id: "r1", label: "Email subject", type: "text" },
          { id: "r2", label: "Email body", type: "long_text" },
        ],
      },
      {
        id: "s2",
        type: "send_email",
        name: "Send to client",
        to: "{{client_email}}",
        subject: "{{Email subject}}",
        body: "{{Email body}}",
        returns: [],
      },
    ],
  },
]

type RunStatus = "success" | "running" | "failed" | "queued"
type RunOutput =
  | { type: "doc"; name: string; meta?: [string, string][] }
  | { type: "metrics"; meta: [string, string][] }
  | { type: "progress"; text: string }
  | { type: "error"; text: string }

type AvatarColor =
  | "blue"
  | "green"
  | "amber"
  | "purple"
  | "rose"
  | "teal"
  | "zinc"

type Run = {
  id: string
  status: RunStatus
  case: string
  output: RunOutput
  started: string
  duration: string | null
  by: { name: string; color: AvatarColor }
}

const AGENT_RUNS: Record<string, Run[]> = {
  "demand-letter": [
    {
      id: "r1",
      status: "success",
      case: "CVSA-1189",
      output: {
        type: "doc",
        name: "Smith Demand Letter.docx",
        meta: [["Claim", "$2.4M"]],
      },
      started: "8m ago",
      duration: "42.1s",
      by: { name: "James Rivera", color: "purple" },
    },
    {
      id: "r2",
      status: "success",
      case: "2025CI01899",
      output: {
        type: "doc",
        name: "Park Demand Letter.docx",
        meta: [["Claim", "$3.8M"]],
      },
      started: "5h ago",
      duration: "38.7s",
      by: { name: "Dylan Park", color: "amber" },
    },
    {
      id: "r3",
      status: "success",
      case: "CVSA-0998",
      output: {
        type: "doc",
        name: "Lopez Demand Letter.docx",
        meta: [["Claim", "$1.6M"]],
      },
      started: "1d ago",
      duration: "29.4s",
      by: { name: "Vanessa Kim", color: "rose" },
    },
    {
      id: "r4",
      status: "running",
      case: "CVSA-1234",
      output: { type: "progress", text: "Drafting demand letter…" },
      started: "30s ago",
      duration: null,
      by: { name: "John Lawyer", color: "blue" },
    },
    {
      id: "r5",
      status: "failed",
      case: "CVSA-0542",
      output: { type: "error", text: "Multiplier calculation timed out" },
      started: "Yesterday",
      duration: "45.2s",
      by: { name: "Sam Torres", color: "rose" },
    },
  ],
  medchron: [
    {
      id: "r1",
      status: "running",
      case: "CVSA-1234",
      output: { type: "progress", text: "Analyzing 42 records…" },
      started: "12s ago",
      duration: null,
      by: { name: "John Lawyer", color: "blue" },
    },
    {
      id: "r2",
      status: "success",
      case: "CVSA-1189",
      output: {
        type: "metrics",
        meta: [
          ["Records", "47"],
          ["Gaps", "3"],
          ["Confidence", "94%"],
        ],
      },
      started: "4m ago",
      duration: "18.2s",
      by: { name: "James Rivera", color: "purple" },
    },
    {
      id: "r3",
      status: "success",
      case: "2025CI02115",
      output: {
        type: "metrics",
        meta: [
          ["Records", "31"],
          ["Gaps", "5"],
          ["Confidence", "87%"],
        ],
      },
      started: "1h ago",
      duration: "14.6s",
      by: { name: "Dylan Park", color: "amber" },
    },
    {
      id: "r4",
      status: "queued",
      case: "CVSA-1276",
      output: { type: "progress", text: "Waiting for records upload" },
      started: "4h ago",
      duration: null,
      by: { name: "James Rivera", color: "purple" },
    },
    {
      id: "r5",
      status: "failed",
      case: "CVSA-0542",
      output: { type: "error", text: "LLM timeout" },
      started: "Yesterday",
      duration: "30.0s",
      by: { name: "Sam Torres", color: "rose" },
    },
  ],
  "voice-intake": [
    {
      id: "r1",
      status: "running",
      case: "INBOUND",
      output: { type: "progress", text: "Caller on the line — qualifying…" },
      started: "45s ago",
      duration: null,
      by: { name: "Auto Inbound", color: "blue" },
    },
    {
      id: "r2",
      status: "success",
      case: "CVSA-1389",
      output: {
        type: "metrics",
        meta: [
          ["Transcript", "18 min"],
          ["Case created", "CVSA-1389"],
          ["Parties", "3 ID'd"],
        ],
      },
      started: "22m ago",
      duration: "3.2s",
      by: { name: "Sam Torres", color: "rose" },
    },
    {
      id: "r3",
      status: "success",
      case: "CVSA-1402",
      output: {
        type: "metrics",
        meta: [
          ["Disposition", "Qualified"],
          ["Consult", "Booked Mon 10am"],
        ],
      },
      started: "1h ago",
      duration: "2.9s",
      by: { name: "James Rivera", color: "purple" },
    },
    {
      id: "r4",
      status: "success",
      case: "CVSA-1399",
      output: {
        type: "metrics",
        meta: [
          ["Disposition", "SOL expired"],
          ["Routed", "Attorney review"],
        ],
      },
      started: "2h ago",
      duration: "2.1s",
      by: { name: "Vanessa Kim", color: "rose" },
    },
    {
      id: "r5",
      status: "failed",
      case: "CVSA-1395",
      output: { type: "error", text: "Caller disconnected before consent" },
      started: "3h ago",
      duration: "18.4s",
      by: { name: "Auto Inbound", color: "blue" },
    },
  ],
  "discovery-response": [
    {
      id: "r1",
      status: "success",
      case: "CVSA-0874",
      output: {
        type: "metrics",
        meta: [
          ["Responses", "28"],
          ["Objections", "6"],
          ["Produced", "22"],
        ],
      },
      started: "2h ago",
      duration: "17.8s",
      by: { name: "Bob Chen", color: "teal" },
    },
    {
      id: "r2",
      status: "success",
      case: "CVSA-0823",
      output: {
        type: "metrics",
        meta: [
          ["Responses", "41"],
          ["Objections", "12"],
          ["Produced", "29"],
        ],
      },
      started: "1d ago",
      duration: "24.1s",
      by: { name: "Vanessa Kim", color: "rose" },
    },
    {
      id: "r3",
      status: "running",
      case: "CVSA-0945",
      output: { type: "progress", text: "Drafting RFP responses…" },
      started: "1m ago",
      duration: null,
      by: { name: "James Rivera", color: "purple" },
    },
  ],
  "depo-prep": [
    {
      id: "r1",
      status: "success",
      case: "CVSA-1189",
      output: {
        type: "metrics",
        meta: [
          ["Deponent", "Cruz Lopez"],
          ["Questions", "127"],
          ["Contradictions", "4"],
        ],
      },
      started: "6m ago",
      duration: "34.8s",
      by: { name: "Vanessa Kim", color: "rose" },
    },
    {
      id: "r2",
      status: "success",
      case: "CVSA-0998",
      output: {
        type: "metrics",
        meta: [
          ["Deponent", "Dr. Patel"],
          ["Questions", "48"],
          ["Contradictions", "0"],
        ],
      },
      started: "1h ago",
      duration: "19.2s",
      by: { name: "Vanessa Kim", color: "rose" },
    },
    {
      id: "r3",
      status: "success",
      case: "2025CI03480",
      output: {
        type: "metrics",
        meta: [
          ["Deponent", "John Doe"],
          ["Questions", "89"],
          ["Contradictions", "2"],
        ],
      },
      started: "14m ago",
      duration: "18.1s",
      by: { name: "Bob Chen", color: "teal" },
    },
  ],
  "sol-monitor": [
    {
      id: "r1",
      status: "success",
      case: "DAILY SCAN",
      output: {
        type: "metrics",
        meta: [
          ["Scanned", "248"],
          ["Alerts", "4"],
          ["Critical", "2 at 7d"],
        ],
      },
      started: "6h ago",
      duration: "2m 14s",
      by: { name: "Auto Schedule", color: "zinc" },
    },
    {
      id: "r2",
      status: "success",
      case: "DAILY SCAN",
      output: {
        type: "metrics",
        meta: [
          ["Scanned", "246"],
          ["Alerts", "3"],
          ["Critical", "1 at 7d"],
        ],
      },
      started: "1d ago",
      duration: "2m 09s",
      by: { name: "Auto Schedule", color: "zinc" },
    },
    {
      id: "r3",
      status: "success",
      case: "DAILY SCAN",
      output: {
        type: "metrics",
        meta: [
          ["Scanned", "245"],
          ["Alerts", "5"],
          ["Critical", "2 at 7d"],
        ],
      },
      started: "2d ago",
      duration: "2m 11s",
      by: { name: "Auto Schedule", color: "zinc" },
    },
  ],
}

const AVATAR_COLOR_VAR: Record<AvatarColor, string | null> = {
  blue: "--chart-1",
  green: "--chart-2",
  amber: "--chart-3",
  purple: "--chart-4",
  rose: "--chart-5",
  teal: "--chart-8",
  zinc: null,
}

const TIME_RANGE_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
]

type FlagType =
  | "contradiction"
  | "discrepancy"
  | "liability"
  | "medical"
  | "evidence"
  | "damages"
  | "standard"

const FLAG_STYLE: Record<
  FlagType,
  { label: string; icon: Icon; colorVar: string | null }
> = {
  contradiction: {
    label: "Contradiction",
    icon: Warning,
    colorVar: "--chart-5",
  },
  discrepancy: { label: "Discrepancy", icon: Warning, colorVar: "--chart-3" },
  liability: { label: "Liability", icon: Scales, colorVar: "--chart-1" },
  medical: { label: "Medical", icon: Heart, colorVar: "--chart-8" },
  evidence: { label: "Evidence", icon: Sparkle, colorVar: "--chart-4" },
  damages: { label: "Damages", icon: Stack, colorVar: "--chart-2" },
  standard: { label: "Standard", icon: Bookmark, colorVar: null },
}

type RunOutputItem = {
  label: string
  value: string
  phi?: boolean
  confidence?: number | null
}

type RunInput = {
  label: string
  value: string
  icon: Icon
}

type RunStep = {
  label: string
  duration: string
  status: "success" | "failed"
}

type RunQuestion = { n: number; text: string; flag: FlagType }

type TranscriptExchange = {
  n: number
  timestamp: string
  question: string
  answer: string
  capturedLabel: string
  capturedValue: string
  phi?: boolean
}

type RunDetail = {
  runId: string
  outputs: RunOutputItem[]
  questions?: RunQuestion[]
  transcript?: { totalDuration: string; exchanges: TranscriptExchange[] }
  inputs: RunInput[]
  steps: RunStep[]
}

const STEPS_BY_AGENT: Record<string, RunStep[]> = {
  "demand-letter": [
    {
      label: "Load case + medical chronology",
      duration: "2.4s",
      status: "success",
    },
    {
      label: "Calculate multiplier & damages",
      duration: "4.1s",
      status: "success",
    },
    { label: "Draft demand letter", duration: "31.6s", status: "success" },
    { label: "Apply firm formatting", duration: "4.0s", status: "success" },
  ],
  medchron: [
    { label: "Parse uploaded records", duration: "3.2s", status: "success" },
    { label: "Build provider timeline", duration: "8.4s", status: "success" },
    { label: "Detect treatment gaps", duration: "6.6s", status: "success" },
  ],
  "voice-intake": [
    { label: "Stream caller audio", duration: "1.0s", status: "success" },
    { label: "Transcribe + extract", duration: "1.2s", status: "success" },
    { label: "CRM conflict + SOL check", duration: "1.0s", status: "success" },
  ],
  "discovery-response": [
    { label: "Load case file", duration: "2.1s", status: "success" },
    {
      label: "Match attorney objection KB",
      duration: "4.6s",
      status: "success",
    },
    { label: "Draft responses", duration: "11.1s", status: "success" },
  ],
  "depo-prep": [
    { label: "Load case context", duration: "1.2s", status: "success" },
    { label: "Retrieve depo samples", duration: "0.8s", status: "success" },
    {
      label: "Find weaknesses & generate questions",
      duration: "16.2s",
      status: "success",
    },
  ],
  "sol-monitor": [
    { label: "Pull active matter list", duration: "18.2s", status: "success" },
    { label: "Compute days to SOL", duration: "42.0s", status: "success" },
    {
      label: "Trigger alerts + email recap",
      duration: "1m 14s",
      status: "success",
    },
  ],
}

const DEPO_PREP_QUESTIONS: RunQuestion[] = [
  {
    n: 1,
    text: "Ms. Lopez, when you spoke to Officer Martinez at the scene, do you recall telling him you were looking for your phone?",
    flag: "contradiction",
  },
  {
    n: 2,
    text: "In your interrogatory responses, you stated you were not using your phone at the time of impact. Is that accurate?",
    flag: "contradiction",
  },
  {
    n: 3,
    text: "Can you explain the difference between what you told the officer and what you stated in your interrogatories?",
    flag: "contradiction",
  },
  {
    n: 4,
    text: "At approximately what speed were you traveling just before the collision?",
    flag: "discrepancy",
  },
  {
    n: 5,
    text: "Were you cited at the scene? And do you know what the citation was for?",
    flag: "liability",
  },
  {
    n: 6,
    text: "When did you first seek medical treatment after the accident?",
    flag: "medical",
  },
  {
    n: 7,
    text: "Why didn't you seek medical attention for four months after the accident?",
    flag: "medical",
  },
  {
    n: 8,
    text: "Did you take any photographs at the scene of the accident?",
    flag: "evidence",
  },
  {
    n: 9,
    text: "Ms. Lopez, what is your educational background?",
    flag: "standard",
  },
  {
    n: 10,
    text: "Have you ever been involved in any other motor vehicle accidents?",
    flag: "standard",
  },
  {
    n: 11,
    text: "Have you ever been convicted of a crime?",
    flag: "standard",
  },
  {
    n: 12,
    text: "Is the $45,000 future medical cost estimate based on you returning to full-time work?",
    flag: "damages",
  },
]

function getRunDetail(run: Run, agentId: string): RunDetail {
  const runId = `run_${`${run.id}XXXXX`.slice(1, 6).toUpperCase()}`

  if (agentId === "depo-prep" && run.case === "CVSA-1189") {
    return {
      runId,
      outputs: [
        {
          label: "Deponent name",
          value: "Maria Lopez",
          phi: true,
          confidence: 100,
        },
        { label: "Deponent type", value: "Plaintiff", confidence: 100 },
        { label: "Question count", value: "127", confidence: null },
      ],
      questions: DEPO_PREP_QUESTIONS,
      transcript: generateTranscriptFromRun(run, agentId),
      inputs: [
        { label: "Case", value: run.case, icon: FileText },
        {
          label: "Deposition samples",
          value: "Plaintiff Depositions (23 files)",
          icon: Stack,
        },
        { label: "Deponent type", value: "Plaintiff", icon: Users },
      ],
      steps: STEPS_BY_AGENT["depo-prep"] ?? [],
    }
  }

  if (agentId === "voice-intake" && run.case === "CVSA-1389") {
    const exchanges: TranscriptExchange[] = [
      {
        n: 1,
        timestamp: "00:08",
        question:
          "Hi, this is Alex from Veritec Law. Am I speaking with Maria Lopez?",
        answer: "Yes, this is Maria.",
        capturedLabel: "Client reached",
        capturedValue: "Yes",
      },
      {
        n: 2,
        timestamp: "00:18",
        question: "Could you confirm your full name for the file?",
        answer: "Maria Elena Lopez.",
        capturedLabel: "Caller name",
        capturedValue: "Maria Lopez",
        phi: true,
      },
      {
        n: 3,
        timestamp: "00:34",
        question: "What happened — can you walk me through it?",
        answer:
          "I was rear-ended on the 101 about a month ago. The other driver was on his phone.",
        capturedLabel: "Matter type",
        capturedValue: "Motor vehicle accident",
      },
      {
        n: 4,
        timestamp: "00:48",
        question: "Do you remember the exact date?",
        answer: "March 12th. I won't forget it.",
        capturedLabel: "Incident date",
        capturedValue: "March 12, 2025",
      },
      {
        n: 5,
        timestamp: "01:12",
        question: "Were you injured in the accident?",
        answer:
          "My neck and my left shoulder. The shoulder is the worst — I can barely lift my arm.",
        capturedLabel: "Injury reported",
        capturedValue: "Whiplash, left shoulder pain",
        phi: true,
      },
      {
        n: 6,
        timestamp: "01:34",
        question: "Have you been treated by a doctor?",
        answer:
          "Yes, I've been seeing Dr. Han at SF Sports Medicine, twice a week.",
        capturedLabel: "Provider",
        capturedValue: "Dr. Han — SF Sports Medicine",
        phi: true,
      },
      {
        n: 7,
        timestamp: "01:42",
        question: "How often are you going in?",
        answer: "Tuesdays and Thursdays. Started the week after the accident.",
        capturedLabel: "Treatment cadence",
        capturedValue: "Tue + Thu, weekly",
        phi: true,
      },
      {
        n: 8,
        timestamp: "02:04",
        question: "How is it feeling now?",
        answer:
          "Better than it was, but my range of motion isn't what it used to be. Dr. Han says it'll take a while.",
        capturedLabel: "Symptom trajectory",
        capturedValue: "Improving slowly; ROM still limited",
        phi: true,
      },
      {
        n: 9,
        timestamp: "02:48",
        question: "Are you working with any other attorney on this?",
        answer: "No — you're the first firm I've called.",
        capturedLabel: "Already represented",
        capturedValue: "No",
      },
      {
        n: 10,
        timestamp: "14:22",
        question:
          "I have Monday at 10am or Tuesday at 2pm. Which works for you?",
        answer: "Monday at 10 is great.",
        capturedLabel: "Consult booked",
        capturedValue: "Mon Apr 14 at 10:00 AM",
      },
    ]
    return {
      runId,
      outputs: [
        { label: "Disposition", value: "Qualified", confidence: 98 },
        {
          label: "Consult booked",
          value: "Mon Apr 14 · 10:00 AM",
          confidence: 100,
        },
        {
          label: "Matter type",
          value: "Motor vehicle accident",
          confidence: 96,
        },
      ],
      transcript: { totalDuration: "18 min", exchanges },
      inputs: [
        { label: "Case", value: run.case, icon: FileText },
        { label: "Caller phone", value: "+1 (424) 555-0100", icon: Phone },
        { label: "Call duration", value: "18 min", icon: ArrowsClockwise },
      ],
      steps: STEPS_BY_AGENT["voice-intake"] ?? [],
    }
  }

  const outputs: RunOutputItem[] =
    run.output.type === "metrics"
      ? run.output.meta.map(([k, v]) => ({ label: k, value: v }))
      : run.output.type === "doc"
        ? [
            { label: "Document", value: run.output.name },
            ...(run.output.meta?.map(([k, v]) => ({ label: k, value: v })) ??
              []),
          ]
        : []

  return {
    runId,
    outputs,
    transcript:
      run.status === "success"
        ? generateTranscriptFromRun(run, agentId)
        : undefined,
    inputs: [{ label: "Case", value: run.case, icon: FileText }],
    steps: STEPS_BY_AGENT[agentId] ?? [
      {
        label: "Run agent",
        duration: run.duration ?? "—",
        status: run.status === "failed" ? "failed" : "success",
      },
    ],
  }
}

const AGENT_PROMPT_PREFIX: Record<string, string> = {
  "demand-letter": "Pull",
  medchron: "Check",
  "voice-intake": "Tell me about",
  "discovery-response": "Pull",
  "depo-prep": "Confirm",
  "sol-monitor": "Report",
}

function generateTranscriptFromRun(
  run: Run,
  agentId: string,
): { totalDuration: string; exchanges: TranscriptExchange[] } | undefined {
  const pairs: [string, string][] =
    run.output.type === "metrics"
      ? run.output.meta
      : run.output.type === "doc"
        ? [["Deliverable", run.output.name], ...(run.output.meta ?? [])]
        : []
  if (pairs.length === 0) return undefined

  const verb = AGENT_PROMPT_PREFIX[agentId] ?? "Capture"
  const exchanges: TranscriptExchange[] = pairs.map(([k, v], i) => ({
    n: i + 1,
    timestamp: secondsToTimestamp(15 + i * 35),
    question: `${verb} the ${k.toLowerCase()}.`,
    answer: `${v}.`,
    capturedLabel: k,
    capturedValue: v,
  }))

  const lastSeconds = 15 + (pairs.length - 1) * 35 + 30
  const minutes = Math.max(1, Math.round(lastSeconds / 60))
  return {
    totalDuration: `${minutes} min`,
    exchanges,
  }
}

type NavItem = { id: string; label: string; icon: Icon }
type NavSection = { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Account",
    items: [{ id: "acct-general", label: "General", icon: Gear }],
  },
  {
    label: "Organisation",
    items: [
      { id: "org-general", label: "General", icon: Gear },
      { id: "team", label: "Team Members", icon: Users },
      { id: "fileflow", label: "FileFlow Inbox", icon: Tray },
      { id: "lithub", label: "Lithub", icon: Scales },
      { id: "api-keys", label: "API Keys", icon: Key },
      { id: "sharing", label: "Sharing", icon: ShareNetwork },
    ],
  },
  {
    label: "Agents",
    items: [
      { id: "voice-agent", label: "Voice", icon: Phone },
      { id: "ai-agents", label: "Agents", icon: Robot },
      { id: "agent-workflows", label: "Workflows", icon: Lightning },
    ],
  },
]

const NAV_ITEM_LABEL: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap((s) => s.items.map((i) => [i.id, i.label])),
)

type AppMode = "settings" | "app"
type AppNavId = "tasks" | "fileflow-app" | "cases" | "sessions"

export function App() {
  // Read initial route from URL hash (e.g. #/tasks, #/inbox, #/settings/voice-agent)
  const initial = parseHashRoute(
    typeof window !== "undefined" ? window.location.hash : "",
  )
  const [mode, setMode] = useState<AppMode>(initial.mode)
  const [active, setActive] = useState(initial.settingsId ?? "voice-agent")
  const [appActive, setAppActive] = useState<AppNavId>(
    initial.appId ?? "tasks",
  )

  // Keep URL hash in sync with current route
  useEffect(() => {
    const hash =
      mode === "settings" ? `#/settings/${active}` : `#/${appActive}`
    if (typeof window !== "undefined" && window.location.hash !== hash) {
      window.history.replaceState(null, "", hash)
    }
  }, [mode, active, appActive])

  // React to browser back/forward
  useEffect(() => {
    if (typeof window === "undefined") return
    const onChange = () => {
      const next = parseHashRoute(window.location.hash)
      setMode(next.mode)
      if (next.settingsId) setActive(next.settingsId)
      if (next.appId) setAppActive(next.appId)
    }
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null,
  )

  const handleNavChange = (id: string) => {
    setActive(id)
    setSelectedAgentId(null)
    setSelectedWorkflowId(null)
  }

  const isAgentsPage = active === "ai-agents"
  const isWorkflowsPage = active === "agent-workflows"
  const isSessionsPage = mode === "app" && appActive === "sessions"
  const containerWidth =
    isAgentsPage || isWorkflowsPage || isSessionsPage
      ? "max-w-[1600px]"
      : "max-w-3xl"

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId)

  return (
    <TooltipProvider>
      <div className="flex h-svh bg-background">
        {mode === "settings" ? (
          <SettingsSidebar
            active={active}
            onChange={handleNavChange}
            onBackToApp={() => setMode("app")}
          />
        ) : (
          <AppSidebar
            active={appActive}
            onChange={setAppActive}
            onOpenSettings={() => setMode("settings")}
          />
        )}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
          {mode === "app" && appActive === "fileflow-app" ? (
            <InboxPage />
          ) : mode === "app" && appActive === "tasks" ? (
            <TasksPage />
          ) : (
          <div className={cn("mx-auto h-full w-full overflow-auto px-6 py-8", containerWidth)}>
            {mode === "settings" && (
              <>
                {active === "voice-agent" && <VoicePage />}
                {isAgentsPage &&
                  (selectedAgentId ? (
                    <AgentDetailPage
                      agent={AGENT_BY_ID[selectedAgentId]}
                      onBack={() => setSelectedAgentId(null)}
                    />
                  ) : (
                    <AgentsListPage onSelect={setSelectedAgentId} />
                  ))}
                {isWorkflowsPage &&
                  (selectedWorkflow ? (
                    <WorkflowBuilder
                      workflow={selectedWorkflow}
                      onSave={(updated) =>
                        setWorkflows((curr) =>
                          curr.map((w) => (w.id === updated.id ? updated : w)),
                        )
                      }
                      onBack={() => setSelectedWorkflowId(null)}
                    />
                  ) : (
                    <WorkflowsListPage
                      workflows={workflows}
                      onSelect={setSelectedWorkflowId}
                      onCreate={() => {
                        const w: Workflow = {
                          id: `wf${Date.now()}`,
                          name: "Untitled Workflow",
                          status: "paused",
                          contactMethod: "phone",
                          trigger: "manual",
                          inputs: [],
                          steps: [],
                        }
                        setWorkflows((curr) => [...curr, w])
                        setSelectedWorkflowId(w.id)
                      }}
                    />
                  ))}
                {!isAgentsPage &&
                  !isWorkflowsPage &&
                  active !== "voice-agent" && (
                    <ComingSoonPage
                      label={NAV_ITEM_LABEL[active] ?? "Settings"}
                    />
                  )}
              </>
            )}

            {mode === "app" && (
              <>
                {appActive === "sessions" && <SessionsPage />}
                {appActive === "cases" && <ComingSoonPage label="Cases" />}
              </>
            )}
          </div>
          )}
        </main>
      </div>
      <Toaster richColors />
    </TooltipProvider>
  )
}

function SettingsSidebar({
  active,
  onChange,
  onBackToApp,
}: {
  active: string
  onChange: (id: string) => void
  onBackToApp: () => void
}) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-border border-r bg-background">
      <button
        type="button"
        onClick={onBackToApp}
        className="flex shrink-0 items-center gap-2 border-border/60 border-b px-4 py-4 text-left font-medium text-foreground text-sm transition-colors hover:bg-muted/40"
      >
        <CaretLeft className="size-4" />
        Back to app
      </button>
      <nav className="flex-1 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = item.id === active
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function ComingSoonPage({ label }: { label: string }) {
  return (
    <>
      <header className="mb-6">
        <h1 className="font-semibold text-2xl text-foreground">{label}</h1>
      </header>
      <div className="rounded-xl border border-border border-dashed bg-background p-12 text-center">
        <p className="text-muted-foreground text-sm">{label} — coming soon</p>
      </div>
    </>
  )
}

const APP_NAV: { id: AppNavId; label: string; icon: Icon }[] = [
  { id: "tasks", label: "Tasks", icon: Hand },
  { id: "fileflow-app", label: "Inbox", icon: Envelope },
  { id: "cases", label: "Cases", icon: Briefcase },
  { id: "sessions", label: "Sessions", icon: Lightning },
]

function AppSidebar({
  active,
  onChange,
  onOpenSettings,
}: {
  active: AppNavId
  onChange: (id: AppNavId) => void
  onOpenSettings: () => void
}) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-border border-r bg-background">
      <div className="border-border/60 border-b p-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-left transition-colors hover:bg-muted/40"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground text-xs">
            V
          </span>
          <span className="flex-1 truncate font-semibold text-foreground text-sm">
            Shawn Benny
          </span>
          <CaretDown className="size-4 text-muted-foreground" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-3">
        {APP_NAV.map((item) => {
          const Icon = item.icon
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-primary"
                  : "text-foreground hover:bg-muted/40",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="border-border/60 border-t p-3">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-muted-foreground text-sm transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Gear className="size-4" />
          Settings
        </button>
      </div>
    </aside>
  )
}

type SessionEntry = Run & { agentId: string; agentLabel: string }

function getAllSessions(): SessionEntry[] {
  const all: SessionEntry[] = []
  for (const agent of AGENTS) {
    const runs = AGENT_RUNS[agent.id] ?? []
    for (const run of runs) {
      all.push({ ...run, agentId: agent.id, agentLabel: agent.label })
    }
  }
  return all
}

type DateBucket = "24h" | "7d" | "30d" | "older"

function bucketStarted(started: string): DateBucket {
  const lower = started.toLowerCase().trim()
  if (
    lower.includes("s ago") ||
    lower.includes("m ago") ||
    lower.includes("h ago")
  ) {
    return "24h"
  }
  if (lower === "yesterday") return "7d"
  const dayMatch = lower.match(/^(\d+)d ago/)
  if (dayMatch) {
    const days = Number(dayMatch[1])
    if (days <= 7) return "7d"
    if (days <= 30) return "30d"
    return "older"
  }
  return "30d"
}

function sessionMatchesDateRange(started: string, range: string): boolean {
  if (range === "all") return true
  const bucket = bucketStarted(started)
  if (range === "24h") return bucket === "24h"
  if (range === "7d") return bucket === "24h" || bucket === "7d"
  if (range === "30d") return bucket !== "older"
  return true
}

function SessionsPage() {
  const [search, setSearch] = useState("")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [caseFilter, setCaseFilter] = useState<string>("all")
  const [triggeredByFilter, setTriggeredByFilter] = useState<string>("all")
  const [selectedSession, setSelectedSession] = useState<{
    agentId: string
    runId: string
  } | null>(null)

  const sessions = getAllSessions()
  const uniqueCases = Array.from(new Set(sessions.map((s) => s.case))).sort()
  const uniqueTriggers = Array.from(
    new Set(sessions.map((s) => s.by.name)),
  ).sort()

  if (selectedSession) {
    const run = (AGENT_RUNS[selectedSession.agentId] ?? []).find(
      (r) => r.id === selectedSession.runId,
    )
    if (run) {
      return (
        <RunDetailPage
          run={run}
          agentId={selectedSession.agentId}
          onBack={() => setSelectedSession(null)}
        />
      )
    }
  }

  const filtered = sessions.filter((s) => {
    if (agentFilter !== "all" && s.agentId !== agentFilter) return false
    if (caseFilter !== "all" && s.case !== caseFilter) return false
    if (triggeredByFilter !== "all" && s.by.name !== triggeredByFilter)
      return false
    if (!sessionMatchesDateRange(s.started, dateFilter)) return false
    if (
      search &&
      !s.case.toLowerCase().includes(search.toLowerCase()) &&
      !s.agentLabel.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const activeFilterCount =
    (agentFilter !== "all" ? 1 : 0) +
    (caseFilter !== "all" ? 1 : 0) +
    (triggeredByFilter !== "all" ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0)

  const clearFilters = () => {
    setAgentFilter("all")
    setCaseFilter("all")
    setTriggeredByFilter("all")
    setDateFilter("all")
  }

  return (
    <>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl text-foreground">Sessions</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Every run from every agent — search, filter, and dive in.
          </p>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <DebouncedSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by case or agent…"
        />
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any date</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {AGENTS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Any case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any case</SelectItem>
            {uniqueCases.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={triggeredByFilter} onValueChange={setTriggeredByFilter}>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Anyone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Triggered by anyone</SelectItem>
            {uniqueTriggers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters ({activeFilterCount})
          </Button>
        )}
      </div>

      <TableContainer className="bg-background">
        <TableScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Triggered by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmpty colSpan={7}>No sessions to show</TableEmpty>
              ) : (
                filtered.map((s) => (
                  <TableRow
                    key={`${s.agentId}-${s.id}`}
                    onClick={() =>
                      setSelectedSession({
                        agentId: s.agentId,
                        runId: s.id,
                      })
                    }
                    className="cursor-pointer"
                  >
                    <TableCell className="whitespace-nowrap">
                      <StatusPill status={s.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-foreground text-sm">
                      {s.agentLabel}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <CasePill caseId={s.case} />
                    </TableCell>
                    <TableCell className="min-w-[280px]">
                      <OutputCell run={s} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {s.started}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground text-xs tabular-nums">
                      {s.duration ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <TriggerAvatar name={s.by.name} color={s.by.color} />
                        <span className="text-foreground text-xs">
                          {s.by.name}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableScrollArea>
      </TableContainer>

      <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
        <span>
          Showing {filtered.length} of {sessions.length} session
          {sessions.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          Live · 10s auto-refresh
        </span>
      </div>
    </>
  )
}

function AgentIconTile({
  icon: IconComp,
  colorVar,
  size = "md",
}: {
  icon: Icon
  colorVar: string
  size?: "md" | "lg"
}) {
  const dimensions = size === "lg" ? "size-11" : "size-9"
  const iconSize = size === "lg" ? "size-5" : "size-4"
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border",
        dimensions,
      )}
      style={{
        backgroundColor: `color-mix(in oklch, var(${colorVar}) 12%, transparent)`,
        borderColor: `color-mix(in oklch, var(${colorVar}) 25%, transparent)`,
        color: `var(${colorVar})`,
      }}
    >
      <IconComp className={iconSize} weight="duotone" />
    </div>
  )
}

function AgentsListPage({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Agents</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl text-foreground">AI Agents</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Specialized agents that handle a single task
          </p>
        </div>
        <Button onClick={() => toast.message("New agent flow not implemented")}>
          <Plus />
          New agent
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onSelect(agent.id)}
          />
        ))}
      </div>
    </>
  )
}

function AgentCard({
  agent,
  onClick,
}: {
  agent: AgentDef
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-stretch rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <AgentIconTile icon={agent.icon} colorVar={agent.colorVar} />
      <h3 className="mt-3 font-semibold text-foreground text-sm group-hover:text-primary">
        {agent.label} Agent
      </h3>
      <p className="mt-1.5 mb-4 flex-1 text-muted-foreground text-xs leading-relaxed">
        {agent.description}
      </p>
      <div className="flex items-center gap-2">
        {agent.status === "active" ? (
          <Badge className="bg-success-muted text-success">Active</Badge>
        ) : (
          <Badge variant="outline">Paused</Badge>
        )}
        {agent.runCount != null && (
          <span className="text-muted-foreground text-xs">
            {agent.runCount} {agent.runUnit} this month
          </span>
        )}
      </div>
    </button>
  )
}

function AgentDetailPage({
  agent,
  onBack,
}: {
  agent: AgentDef
  onBack: () => void
}) {
  const [name, setName] = useState(agent.defaultIdentity.name)
  const [voice, setVoice] = useState(agent.defaultIdentity.voice)
  const [greeting, setGreeting] = useState(agent.defaultIdentity.greeting)
  const [prompt, setPrompt] = useState(agent.defaultPrompt)
  const [status, setStatus] = useState<"active" | "paused">(agent.status)
  const [tab, setTab] = useState("editor")

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Agents</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
      >
        <CaretLeft className="size-4" />
        All agents
      </button>

      <header className="mb-6 flex items-start gap-4">
        <AgentIconTile icon={agent.icon} colorVar={agent.colorVar} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl text-foreground">
            {agent.label} Agent
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {agent.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setStatus((s) => (s === "active" ? "paused" : "active"))
          }
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label={`Toggle status (currently ${status})`}
        >
          {status === "active" ? (
            <Badge className="bg-success-muted text-success">Active</Badge>
          ) : (
            <Badge variant="outline">Paused</Badge>
          )}
        </button>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="mb-6 gap-0">
        <TabsList variant="line" className="border-border border-b">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="sessions">
            Sessions
            <Badge variant="secondary" className="ml-1">
              {(AGENT_RUNS[agent.id] ?? []).length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "editor" ? (
        <div className="space-y-6">
          <SectionCard
            title="Agent Identity"
            description="How the agent introduces itself to callers"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="agent-name">Agent name</Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={agent.label}
                />
                <p className="text-muted-foreground text-xs">
                  The name the agent uses when greeting callers
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Default voice</Label>
                <Select
                  value={voice}
                  onValueChange={(v) => setVoice(v as "female" | "male")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Voice used for all languages unless overridden
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="greeting">Greeting script</Label>
              <Textarea
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                rows={3}
                placeholder={`Hi, I'm ${name || agent.label}…`}
              />
              <p className="text-muted-foreground text-xs">
                Use{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                  {"{{client_name}}"}
                </code>{" "}
                to personalise the greeting if the caller is already in your
                CRM.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="System Prompt"
            description="The instructions that define this agent's behaviour"
          >
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              placeholder="Describe what this agent should do…"
              className="font-mono text-xs"
            />
            <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
              <span>{prompt.length} characters</span>
              <button
                type="button"
                onClick={() => setPrompt(agent.defaultPrompt)}
                className="transition-colors hover:text-primary"
              >
                Reset to default
              </button>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button onClick={() => toast.success("Agent saved")}>
              <CheckCircleIcon />
              Save changes
            </Button>
          </div>
        </div>
      ) : (
        <RunsTab agentId={agent.id} />
      )}
    </>
  )
}

function StatusPill({ status }: { status: RunStatus }) {
  const config: Record<
    RunStatus,
    { className: string; dotClass: string; label: string }
  > = {
    success: {
      className: "bg-success-muted text-success",
      dotClass: "bg-success",
      label: "Success",
    },
    running: {
      className: "bg-accent text-primary",
      dotClass: "bg-primary animate-pulse",
      label: "Running",
    },
    failed: {
      className: "bg-danger-muted text-destructive",
      dotClass: "bg-destructive",
      label: "Failed",
    },
    queued: {
      className: "bg-muted text-muted-foreground",
      dotClass: "bg-muted-foreground/60",
      label: "Queued",
    },
  }
  const cfg = config[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium text-xs",
        cfg.className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", cfg.dotClass)} />
      {cfg.label}
    </span>
  )
}

function CasePill({ caseId }: { caseId: string }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-medium text-foreground text-xs">
      <FileText className="size-3 shrink-0 text-muted-foreground" />
      {caseId}
    </span>
  )
}

function TriggerAvatar({ name, color }: { name: string; color: AvatarColor }) {
  const initials = name
    .split(" ")
    .map((s) => s[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const colorVar = AVATAR_COLOR_VAR[color]
  const style = colorVar
    ? {
        backgroundColor: `color-mix(in oklch, var(${colorVar}) 18%, transparent)`,
        color: `var(${colorVar})`,
      }
    : undefined
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full font-semibold text-xs",
        !colorVar && "bg-muted text-muted-foreground",
      )}
      style={style}
    >
      {initials}
    </span>
  )
}

function MetaList({ meta }: { meta: [string, string][] }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      {meta.map(([k, v]) => (
        <span key={k} className="flex items-center gap-1">
          <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            {k}
          </span>
          <span className="font-semibold text-foreground text-xs">{v}</span>
        </span>
      ))}
    </div>
  )
}

function OutputCell({ run }: { run: Run }) {
  if (run.status === "running" && run.output.type === "progress") {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Progress
        </span>
        <span className="truncate text-foreground text-xs">
          {run.output.text}
        </span>
      </div>
    )
  }
  if (run.status === "queued" && run.output.type === "progress") {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Status
        </span>
        <span className="truncate text-muted-foreground text-xs">
          {run.output.text}
        </span>
      </div>
    )
  }
  if (run.status === "failed" && run.output.type === "error") {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 font-semibold text-destructive text-xs uppercase tracking-wider">
          Error
        </span>
        <span className="truncate text-destructive text-xs">
          {run.output.text}
        </span>
      </div>
    )
  }
  if (run.output.type === "doc") {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-success-muted px-1.5 py-0.5 font-medium text-success text-xs">
          <FileText className="size-3" />
          {run.output.name}
        </span>
        {run.output.meta && <MetaList meta={run.output.meta} />}
      </div>
    )
  }
  if (run.output.type === "metrics") {
    return <MetaList meta={run.output.meta} />
  }
  return null
}

function RunsTab({ agentId }: { agentId: string }) {
  const runs = AGENT_RUNS[agentId] ?? []
  const [search, setSearch] = useState("")
  const [range, setRange] = useState("24h")
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const selectedRun = runs.find((r) => r.id === selectedRunId)
  if (selectedRun) {
    return (
      <RunDetailPage
        run={selectedRun}
        agentId={agentId}
        onBack={() => setSelectedRunId(null)}
      />
    )
  }

  const filtered = runs.filter(
    (r) => !search || r.case.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <DebouncedSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by case, run ID…"
        />
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button
            size="sm"
            onClick={() => toast.message("New session triggered")}
          >
            <Plus />
            New session
          </Button>
        </div>
      </div>

      <TableContainer className="bg-background">
        <TableScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Triggered by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmpty colSpan={6}>No sessions to show</TableEmpty>
              ) : (
                filtered.map((run) => (
                  <TableRow
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="whitespace-nowrap">
                      <StatusPill status={run.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <CasePill caseId={run.case} />
                    </TableCell>
                    <TableCell className="min-w-[280px]">
                      <OutputCell run={run} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {run.started}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground text-xs tabular-nums">
                      {run.duration ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <TriggerAvatar
                          name={run.by.name}
                          color={run.by.color}
                        />
                        <span className="text-foreground text-xs">
                          {run.by.name}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableScrollArea>
      </TableContainer>

      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span>
          Showing {filtered.length} of {runs.length} session
          {runs.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          Live · 10s auto-refresh
        </span>
      </div>
    </div>
  )
}

function VoicePage() {
  const [inbound, setInbound] = useState<InboundPhone[]>([
    {
      id: "ib1",
      number: "+1 (424) 555-0100",
      label: "Primary intake line",
      status: "active",
      agentIds: ["voice-intake"],
      usage: { calls7d: 142, lastCall: "11 min ago" },
    },
  ])
  const [outbound, setOutbound] = useState<OutboundPhone[]>([
    {
      id: "ob1",
      number: "+1 (424) 555-0182",
      label: "Primary outbound line",
      status: "active",
      isDefault: true,
      maxRetries: 3,
      agentIds: ["medchron", "voice-intake"],
      usage: { calls7d: 87, lastCall: "2 h ago" },
    },
  ])
  const [callerId, setCallerId] = useState("VeriTec AI")
  const [callWindow, setCallWindow] = useState({ start: "08:00", end: "20:00" })
  const [callDays, setCallDays] = useState<WeekdaySet>({
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: false,
    sun: false,
  })
  const [autoDetect, setAutoDetect] = useState(false)
  const [languages, setLanguages] = useState<ActiveLanguage[]>([
    { id: "en", voice: "female", isPrimary: true },
  ])
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Voice</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-4 flex items-center gap-3">
        <h2 className="font-semibold text-base text-foreground">Voice</h2>
        <p className="text-muted-foreground text-xs">
          Phone numbers and language settings · shared across voice agents
        </p>
      </header>

      {/* Summary strip — total numbers, calls last 7d, default outbound */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-4">
        <SummaryStat
          label="Inbound numbers"
          value={String(inbound.length)}
          hint={`${inbound.filter((n) => n.status === "active").length} active`}
        />
        <SummaryStat
          label="Outbound numbers"
          value={String(outbound.length)}
          hint={`${outbound.filter((n) => n.status === "active").length} active`}
        />
        <SummaryStat
          label="Calls (last 7 d)"
          value={String(
            [...inbound, ...outbound].reduce(
              (sum, p) => sum + (p.usage?.calls7d ?? 0),
              0,
            ),
          )}
          hint="across all numbers"
        />
        <SummaryStat
          label="Default outbound"
          value={
            outbound.find((p) => p.isDefault)?.number.split(" ").slice(-2).join(" ") ??
            "—"
          }
          hint={callerId ? `as “${callerId}”` : "no caller ID"}
        />
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Inbound Numbers"
          description="Numbers clients dial to reach your AI agent"
        >
          <div className="space-y-2">
            {inbound.map((phone) => (
              <InboundPhoneRow
                key={phone.id}
                phone={phone}
                onSave={(p) =>
                  setInbound((curr) => curr.map((x) => (x.id === p.id ? p : x)))
                }
                onDelete={(id) =>
                  setInbound((curr) => curr.filter((x) => x.id !== id))
                }
              />
            ))}
            <AddPhoneRowButton
              onAdd={(number, label) =>
                setInbound((curr) => [
                  ...curr,
                  {
                    id: `ib${Date.now()}`,
                    number,
                    label: label || "Intake line",
                    status: "active",
                  },
                ])
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Outbound Numbers"
          description="Numbers the agent uses when calling clients"
        >
          <div className="space-y-2">
            {outbound.map((phone) => (
              <OutboundPhoneRow
                key={phone.id}
                phone={phone}
                onSave={(p) =>
                  setOutbound((curr) =>
                    curr.map((x) => (x.id === p.id ? p : x)),
                  )
                }
                onDelete={(id) =>
                  setOutbound((curr) => curr.filter((x) => x.id !== id))
                }
                onSetDefault={(id) =>
                  setOutbound((curr) =>
                    curr.map((x) => ({ ...x, isDefault: x.id === id })),
                  )
                }
              />
            ))}
            <AddPhoneRowButton
              onAdd={(number, label) =>
                setOutbound((curr) => [
                  ...curr,
                  {
                    id: `ob${Date.now()}`,
                    number,
                    label: label || "Outbound line",
                    status: "active",
                    isDefault: false,
                    maxRetries: 3,
                  },
                ])
              }
            />
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="mb-3 font-semibold text-foreground text-sm">
              Global outbound settings
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Caller ID + preview */}
              <div className="space-y-1.5">
                <Label htmlFor="caller-id">Caller ID display name</Label>
                <Input
                  id="caller-id"
                  value={callerId}
                  onChange={(e) => setCallerId(e.target.value)}
                  placeholder="Your firm name"
                />
                <p className="text-muted-foreground text-xs">
                  Shown on client phone screens when the agent calls
                </p>
                <CallerIdPreview
                  name={callerId}
                  number={
                    outbound.find((p) => p.isDefault)?.number ?? outbound[0]?.number ?? ""
                  }
                />
              </div>

              {/* Call window — start / end + weekday selector + timezone */}
              <div className="space-y-1.5">
                <Label>Call window</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={callWindow.start}
                    onValueChange={(v) =>
                      setCallWindow((c) => ({ ...c, start: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground text-sm">to</span>
                  <Select
                    value={callWindow.end}
                    onValueChange={(v) =>
                      setCallWindow((c) => ({ ...c, end: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <WeekdayPicker
                  value={callDays}
                  onChange={setCallDays}
                  className="pt-1"
                />
                <p className="text-muted-foreground text-xs">
                  Agent will only dial out in this window · Timezone:{" "}
                  <span className="font-medium text-foreground">
                    America/Los_Angeles
                  </span>
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Languages"
          description="Languages the agent can conduct intake calls in"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm">
                Auto-detect language
              </p>
              <p className="text-muted-foreground text-xs">
                Automatically switch to the caller's language if supported
              </p>
            </div>
            <ToggleSwitch
              id="auto-detect"
              label={autoDetect ? "On" : "Off"}
              checked={autoDetect}
              onChange={setAutoDetect}
            />
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="mb-3 font-semibold text-foreground text-sm">
              Active languages
            </h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <LanguageRow
                  key={lang.id}
                  lang={lang}
                  onChangeVoice={(voice) =>
                    setLanguages((curr) =>
                      curr.map((l) => (l.id === lang.id ? { ...l, voice } : l)),
                    )
                  }
                  onRemove={() =>
                    setLanguages((curr) => curr.filter((l) => l.id !== lang.id))
                  }
                />
              ))}
            </div>

            {showLanguagePicker ? (
              <LanguagePicker
                excluded={languages.map((l) => l.id)}
                onSelect={(id) => {
                  setLanguages((curr) => [
                    ...curr,
                    { id, voice: "female", isPrimary: false },
                  ])
                  setShowLanguagePicker(false)
                }}
                onCancel={() => setShowLanguagePicker(false)}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-primary"
                onClick={() => setShowLanguagePicker(true)}
              >
                <Plus />
                Add language
              </Button>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success("Voice settings saved")}>
          <CheckCircleIcon />
          Save changes
        </Button>
      </div>
    </>
  )
}

function SummaryStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 font-semibold text-foreground text-base tabular-nums">
        {value}
      </p>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

function RoutingLine({ agentIds }: { agentIds?: string[] }) {
  if (!agentIds || agentIds.length === 0) return null
  const labels = agentIds
    .map((id) => AGENTS.find((a) => a.id === id)?.label ?? id)
    .filter(Boolean)
  return (
    <p className="mt-1 flex flex-wrap items-center gap-1 text-muted-foreground text-xs">
      <span>Routes to</span>
      {labels.map((l) => (
        <Badge key={l} variant="outline" className="font-medium">
          {l}
        </Badge>
      ))}
    </p>
  )
}

function UsageStat({ usage }: { usage: PhoneUsage }) {
  return (
    <div className="hidden text-right sm:block">
      <p className="font-semibold text-foreground text-sm tabular-nums">
        {usage.calls7d.toLocaleString()}
      </p>
      <p className="text-muted-foreground text-xs">
        {usage.lastCall ? `last · ${usage.lastCall}` : "no calls yet"}
      </p>
      <p className="text-muted-foreground text-xs">7-day calls</p>
    </div>
  )
}

function CallerIdPreview({ name, number }: { name: string; number: string }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
        <PhoneIncoming className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground text-sm">
          {name || "Unknown caller"}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          {number || "—"} · Incoming call…
        </p>
      </div>
      <span className="text-muted-foreground text-xs">Recipient view</span>
    </div>
  )
}

const WEEKDAYS: Array<{ key: keyof WeekdaySet; label: string }> = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
]

function WeekdayPicker({
  value,
  onChange,
  className,
}: {
  value: WeekdaySet
  onChange: (v: WeekdaySet) => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {WEEKDAYS.map((d) => {
        const active = value[d.key]
        return (
          <button
            key={d.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...value, [d.key]: !active })}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md border text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {d.label}
          </button>
        )
      })}
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <header className="border-border/60 border-b bg-muted/40 px-4 py-3">
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
        <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

function PhoneIconBadge({ direction }: { direction: "in" | "out" }) {
  const Icon = direction === "in" ? PhoneIncoming : PhoneOutgoing
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="size-4" />
    </div>
  )
}

function StatusBadge({ status }: { status: "active" | "paused" }) {
  if (status === "active") {
    return <Badge className="bg-success-muted text-success">Active</Badge>
  }
  return <Badge variant="outline">Paused</Badge>
}

function InboundPhoneRow({
  phone,
  onSave,
  onDelete,
}: {
  phone: InboundPhone
  onSave: (phone: InboundPhone) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(phone)

  if (editing) {
    return (
      <div className="space-y-3 rounded-lg border border-primary/30 bg-accent/30 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <Input
              value={draft.number}
              onChange={(e) => setDraft({ ...draft, number: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. Primary intake line"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(phone)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(draft)
              setEditing(false)
            }}
          >
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <PhoneIconBadge direction="in" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-foreground text-sm">
            {phone.number}
          </p>
          <StatusBadge status={phone.status} />
        </div>
        <p className="truncate text-muted-foreground text-xs">{phone.label}</p>
        <RoutingLine agentIds={phone.agentIds} />
      </div>
      {phone.usage && <UsageStat usage={phone.usage} />}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit phone number"
          onClick={() => {
            setDraft(phone)
            setEditing(true)
          }}
        >
          <PencilSimple />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete phone number"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(phone.id)}
        >
          <TrashSimple />
        </Button>
      </div>
    </div>
  )
}

function OutboundPhoneRow({
  phone,
  onSave,
  onDelete,
  onSetDefault,
}: {
  phone: OutboundPhone
  onSave: (phone: OutboundPhone) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(phone)

  if (editing) {
    return (
      <div className="space-y-3 rounded-lg border border-primary/30 bg-accent/30 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Phone number</Label>
            <Input
              value={draft.number}
              onChange={(e) => setDraft({ ...draft, number: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. Primary outbound line"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Caller ID name</Label>
            <Input
              value={draft.callerId ?? ""}
              onChange={(e) => setDraft({ ...draft, callerId: e.target.value })}
              placeholder="Leave blank to use global"
            />
            <p className="text-muted-foreground text-xs">
              Overrides global caller ID for this number
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Max retries</Label>
            <Select
              value={String(draft.maxRetries)}
              onValueChange={(v) =>
                setDraft({ ...draft, maxRetries: Number(v) })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETRY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(phone)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(draft)
              setEditing(false)
            }}
          >
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <PhoneIconBadge direction="out" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground text-sm">
            {phone.number}
          </p>
          <StatusBadge status={phone.status} />
          {phone.isDefault && (
            <Badge variant="outline" className="font-medium">
              Default
            </Badge>
          )}
          <Badge variant="secondary" className="font-medium">
            {phone.maxRetries}× retry
          </Badge>
          {phone.callerId && (
            <Badge variant="outline" className="font-medium">
              Caller ID: {phone.callerId}
            </Badge>
          )}
        </div>
        <p className="truncate text-muted-foreground text-xs">{phone.label}</p>
        <RoutingLine agentIds={phone.agentIds} />
      </div>
      {phone.usage && <UsageStat usage={phone.usage} />}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {!phone.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetDefault(phone.id)}
          >
            Set default
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit phone number"
          onClick={() => {
            setDraft(phone)
            setEditing(true)
          }}
        >
          <PencilSimple />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete phone number"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(phone.id)}
        >
          <TrashSimple />
        </Button>
      </div>
    </div>
  )
}

function AddPhoneRowButton({
  onAdd,
}: {
  onAdd: (number: string, label: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [number, setNumber] = useState("")
  const [label, setLabel] = useState("")

  if (!open) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-primary"
        onClick={() => setOpen(true)}
      >
        <Plus />
        Add phone number
      </Button>
    )
  }

  const commit = () => {
    if (!number.trim()) return
    onAdd(number.trim(), label.trim())
    setNumber("")
    setLabel("")
    setOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 border-dashed bg-accent/30 p-2">
      <Input
        autoFocus
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="+1 (555) 000-0000"
        className="h-8 flex-1"
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label"
        className="h-8 flex-1"
        onKeyDown={(e) => e.key === "Enter" && commit()}
      />
      <Button size="sm" disabled={!number.trim()} onClick={commit}>
        Add
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Cancel"
        onClick={() => {
          setNumber("")
          setLabel("")
          setOpen(false)
        }}
      >
        <X />
      </Button>
    </div>
  )
}

function LanguageRow({
  lang,
  onChangeVoice,
  onRemove,
}: {
  lang: ActiveLanguage
  onChangeVoice: (voice: "female" | "male") => void
  onRemove: () => void
}) {
  const info = LANGUAGES.find((l) => l.id === lang.id)
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
      <span className="text-lg leading-none">{info?.flag}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground text-sm">
          {info?.label ?? lang.id}
        </p>
      </div>
      {lang.isPrimary && <Badge variant="outline">Primary</Badge>}
      <Select
        value={lang.voice}
        onValueChange={(v) => onChangeVoice(v as "female" | "male")}
      >
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="female">Female</SelectItem>
          <SelectItem value="male">Male</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Remove language"
        disabled={lang.isPrimary}
        className={cn(
          "text-muted-foreground hover:text-destructive",
          lang.isPrimary && "invisible",
        )}
        onClick={onRemove}
      >
        <TrashSimple />
      </Button>
    </div>
  )
}

function LanguagePicker({
  excluded,
  onSelect,
  onCancel,
}: {
  excluded: string[]
  onSelect: (id: string) => void
  onCancel: () => void
}) {
  const available = LANGUAGES.filter((l) => !excluded.includes(l.id))
  return (
    <div className="mt-3 rounded-lg border border-primary/30 border-dashed bg-accent/30 p-3">
      <p className="mb-2 font-medium text-foreground text-xs">
        Select a language to add
      </p>
      <div className="flex flex-wrap gap-1.5">
        {available.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelect(l.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground text-xs transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <span>{l.flag}</span>
            {l.label}
          </button>
        ))}
        {available.length === 0 && (
          <p className="text-muted-foreground text-xs">
            All supported languages are already active.
          </p>
        )}
      </div>
      <div className="mt-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X />
          Cancel
        </Button>
      </div>
    </div>
  )
}

function RunDetailPage({
  run,
  agentId,
  onBack,
}: {
  run: Run
  agentId: string
  onBack: () => void
}) {
  const detail = getRunDetail(run, agentId)
  const [flagFilter, setFlagFilter] = useState<FlagType | "all">("all")
  const [questionSearch, setQuestionSearch] = useState("")
  const [openExchangeIndex, setOpenExchangeIndex] = useState<number | null>(
    null,
  )
  const [showFullTranscript, setShowFullTranscript] = useState(false)

  const flagCounts: Partial<Record<FlagType, number>> = {}
  for (const q of detail.questions ?? []) {
    flagCounts[q.flag] = (flagCounts[q.flag] ?? 0) + 1
  }

  const filteredQuestions = (detail.questions ?? []).filter(
    (q) =>
      (flagFilter === "all" || q.flag === flagFilter) &&
      (!questionSearch ||
        q.text.toLowerCase().includes(questionSearch.toLowerCase())),
  )

  const handleOpenExchange = (exchangeIndex: number) => {
    setShowFullTranscript(false)
    setOpenExchangeIndex(exchangeIndex)
  }
  const handleOpenFullTranscript = () => {
    setShowFullTranscript(true)
    setOpenExchangeIndex(0)
  }
  const sheetOpen = openExchangeIndex !== null && detail.transcript != null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Back to sessions"
          onClick={onBack}
        >
          <CaretLeft />
        </Button>
        <code className="font-mono text-muted-foreground text-sm">
          {detail.runId}
        </code>
        <StatusPill status={run.status} />
        <div className="ml-auto flex items-center gap-2">
          {detail.transcript && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFullTranscript}
            >
              <Phone />
              Listen to call
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Copy />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <ArrowsClockwise />
            Re-run
          </Button>
          <Button variant="outline" size="sm">
            <DownloadSimple />
            Download
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <section>
            <h3 className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Outputs
              <span className="ml-1.5 font-normal normal-case tracking-normal text-muted-foreground/70">
                · extractions from this run
              </span>
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {detail.outputs.map((output) => (
                <OutputCard key={output.label} output={output} />
              ))}
            </div>
          </section>

          {detail.transcript && (
            <TranscriptCard
              transcript={detail.transcript}
              onSelectExchange={handleOpenExchange}
            />
          )}

          {detail.questions && (
            <QuestionsCard
              questions={detail.questions}
              filteredQuestions={filteredQuestions}
              flagCounts={flagCounts}
              flagFilter={flagFilter}
              onFlagFilterChange={setFlagFilter}
              questionSearch={questionSearch}
              onQuestionSearchChange={setQuestionSearch}
            />
          )}
        </div>

        <aside className="space-y-3 lg:w-80 lg:shrink-0">
          <RunInputsCard inputs={detail.inputs} />
          <RunTimelineCard run={run} />
          <RunExecutionLogCard steps={detail.steps} />
        </aside>
      </div>

      {detail.transcript && (
        <Sheet
          open={sheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              setOpenExchangeIndex(null)
              setShowFullTranscript(false)
            }
          }}
        >
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
          >
            <CallPlayerSheet
              transcript={detail.transcript}
              focusExchangeIndex={openExchangeIndex ?? 0}
              showFullTranscript={showFullTranscript}
              onToggleFull={() => setShowFullTranscript((v) => !v)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

function OutputCard({ output }: { output: RunOutputItem }) {
  const conf = output.confidence
  const confidenceTone =
    conf == null
      ? null
      : conf >= 90
        ? "bg-success-muted text-success"
        : conf >= 80
          ? "bg-warning-muted text-warning"
          : "bg-danger-muted text-destructive"
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          {output.label}
        </span>
        {output.phi && (
          <Badge className="bg-warning-muted text-warning">PHI</Badge>
        )}
        {confidenceTone != null && conf != null && (
          <Badge className={confidenceTone}>{conf}%</Badge>
        )}
      </div>
      <p className="font-semibold text-base text-foreground leading-tight">
        {output.value}
      </p>
    </div>
  )
}

function QuestionsCard({
  questions,
  filteredQuestions,
  flagCounts,
  flagFilter,
  onFlagFilterChange,
  questionSearch,
  onQuestionSearchChange,
}: {
  questions: RunQuestion[]
  filteredQuestions: RunQuestion[]
  flagCounts: Partial<Record<FlagType, number>>
  flagFilter: FlagType | "all"
  onFlagFilterChange: (f: FlagType | "all") => void
  questionSearch: string
  onQuestionSearchChange: (s: string) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <header className="flex flex-wrap items-start justify-between gap-3 border-border/60 border-b bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-md border"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--chart-4) 12%, transparent)",
              borderColor:
                "color-mix(in oklch, var(--chart-4) 25%, transparent)",
              color: "var(--chart-4)",
            }}
          >
            <Stack className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">
                Questions
              </h3>
              <Badge variant="outline">Records · 4 columns</Badge>
              <span className="text-muted-foreground text-xs">
                {questions.length} total · showing {filteredQuestions.length}
              </span>
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              One row per question — the core deliverable
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <DownloadSimple />
          CSV
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-border/60 border-b px-4 py-3">
        <DebouncedSearch
          value={questionSearch}
          onChange={onQuestionSearchChange}
          placeholder="Search questions…"
        />
        <FlagFilterButton
          active={flagFilter === "all"}
          onClick={() => onFlagFilterChange("all")}
          label="All"
          count={questions.length}
        />
        {(Object.keys(FLAG_STYLE) as FlagType[])
          .filter((f) => flagCounts[f])
          .map((f) => (
            <FlagFilterButton
              key={f}
              active={flagFilter === f}
              onClick={() => onFlagFilterChange(flagFilter === f ? "all" : f)}
              flag={f}
              label={FLAG_STYLE[f].label}
              count={flagCounts[f] ?? 0}
            />
          ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Question</TableHead>
            <TableHead className="w-36">Flag</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredQuestions.length === 0 ? (
            <TableEmpty colSpan={3}>No questions match the filter</TableEmpty>
          ) : (
            filteredQuestions.map((q) => (
              <TableRow key={q.n}>
                <TableCell className="text-muted-foreground text-xs tabular-nums">
                  {q.n}
                </TableCell>
                <TableCell className="whitespace-normal text-foreground text-sm leading-relaxed">
                  {q.text}
                </TableCell>
                <TableCell>
                  <FlagBadge flag={q.flag} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  )
}

function TranscriptCard({
  transcript,
  onSelectExchange,
}: {
  transcript: { totalDuration: string; exchanges: TranscriptExchange[] }
  onSelectExchange?: (index: number) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <header className="flex flex-wrap items-start justify-between gap-3 border-border/60 border-b bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex size-7 shrink-0 items-center justify-center rounded-md border"
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--chart-2) 12%, transparent)",
              borderColor:
                "color-mix(in oklch, var(--chart-2) 25%, transparent)",
              color: "var(--chart-2)",
            }}
          >
            <Phone className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground text-sm">
                Call transcript
              </h3>
              <Badge variant="outline">
                {transcript.exchanges.length} exchanges
              </Badge>
              <span className="text-muted-foreground text-xs">
                {transcript.totalDuration} call
              </span>
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Each row is a question the agent asked and the answer the caller
              gave — captured into structured fields
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <DownloadSimple />
          Transcript
        </Button>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Time</TableHead>
            <TableHead>Question &amp; answer</TableHead>
            <TableHead className="w-72 lg:w-80">Captured field</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transcript.exchanges.map((ex, i) => (
            <TableRow
              key={ex.n}
              className={cn("align-top", onSelectExchange && "cursor-pointer")}
              onClick={onSelectExchange ? () => onSelectExchange(i) : undefined}
            >
              <TableCell className="whitespace-nowrap pt-3 font-mono text-muted-foreground text-xs tabular-nums">
                {ex.timestamp}
              </TableCell>
              <TableCell className="whitespace-normal py-3">
                <div className="space-y-2">
                  <TranscriptLine speaker="agent" text={ex.question} />
                  <TranscriptLine speaker="caller" text={ex.answer} />
                </div>
              </TableCell>
              <TableCell className="whitespace-normal pt-3">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    {ex.capturedLabel}
                  </span>
                  {ex.phi && (
                    <Badge className="bg-warning-muted text-warning">PHI</Badge>
                  )}
                </div>
                <p className="font-semibold text-foreground text-sm leading-tight">
                  {ex.capturedValue}
                </p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

function TranscriptLine({
  speaker,
  text,
}: {
  speaker: "agent" | "caller"
  text: string
}) {
  const isAgent = speaker === "agent"
  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full font-semibold text-xs",
          isAgent ? "bg-accent text-primary" : "bg-success-muted text-success",
        )}
        aria-hidden
      >
        {isAgent ? "A" : "C"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          {isAgent ? "Agent" : "Caller"}
        </p>
        <p
          className={cn(
            "text-sm leading-relaxed",
            isAgent ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {isAgent ? text : `“${text}”`}
        </p>
      </div>
    </div>
  )
}

type Turn = {
  id: string
  timestamp: string
  seconds: number
  role: "agent" | "caller"
  text: string
}

function timestampToSeconds(ts: string): number {
  const [m, s] = ts.split(":").map(Number)
  return (m ?? 0) * 60 + (s ?? 0)
}

function secondsToTimestamp(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function buildTurnsFromTranscript(exchanges: TranscriptExchange[]): Turn[] {
  const turns: Turn[] = []
  for (let i = 0; i < exchanges.length; i++) {
    const ex = exchanges[i]
    const agentSeconds = timestampToSeconds(ex.timestamp)
    const callerSeconds = agentSeconds + 4
    turns.push({
      id: `turn-${i}-agent`,
      timestamp: ex.timestamp,
      seconds: agentSeconds,
      role: "agent",
      text: ex.question,
    })
    turns.push({
      id: `turn-${i}-caller`,
      timestamp: secondsToTimestamp(callerSeconds),
      seconds: callerSeconds,
      role: "caller",
      text: ex.answer,
    })
  }
  return turns
}

function CallPlayerSheet({
  transcript,
  focusExchangeIndex,
  showFullTranscript,
  onToggleFull,
}: {
  transcript: { totalDuration: string; exchanges: TranscriptExchange[] }
  focusExchangeIndex: number
  showFullTranscript: boolean
  onToggleFull: () => void
}) {
  const turns = buildTurnsFromTranscript(transcript.exchanges)
  const focusedExchange =
    transcript.exchanges[focusExchangeIndex] ?? transcript.exchanges[0]
  const focusedAgentTurnId = `turn-${focusExchangeIndex}-agent`
  const focusedCallerTurnId = `turn-${focusExchangeIndex}-caller`

  const [activeTurnId, setActiveTurnId] = useState<string>(focusedAgentTurnId)

  useEffect(() => {
    setActiveTurnId(focusedAgentTurnId)
  }, [focusedAgentTurnId])

  const visibleTurns = showFullTranscript
    ? turns
    : turns.filter(
        (t) => t.id === focusedAgentTurnId || t.id === focusedCallerTurnId,
      )

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<"1x" | "1.25x" | "1.5x" | "2x">("1x")

  const activeTurn =
    turns.find((t) => t.id === activeTurnId) ?? turns[0] ?? null
  const currentSeconds = activeTurn?.seconds ?? 0
  const totalSeconds = (() => {
    const last = turns[turns.length - 1]
    if (!last) return 0
    const tail = last.seconds + 30
    const match = transcript.totalDuration.match(/(\d+)\s*min/)
    const fromString = match ? Number(match[1]) * 60 : 0
    return Math.max(tail, fromString)
  })()
  const progress =
    totalSeconds > 0 ? Math.min(100, (currentSeconds / totalSeconds) * 100) : 0
  const totalLabel =
    totalSeconds > 0
      ? secondsToTimestamp(totalSeconds)
      : transcript.totalDuration

  const seekTo = (targetSeconds: number) => {
    if (turns.length === 0) return
    const clamped = Math.max(
      0,
      totalSeconds > 0 ? Math.min(targetSeconds, totalSeconds) : targetSeconds,
    )
    let nearest = turns[0]
    for (const t of turns) {
      if (t.seconds <= clamped) nearest = t
      else break
    }
    setActiveTurnId(nearest.id)
  }
  const seekBack30 = () => seekTo(currentSeconds - 30)
  const seekForward30 = () => seekTo(currentSeconds + 30)

  return (
    <>
      <SheetHeader className="gap-2 border-border border-b p-4">
        <SheetTitle className="font-semibold text-foreground text-sm">
          {showFullTranscript ? "Full call transcript" : "Listen to exchange"}
        </SheetTitle>
        {!showFullTranscript && focusedExchange && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {focusedExchange.capturedLabel}
            </span>
            {focusedExchange.phi && (
              <Badge className="bg-warning-muted text-warning">PHI</Badge>
            )}
            <span className="text-foreground text-sm">
              · {focusedExchange.capturedValue}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mt-1 self-start text-primary"
          onClick={onToggleFull}
        >
          {showFullTranscript
            ? "Focus on this exchange"
            : "View full transcript"}
        </Button>
      </SheetHeader>

      <ul className="flex-1 overflow-y-auto py-2">
        {visibleTurns.map((turn) => {
          const isActive = turn.id === activeTurnId
          const isFocused =
            !showFullTranscript &&
            (turn.id === focusedAgentTurnId || turn.id === focusedCallerTurnId)
          return (
            <li key={turn.id}>
              <button
                type="button"
                onClick={() => setActiveTurnId(turn.id)}
                className={cn(
                  "flex w-full items-start gap-4 px-4 py-3 text-left transition-colors",
                  isActive
                    ? "bg-accent"
                    : isFocused
                      ? "bg-muted/40"
                      : "hover:bg-muted/40",
                )}
              >
                <div className="w-12 shrink-0 pt-0.5">
                  <div className="font-mono text-muted-foreground text-xs tabular-nums">
                    {turn.timestamp}
                  </div>
                  <div
                    className={cn(
                      "mt-0.5 font-semibold text-xs uppercase tracking-wider",
                      turn.role === "agent" ? "text-primary" : "text-success",
                    )}
                  >
                    {turn.role}
                  </div>
                </div>
                <p
                  className={cn(
                    "flex-1 text-sm leading-relaxed",
                    turn.role === "caller"
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {turn.role === "caller" ? `“${turn.text}”` : turn.text}
                </p>
              </button>
            </li>
          )
        })}
      </ul>

      <footer className="space-y-3 border-border border-t bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            {secondsToTimestamp(currentSeconds)}
          </span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-muted-foreground text-xs tabular-nums">
            {totalLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
              {(["1x", "1.25x", "1.5x", "2x"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "rounded px-1.5 py-0.5 font-medium text-xs transition-colors",
                    speed === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Back 30 seconds"
              onClick={seekBack30}
              disabled={!activeTurn}
              className="gap-1"
            >
              <ArrowCounterClockwise />
              30
            </Button>
            <Button
              size="icon"
              variant="default"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Forward 30 seconds"
              onClick={seekForward30}
              disabled={!activeTurn}
              className="gap-1"
            >
              <ArrowClockwise />
              30
            </Button>
          </div>

          <div className="flex items-center justify-end gap-1">
            <Button size="icon-sm" variant="ghost" aria-label="Volume">
              <SpeakerHigh />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Download recording"
            >
              <DownloadSimple />
            </Button>
          </div>
        </div>
      </footer>
    </>
  )
}

function FlagBadge({ flag }: { flag: FlagType }) {
  const cfg = FLAG_STYLE[flag]
  const IconComp = cfg.icon
  if (!cfg.colorVar) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 font-medium text-muted-foreground text-xs">
        <IconComp className="size-3" />
        {cfg.label}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium text-xs"
      style={{
        backgroundColor: `color-mix(in oklch, var(${cfg.colorVar}) 12%, transparent)`,
        borderColor: `color-mix(in oklch, var(${cfg.colorVar}) 30%, transparent)`,
        color: `var(${cfg.colorVar})`,
      }}
    >
      <IconComp className="size-3" />
      {cfg.label}
    </span>
  )
}

function FlagFilterButton({
  active,
  onClick,
  flag,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  flag?: FlagType
  label: string
  count: number
}) {
  const cfg = flag ? FLAG_STYLE[flag] : null
  const IconComp = cfg?.icon
  const activeStyle =
    active && cfg?.colorVar
      ? {
          backgroundColor: `color-mix(in oklch, var(${cfg.colorVar}) 12%, transparent)`,
          borderColor: `color-mix(in oklch, var(${cfg.colorVar}) 30%, transparent)`,
          color: `var(${cfg.colorVar})`,
        }
      : undefined
  return (
    <button
      type="button"
      onClick={onClick}
      style={activeStyle}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-xs transition-colors",
        active && !cfg?.colorVar && "bg-accent text-primary",
        active && cfg && !cfg.colorVar && "bg-accent text-primary",
        !active &&
          "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {IconComp && <IconComp className="size-3" />}
      {label}
      <span className="opacity-60">{count}</span>
    </button>
  )
}

function RunInputsCard({ inputs }: { inputs: RunInput[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <header className="border-border/60 border-b bg-muted/40 px-4 py-3">
        <h3 className="font-semibold text-foreground text-sm">Inputs</h3>
        <p className="mt-0.5 text-muted-foreground text-xs">
          What was passed in
        </p>
      </header>
      <div className="space-y-3 px-4 py-3">
        {inputs.map((inp) => {
          const InpIcon = inp.icon
          return (
            <div key={inp.label}>
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                <InpIcon className="size-3.5" />
                {inp.label}
              </div>
              <p className="text-foreground text-sm">{inp.value}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function RunTimelineCard({ run }: { run: Run }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <header className="border-border/60 border-b bg-muted/40 px-4 py-3">
        <h3 className="font-semibold text-foreground text-sm">Timeline</h3>
      </header>
      <dl className="space-y-2 px-4 py-3 text-sm">
        <TimelineRow label="Started" value={<span>{run.started}</span>} />
        <TimelineRow
          label="Duration"
          value={<span className="tabular-nums">{run.duration ?? "—"}</span>}
        />
        <TimelineRow
          label="Triggered by"
          value={
            <div className="flex items-center gap-1.5">
              <TriggerAvatar name={run.by.name} color={run.by.color} />
              <span>{run.by.name}</span>
            </div>
          }
        />
        <TimelineRow label="Case" value={<CasePill caseId={run.case} />} />
      </dl>
    </section>
  )
}

function TimelineRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground text-xs">{value}</dd>
    </div>
  )
}

function RunExecutionLogCard({ steps }: { steps: RunStep[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <header className="border-border/60 border-b bg-muted/40 px-4 py-3">
        <h3 className="font-semibold text-foreground text-sm">Execution log</h3>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {steps.length} steps
        </p>
      </header>
      <ol className="space-y-2 px-4 py-3">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-start gap-2 text-sm">
            <span className="w-3 shrink-0 pt-0.5 text-right font-semibold text-muted-foreground text-xs tabular-nums">
              {i + 1}
            </span>
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                step.status === "failed"
                  ? "bg-danger-muted text-destructive"
                  : "bg-success-muted text-success",
              )}
            >
              {step.status === "failed" ? (
                <X className="size-2.5" weight="bold" />
              ) : (
                <Check className="size-2.5" weight="bold" />
              )}
            </span>
            <span className="flex-1 text-foreground text-xs leading-tight">
              {step.label}
            </span>
            <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
              {step.duration}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function tintedTileStyle(colorVar: string): React.CSSProperties {
  return {
    backgroundColor: `color-mix(in oklch, var(${colorVar}) 12%, transparent)`,
    borderColor: `color-mix(in oklch, var(${colorVar}) 25%, transparent)`,
    color: `var(${colorVar})`,
  }
}

function tintedChipStyle(colorVar: string): React.CSSProperties {
  return {
    backgroundColor: `color-mix(in oklch, var(${colorVar}) 12%, transparent)`,
    borderColor: `color-mix(in oklch, var(${colorVar}) 30%, transparent)`,
    color: `var(${colorVar})`,
  }
}

function WorkflowsListPage({
  workflows,
  onSelect,
  onCreate,
}: {
  workflows: Workflow[]
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Workflows</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl text-foreground">Workflows</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Automated agents that collect data and take action
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus />
          New workflow
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.map((w) => (
          <WorkflowCard
            key={w.id}
            workflow={w}
            onClick={() => onSelect(w.id)}
          />
        ))}
        <button
          type="button"
          onClick={onCreate}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-border border-dashed bg-background/50 p-5 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 hover:text-primary"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-muted">
            <Plus className="size-4" />
          </span>
          <span className="font-medium text-sm">New workflow</span>
        </button>
      </div>
    </>
  )
}

function WorkflowCard({
  workflow,
  onClick,
}: {
  workflow: Workflow
  onClick: () => void
}) {
  const contact = WORKFLOW_CONTACT_META[workflow.contactMethod]
  const ContactIcon = contact.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-stretch rounded-xl border border-border bg-background p-5 text-left transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
          style={tintedTileStyle(contact.colorVar)}
        >
          <ContactIcon className="size-4" weight="duotone" />
        </div>
        {workflow.status === "active" ? (
          <Badge className="bg-success-muted text-success">Active</Badge>
        ) : (
          <Badge variant="outline">Paused</Badge>
        )}
      </div>
      <h3 className="mb-2 font-semibold text-foreground text-sm group-hover:text-primary">
        {workflow.name}
      </h3>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium text-xs"
          style={tintedChipStyle(contact.colorVar)}
        >
          <ContactIcon className="size-3" />
          {contact.label}
        </span>
        <Badge variant="outline">
          {WORKFLOW_TRIGGER_LABEL[workflow.trigger]}
        </Badge>
      </div>
      <div className="mt-auto flex items-center gap-2 border-border/60 border-t pt-3 text-muted-foreground text-xs">
        <span>
          {workflow.inputs.length} input
          {workflow.inputs.length === 1 ? "" : "s"}
        </span>
        <span className="text-border">·</span>
        <span>
          {workflow.steps.length} step{workflow.steps.length === 1 ? "" : "s"}
        </span>
      </div>
    </button>
  )
}

function WorkflowBuilder({
  workflow,
  onSave,
  onBack,
}: {
  workflow: Workflow
  onSave: (w: Workflow) => void
  onBack: () => void
}) {
  const [draft, setDraft] = useState<Workflow>(workflow)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setDraft(workflow)
  }, [workflow])

  const handleSave = () => {
    onSave(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addStep = (type: WorkflowStepType) => {
    const meta = WORKFLOW_STEP_META[type]
    const base: WorkflowStep = {
      id: `s${Date.now()}`,
      type,
      name: meta.label,
      returns: [],
    }
    if (type === "outbound_voice" || type === "prompt") base.prompt = ""
    if (type === "fetch") {
      base.url = ""
      base.method = "GET"
      base.auth = "none"
    }
    if (type === "format") base.template = ""
    if (type === "send_email") {
      base.to = ""
      base.subject = ""
      base.body = ""
    }
    if (type === "send_sms") {
      base.to = ""
      base.message = ""
    }
    if (type === "human_review") {
      base.reviewerChannel = "email"
      base.reviewNote = ""
    }
    if (type === "integration") {
      base.destination = "dropbox"
      base.fieldIds = []
    }
    setDraft({ ...draft, steps: [...draft.steps, base] })
  }

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= draft.steps.length) return
    const next = [...draft.steps]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setDraft({ ...draft, steps: next })
  }

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Workflows</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <CaretLeft className="size-4" />
          All workflows
        </button>

        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="ml-2 rounded-md border border-transparent bg-transparent px-2 py-1 font-semibold text-foreground text-lg outline-none hover:border-border focus:border-border focus:bg-background"
        />

        <div className="ml-auto flex items-center gap-2">
          <ContactMethodSwitcher
            value={draft.contactMethod}
            onChange={(m) => setDraft({ ...draft, contactMethod: m })}
          />
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                status: draft.status === "active" ? "paused" : "active",
              })
            }
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {draft.status === "active" ? (
              <Badge className="bg-success-muted text-success">Active</Badge>
            ) : (
              <Badge variant="outline">Paused</Badge>
            )}
          </button>
          <Button
            onClick={handleSave}
            className={cn(saved && "bg-success hover:bg-success/90")}
          >
            {saved ? <Check /> : null}
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div
          className="px-6 py-8"
          style={{
            backgroundColor: "var(--muted)",
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklch, var(--border) 80%, transparent) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="mx-auto max-w-[600px] space-y-0">
            <TriggerNode workflow={draft} onUpdate={(w) => setDraft(w)} />
            <Connector />
            {draft.steps.map((step, i) => {
              const availableFields = draft.steps.slice(0, i).flatMap((prior) =>
                prior.returns.map((r) => ({
                  id: r.id,
                  label: r.label,
                  type: r.type,
                  sourceStep: prior.name,
                })),
              )
              return (
                <div key={step.id}>
                  <StepNode
                    step={step}
                    index={i}
                    total={draft.steps.length}
                    availableFields={availableFields}
                    onUpdate={(updated) =>
                      setDraft({
                        ...draft,
                        steps: draft.steps.map((s) =>
                          s.id === updated.id ? updated : s,
                        ),
                      })
                    }
                    onDelete={(id) =>
                      setDraft({
                        ...draft,
                        steps: draft.steps.filter((s) => s.id !== id),
                      })
                    }
                    onMove={moveStep}
                  />
                  <Connector />
                </div>
              )
            })}
            <AddStepRow onAdd={addStep} />
            <Connector />
            <EndNode />
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactMethodSwitcher({
  value,
  onChange,
}: {
  value: ContactMethod
  onChange: (m: ContactMethod) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
      {(["phone", "email", "sms"] as const).map((m) => {
        const meta = WORKFLOW_CONTACT_META[m]
        const MetaIcon = meta.icon
        const isActive = value === m
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            aria-label={meta.label}
            className={cn(
              "flex size-7 items-center justify-center rounded transition-colors",
              !isActive && "text-muted-foreground hover:text-foreground",
            )}
            style={isActive ? tintedChipStyle(meta.colorVar) : undefined}
          >
            <MetaIcon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

function Connector() {
  return (
    <div className="flex justify-center" aria-hidden>
      <div className="h-7 w-px bg-border" />
    </div>
  )
}

function EndNode() {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-muted-foreground text-xs">
        <span className="size-2 shrink-0 rounded-full bg-muted-foreground/50" />
        Ends — result is saved to the Sessions table
      </div>
    </div>
  )
}

function TriggerNode({
  workflow,
  onUpdate,
}: {
  workflow: Workflow
  onUpdate: (w: Workflow) => void
}) {
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [draftLabel, setDraftLabel] = useState("")
  const [draftType, setDraftType] = useState<WorkflowFieldType>("text")
  const [draftRequired, setDraftRequired] = useState(false)

  const inputs = workflow.inputs

  const addInput = () => {
    if (!draftLabel.trim()) return
    onUpdate({
      ...workflow,
      inputs: [
        ...inputs,
        {
          id: `i${Date.now()}`,
          label: draftLabel.trim(),
          key: draftLabel.trim().toLowerCase().replace(/\s+/g, "_"),
          type: draftType,
          required: draftRequired,
        },
      ],
    })
    setDraftLabel("")
    setDraftType("text")
    setDraftRequired(false)
    setAdding(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
            style={tintedTileStyle("--chart-1")}
          >
            <Database className="size-4" weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-sm">
              Inputs collected
            </p>
            <p className="text-muted-foreground text-xs">
              {inputs.length} field{inputs.length === 1 ? "" : "s"}
            </p>
          </div>
        </button>
        <Select
          value={workflow.trigger}
          onValueChange={(v) =>
            onUpdate({ ...workflow, trigger: v as WorkflowTrigger })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOW_TRIGGER_OPTIONS.map((t) => {
              const TIcon = t.icon
              return (
                <SelectItem key={t.value} value={t.value}>
                  <TIcon className="size-3.5" />
                  {t.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => setOpen(!open)}
        >
          {open ? <CaretUp /> : <CaretDown />}
        </Button>
      </div>

      {open && (
        <div className="border-border/60 border-t">
          {inputs.length > 0 && (
            <ul className="divide-y divide-border/60 px-4">
              {inputs.map((field) => {
                const FieldIcon = WORKFLOW_FIELD_TYPE_ICON[field.type] ?? null
                return (
                  <li key={field.id} className="flex items-center gap-2.5 py-2">
                    <span className="flex w-4 shrink-0 items-center justify-center text-muted-foreground">
                      {FieldIcon ? (
                        <FieldIcon className="size-3.5" />
                      ) : (
                        <span className="font-bold text-xs">T</span>
                      )}
                    </span>
                    <span className="flex-1 text-foreground text-sm">
                      {field.label}
                    </span>
                    {field.required && (
                      <Badge className="bg-danger-muted text-destructive">
                        Req
                      </Badge>
                    )}
                    <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {WORKFLOW_FIELD_TYPE_LABEL[field.type]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove input"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        onUpdate({
                          ...workflow,
                          inputs: inputs.filter((x) => x.id !== field.id),
                        })
                      }
                    >
                      <X />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}

          {adding ? (
            <div className="space-y-2 border-border/60 border-t bg-accent/30 px-4 py-3">
              <Input
                autoFocus
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Field label"
                className="h-8"
                onKeyDown={(e) => e.key === "Enter" && addInput()}
              />
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
                <Select
                  value={draftType}
                  onValueChange={(v) => setDraftType(v as WorkflowFieldType)}
                >
                  <SelectTrigger size="sm" className="w-full min-w-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(
                        WORKFLOW_FIELD_TYPE_LABEL,
                      ) as WorkflowFieldType[]
                    ).map((t) => (
                      <SelectItem key={t} value={t}>
                        {WORKFLOW_FIELD_TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label
                  htmlFor="trigger-input-required"
                  className="flex items-center gap-1.5 text-muted-foreground text-xs"
                >
                  <Checkbox
                    id="trigger-input-required"
                    checked={draftRequired}
                    onCheckedChange={(v) => setDraftRequired(v === true)}
                  />
                  Required
                </Label>
                <Button
                  size="sm"
                  disabled={!draftLabel.trim()}
                  onClick={addInput}
                >
                  Add
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Cancel"
                  onClick={() => setAdding(false)}
                >
                  <X />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-1.5 border-border/60 border-t py-2.5 text-muted-foreground text-xs transition-colors hover:bg-accent/40 hover:text-primary"
            >
              <Plus className="size-3.5" />
              Add input
            </button>
          )}
        </div>
      )}
    </div>
  )
}

type AvailableField = {
  id: string
  label: string
  type: WorkflowReturnType
  sourceStep: string
}

function StepNode({
  step,
  index,
  total,
  availableFields,
  onUpdate,
  onDelete,
  onMove,
}: {
  step: WorkflowStep
  index: number
  total: number
  availableFields: AvailableField[]
  onUpdate: (s: WorkflowStep) => void
  onDelete: (id: string) => void
  onMove: (from: number, to: number) => void
}) {
  const meta = WORKFLOW_STEP_META[step.type]
  const StepIcon = meta.icon
  const [open, setOpen] = useState(true)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
          style={tintedTileStyle(meta.colorVar)}
        >
          <StepIcon className="size-4" weight="duotone" />
        </div>
        <input
          value={step.name}
          onChange={(e) => onUpdate({ ...step, name: e.target.value })}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 font-semibold text-foreground text-sm outline-none hover:border-border focus:border-border focus:bg-muted/40"
        />
        <span
          className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium text-xs"
          style={tintedChipStyle(meta.colorVar)}
        >
          {meta.label}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Move up"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
          >
            <CaretUp />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Move down"
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
          >
            <CaretDown />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen(!open)}
          >
            {open ? <CaretUp /> : <CaretDown />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Delete step"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(step.id)}
          >
            <TrashSimple />
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-border/60 border-t px-4 py-3">
          <StepConfig
            step={step}
            availableFields={availableFields}
            onUpdate={onUpdate}
          />
          <StepReturns step={step} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  )
}

function AgentSelector({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (id: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
        Run as agent
      </p>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an agent…" />
        </SelectTrigger>
        <SelectContent>
          {AGENTS.map((agent) => {
            const AgentIcon = agent.icon
            return (
              <SelectItem key={agent.id} value={agent.id}>
                <AgentIcon className="size-3.5" />
                {agent.label} Agent
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-xs">
        The agent's identity and system prompt drive this step.
      </p>
    </div>
  )
}

function StepConfig({
  step,
  availableFields,
  onUpdate,
}: {
  step: WorkflowStep
  availableFields: AvailableField[]
  onUpdate: (s: WorkflowStep) => void
}) {
  if (step.type === "outbound_voice" || step.type === "prompt") {
    return (
      <div className="space-y-3">
        <AgentSelector
          value={step.agentId}
          onChange={(id) => onUpdate({ ...step, agentId: id })}
        />
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            {step.type === "outbound_voice" ? "System prompt" : "Instruction"}
          </p>
          <Textarea
            value={step.prompt ?? ""}
            onChange={(e) => onUpdate({ ...step, prompt: e.target.value })}
            rows={3}
            placeholder="Describe what this step should do…"
          />
        </div>
      </div>
    )
  }
  if (step.type === "fetch") {
    return (
      <div className="space-y-2">
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Endpoint
          </p>
          <Input
            value={step.url ?? ""}
            onChange={(e) => onUpdate({ ...step, url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Method
            </p>
            <Select
              value={step.method ?? "GET"}
              onValueChange={(v) =>
                onUpdate({ ...step, method: v as "GET" | "POST" | "PUT" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Auth
            </p>
            <Select
              value={step.auth ?? "none"}
              onValueChange={(v) =>
                onUpdate({
                  ...step,
                  auth: v as "none" | "bearer" | "api_key",
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer</SelectItem>
                <SelectItem value="api_key">API Key</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }
  if (step.type === "format") {
    return (
      <div className="space-y-1.5">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Output template
        </p>
        <Textarea
          value={step.template ?? ""}
          onChange={(e) => onUpdate({ ...step, template: e.target.value })}
          rows={3}
          placeholder="Use {{field_name}} to reference inputs and previous outputs…"
        />
      </div>
    )
  }
  if (step.type === "send_email") {
    return (
      <div className="space-y-2">
        <Input
          value={step.to ?? ""}
          onChange={(e) => onUpdate({ ...step, to: e.target.value })}
          placeholder="To: {{client_email}}"
        />
        <Input
          value={step.subject ?? ""}
          onChange={(e) => onUpdate({ ...step, subject: e.target.value })}
          placeholder="Subject…"
        />
        <Textarea
          value={step.body ?? ""}
          onChange={(e) => onUpdate({ ...step, body: e.target.value })}
          rows={3}
          placeholder="Body — use {{field}} for dynamic values"
        />
      </div>
    )
  }
  if (step.type === "send_sms") {
    return (
      <div className="space-y-3">
        <AgentSelector
          value={step.agentId}
          onChange={(id) => onUpdate({ ...step, agentId: id })}
        />
        <Input
          value={step.to ?? ""}
          onChange={(e) => onUpdate({ ...step, to: e.target.value })}
          placeholder="To: {{lead_phone}}"
        />
        <Textarea
          value={step.message ?? ""}
          onChange={(e) => onUpdate({ ...step, message: e.target.value })}
          rows={2}
          placeholder="Message (under 160 chars)"
        />
      </div>
    )
  }
  if (step.type === "human_review") {
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Reviewer
          </p>
          <Select
            value={step.reviewerId ?? ""}
            onValueChange={(v) => onUpdate({ ...step, reviewerId: v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a person to notify" />
            </SelectTrigger>
            <SelectContent>
              {REVIEWERS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <span className="font-medium text-foreground">{r.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {r.role}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Notify via
          </p>
          <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-0.5">
            {REVIEWER_CHANNELS.map((c) => {
              const ChannelIcon = c.icon
              const isActive = (step.reviewerChannel ?? "email") === c.value
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    onUpdate({ ...step, reviewerChannel: c.value })
                  }
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 font-medium text-xs transition-colors",
                    isActive
                      ? "border border-border bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ChannelIcon className="size-3.5" />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Note (optional)
          </p>
          <Textarea
            value={step.reviewNote ?? ""}
            onChange={(e) => onUpdate({ ...step, reviewNote: e.target.value })}
            rows={2}
            placeholder="Context for the reviewer — what to look for…"
          />
        </div>
      </div>
    )
  }
  if (step.type === "integration") {
    const selectedIds = step.fieldIds ?? []
    const toggleField = (id: string) => {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
      onUpdate({ ...step, fieldIds: next })
    }
    return (
      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Send to
          </p>
          <Select
            value={step.destination ?? "dropbox"}
            onValueChange={(v) =>
              onUpdate({
                ...step,
                destination: v as IntegrationDestination,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTEGRATIONS.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            Fields to send
          </p>
          {availableFields.length === 0 ? (
            <p className="rounded-md border border-border border-dashed bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
              No captured fields yet — add a step before this one that returns
              data.
            </p>
          ) : (
            <ul className="space-y-1">
              {availableFields.map((f) => {
                const checked = selectedIds.includes(f.id)
                return (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5"
                  >
                    <Checkbox
                      id={`int-${step.id}-${f.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleField(f.id)}
                    />
                    <Label
                      htmlFor={`int-${step.id}-${f.id}`}
                      className="flex flex-1 items-center gap-2 text-foreground text-sm"
                    >
                      <span>{f.label}</span>
                      <span className="font-mono text-muted-foreground text-xs">
                        · {WORKFLOW_RETURN_TYPE_LABEL[f.type]}
                      </span>
                    </Label>
                    <span className="text-muted-foreground text-xs">
                      from {f.sourceStep}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    )
  }
  return null
}

function StepReturns({
  step,
  onUpdate,
}: {
  step: WorkflowStep
  onUpdate: (s: WorkflowStep) => void
}) {
  const [adding, setAdding] = useState(false)
  const [draftLabel, setDraftLabel] = useState("")
  const [draftType, setDraftType] = useState<WorkflowReturnType>("text")

  const showSection =
    step.returns.length > 0 ||
    step.type === "outbound_voice" ||
    step.type === "prompt"
  if (!showSection) return null

  const addReturn = () => {
    if (!draftLabel.trim()) return
    onUpdate({
      ...step,
      returns: [
        ...step.returns,
        { id: `r${Date.now()}`, label: draftLabel.trim(), type: draftType },
      ],
    })
    setDraftLabel("")
    setDraftType("text")
    setAdding(false)
  }

  return (
    <div className="space-y-1.5">
      <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
        Returns
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {step.returns.map((r) => (
          <span
            key={r.id}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-medium text-foreground text-xs"
          >
            <span className="font-mono text-muted-foreground text-xs">
              {WORKFLOW_RETURN_TYPE_LABEL[r.type]}
            </span>
            <span>·</span>
            {r.label}
            <button
              type="button"
              aria-label={`Remove ${r.label}`}
              onClick={() =>
                onUpdate({
                  ...step,
                  returns: step.returns.filter((x) => x.id !== r.id),
                })
              }
              className="ml-0.5 text-muted-foreground hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {adding ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="Field name"
              className="h-7 w-32"
              onKeyDown={(e) => e.key === "Enter" && addReturn()}
            />
            <Select
              value={draftType}
              onValueChange={(v) => setDraftType(v as WorkflowReturnType)}
            >
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(
                    WORKFLOW_RETURN_TYPE_LABEL,
                  ) as WorkflowReturnType[]
                ).map((t) => (
                  <SelectItem key={t} value={t}>
                    {WORKFLOW_RETURN_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="xs" disabled={!draftLabel.trim()} onClick={addReturn}>
              Add
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Cancel"
              onClick={() => setAdding(false)}
            >
              <X />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-md border border-border border-dashed px-1.5 py-0.5 text-muted-foreground text-xs transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus className="size-3" />
            Add
          </button>
        )}
      </div>
    </div>
  )
}

function AddStepRow({ onAdd }: { onAdd: (type: WorkflowStepType) => void }) {
  const order: WorkflowStepType[] = [
    "fetch",
    "prompt",
    "format",
    "outbound_voice",
    "send_email",
    "send_sms",
    "human_review",
    "integration",
  ]
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {order.map((type) => {
        const meta = WORKFLOW_STEP_META[type]
        const TypeIcon = meta.icon
        return (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
          >
            <TypeIcon className="size-4" />
            Add {meta.label}
          </button>
        )
      })}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Inbox — Front-style 3-pane, AI-drafted replies, case-context rail
// ──────────────────────────────────────────────────────────────────────

type ThreadStatus = "open" | "snoozed" | "done" | "waiting"

type EmailFolder = {
  id: string
  label: string
  icon: Icon
  count?: number
  unread?: number
  shared?: boolean
  sharedInitials?: { initials: string; tone: string }[]
}

type SmartView = { id: string; label: string; icon: Icon; count: number }

type EmailParticipant = { name: string; initials: string; tone: string }

type EmailThread = {
  id: string
  folderId: string
  subject: string
  participants: EmailParticipant[]
  snippet: string
  time: string
  unread: boolean
  status: ThreadStatus
  assignee?: EmailParticipant
  hasDraft?: boolean
  hasMention?: boolean
  attachments?: number
  caseId?: string
  caseName?: string
  messageCount: number
}

type EmailMessage = {
  id: string
  from: EmailParticipant
  to: string
  time: string
  body: string
  attachments?: { name: string; size: string; type: "pdf" | "docx" | "img" }[]
}

const FOLDERS: EmailFolder[] = [
  { id: "my-inbox", label: "My inbox", icon: Envelope, count: 12, unread: 4 },
  { id: "sent", label: "Sent", icon: PaperPlaneTilt },
  { id: "drafts", label: "Drafts", icon: PencilSimple, count: 2 },
  { id: "snoozed", label: "Snoozed", icon: BellSlash, count: 3 },
  { id: "done", label: "Done", icon: Archive },
]

const SHARED_FOLDERS: EmailFolder[] = [
  {
    id: "intake",
    label: "intake@veritec",
    icon: Tray,
    count: 47,
    unread: 12,
    shared: true,
    sharedInitials: [
      { initials: "VK", tone: "bg-rose-100 text-rose-700" },
      { initials: "JR", tone: "bg-purple-100 text-purple-700" },
      { initials: "SB", tone: "bg-blue-100 text-blue-700" },
    ],
  },
  {
    id: "records",
    label: "records@veritec",
    icon: Tray,
    count: 8,
    unread: 2,
    shared: true,
    sharedInitials: [
      { initials: "VK", tone: "bg-rose-100 text-rose-700" },
      { initials: "AM", tone: "bg-amber-100 text-amber-700" },
    ],
  },
  {
    id: "discovery",
    label: "discovery@veritec",
    icon: Tray,
    count: 15,
    unread: 5,
    shared: true,
    sharedInitials: [
      { initials: "JR", tone: "bg-purple-100 text-purple-700" },
      { initials: "SB", tone: "bg-blue-100 text-blue-700" },
    ],
  },
]

const SMART_VIEWS: SmartView[] = [
  { id: "mentions", label: "@ mentions", icon: At, count: 3 },
  { id: "waiting", label: "Waiting on reply", icon: ChatCircle, count: 6 },
  { id: "auto-drafted", label: "Auto-drafted", icon: Sparkle, count: 9 },
  { id: "linked", label: "Linked to case", icon: Briefcase, count: 28 },
]

const ME: EmailParticipant = {
  name: "Shawn Benny",
  initials: "SB",
  tone: "bg-blue-100 text-blue-700",
}
const VK: EmailParticipant = {
  name: "Vanessa Kim",
  initials: "VK",
  tone: "bg-rose-100 text-rose-700",
}
const JR: EmailParticipant = {
  name: "James Rivera",
  initials: "JR",
  tone: "bg-purple-100 text-purple-700",
}

const THREADS: EmailThread[] = [
  {
    id: "t1",
    folderId: "intake",
    subject: "Rear-end on the 101 — possible PI claim",
    participants: [
      { name: "Camille Estrada", initials: "CE", tone: "bg-amber-100 text-amber-700" },
    ],
    snippet:
      "Hi, I was hit from behind on the 101 Friday night. My back is hurting and I want to know if we can help…",
    time: "11 min",
    unread: true,
    status: "open",
    hasDraft: true,
    messageCount: 1,
    caseId: "LEAD-1141",
    caseName: "Estrada — intake",
  },
  {
    id: "t2",
    folderId: "intake",
    subject: "Re: Records request — Bay Area PT (CVSA-1189)",
    participants: [
      { name: "Bay Area PT — Records", initials: "BA", tone: "bg-emerald-100 text-emerald-700" },
    ],
    snippet:
      "Attached please find the requested treatment records for patient Maria Lopez (DOB 03/14/91). 18 pages.",
    time: "1 h",
    unread: true,
    status: "open",
    assignee: VK,
    attachments: 2,
    messageCount: 3,
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
  },
  {
    id: "t3",
    folderId: "intake",
    subject: "Demand response — Reyes v. State Farm",
    participants: [
      { name: "Erica Chen — State Farm", initials: "EC", tone: "bg-orange-100 text-orange-700" },
    ],
    snippet:
      "Counsel — we have reviewed the demand letter dated 4/22. Our position is that the medical specials…",
    time: "3 h",
    unread: false,
    status: "waiting",
    assignee: JR,
    hasMention: true,
    messageCount: 5,
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
  },
  {
    id: "t4",
    folderId: "my-inbox",
    subject: "Hill v. Allstate — depo scheduling",
    participants: [
      { name: "Patti Lawson", initials: "PL", tone: "bg-teal-100 text-teal-700" },
    ],
    snippet:
      "Counsel — proposing 12/08 at 9am for the plaintiff deposition. Please confirm or propose alternates.",
    time: "5 h",
    unread: false,
    status: "open",
    assignee: ME,
    hasDraft: true,
    messageCount: 2,
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
  },
  {
    id: "t5",
    folderId: "records",
    subject: "Aetna lien notice — claim 88421",
    participants: [
      { name: "Aetna Subrogation", initials: "AS", tone: "bg-indigo-100 text-indigo-700" },
    ],
    snippet:
      "Notice of lien per California Civil Code section 3045.1 in the matter of Maria Lopez. Total amount asserted…",
    time: "8 h",
    unread: false,
    status: "open",
    assignee: VK,
    attachments: 1,
    hasDraft: true,
    messageCount: 1,
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
  },
  {
    id: "t6",
    folderId: "intake",
    subject: "Slipped at TJ's grocery store — Hayward",
    participants: [
      { name: "Marcus Johnson", initials: "MJ", tone: "bg-cyan-100 text-cyan-700" },
    ],
    snippet:
      "I slipped on a wet spot in the produce section last Tuesday and went to the ER. ER bill is 4k…",
    time: "yesterday",
    unread: false,
    status: "open",
    hasDraft: true,
    messageCount: 1,
  },
  {
    id: "t7",
    folderId: "intake",
    subject: "Following up on consult booking",
    participants: [
      { name: "Janet Patel", initials: "JP", tone: "bg-pink-100 text-pink-700" },
    ],
    snippet:
      "Hi — I had filled out the form last week and someone called me but I missed the call. Can we reschedule…",
    time: "yesterday",
    unread: false,
    status: "waiting",
    assignee: ME,
    messageCount: 4,
    caseId: "LEAD-1129",
    caseName: "Patel — intake",
  },
  {
    id: "t8",
    folderId: "discovery",
    subject: "Reyes — RFP responses signed and ready",
    participants: [
      { name: "James Rivera", initials: "JR", tone: "bg-purple-100 text-purple-700" },
    ],
    snippet:
      "Vanessa — signed RFP responses attached. Please serve on opposing counsel by 5pm and update the calendar.",
    time: "2 days",
    unread: false,
    status: "done",
    assignee: VK,
    attachments: 3,
    messageCount: 2,
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
  },
]

const THREAD_MESSAGES: Record<string, EmailMessage[]> = {
  t1: [
    {
      id: "m1",
      from: { name: "Camille Estrada", initials: "CE", tone: "bg-amber-100 text-amber-700" },
      to: "intake@veritec",
      time: "11 minutes ago",
      body:
        "Hi,\n\nI was hit from behind on the 101 Friday night and my lower back has been hurting since. I went to urgent care on Saturday and they referred me for an MRI but my insurance is pushing back on it.\n\nIs this something your firm can help with? The other driver said it was his fault and the police filed a report. I have not signed anything with the other side's insurance yet.\n\nThanks,\nCamille",
    },
  ],
  t2: [
    {
      id: "m1",
      from: { name: "Vanessa Kim", initials: "VK", tone: "bg-rose-100 text-rose-700" },
      to: "Bay Area PT — Records",
      time: "Yesterday at 4:12 PM",
      body:
        "Hi — please find attached our authorization. Requesting all records for Maria Lopez (DOB 03/14/91) from 10/15/25 to present. HITECH cost cap applies.\n\nThanks,\nVanessa Kim, Paralegal",
    },
    {
      id: "m2",
      from: { name: "Bay Area PT — Records", initials: "BA", tone: "bg-emerald-100 text-emerald-700" },
      to: "records@veritec",
      time: "1 hour ago",
      body:
        "Vanessa,\n\nAttached please find the requested treatment records for patient Maria Lopez (DOB 03/14/91). 18 pages including initial eval, 12 PT visits, and discharge summary dated 4/22/26.\n\nBill for $35.50 (HITECH cap, 18 pages × $0.25 + $25 search) is also attached.\n\nDeborah\nBay Area PT — Records",
      attachments: [
        { name: "Lopez_PT_records_1015-0422.pdf", size: "8.4 MB", type: "pdf" },
        { name: "Lopez_billing_invoice.pdf", size: "104 KB", type: "pdf" },
      ],
    },
  ],
}

const AI_DRAFTS: Record<
  string,
  { intent: string; body: string; confidence: number; sources: string[] }
> = {
  t1: {
    intent: "Reply to inbound lead — qualify & book consult",
    confidence: 0.92,
    sources: ["Brain · Camille's tone matches prior intake leads", "FileFlow · Intake matter type rules"],
    body:
      "Hi Camille,\n\nThanks for reaching out — I'm so sorry to hear about the accident. Yes, this sounds like something we can absolutely help with.\n\nA few quick questions to get you on our calendar:\n\n1. What date did the accident happen?\n2. Have you been to urgent care or seen any other providers besides the ER?\n3. Has anyone from the other driver's insurance contacted you?\n\nI'd like to set up a free 30-minute consultation with one of our attorneys — would tomorrow 3:30pm or Thursday 11am work for you?\n\nBest,\nShawn",
  },
  t4: {
    intent: "Confirm depo scheduling — propose alternates",
    confidence: 0.88,
    sources: ["Brain · Shawn's calendar shows 12/08 conflict", "FileFlow · Hill matter pre-trial deadlines"],
    body:
      "Patti,\n\nWe have a conflict on 12/08. Can we propose 12/10 at 9am or 12/15 at 1pm at our office instead? Both align with our pre-trial schedule on Hill.\n\nLet me know which works on your end.\n\nBest,\nShawn",
  },
  t5: {
    intent: "Acknowledge lien notice — request reduction",
    confidence: 0.78,
    sources: ["Brain · Standard lien acknowledgement template", "FileFlow · Aetna prior settlements"],
    body:
      "Counsel,\n\nWe acknowledge receipt of the lien notice dated 4/30/26 in the Maria Lopez matter. Please confirm the total amount asserted and provide a current itemization.\n\nWe will be in a position to discuss reduction once treatment is complete and we have final billing. Anticipated MMI is end of June.\n\nBest,\nShawn Benny",
  },
  t6: {
    intent: "Decline — premises with no apparent witnesses or evidence",
    confidence: 0.65,
    sources: ["Brain · Premises matters with no witnesses ≈ decline", "FileFlow · No surveillance / incident report on file"],
    body:
      "Marcus,\n\nThank you for reaching out. Unfortunately, premises cases without witness corroboration or an incident report from the store tend to be very difficult to prove. We're not in a position to take this on at this time.\n\nIf you do obtain an incident report from TJ's or have any witness information, please feel free to reach back out and we can re-evaluate.\n\nBest,\nShawn",
  },
}

const LINKED_CASES: Record<
  string,
  {
    id: string
    name: string
    matter: string
    stage: string
    stageTone: "bg-amber-100 text-amber-800" | "bg-rose-100 text-rose-800" | "bg-blue-100 text-blue-800"
    leadAttorney: string
    leadInitials: string
    leadTone: string
    incident: string
    documents: number
    openTasks: number
    nextDeadline: string
    nextDeadlineTone: "warning" | "danger" | "neutral"
    recentActivity: { label: string; time: string }[]
  }
> = {
  "CVSA-1189": {
    id: "CVSA-1189",
    name: "Lopez v. Park",
    matter: "MVA · Pre-litigation",
    stage: "Treatment cycle",
    stageTone: "bg-amber-100 text-amber-800",
    leadAttorney: "James Rivera",
    leadInitials: "JR",
    leadTone: "bg-purple-100 text-purple-700",
    incident: "Oct 12, 2025 · Rear-end MVA",
    documents: 24,
    openTasks: 3,
    nextDeadline: "21d to demand window",
    nextDeadlineTone: "warning",
    recentActivity: [
      { label: "Bay Area PT records received", time: "1 h ago" },
      { label: "Voice agent — weekly check-in", time: "Yesterday" },
      { label: "Aetna lien notice received", time: "8 h ago" },
    ],
  },
  "DC-24-09812": {
    id: "DC-24-09812",
    name: "Reyes v. State Farm",
    matter: "MVA · Litigation",
    stage: "Discovery",
    stageTone: "bg-rose-100 text-rose-800",
    leadAttorney: "James Rivera",
    leadInitials: "JR",
    leadTone: "bg-purple-100 text-purple-700",
    incident: "Aug 4, 2025 · Side-impact MVA",
    documents: 87,
    openTasks: 6,
    nextDeadline: "Filing due 12/03",
    nextDeadlineTone: "warning",
    recentActivity: [
      { label: "Demand response received", time: "3 h ago" },
      { label: "RFP responses served", time: "2 d ago" },
      { label: "Interrogatories drafted", time: "5 d ago" },
    ],
  },
  "DC-25-00481": {
    id: "DC-25-00481",
    name: "Hill v. Allstate",
    matter: "Premises · Litigation",
    stage: "Pre-trial",
    stageTone: "bg-rose-100 text-rose-800",
    leadAttorney: "Shawn Benny",
    leadInitials: "SB",
    leadTone: "bg-blue-100 text-blue-700",
    incident: "Feb 18, 2025 · Slip & fall",
    documents: 142,
    openTasks: 9,
    nextDeadline: "Depo 12/08",
    nextDeadlineTone: "warning",
    recentActivity: [
      { label: "Depo scheduling proposal", time: "5 h ago" },
      { label: "Expert witness retained", time: "1 wk ago" },
    ],
  },
  "LEAD-1141": {
    id: "LEAD-1141",
    name: "Estrada — intake",
    matter: "MVA · Lead",
    stage: "Initial qualification",
    stageTone: "bg-blue-100 text-blue-800",
    leadAttorney: "—",
    leadInitials: "—",
    leadTone: "bg-muted text-muted-foreground",
    incident: "May 1, 2026 · Rear-end MVA",
    documents: 0,
    openTasks: 1,
    nextDeadline: "Auto-qualify",
    nextDeadlineTone: "neutral",
    recentActivity: [
      { label: "Email received", time: "11 min ago" },
      { label: "Voice agent attempted callback", time: "30 min ago" },
    ],
  },
  "LEAD-1129": {
    id: "LEAD-1129",
    name: "Patel — intake",
    matter: "Premises · Lead",
    stage: "Awaiting retainer",
    stageTone: "bg-blue-100 text-blue-800",
    leadAttorney: "—",
    leadInitials: "—",
    leadTone: "bg-muted text-muted-foreground",
    incident: "Apr 22, 2026 · Slip & fall",
    documents: 0,
    openTasks: 2,
    nextDeadline: "Auto-follow-up 5/3",
    nextDeadlineTone: "neutral",
    recentActivity: [
      { label: "Voicemail left by client", time: "Yesterday" },
      { label: "Form submitted", time: "1 wk ago" },
    ],
  },
}

type InboxFilter = "all" | "unread" | "mine" | "drafted"

function InboxPage() {
  const [selectedFolder, setSelectedFolder] = useState("intake")
  const [filter, setFilter] = useState<InboxFilter>("all")
  const [query, setQuery] = useState("")
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>("t1")
  const [draftBody, setDraftBody] = useState<string | null>(null)
  const [contextRailOpen, setContextRailOpen] = useState(true)

  const filteredThreads = useMemo(() => {
    return THREADS.filter((t) => {
      if (t.folderId !== selectedFolder) return false
      if (filter === "unread" && !t.unread) return false
      if (filter === "mine" && t.assignee?.initials !== ME.initials) return false
      if (filter === "drafted" && !t.hasDraft) return false
      if (query) {
        const q = query.toLowerCase()
        if (
          !t.subject.toLowerCase().includes(q) &&
          !t.snippet.toLowerCase().includes(q) &&
          !t.participants.some((p) => p.name.toLowerCase().includes(q))
        ) {
          return false
        }
      }
      return true
    })
  }, [selectedFolder, filter, query])

  const selectedThread =
    filteredThreads.find((t) => t.id === selectedThreadId) ?? filteredThreads[0]

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <InboxLeftPane
        selected={selectedFolder}
        onSelect={(id) => {
          setSelectedFolder(id)
          setSelectedThreadId(null)
          setDraftBody(null)
        }}
      />
      <ThreadListPane
        folder={[...FOLDERS, ...SHARED_FOLDERS].find((f) => f.id === selectedFolder)}
        threads={filteredThreads}
        selectedId={selectedThread?.id}
        onSelect={(id) => {
          setSelectedThreadId(id)
          setDraftBody(null)
        }}
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
      />
      {selectedThread ? (
        <ThreadDetailPane
          thread={selectedThread}
          draftBody={draftBody}
          onDraftChange={setDraftBody}
          onApproveDraft={() => {
            toast.success("Reply sent to " + selectedThread.participants[0].name)
            setDraftBody(null)
          }}
          contextRailOpen={contextRailOpen}
          onToggleContextRail={() => setContextRailOpen((v) => !v)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Nothing selected.
        </div>
      )}
    </div>
  )
}

// ── Left pane: folder switcher + smart views ──────────────────────────

function InboxLeftPane({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-3 overflow-y-auto border-border border-r bg-background p-3">
      <Button size="sm" className="w-full justify-center">
        <PencilSimple />
        Compose
      </Button>

      <FolderGroup label="Personal">
        {FOLDERS.map((f) => (
          <FolderItem
            key={f.id}
            folder={f}
            active={selected === f.id}
            onClick={() => onSelect(f.id)}
          />
        ))}
      </FolderGroup>

      <FolderGroup label="Shared inboxes">
        {SHARED_FOLDERS.map((f) => (
          <FolderItem
            key={f.id}
            folder={f}
            active={selected === f.id}
            onClick={() => onSelect(f.id)}
          />
        ))}
      </FolderGroup>

      <FolderGroup label="Smart views">
        {SMART_VIEWS.map((v) => {
          const Icon = v.icon
          return (
            <button
              key={v.id}
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-foreground text-sm transition-colors hover:bg-muted/60"
            >
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{v.label}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {v.count}
              </span>
            </button>
          )
        })}
      </FolderGroup>
    </aside>
  )
}

function FolderGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FolderItem({
  folder,
  active,
  onClick,
}: {
  folder: EmailFolder
  active: boolean
  onClick: () => void
}) {
  const Icon = folder.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-accent font-medium text-primary"
          : "text-foreground hover:bg-muted/60",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="flex-1 truncate">{folder.label}</span>
      {folder.shared && folder.sharedInitials && (
        <AvatarStack people={folder.sharedInitials} size="xs" />
      )}
      {folder.unread ? (
        <span className="rounded bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground tabular-nums">
          {folder.unread}
        </span>
      ) : folder.count ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {folder.count}
        </span>
      ) : null}
    </button>
  )
}

function AvatarStack({
  people,
  size = "sm",
}: {
  people: { initials: string; tone: string }[]
  size?: "xs" | "sm"
}) {
  const sizeClass = size === "xs" ? "size-4 text-[8px]" : "size-5 text-[9px]"
  return (
    <div className="flex -space-x-1">
      {people.slice(0, 3).map((p, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-background font-semibold",
            sizeClass,
            p.tone,
          )}
        >
          {p.initials}
        </span>
      ))}
    </div>
  )
}

// ── Middle pane: thread list ──────────────────────────────────────────

function ThreadListPane({
  folder,
  threads,
  selectedId,
  onSelect,
  query,
  onQuery,
  filter,
  onFilter,
}: {
  folder?: EmailFolder
  threads: EmailThread[]
  selectedId?: string
  onSelect: (id: string) => void
  query: string
  onQuery: (q: string) => void
  filter: InboxFilter
  onFilter: (f: InboxFilter) => void
}) {
  const Icon = folder?.icon ?? Envelope
  return (
    <section className="flex w-[380px] shrink-0 flex-col overflow-hidden border-border border-r bg-background">
      <header className="flex items-center gap-2 px-4 py-3">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="font-semibold text-base text-foreground">
          {folder?.label ?? "Inbox"}
        </h2>
        {folder?.shared && folder.sharedInitials && (
          <AvatarStack people={folder.sharedInitials} />
        )}
        <span className="ml-auto text-muted-foreground text-xs tabular-nums">
          {threads.length}
        </span>
      </header>

      <div className="border-border border-b px-3 pb-3">
        <DebouncedSearch
          value={query}
          onChange={onQuery}
          placeholder="Search subject, sender, body…"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {(
            [
              ["all", "All"],
              ["unread", "Unread"],
              ["mine", "Mine"],
              ["drafted", "AI-drafted"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => onFilter(k as InboxFilter)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                filter === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {threads.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted-foreground text-sm">
            No conversations match.
          </p>
        ) : (
          threads.map((t) => (
            <ThreadListItem
              key={t.id}
              thread={t}
              active={selectedId === t.id}
              onClick={() => onSelect(t.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function ThreadListItem({
  thread,
  active,
  onClick,
}: {
  thread: EmailThread
  active: boolean
  onClick: () => void
}) {
  const sender = thread.participants[0]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 border-border/60 border-b px-4 py-3 text-left transition-colors",
        active ? "bg-accent" : "hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full font-semibold text-xs",
          sender.tone,
        )}
      >
        {sender.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {thread.unread && (
            <Circle weight="fill" className="size-2 shrink-0 text-primary" />
          )}
          <p
            className={cn(
              "flex-1 truncate text-foreground text-sm",
              thread.unread && "font-semibold",
            )}
          >
            {sender.name}
            {thread.messageCount > 1 && (
              <span className="ml-1 text-muted-foreground">
                · {thread.messageCount}
              </span>
            )}
          </p>
          <span className="shrink-0 text-muted-foreground text-xs">
            {thread.time}
          </span>
        </div>
        <p
          className={cn(
            "mt-0.5 truncate text-foreground text-sm",
            thread.unread && "font-medium",
          )}
        >
          {thread.subject}
        </p>
        <p className="mt-0.5 truncate text-muted-foreground text-xs">
          {thread.snippet}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {thread.hasDraft && (
            <Badge className="bg-primary/10 font-medium text-primary">
              <Sparkle weight="fill" className="size-3" />
              AI draft ready
            </Badge>
          )}
          {thread.hasMention && (
            <Badge className="bg-warning-muted font-medium text-warning">
              <At className="size-3" />
              mention
            </Badge>
          )}
          {thread.status === "waiting" && (
            <Badge variant="outline" className="font-medium">
              <ChatCircle className="size-3" />
              waiting
            </Badge>
          )}
          {thread.status === "done" && (
            <Badge className="bg-success-muted font-medium text-success">
              <CheckCircleIcon className="size-3" weight="fill" />
              done
            </Badge>
          )}
          {thread.attachments && (
            <Badge variant="outline" className="font-medium">
              <Paperclip className="size-3" />
              {thread.attachments}
            </Badge>
          )}
          {thread.caseId && (
            <Badge variant="outline" className="font-medium">
              <Briefcase className="size-3" />
              {thread.caseId}
            </Badge>
          )}
        </div>
      </div>
      {thread.assignee && (
        <span
          className={cn(
            "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full font-semibold text-[9px]",
            thread.assignee.tone,
          )}
          title={`Assigned to ${thread.assignee.name}`}
        >
          {thread.assignee.initials}
        </span>
      )}
    </button>
  )
}

// ── Right pane: thread detail + AI draft + case rail ──────────────────

function ThreadDetailPane({
  thread,
  draftBody,
  onDraftChange,
  onApproveDraft,
  contextRailOpen,
  onToggleContextRail,
}: {
  thread: EmailThread
  draftBody: string | null
  onDraftChange: (v: string | null) => void
  onApproveDraft: () => void
  contextRailOpen: boolean
  onToggleContextRail: () => void
}) {
  const messages = THREAD_MESSAGES[thread.id] ?? [
    {
      id: "m1",
      from: thread.participants[0],
      to: thread.folderId.includes("@") ? thread.folderId : `${thread.folderId}@veritec`,
      time: thread.time + " ago",
      body: thread.snippet,
    },
  ]
  const aiDraft = thread.hasDraft ? AI_DRAFTS[thread.id] : null
  const linkedCase = thread.caseId ? LINKED_CASES[thread.caseId] : null
  const liveDraft = draftBody ?? aiDraft?.body ?? ""

  return (
    <section className="flex min-w-0 flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <ThreadHeader
          thread={thread}
          contextRailOpen={contextRailOpen}
          onToggleContextRail={onToggleContextRail}
        />
        <div className="flex-1 overflow-auto px-6 py-4">
          {messages.map((m) => (
            <MessageBlock key={m.id} message={m} />
          ))}
        </div>
        {aiDraft && (
          <AiDraftCard
            draft={aiDraft}
            value={liveDraft}
            onChange={(v) => onDraftChange(v)}
            onApprove={onApproveDraft}
            onReject={() => onDraftChange("")}
          />
        )}
      </div>
      {contextRailOpen && linkedCase && <CaseContextRail caseData={linkedCase} />}
    </section>
  )
}

function ThreadHeader({
  thread,
  contextRailOpen,
  onToggleContextRail,
}: {
  thread: EmailThread
  contextRailOpen: boolean
  onToggleContextRail: () => void
}) {
  return (
    <header className="flex items-start gap-3 border-border border-b px-6 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-base text-foreground">
            {thread.subject}
          </h2>
          {thread.caseName && (
            <Badge variant="outline" className="font-medium">
              <Briefcase className="size-3" />
              {thread.caseId} · {thread.caseName}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {thread.participants[0].name} · {thread.messageCount}{" "}
          {thread.messageCount === 1 ? "message" : "messages"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Snooze">
          <BellSlash />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Archive">
          <Archive />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Tag">
          <Tag />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="More">
          <DotsThree />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={contextRailOpen ? "Hide case context" : "Show case context"}
          onClick={onToggleContextRail}
        >
          {contextRailOpen ? <CaretRight /> : <CaretLeft />}
        </Button>
      </div>
    </header>
  )
}

function MessageBlock({ message }: { message: EmailMessage }) {
  return (
    <article className="mb-4 rounded-xl border border-border bg-background p-4">
      <header className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-xs",
            message.from.tone,
          )}
        >
          {message.from.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground text-sm">
            {message.from.name}
          </p>
          <p className="truncate text-muted-foreground text-xs">
            to {message.to} · {message.time}
          </p>
        </div>
      </header>
      <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
        {message.body}
      </div>
      {message.attachments && (
        <div className="mt-3 flex flex-wrap gap-2 border-border border-t pt-3">
          {message.attachments.map((a) => (
            <button
              key={a.name}
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-danger-muted text-destructive">
                <FileText className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground text-sm">
                  {a.name}
                </span>
                <span className="block text-muted-foreground text-xs">
                  {a.size} · {a.type.toUpperCase()}
                </span>
              </span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                <Briefcase className="size-3" />
                Save to case
              </span>
            </button>
          ))}
        </div>
      )}
    </article>
  )
}

function AiDraftCard({
  draft,
  value,
  onChange,
  onApprove,
  onReject,
}: {
  draft: { intent: string; body: string; confidence: number; sources: string[] }
  value: string
  onChange: (v: string) => void
  onApprove: () => void
  onReject: () => void
}) {
  const [editing, setEditing] = useState(false)
  const pct = Math.round(draft.confidence * 100)
  const tone = pct >= 85 ? "text-success" : pct >= 70 ? "text-warning" : "text-muted-foreground"
  return (
    <div className="border-border border-t bg-muted/30 px-6 py-4">
      <div className="rounded-xl border border-primary/40 bg-background">
        <header className="flex items-center gap-2 border-border border-b px-4 py-2.5">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkle weight="fill" className="size-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground text-sm">
              AI draft · {draft.intent}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              {draft.sources.join(" · ")}
            </p>
          </div>
          <span className={cn("font-semibold text-xs tabular-nums", tone)}>
            {pct}% confidence
          </span>
        </header>
        {editing ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[180px] resize-none rounded-none border-0 focus-visible:ring-0"
          />
        ) : (
          <div className="whitespace-pre-wrap px-4 py-3 text-foreground text-sm leading-relaxed">
            {value}
          </div>
        )}
        <footer className="flex flex-wrap items-center gap-2 border-border border-t bg-muted/20 px-3 py-2">
          <Button size="sm" onClick={onApprove}>
            <PaperPlaneTilt weight="fill" />
            Approve & send
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing((v) => !v)}
          >
            <PencilSimple />
            {editing ? "Done editing" : "Edit"}
          </Button>
          <Button size="sm" variant="ghost">
            <ArrowsClockwise />
            Regenerate
          </Button>
          <span className="text-muted-foreground text-xs">Tone:</span>
          {(["Match brain", "Formal", "Warmer", "Shorter"] as const).map(
            (t, i) => (
              <button
                key={t}
                type="button"
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                  i === 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {t}
              </button>
            ),
          )}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-muted-foreground"
            onClick={onReject}
          >
            <X />
            Reject
          </Button>
        </footer>
      </div>
    </div>
  )
}

function CaseContextRail({
  caseData,
}: {
  caseData: (typeof LINKED_CASES)[keyof typeof LINKED_CASES]
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-border border-l bg-background p-4">
      <header className="mb-3">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          Linked case
        </p>
        <p className="mt-0.5 font-semibold text-foreground text-base">
          {caseData.name}
        </p>
        <p className="text-muted-foreground text-xs">
          {caseData.id} · {caseData.matter}
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
            caseData.stageTone,
          )}
        >
          {caseData.stage}
        </span>
        <Badge
          className={cn(
            caseData.nextDeadlineTone === "warning" &&
              "bg-warning-muted text-warning",
            caseData.nextDeadlineTone === "danger" &&
              "bg-danger-muted text-destructive",
            caseData.nextDeadlineTone === "neutral" && "bg-muted text-foreground",
            "font-medium",
          )}
        >
          {caseData.nextDeadline}
        </Badge>
      </div>

      <Separator className="mb-3" />

      <FactRow label="Incident" value={caseData.incident} />
      <FactRow
        label="Lead attorney"
        value={
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex size-4 items-center justify-center rounded-full font-semibold text-[8px]",
                caseData.leadTone,
              )}
            >
              {caseData.leadInitials}
            </span>
            {caseData.leadAttorney}
          </span>
        }
      />
      <FactRow label="Documents" value={`${caseData.documents}`} />
      <FactRow label="Open tasks" value={`${caseData.openTasks}`} />

      <Separator className="my-3" />

      <p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        Recent activity
      </p>
      <div className="flex flex-col gap-2">
        {caseData.recentActivity.map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <Circle weight="fill" className="mt-1.5 size-1.5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-foreground">{a.label}</p>
              <p className="text-muted-foreground text-xs">{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <Button variant="outline" size="sm" className="w-full justify-center">
          <Briefcase />
          Open in FileFlow
        </Button>
      </div>
    </aside>
  )
}

function FactRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1">
      <span className="shrink-0 text-muted-foreground text-xs">{label}</span>
      <span className="text-right text-foreground text-sm">{value}</span>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────
// Agent Task Board — paralegal-as-orchestrator workspace
// ──────────────────────────────────────────────────────────────────────

type TaskStatus = "needs_approval" | "in_progress" | "blocked" | "done"
type TaskRisk = "low" | "medium" | "high"
type GroupBy = "status" | "case" | "agent" | "type"

type TaskAgent = {
  id: string
  label: string
  /** Categorical chart token (--chart-N) — used for tinted icon tile */
  colorVar: string
  icon: Icon
}

type AgentTask = {
  id: string
  title: string
  /** 1-line preview of the proposed output the paralegal will approve */
  outcome: string
  /** What the agent is doing / blocked on, depending on status */
  detail: string
  agentId: string
  type: string
  caseId: string
  caseName: string
  status: TaskStatus
  risk: TaskRisk
  /** Dollar value or magnitude — used for batch filters like "approve under $500" */
  stakes?: string
  /** How long since the task arrived in this status */
  age: string
  /** Whether this task is part of a recurring pattern the brain has learned */
  patternId?: string
  patternLabel?: string
  /** Why the agent flagged it for approval (or what's blocking it) */
  reasoning: string
  /** If set, this is a subtask of another task (rendered indented in List view) */
  parentId?: string
}

const TASK_AGENTS: Record<string, TaskAgent> = {
  intake: {
    id: "intake",
    label: "Voice Intake",
    colorVar: "--chart-2",
    icon: Phone,
  },
  records: {
    id: "records",
    label: "Records Chaser",
    colorVar: "--chart-1",
    icon: Stack,
  },
  medchron: {
    id: "medchron",
    label: "MedChron",
    colorVar: "--chart-3",
    icon: FileText,
  },
  demand: {
    id: "demand",
    label: "Demand Letter",
    colorVar: "--chart-4",
    icon: Sparkle,
  },
  lien: {
    id: "lien",
    label: "Lien Resolution",
    colorVar: "--chart-5",
    icon: Scales,
  },
  email: {
    id: "email",
    label: "Email Brain",
    colorVar: "--chart-6",
    icon: Envelope,
  },
}

const TASKS: AgentTask[] = [
  // ── Needs approval ─────────────────────────────────────────────────
  {
    id: "T-1",
    title: "Approve records request — Bay Area PT",
    outcome: "HIPAA-compliant letter, 30-day deadline, HITECH cap",
    detail: "Standard records request following last week's intake",
    agentId: "records",
    type: "Send records request",
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
    status: "needs_approval",
    risk: "low",
    stakes: "$0",
    age: "4 min",
    patternId: "rec-std",
    patternLabel: "Standard records request",
    reasoning:
      "Provider matched to firm contact ecosystem. Patient authorization on file. No prior dispute history.",
  },
  {
    id: "T-2",
    title: "Approve lien acknowledgement — Aetna",
    outcome: "Acknowledge receipt, request itemization, defer reduction to MMI",
    detail: "Reply to Aetna lien notice for $12,400",
    agentId: "lien",
    type: "Lien response",
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
    status: "needs_approval",
    risk: "low",
    stakes: "$12.4k",
    age: "8 h",
    patternId: "lien-ack",
    patternLabel: "Standard lien acknowledgement",
    reasoning:
      "Aetna lien notices follow standard format. Reduction negotiations historically resolve post-MMI.",
  },
  {
    id: "T-3",
    title: "Approve demand letter draft — Reyes v. State Farm",
    outcome: "$2.4M demand, firm tone, 30-day deadline",
    detail: "First draft from medical chronology + multiplier calculation",
    agentId: "demand",
    type: "Demand letter",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "needs_approval",
    risk: "high",
    stakes: "$2.4M",
    age: "1 h",
    reasoning:
      "Treatment complete, MMI confirmed. Specials $312k, multiplier 3.5x = $1.09M general, $1.31M total. Police report and citation support clear liability.",
  },
  {
    id: "T-4",
    title: "Approve intake decline — Marcus Johnson",
    outcome: "Polite decline with referral guidance",
    detail: "Premises case with no witness corroboration",
    agentId: "email",
    type: "Email reply",
    caseId: "LEAD-1147",
    caseName: "Johnson — intake",
    status: "needs_approval",
    risk: "low",
    stakes: "$0",
    age: "yesterday",
    patternId: "premises-decline",
    patternLabel: "Premises decline — no witness",
    reasoning:
      "Premises cases without witness corroboration historically settle below firm's threshold. No incident report from store.",
  },
  {
    id: "T-5",
    title: "Approve med-chron summary — Lopez v. Park",
    outcome: "Chronology covering 14 visits, 3 providers, 1 gap",
    detail: "Auto-built from 24 medical records received this week",
    agentId: "medchron",
    type: "Med chronology",
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
    status: "needs_approval",
    risk: "medium",
    stakes: "—",
    age: "2 h",
    reasoning:
      "Brain flagged 1 unexplained 18-day gap between PT visit 4 and visit 5. Attorney decision needed on whether to explain or address in deposition prep.",
  },
  {
    id: "T-6",
    title: "Approve consult booking offer — Estrada",
    outcome: "Free 30-min consult, tomorrow 3:30pm or Thursday 11am",
    detail: "Reply to inbound lead from web form",
    agentId: "email",
    type: "Email reply",
    caseId: "LEAD-1141",
    caseName: "Estrada — intake",
    status: "needs_approval",
    risk: "low",
    stakes: "$0",
    age: "11 min",
    patternId: "intake-book",
    patternLabel: "Standard intake booking",
    reasoning:
      "Camille's tone matches prior intake leads. MVA matter type qualifies. SOL well within range.",
  },
  {
    id: "T-7",
    title: "Approve records request — Stanford Medical Imaging",
    outcome: "Records request for MRI, CT, X-rays",
    detail: "Imaging facility added to case via voice intake",
    agentId: "records",
    type: "Send records request",
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
    status: "needs_approval",
    risk: "low",
    stakes: "$0",
    age: "23 min",
    patternId: "rec-std",
    patternLabel: "Standard records request",
    reasoning:
      "Stanford Medical Imaging matched to firm ecosystem. HIPAA on file. Standard 30-day deadline.",
  },

  // ── In progress ────────────────────────────────────────────────────
  {
    id: "T-8",
    title: "Voice intake — qualifying inbound lead",
    outcome: "Call in progress · 2 min 14 sec elapsed",
    detail: "Live qualification with caller from web form",
    agentId: "intake",
    type: "Voice qualify",
    caseId: "LEAD-1148",
    caseName: "Inbound · (415) 555-0192",
    status: "in_progress",
    risk: "low",
    age: "live",
    reasoning: "Voice agent currently on call. Will surface for review on hangup.",
  },
  {
    id: "T-9",
    title: "Building medical chronology — Reyes",
    outcome: "Processing 47 records · 71% complete",
    detail: "OCR + diagnosis extraction + ICD-10 tagging",
    agentId: "medchron",
    type: "Med chronology",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "in_progress",
    risk: "low",
    age: "8 min",
    reasoning: "Long-running pipeline. ETA 3 minutes.",
  },
  {
    id: "T-10",
    title: "Following up on records — Westside Imaging",
    outcome: "3rd follow-up scheduled for 5/15",
    detail: "Provider hasn't acknowledged 2 prior requests",
    agentId: "records",
    type: "Records follow-up",
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
    status: "in_progress",
    risk: "low",
    age: "3 d",
    reasoning: "Automatic cadence. Will surface to paralegal after 5 attempts.",
  },
  {
    id: "T-11",
    title: "Weekly treatment check-in — Olivia Bennett",
    outcome: "Call queued for tomorrow 10 AM",
    detail: "Scheduled cadence call",
    agentId: "intake",
    type: "Voice check-in",
    caseId: "CVSA-4108",
    caseName: "Bennett — Pre-litigation",
    status: "in_progress",
    risk: "low",
    age: "scheduled",
    reasoning: "Cadence on schedule. Will join the queue tomorrow morning.",
  },

  // ── Blocked ────────────────────────────────────────────────────────
  {
    id: "T-12",
    title: "Lien negotiation stuck — Blue Cross",
    outcome: "Awaiting itemization for 2+ weeks",
    detail: "Carrier non-responsive to 3 prior requests",
    agentId: "lien",
    type: "Lien response",
    caseId: "CVSA-3941",
    caseName: "Brooks v. Lyft",
    status: "blocked",
    risk: "high",
    stakes: "$8.2k",
    age: "14 d",
    reasoning:
      "Brain attempted 3 follow-ups via email + 1 phone call. No response. Recommend attorney intervention or supervisor escalation.",
  },
  {
    id: "T-13",
    title: "Demand letter blocked — missing wage docs",
    outcome: "Need W2s and pay stubs to finalize lost wages",
    detail: "Client hasn't returned the wage affidavit form",
    agentId: "demand",
    type: "Demand letter",
    caseId: "CVSA-4123",
    caseName: "Cho v. State Farm",
    status: "blocked",
    risk: "medium",
    stakes: "$185k",
    age: "5 d",
    reasoning:
      "Demand can't go out without wage damages numbers. Voice agent has called 3 times — no answer.",
  },
  {
    id: "T-14",
    title: "Voice intake — caller hung up before qualification",
    outcome: "1 min 12 sec call, partial qualification",
    detail: "Lead hung up after providing name only",
    agentId: "intake",
    type: "Voice qualify",
    caseId: "LEAD-1146",
    caseName: "Inbound · (415) 555-0188",
    status: "blocked",
    risk: "low",
    age: "1 h",
    reasoning:
      "Caller name captured: 'Sarah'. No callback number. Paralegal decision: trace via originating number or close as voicemail.",
  },

  // ── Parent task: depo prep pipeline (Hill v. Allstate) ────────────
  {
    id: "T-P1",
    title: "Prep for Hill v. Allstate deposition (12/08)",
    outcome: "Coordinated 4-agent pipeline · 2 of 4 substeps done",
    detail: "Multi-agent: records → med-chron → question gen → exhibit prep",
    agentId: "demand", // umbrella owner
    type: "Depo prep",
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
    status: "in_progress",
    risk: "medium",
    stakes: "—",
    age: "2 d",
    reasoning:
      "4-agent pipeline coordinating deposition prep. 2 substeps complete, 1 needs your approval, 1 still chasing records.",
  },
  {
    id: "T-P1-1",
    parentId: "T-P1",
    title: "Records request — Stanford Imaging",
    outcome: "Approved by you yesterday · awaiting receipt",
    detail: "Standard records request",
    agentId: "records",
    type: "Send records request",
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
    status: "in_progress",
    risk: "low",
    age: "1 d",
    reasoning: "Standard request, awaiting provider response.",
  },
  {
    id: "T-P1-2",
    parentId: "T-P1",
    title: "Build med chronology from existing records",
    outcome: "12 visits, 4 providers, no gaps flagged",
    detail: "MedChron pipeline run on 41 records",
    agentId: "medchron",
    type: "Med chronology",
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
    status: "done",
    risk: "low",
    age: "2 d",
    reasoning: "Auto-completed; output approved by you 2 days ago.",
  },
  {
    id: "T-P1-3",
    parentId: "T-P1",
    title: "Generate deposition questions (Hill)",
    outcome: "48 questions across 6 thematic blocks",
    detail: "Pulled from depo prep playbook + case-specific facts",
    agentId: "demand",
    type: "Depo questions",
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
    status: "needs_approval",
    risk: "medium",
    stakes: "—",
    age: "3 h",
    reasoning:
      "Question set covers background, narrative, distraction, traffic signal, and damages. 2 high-impeachment confrontations identified.",
  },
  {
    id: "T-P1-4",
    parentId: "T-P1",
    title: "Compile exhibit set",
    outcome: "14 exhibits matched to questions, indexed",
    detail: "Cross-referenced from FileFlow doc store",
    agentId: "records",
    type: "Exhibit prep",
    caseId: "DC-25-00481",
    caseName: "Hill v. Allstate",
    status: "done",
    risk: "low",
    age: "1 d",
    reasoning: "Auto-completed; exhibit binder is in FileFlow.",
  },

  // ── Parent task: demand letter pipeline (Reyes — already in approval) ─
  {
    id: "T-P2",
    title: "Demand letter package — Reyes v. State Farm",
    outcome: "3 of 4 substeps complete · letter draft awaiting you",
    detail: "Multi-agent: med-chron → multiplier → letter → cover email",
    agentId: "demand",
    type: "Demand letter",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "needs_approval",
    risk: "high",
    stakes: "$2.4M",
    age: "1 h",
    reasoning:
      "Top-level approval blocks remaining substeps. Med-chron, multiplier, and letter draft are complete.",
  },
  {
    id: "T-P2-1",
    parentId: "T-P2",
    title: "Med chronology — Reyes",
    outcome: "47 records processed, 71% complete",
    detail: "Long-running pipeline",
    agentId: "medchron",
    type: "Med chronology",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "in_progress",
    risk: "low",
    age: "8 min",
    reasoning: "ETA 3 minutes.",
  },
  {
    id: "T-P2-2",
    parentId: "T-P2",
    title: "Calculate multiplier ($1.09M general)",
    outcome: "3.5x multiplier · liability clear, treatment complete",
    detail: "Specials $312k × 3.5",
    agentId: "demand",
    type: "Damages calc",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "done",
    risk: "low",
    age: "2 h",
    reasoning: "Auto-completed.",
  },
  {
    id: "T-P2-3",
    parentId: "T-P2",
    title: "Draft demand letter (4 pages)",
    outcome: "$2.4M demand, firm tone, 30-day deadline",
    detail: "Same artifact as T-3 — references this draft",
    agentId: "demand",
    type: "Demand letter",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "needs_approval",
    risk: "high",
    stakes: "$2.4M",
    age: "1 h",
    reasoning: "See T-3 — same draft surfaced here as part of pipeline.",
  },
  {
    id: "T-P2-4",
    parentId: "T-P2",
    title: "Draft cover email to opposing counsel",
    outcome: "Will trigger on letter approval",
    detail: "Waiting on T-P2-3",
    agentId: "email",
    type: "Email reply",
    caseId: "DC-24-09812",
    caseName: "Reyes v. State Farm",
    status: "blocked",
    risk: "low",
    age: "—",
    reasoning: "Blocked until demand letter draft is approved.",
  },

  // ── Done today ─────────────────────────────────────────────────────
  {
    id: "T-15",
    title: "Approved records request — Sutter Health",
    outcome: "Letter sent, 30-day deadline",
    detail: "You approved · 2 h ago",
    agentId: "records",
    type: "Send records request",
    caseId: "CVSA-4127",
    caseName: "Lopez (Maria) v. Park",
    status: "done",
    risk: "low",
    stakes: "$0",
    age: "2 h",
    reasoning: "Standard request, approved in batch this morning.",
  },
  {
    id: "T-16",
    title: "Approved demand letter — Patel premises",
    outcome: "$420k demand, firm tone, sent to Travelers",
    detail: "You approved · this morning",
    agentId: "demand",
    type: "Demand letter",
    caseId: "CVSA-3812",
    caseName: "Patel v. Westfield",
    status: "done",
    risk: "high",
    stakes: "$420k",
    age: "this morning",
    reasoning: "Demand letter approved after attorney sign-off.",
  },
  {
    id: "T-17",
    title: "Approved intake — Daniel Cho",
    outcome: "Retainer sent, consult booked",
    detail: "You approved · 4 h ago",
    agentId: "email",
    type: "Email reply",
    caseId: "LEAD-1144",
    caseName: "Cho — intake",
    status: "done",
    risk: "low",
    stakes: "$0",
    age: "4 h",
    reasoning: "Standard intake booking flow.",
  },
  {
    id: "T-18",
    title: "Auto-approved records receipt — Bay Area PT",
    outcome: "Records routed to Lopez case, indexed",
    detail: "Brain auto-approved · 1 h ago",
    agentId: "records",
    type: "Records receipt",
    caseId: "CVSA-1189",
    caseName: "Lopez v. Park",
    status: "done",
    risk: "low",
    age: "1 h",
    reasoning:
      "Records receipt matched to open request. Auto-approved under brain pattern 'rec-receipt'.",
  },
]

function TasksPage() {
  const [groupBy, setGroupBy] = useState<GroupBy>("status")
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([])
  const [agentFilters, setAgentFilters] = useState<string[]>([])
  const [caseFilters, setCaseFilters] = useState<string[]>([])
  const [riskFilters, setRiskFilters] = useState<TaskRisk[]>([])
  const [caseSearch, setCaseSearch] = useState("")
  const [query, setQuery] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("T-1")
  const [viewMode, setViewMode] = useState<"list" | "board" | "cases">("list")
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(["T-P1", "T-P2"]),
  )
  const [tasks, setTasks] = useState<AgentTask[]>(TASKS)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (agentFilters.length > 0 && !agentFilters.includes(t.agentId))
        return false
      if (caseFilters.length > 0 && !caseFilters.includes(t.caseId))
        return false
      if (riskFilters.length > 0 && !riskFilters.includes(t.risk)) return false
      if (statusFilters.length > 0 && !statusFilters.includes(t.status))
        return false
      if (q) {
        const blob = [
          t.title,
          t.outcome,
          t.detail,
          t.type,
          t.caseId,
          t.caseName,
          TASK_AGENTS[t.agentId]?.label ?? "",
          t.patternLabel ?? "",
        ]
          .join(" ")
          .toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [tasks, agentFilters, caseFilters, riskFilters, statusFilters, query])

  const selected = filtered.find((t) => t.id === selectedTaskId) ?? filtered[0]

  const counts = useMemo(() => {
    const c = { needs_approval: 0, in_progress: 0, blocked: 0, done: 0 }
    for (const t of filtered) c[t.status]++
    return c
  }, [filtered])

  const allCases = useMemo(() => {
    const seen = new Map<string, string>()
    for (const t of tasks) seen.set(t.caseId, t.caseName)
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [tasks])

  const handleApprove = (taskId: string) => {
    setTasks((curr) =>
      curr.map((t) => (t.id === taskId ? { ...t, status: "done" as TaskStatus, age: "just now" } : t)),
    )
    toast.success("Approved — agent sending now")
    // pick next pending task
    const next = filtered.find((t) => t.id !== taskId && t.status === "needs_approval")
    if (next) setSelectedTaskId(next.id)
  }

  const handleReject = (taskId: string) => {
    setTasks((curr) => curr.filter((t) => t.id !== taskId))
    toast.message("Rejected — agent will not proceed")
  }

  const handleEscalate = (taskId: string) => {
    toast.success("Escalated to attorney")
    setTasks((curr) =>
      curr.map((t) =>
        t.id === taskId
          ? { ...t, status: "in_progress" as TaskStatus, age: "just now" }
          : t,
      ),
    )
  }

  const handleTryVoice = (taskId: string) => {
    toast.success("Voice outreach queued")
    setTasks((curr) =>
      curr.map((t) =>
        t.id === taskId
          ? { ...t, status: "in_progress" as TaskStatus, age: "just now" }
          : t,
      ),
    )
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────
  // J/K — next/prev row, A — approve, X — reject, V — try voice (blocked),
  // E — escalate (blocked) or edit (needs approval), S — send back
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewMode !== "list") return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const topLevel = filtered.filter((t) => !t.parentId)
      const idx = topLevel.findIndex((t) => t.id === selected?.id)
      switch (e.key.toLowerCase()) {
        case "j":
          if (idx < topLevel.length - 1) setSelectedTaskId(topLevel[idx + 1].id)
          e.preventDefault()
          break
        case "k":
          if (idx > 0) setSelectedTaskId(topLevel[idx - 1].id)
          e.preventDefault()
          break
        case "a":
          if (selected?.status === "needs_approval") {
            handleApprove(selected.id)
            e.preventDefault()
          }
          break
        case "x":
          if (selected?.status === "needs_approval") {
            handleReject(selected.id)
            e.preventDefault()
          }
          break
        case "v":
          if (selected?.status === "blocked") {
            handleTryVoice(selected.id)
            e.preventDefault()
          }
          break
        case "e":
          if (selected?.status === "blocked") {
            handleEscalate(selected.id)
            e.preventDefault()
          }
          break
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [viewMode, filtered, selected])

  const handleBatchApprove = (predicate: (t: AgentTask) => boolean) => {
    const matched = filtered.filter(predicate)
    setTasks((curr) =>
      curr.map((t) =>
        matched.includes(t) ? { ...t, status: "done" as TaskStatus, age: "just now" } : t,
      ),
    )
    toast.success(`Approved ${matched.length} tasks in batch`)
  }

  const handleApproveNextN = (n: number) => {
    const pending = filtered
      .filter((t) => t.status === "needs_approval" && !t.parentId)
      .slice(0, n)
    if (pending.length === 0) {
      toast.message("Nothing in the queue to approve")
      return
    }
    setTasks((curr) =>
      curr.map((t) =>
        pending.some((p) => p.id === t.id)
          ? { ...t, status: "done" as TaskStatus, age: "just now" }
          : t,
      ),
    )
    toast.success(`Approved ${pending.length} task${pending.length === 1 ? "" : "s"}`)
  }

  const clearFilters = () => {
    setAgentFilters([])
    setCaseFilters([])
    setRiskFilters([])
    setStatusFilters([])
    setQuery("")
    setCaseSearch("")
  }
  const activeFilterCount =
    agentFilters.length +
    caseFilters.length +
    riskFilters.length +
    statusFilters.length +
    (query.trim() ? 1 : 0)

  const filteredCases = allCases.filter((c) =>
    caseSearch
      ? c.name.toLowerCase().includes(caseSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(caseSearch.toLowerCase())
      : true,
  )
  const needsReviewCount = filtered.filter(
    (t) => t.status === "needs_approval" && !t.parentId,
  ).length
  const autoApprovalRate = Math.round(
    (tasks.filter((t) => t.status === "done").length /
      Math.max(1, tasks.filter((t) => t.status !== "in_progress").length)) *
      100,
  )

  if (viewMode === "cases") {
    return (
      <OldCaseListView
        tasks={tasks}
        cases={allCases}
        onSwitchBack={() => setViewMode("list")}
      />
    )
  }

  const toggleParent = (id: string) => {
    setExpandedParents((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* INTERVENTION BANNER — loud when humans are needed */}
      {(counts.blocked > 0 || counts.needs_approval > 0) && (
        <InterventionBanner
          blocked={counts.blocked}
          needsApproval={counts.needs_approval}
          onReviewBlocked={() => {
            setStatusFilters(["blocked"])
            // jump to first blocked
            const firstBlocked = filtered.find((t) => t.status === "blocked")
            if (firstBlocked) setSelectedTaskId(firstBlocked.id)
          }}
          onReviewApproval={() => {
            setStatusFilters(["needs_approval"])
            const firstApproval = filtered.find(
              (t) => t.status === "needs_approval",
            )
            if (firstApproval) setSelectedTaskId(firstApproval.id)
          }}
        />
      )}

      {/* Breadcrumb header */}
      <header className="flex h-12 items-center gap-2 border-border border-b bg-background px-6 shrink-0">
        <Hand className="size-4 text-muted-foreground" />
        <span className="font-semibold text-foreground text-sm">Tasks</span>
        <span className="text-muted-foreground/50 text-sm">/</span>
        <span className="text-muted-foreground text-xs">
          showing {filtered.length} of {tasks.length}
        </span>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
          {(
            [
              ["list", "List", Stack],
              ["board", "Board", Tray],
              ["cases", "Cases", Briefcase],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => setViewMode(k as typeof viewMode)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2 py-1 font-medium text-xs transition-colors",
                viewMode === k
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" weight="bold" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Stat strip — View dropdown + icon-prefixed metrics + warning */}
      <div className="bg-background px-6 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background pl-2 pr-3 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Stack className="size-3.5" />
                View:{" "}
                {groupBy === "status"
                  ? "Status"
                  : groupBy === "case"
                    ? "Case"
                    : groupBy === "agent"
                      ? "Agent"
                      : "Task type"}
                <CaretDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Group by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(
                [
                  ["status", "Status"],
                  ["case", "Case"],
                  ["agent", "Agent"],
                  ["type", "Task type"],
                ] as const
              ).map(([k, label]) => (
                <DropdownMenuItem key={k} onClick={() => setGroupBy(k)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-4">
            <StatMetric
              icon={Lightning}
              label={`${filtered.length} Tasks`}
            />
            <StatMetric
              icon={Sparkle}
              label={`${autoApprovalRate}% Auto-approval rate`}
            />
            {needsReviewCount > 0 && (
              <StatMetric
                icon={Warning}
                label={`${needsReviewCount} Need Review`}
                tone="warning"
              />
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Lightning className="size-3.5" />
                  Batch
                  <CaretDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Batch approve</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    handleBatchApprove(
                      (t) =>
                        t.status === "needs_approval" &&
                        t.patternId === "rec-std",
                    )
                  }
                >
                  Approve all standard records
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleBatchApprove(
                      (t) =>
                        t.status === "needs_approval" &&
                        t.patternId === "lien-ack",
                    )
                  }
                >
                  Approve all standard liens
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleBatchApprove(
                      (t) => t.status === "needs_approval" && t.risk === "low",
                    )
                  }
                >
                  Approve all low-risk
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => handleApproveNextN(5)}>
              <Lightning weight="fill" className="size-3.5" />
              Approve next 5
            </Button>
          </div>
        </div>
      </div>

      {/* Body — filter card + content card + decision panel */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden px-6 pb-4">
        {viewMode === "list" && (
          <FilterCard
            tasks={tasks}
            statusFilters={statusFilters}
            onStatusFilters={setStatusFilters}
            agentFilters={agentFilters}
            onAgentFilters={setAgentFilters}
            caseFilters={caseFilters}
            onCaseFilters={setCaseFilters}
            riskFilters={riskFilters}
            onRiskFilters={setRiskFilters}
            allCases={filteredCases}
            caseSearch={caseSearch}
            onCaseSearch={setCaseSearch}
            query={query}
            onQuery={setQuery}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          />
        )}
        <div className="flex min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-background">
          {viewMode === "list" ? (
            <TaskListView
              tasks={filtered}
              groupBy={groupBy}
              selectedId={selected?.id}
              onSelect={setSelectedTaskId}
              expandedParents={expandedParents}
              onToggleParent={toggleParent}
              onApprove={handleApprove}
            />
          ) : (
            <TaskBoard
              tasks={filtered}
              groupBy={groupBy}
              selectedId={selected?.id}
              onSelect={setSelectedTaskId}
            />
          )}
        </div>
        {selected && (
          <div className="flex w-[340px] shrink-0 overflow-hidden rounded-xl border border-border bg-background">
            <DecisionPanel
              task={selected}
              onApprove={() => handleApprove(selected.id)}
              onReject={() => handleReject(selected.id)}
              queueIndex={filtered
                .filter((t) => t.status === "needs_approval")
                .findIndex((t) => t.id === selected.id)}
              queueTotal={counts.needs_approval}
            />
          </div>
        )}
      </div>

      {/* Bottom dock — session brief */}
      <SessionDock
        clearedToday={counts.done}
        remaining={counts.needs_approval}
      />
    </div>
  )
}


function RiskDot({ risk }: { risk: TaskRisk }) {
  const tone = {
    low: "bg-success",
    medium: "bg-warning",
    high: "bg-destructive",
  }[risk]
  return <span className={cn("inline-block size-2 rounded-full", tone)} />
}

// ── Task board ────────────────────────────────────────────────────────

const STATUS_COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: "needs_approval", label: "Needs approval", tone: "border-warning/40 bg-warning-muted/30" },
  { id: "in_progress", label: "In progress", tone: "border-primary/30 bg-primary/5" },
  { id: "blocked", label: "Blocked", tone: "border-destructive/30 bg-danger-muted/30" },
  { id: "done", label: "Done today", tone: "border-success/30 bg-success-muted/20" },
]

function TaskBoard({
  tasks,
  groupBy,
  selectedId,
  onSelect,
}: {
  tasks: AgentTask[]
  groupBy: GroupBy
  selectedId?: string
  onSelect: (id: string) => void
}) {
  if (groupBy === "status") {
    return (
      <div className="flex min-w-0 flex-1 gap-3 overflow-auto bg-muted/30 p-4">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <BoardColumn
              key={col.id}
              title={col.label}
              accentClass={col.tone}
              count={colTasks.length}
            >
              {colTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  selected={selectedId === t.id}
                  onClick={() => onSelect(t.id)}
                />
              ))}
            </BoardColumn>
          )
        })}
      </div>
    )
  }

  // Group by case / agent / type
  const groups = new Map<string, AgentTask[]>()
  for (const t of tasks) {
    const key =
      groupBy === "case"
        ? `${t.caseId} · ${t.caseName}`
        : groupBy === "agent"
          ? TASK_AGENTS[t.agentId]?.label ?? t.agentId
          : t.type
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)?.push(t)
  }

  return (
    <div className="flex min-w-0 flex-1 gap-3 overflow-auto bg-muted/30 p-4">
      {Array.from(groups.entries()).map(([key, items]) => (
        <BoardColumn
          key={key}
          title={key}
          accentClass="border-border"
          count={items.length}
        >
          {items.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              selected={selectedId === t.id}
              onClick={() => onSelect(t.id)}
              showStatus
            />
          ))}
        </BoardColumn>
      ))}
    </div>
  )
}

function BoardColumn({
  title,
  count,
  accentClass,
  children,
}: {
  title: string
  count: number
  accentClass: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <header
        className={cn(
          "flex items-center gap-2 rounded-lg border-l-2 bg-background px-3 py-2",
          accentClass,
        )}
      >
        <h3 className="flex-1 truncate font-semibold text-foreground text-sm">
          {title}
        </h3>
        <span className="rounded bg-muted px-1.5 text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      </header>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function TaskCard({
  task,
  selected,
  onClick,
  showStatus,
}: {
  task: AgentTask
  selected: boolean
  onClick: () => void
  showStatus?: boolean
}) {
  const agent = TASK_AGENTS[task.agentId]
  const AgentIcon = agent?.icon ?? Robot
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col gap-1.5 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded-md"
          style={{
            backgroundColor: `color-mix(in oklch, var(${agent?.colorVar ?? "--chart-1"}) 18%, transparent)`,
            color: `var(${agent?.colorVar ?? "--chart-1"})`,
          }}
        >
          <AgentIcon className="size-3" weight="bold" />
        </span>
        <span className="truncate text-muted-foreground text-xs">
          {agent?.label}
        </span>
        <span className="ml-auto text-muted-foreground text-xs">{task.age}</span>
      </div>
      <p className="font-medium text-foreground text-sm leading-tight">
        {task.title}
      </p>
      <p className="line-clamp-2 text-muted-foreground text-xs leading-snug">
        {task.outcome}
      </p>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="font-medium">
          <Briefcase className="size-3" />
          {task.caseId}
        </Badge>
        {task.stakes && task.stakes !== "$0" && task.stakes !== "—" && (
          <Badge variant="outline" className="font-medium">
            {task.stakes}
          </Badge>
        )}
        <RiskBadge risk={task.risk} />
        {task.patternLabel && (
          <Badge className="bg-primary/10 font-medium text-primary">
            <Sparkle weight="fill" className="size-3" />
            {task.patternLabel}
          </Badge>
        )}
        {showStatus && <StatusChip status={task.status} />}
      </div>
    </button>
  )
}

function RiskBadge({ risk }: { risk: TaskRisk }) {
  if (risk === "low") return null
  const tone =
    risk === "high"
      ? "bg-danger-muted text-destructive"
      : "bg-warning-muted text-warning"
  const label = risk === "high" ? "High risk" : "Medium"
  return (
    <Badge className={cn(tone, "font-medium")}>
      <Warning className="size-3" weight="fill" />
      {label}
    </Badge>
  )
}

function StatusChip({ status }: { status: TaskStatus }) {
  const map = {
    needs_approval: { label: "Needs approval", tone: "bg-warning-muted text-warning" },
    in_progress: { label: "In progress", tone: "bg-primary/10 text-primary" },
    blocked: { label: "Blocked", tone: "bg-danger-muted text-destructive" },
    done: { label: "Done", tone: "bg-success-muted text-success" },
  }[status]
  return <Badge className={cn(map.tone, "font-medium")}>{map.label}</Badge>
}

// ── Decision panel (right slide-over) ─────────────────────────────────

function DecisionPanel({
  task,
  onApprove,
  onReject,
  queueIndex,
  queueTotal,
}: {
  task: AgentTask
  onApprove: () => void
  onReject: () => void
  queueIndex: number
  queueTotal: number
}) {
  const agent = TASK_AGENTS[task.agentId]
  const AgentIcon = agent?.icon ?? Robot
  const isApproval = task.status === "needs_approval"
  const isBlocked = task.status === "blocked"

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-y-auto bg-background">
      <header className="flex items-start gap-3 border-border border-b px-4 py-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in oklch, var(${agent?.colorVar ?? "--chart-1"}) 18%, transparent)`,
            color: `var(${agent?.colorVar ?? "--chart-1"})`,
          }}
        >
          <AgentIcon className="size-4" weight="bold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{agent?.label}</p>
          <p className="font-semibold text-foreground text-sm">{task.title}</p>
        </div>
        {isApproval && queueTotal > 0 && (
          <div className="text-right text-muted-foreground text-xs">
            <p className="tabular-nums">
              {queueIndex + 1} / {queueTotal}
            </p>
            <p>in queue</p>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-3 px-4 py-3">
        {/* Proposed outcome */}
        <section>
          <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            {isBlocked ? "Where we're stuck" : "Proposed outcome"}
          </p>
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-foreground text-sm leading-relaxed">
            {task.outcome}
          </p>
        </section>

        {/* Reasoning */}
        <section>
          <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Why
          </p>
          <p className="text-foreground text-sm leading-relaxed">
            {task.reasoning}
          </p>
        </section>

        {/* Case context */}
        <section>
          <p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Context
          </p>
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">{task.caseId}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{task.caseName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="font-medium">
                {task.type}
              </Badge>
              {task.stakes && task.stakes !== "—" && (
                <Badge variant="outline" className="font-medium">
                  Stakes: {task.stakes}
                </Badge>
              )}
              <RiskBadge risk={task.risk} />
              {task.patternLabel && (
                <Badge className="bg-primary/10 font-medium text-primary">
                  <Sparkle weight="fill" className="size-3" />
                  {task.patternLabel}
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Open in case (deep link) */}
        <Button variant="outline" size="sm" className="justify-start">
          <Briefcase />
          Open {task.caseId} in FileFlow
        </Button>
      </div>

      {/* Decision footer */}
      <footer className="mt-auto flex flex-col gap-2 border-border border-t bg-muted/20 px-4 py-3">
        {isApproval && (
          <>
            <div className="flex items-center gap-1.5">
              <Button size="sm" className="flex-1 justify-center" onClick={onApprove}>
                <Check weight="bold" />
                Approve & send
              </Button>
              <Button size="sm" variant="outline" aria-label="Edit">
                <PencilSimple />
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Send back"
              >
                <ArrowCounterClockwise />
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Reject"
                className="text-muted-foreground hover:text-destructive"
                onClick={onReject}
              >
                <X />
              </Button>
            </div>
          </>
        )}
        {isBlocked && (
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="flex-1 justify-center bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Phone weight="fill" />
              Try voice
            </Button>
            <Button size="sm" variant="outline" className="flex-1 justify-center">
              <UserCheck />
              Escalate
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-destructive"
            >
              <X />
            </Button>
          </div>
        )}
        {task.status === "in_progress" && (
          <Button size="sm" variant="outline" className="justify-center">
            <Pause />
            Pause agent
          </Button>
        )}
        {task.status === "done" && (
          <p className="text-center text-muted-foreground text-sm">
            Done. No action needed.
          </p>
        )}
      </footer>
    </aside>
  )
}

// ── Session dock ──────────────────────────────────────────────────────

function SessionDock({
  clearedToday,
  remaining,
}: {
  clearedToday: number
  remaining: number
}) {
  const eta = remaining > 0 ? `~${Math.max(1, Math.round(remaining * 0.6))} min to clear` : "Inbox zero"
  return (
    <footer className="flex flex-wrap items-center gap-3 border-border border-t bg-background px-6 py-2 text-sm">
      <span className="flex items-center gap-2">
        <span className="size-1.5 animate-pulse rounded-full bg-success" />
        <span className="text-foreground">
          <span className="font-semibold tabular-nums">{clearedToday}</span>
          <span className="text-muted-foreground"> cleared · </span>
          <span className="font-semibold tabular-nums">{remaining}</span>
          <span className="text-muted-foreground"> left</span>
        </span>
      </span>
      <span className="text-muted-foreground text-xs">·</span>
      <span className="text-muted-foreground text-xs">{eta}</span>
      <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
        <ArrowClockwise className="size-3.5" />
        Refresh
      </Button>
    </footer>
  )
}

// ── Old case-list fallback view (transition aid) ──────────────────────

function OldCaseListView({
  tasks,
  cases,
  onSwitchBack,
}: {
  tasks: AgentTask[]
  cases: { id: string; name: string }[]
  onSwitchBack: () => void
}) {
  const byCase = new Map<string, AgentTask[]>()
  for (const t of tasks) {
    if (!byCase.has(t.caseId)) byCase.set(t.caseId, [])
    byCase.get(t.caseId)?.push(t)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-border border-b bg-background px-6 py-3">
        <h2 className="font-semibold text-base text-foreground">Cases · old view</h2>
        <p className="text-muted-foreground text-xs">
          One row per case, with the same task data grouped by matter
        </p>
        <div className="ml-auto">
          <ToggleSwitch
            id="old-view-back"
            label="Switch to task board"
            checked={false}
            onChange={onSwitchBack}
          />
        </div>
      </header>
      <div className="flex-1 overflow-auto bg-background px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case</TableHead>
              <TableHead>Needs you</TableHead>
              <TableHead>In flight</TableHead>
              <TableHead>Blocked</TableHead>
              <TableHead>Done today</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => {
              const list = byCase.get(c.id) ?? []
              const na = list.filter((t) => t.status === "needs_approval").length
              const ip = list.filter((t) => t.status === "in_progress").length
              const bl = list.filter((t) => t.status === "blocked").length
              const dn = list.filter((t) => t.status === "done").length
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {c.id}
                      </Badge>
                      <span className="text-foreground text-sm">{c.name}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {na > 0 ? (
                      <Badge className="bg-warning-muted font-medium text-warning">
                        {na}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ip > 0 ? (
                      <span className="text-foreground text-sm tabular-nums">{ip}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bl > 0 ? (
                      <Badge className="bg-danger-muted font-medium text-destructive">
                        {bl}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm tabular-nums">{dn}</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ── List view (LaunchDarkly-inspired scannable rows + RTS mission-control lanes) ──

function TaskListView({
  tasks,
  groupBy,
  selectedId,
  onSelect,
  expandedParents,
  onToggleParent,
  onApprove,
}: {
  tasks: AgentTask[]
  groupBy: GroupBy
  selectedId?: string
  onSelect: (id: string) => void
  expandedParents: Set<string>
  onToggleParent: (id: string) => void
  onApprove: (id: string) => void
}) {
  // Split into parents and children
  const topLevel = tasks.filter((t) => !t.parentId)
  const childrenOf = (id: string) => tasks.filter((t) => t.parentId === id)

  // Group top-level by status (default) or by case/agent/type
  const groups = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_COLUMNS.map((s) => ({
        key: s.id,
        label: s.label,
        items: topLevel.filter((t) => t.status === s.id),
      })).filter((g) => g.items.length > 0)
    }
    const map = new Map<string, AgentTask[]>()
    for (const t of topLevel) {
      const key =
        groupBy === "case"
          ? `${t.caseId} · ${t.caseName}`
          : groupBy === "agent"
            ? TASK_AGENTS[t.agentId]?.label ?? t.agentId
            : t.type
      if (!map.has(key)) map.set(key, [])
      map.get(key)?.push(t)
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: key,
      items,
    }))
  }, [topLevel, groupBy])

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-background">
        {groups.map((g) => (
          <section key={g.key}>
            <header className="sticky top-0 z-10 flex items-center gap-2 border-border/60 border-b bg-background/95 backdrop-blur px-4 py-2.5">
              {g.key === "blocked" && (
                <span className="size-1.5 rounded-full bg-destructive" />
              )}
              <span
                className={cn(
                  "font-semibold text-xs uppercase tracking-wide",
                  g.key === "blocked" ? "text-destructive" : "text-foreground",
                )}
              >
                {g.label}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {g.items.length}
              </span>
            </header>
            {g.items.map((t) => {
              const children = childrenOf(t.id)
              const isExpanded = expandedParents.has(t.id) && children.length > 0
              return (
                <div key={t.id}>
                  <ListRow
                    task={t}
                    childCount={children.length}
                    selected={selectedId === t.id}
                    expanded={isExpanded}
                    onSelect={() => onSelect(t.id)}
                    onToggleExpand={() => onToggleParent(t.id)}
                    onApprove={() => onApprove(t.id)}
                  />
                  {isExpanded &&
                    children.map((c) => (
                      <ListRow
                        key={c.id}
                        task={c}
                        childCount={0}
                        selected={selectedId === c.id}
                        expanded={false}
                        nested
                        onSelect={() => onSelect(c.id)}
                        onToggleExpand={() => {}}
                        onApprove={() => onApprove(c.id)}
                      />
                    ))}
                </div>
              )
            })}
            {g.items.length === 0 && (
              <p className="px-6 py-4 text-muted-foreground text-sm">
                Nothing here.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}


function ListRow({
  task,
  childCount,
  selected,
  expanded,
  nested,
  onSelect,
  onToggleExpand,
  onApprove,
}: {
  task: AgentTask
  childCount: number
  selected: boolean
  expanded: boolean
  nested?: boolean
  onSelect: () => void
  onToggleExpand: () => void
  onApprove: () => void
}) {
  const agent = TASK_AGENTS[task.agentId]
  const isParent = childCount > 0
  const isBlocked = task.status === "blocked"

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-3 border-border/60 border-b px-4 py-2.5 transition-colors last:border-b-0",
        selected ? "bg-accent" : "hover:bg-muted/30",
        nested && "bg-muted/10 pl-12",
        // STUCK — quiet but unmistakable: red left bar only, plus red outcome text
        isBlocked &&
          !selected &&
          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-destructive",
      )}
      onClick={onSelect}
    >
      {/* Leading slot — caret for parents, agent tile otherwise */}
      {isParent ? (
        <button
          type="button"
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {expanded ? <CaretDown className="size-3.5" /> : <CaretRight className="size-3.5" />}
        </button>
      ) : nested ? (
        <span className="inline-flex size-7 shrink-0 items-center justify-center">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
        </span>
      ) : (
        <AgentTile agent={agent} status={task.status} />
      )}

      {/* Main content — two clean lines */}
      <div className="min-w-0 flex-1">
        {/* Line 1: title + inline emphasis (stakes / risk) */}
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-foreground text-sm leading-snug">
            {task.title}
          </p>
          {task.risk === "high" && (
            <Warning
              weight="fill"
              className="size-3.5 shrink-0 text-destructive"
              aria-label="High risk"
            />
          )}
          {task.stakes && task.stakes !== "$0" && task.stakes !== "—" && (
            <span
              className={cn(
                "shrink-0 font-medium text-xs tabular-nums",
                task.risk === "high" ? "text-destructive" : "text-foreground",
              )}
            >
              {task.stakes}
            </span>
          )}
          {task.patternLabel && (
            <Sparkle
              weight="fill"
              className="size-3.5 shrink-0 text-primary"
              aria-label={`Brain pattern: ${task.patternLabel}`}
            />
          )}
          {isParent && (
            <span className="shrink-0 text-muted-foreground text-xs">
              · {childCount} steps
            </span>
          )}
        </div>
        {/* Line 2: subtitle — case + outcome */}
        <p
          className={cn(
            "mt-0.5 line-clamp-1 text-xs leading-snug",
            isBlocked ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <span className="font-mono uppercase">{task.caseId}</span>
          <span className="mx-1">·</span>
          <span>{task.outcome}</span>
        </p>
      </div>

      {/* Trailing meta — age + actions */}
      <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
        {task.age}
      </span>
      <RightZone task={task} nested={!!nested} onApprove={onApprove} />
    </div>
  )
}

/** Square tile with the agent's brand color tint + first-letter glyph or icon */
function AgentTile({
  agent,
  status,
}: {
  agent?: TaskAgent
  status: TaskStatus
}) {
  if (!agent) {
    return (
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Robot className="size-4" weight="bold" />
      </span>
    )
  }
  const Icon = agent.icon
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className="inline-flex size-8 items-center justify-center rounded-md"
        style={{
          backgroundColor: `color-mix(in oklch, var(${agent.colorVar}) 18%, transparent)`,
          color: `var(${agent.colorVar})`,
        }}
      >
        <Icon className="size-4" weight="bold" />
      </span>
      {/* Status pip overlaid bottom-right */}
      <StatusPip status={status} />
    </span>
  )
}

function StatusPip({ status }: { status: TaskStatus }) {
  const tone = {
    needs_approval: "bg-warning",
    in_progress: "bg-primary animate-pulse",
    blocked: "bg-destructive",
    done: "bg-success",
  }[status]
  return (
    <span
      className={cn(
        "-bottom-0.5 -right-0.5 absolute size-2.5 rounded-full ring-2 ring-background",
        tone,
      )}
    />
  )
}

function RightZone({
  task,
  nested,
  onApprove,
}: {
  task: AgentTask
  nested: boolean
  onApprove: () => void
}) {
  if (task.status === "in_progress") {
    const pct = parseProgress(task.outcome)
    return (
      <div className="flex w-[180px] shrink-0 items-center justify-end gap-2">
        {pct !== null ? (
          <>
            <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-medium text-primary text-xs tabular-nums">
              {pct}%
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 text-primary text-xs font-medium">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Running
          </span>
        )}
      </div>
    )
  }

  if (task.status === "blocked") {
    return (
      <div className="flex w-[260px] shrink-0 items-center justify-end gap-1">
        {!nested && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-danger-muted hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
              title="Try voice outreach (V)"
            >
              <Phone className="size-3.5" weight="bold" />
              Try voice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              title="Escalate to attorney (E)"
            >
              <UserCheck className="size-3.5" />
              Escalate
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-destructive"
              onClick={(e) => e.stopPropagation()}
              title="Dismiss (X)"
            >
              <X />
            </Button>
          </>
        )}
      </div>
    )
  }

  if (task.status === "done") {
    return (
      <div className="flex w-[180px] shrink-0 items-center justify-end gap-1.5">
        <CheckCircleIcon weight="fill" className="size-3.5 text-success" />
        <span className="text-muted-foreground text-xs">Done</span>
      </div>
    )
  }

  // needs_approval — the main triage state
  return (
    <div className="flex w-[220px] shrink-0 items-center justify-end gap-1">
      {!nested && (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onApprove()
          }}
          title="Approve & send (A)"
        >
          <Check weight="bold" className="size-3" />
          Approve
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Edit"
        title="Edit before sending (E)"
        onClick={(e) => e.stopPropagation()}
      >
        <PencilSimple />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Send back"
        title="Send back to agent (S)"
        onClick={(e) => e.stopPropagation()}
      >
        <ArrowCounterClockwise />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Reject"
        title="Reject (X)"
        className="text-muted-foreground hover:text-destructive"
        onClick={(e) => e.stopPropagation()}
      >
        <X />
      </Button>
    </div>
  )
}

function StatusDot({ status }: { status: TaskStatus }) {
  if (status === "needs_approval") {
    return <span className="size-2 rounded-full bg-warning" />
  }
  if (status === "in_progress") {
    return <span className="size-2 animate-pulse rounded-full bg-primary" />
  }
  if (status === "blocked") {
    return <span className="size-2 rounded-full bg-destructive" />
  }
  return <CheckCircleIcon weight="fill" className="size-3.5 text-success" />
}

function AgentAvatar({ agent }: { agent?: TaskAgent }) {
  if (!agent) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-muted font-semibold text-[9px] text-muted-foreground">
        ?
      </span>
    )
  }
  const initials = agent.label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <span
      className="inline-flex size-5 items-center justify-center rounded-full font-semibold text-[9px]"
      style={{
        backgroundColor: `color-mix(in oklch, var(${agent.colorVar}) 20%, transparent)`,
        color: `var(${agent.colorVar})`,
      }}
    >
      {initials}
    </span>
  )
}

function parseProgress(s: string): number | null {
  const m = s.match(/(\d{1,3})%/)
  return m ? Number(m[1]) : null
}


// ── Stat metric (icon + label inline, used in the top stat strip) ─────

function StatMetric({
  icon: Icon,
  label,
  tone,
}: {
  icon: Icon
  label: string
  tone?: "warning" | "default"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        tone === "warning" ? "text-warning font-medium" : "text-foreground",
      )}
    >
      <Icon
        weight={tone === "warning" ? "fill" : "bold"}
        className={cn(
          "size-4",
          tone === "warning" ? "text-warning" : "text-muted-foreground",
        )}
      />
      {label}
    </span>
  )
}

// ── Filter card (Figma 269:10568 pattern — checkbox sections) ─────────

function FilterCard({
  tasks,
  statusFilters,
  onStatusFilters,
  agentFilters,
  onAgentFilters,
  caseFilters,
  onCaseFilters,
  riskFilters,
  onRiskFilters,
  allCases,
  caseSearch,
  onCaseSearch,
  query,
  onQuery,
  activeFilterCount,
  onClearFilters,
}: {
  tasks: AgentTask[]
  statusFilters: TaskStatus[]
  onStatusFilters: (v: TaskStatus[]) => void
  agentFilters: string[]
  onAgentFilters: (v: string[]) => void
  caseFilters: string[]
  onCaseFilters: (v: string[]) => void
  riskFilters: TaskRisk[]
  onRiskFilters: (v: TaskRisk[]) => void
  allCases: { id: string; name: string }[]
  caseSearch: string
  onCaseSearch: (v: string) => void
  query: string
  onQuery: (v: string) => void
  activeFilterCount: number
  onClearFilters: () => void
}) {
  const toggle = <T extends string>(
    list: T[],
    val: T,
    setter: (v: T[]) => void,
  ) => {
    if (list.includes(val)) setter(list.filter((x) => x !== val))
    else setter([...list, val])
  }

  const statusCounts = useMemo(() => {
    const m = { needs_approval: 0, in_progress: 0, blocked: 0, done: 0 }
    for (const t of tasks) m[t.status]++
    return m
  }, [tasks])
  const agentCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of tasks) m.set(t.agentId, (m.get(t.agentId) ?? 0) + 1)
    return m
  }, [tasks])
  const riskCounts = useMemo(() => {
    const m: Record<TaskRisk, number> = { low: 0, medium: 0, high: 0 }
    for (const t of tasks) m[t.risk]++
    return m
  }, [tasks])

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto rounded-xl border border-border bg-background p-4">
      <header className="mb-3 flex items-center justify-between px-1">
        <h3 className="font-semibold text-foreground text-sm">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-muted-foreground text-xs transition-colors hover:text-foreground"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </header>

      <div className="mb-4">
        <DebouncedSearch
          value={query}
          onChange={onQuery}
          placeholder="Search tasks…"
        />
      </div>

      <FilterSection label="Status">
        {STATUS_COLUMNS.map((s) => (
          <FilterCheckbox
            key={s.id}
            label={s.label}
            checked={statusFilters.includes(s.id)}
            count={statusCounts[s.id]}
            onChange={() => toggle(statusFilters, s.id, onStatusFilters)}
            leading={<StatusDot status={s.id} />}
          />
        ))}
      </FilterSection>

      <FilterSection label="Agents">
        {Object.values(TASK_AGENTS).map((a) => (
          <FilterCheckbox
            key={a.id}
            label={a.label}
            checked={agentFilters.includes(a.id)}
            count={agentCounts.get(a.id)}
            onChange={() => toggle(agentFilters, a.id, onAgentFilters)}
            leading={<AgentAvatar agent={a} />}
          />
        ))}
      </FilterSection>

      <FilterSection label="Risk">
        {(["high", "medium", "low"] as const).map((r) => (
          <FilterCheckbox
            key={r}
            label={r === "low" ? "Low" : r === "medium" ? "Medium" : "High"}
            checked={riskFilters.includes(r)}
            count={riskCounts[r]}
            onChange={() => toggle(riskFilters, r, onRiskFilters)}
            leading={<RiskDot risk={r} />}
          />
        ))}
      </FilterSection>

      <FilterSection label="Cases">
        <div className="mb-2">
          <DebouncedSearch
            value={caseSearch}
            onChange={onCaseSearch}
            placeholder="Search cases or IDs…"
          />
        </div>
        {allCases.length === 0 ? (
          <p className="px-2 py-2 text-muted-foreground text-xs">
            No cases match.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {allCases.map((c) => (
              <FilterCheckbox
                key={c.id}
                label={c.name}
                checked={caseFilters.includes(c.id)}
                onChange={() => toggle(caseFilters, c.id, onCaseFilters)}
              />
            ))}
          </div>
        )}
      </FilterSection>
    </aside>
  )
}

function FilterSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-4 last:mb-0">
      <h4 className="mb-2 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </h4>
      <div className="flex flex-col gap-0.5">{children}</div>
    </section>
  )
}

function FilterCheckbox({
  label,
  hint,
  checked,
  count,
  onChange,
  leading,
}: {
  label: string
  hint?: string
  checked: boolean
  count?: number
  onChange: () => void
  leading?: React.ReactNode
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60",
        checked && "bg-accent/40",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="size-4 shrink-0"
      />
      {leading}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          checked ? "font-medium text-foreground" : "text-foreground",
        )}
      >
        {label}
      </span>
      {hint && (
        <span className="shrink-0 font-mono text-muted-foreground text-xs">
          {hint}
        </span>
      )}
      {count !== undefined && (
        <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
          {count}
        </span>
      )}
    </label>
  )
}

// ── Intervention banner — loud signal that humans are needed ──────────

function InterventionBanner({
  blocked,
  needsApproval,
  onReviewBlocked,
  onReviewApproval,
}: {
  blocked: number
  needsApproval: number
  onReviewBlocked: () => void
  onReviewApproval: () => void
}) {
  const hasBlocked = blocked > 0
  if (!hasBlocked && needsApproval === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-3 border-border border-b bg-background px-6 py-2 text-sm">
      {hasBlocked && (
        <span className="inline-flex items-center gap-1.5 text-destructive">
          <span className="size-1.5 rounded-full bg-destructive" />
          <span className="font-semibold tabular-nums">{blocked}</span>
          <span className="font-medium">stuck</span>
        </span>
      )}
      {hasBlocked && needsApproval > 0 && (
        <span className="text-muted-foreground/40">·</span>
      )}
      {needsApproval > 0 && (
        <span className="inline-flex items-center gap-1.5 text-warning">
          <span className="size-1.5 rounded-full bg-warning" />
          <span className="font-semibold tabular-nums">{needsApproval}</span>
          <span className="font-medium">waiting for review</span>
        </span>
      )}
      <div className="ml-auto flex items-center gap-1">
        {hasBlocked && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-danger-muted hover:text-destructive"
            onClick={onReviewBlocked}
          >
            Unblock →
          </Button>
        )}
        {needsApproval > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={onReviewApproval}
          >
            Review →
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Hash routing ──────────────────────────────────────────────────────
// Routes:
//   #/tasks            → app mode, Tasks page (default landing)
//   #/inbox            → app mode, Inbox
//   #/cases            → app mode, Cases
//   #/sessions         → app mode, Sessions
//   #/settings         → settings mode (defaults to voice-agent)
//   #/settings/<id>    → settings mode, specific page
//                        ids: voice-agent · ai-agents · agent-workflows ·
//                             acct-general · org-general · team · fileflow ·
//                             lithub · api-keys · sharing

const VALID_APP_IDS: AppNavId[] = [
  "tasks",
  "fileflow-app",
  "cases",
  "sessions",
]
const APP_ID_ALIAS: Record<string, AppNavId> = {
  inbox: "fileflow-app",
}

function parseHashRoute(hash: string): {
  mode: AppMode
  appId?: AppNavId
  settingsId?: string
} {
  // Strip leading "#/" or "#"
  const clean = hash.replace(/^#\/?/, "")
  if (!clean) return { mode: "app", appId: "tasks" }

  const [first, second] = clean.split("/")
  if (first === "settings") {
    return { mode: "settings", settingsId: second || "voice-agent" }
  }

  const aliased = APP_ID_ALIAS[first]
  if (aliased) return { mode: "app", appId: aliased }

  if ((VALID_APP_IDS as string[]).includes(first)) {
    return { mode: "app", appId: first as AppNavId }
  }

  return { mode: "app", appId: "tasks" }
}

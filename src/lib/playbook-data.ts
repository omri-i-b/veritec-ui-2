import type { ComponentType } from "react"
import {
  FileText,
  Notepad,
  Timer,
  Calculator,
  Scales,
  Gavel,
  PhoneCall,
  UsersThree,
  ChartLineUp,
  Microphone,
} from "@phosphor-icons/react"

export type FieldType = "text" | "number" | "date" | "file" | "case-ref" | "enum" | "list" | "kb-ref"

export interface Field {
  id: string
  name: string
  type: FieldType
  required?: boolean
  description?: string
  /** If type is "enum" or "list", options shown as choices */
  options?: string[]
  /** Default value or sample for test panel */
  sample?: string
}

export type StepType = "fetch" | "prompt" | "extract" | "condition"

export interface Step {
  id: string
  type: StepType
  name: string
  detail: string
  expanded?: boolean
  model?: string
}

export interface PlaybookDef {
  id: string
  name: string
  description: string
  category: string
  status: "Published" | "Draft"
  version: string
  icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>
  iconColor: string
  iconBg: string
  totalRuns: number
  lastRun: string
  inputs: Field[]
  steps: Step[]
  outputs: Field[]
}

export const PLAYBOOK_DEFS: Record<string, PlaybookDef> = {
  "medical-records-summary": {
    id: "medical-records-summary",
    name: "Medical Records Summary",
    description:
      "Analyzes uploaded medical records, extracts chronological treatment history, and flags gaps in documentation.",
    category: "Discovery",
    status: "Published",
    version: "v8",
    icon: FileText,
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    totalRuns: 1847,
    lastRun: "12s ago",
    inputs: [
      { id: "in_1", name: "Case", type: "case-ref", required: true, description: "The case this run is associated with", sample: "CVSA-1189" },
      { id: "in_2", name: "Records", type: "file", required: true, description: "Medical records PDFs to analyze", sample: "42 PDFs (18.2 MB)" },
      { id: "in_3", name: "Plaintiff", type: "text", description: "Plaintiff name (auto-filled from Case if empty)", sample: "Jane Doe" },
    ],
    steps: [
      { id: "s1", type: "fetch", name: "Fetch records", detail: "Load all PDFs from {{Records}} and extract text" },
      {
        id: "s2",
        type: "prompt",
        name: "Analyze with LLM",
        detail:
          "Analyze the medical records for {{Case}} (plaintiff: {{Plaintiff}}). Identify treatment gaps exceeding 30 days, flag pre-existing conditions, and produce a chronological summary.",
        expanded: true,
        model: "Claude Sonnet 4.7",
      },
      { id: "s3", type: "extract", name: "Parse structured output", detail: "Extract JSON: summary, gaps_found, confidence" },
    ],
    outputs: [
      { id: "out_1", name: "summary", type: "text", description: "Chronological summary of treatment" },
      { id: "out_2", name: "gaps_found", type: "number", description: "Count of documentation gaps" },
      { id: "out_3", name: "confidence", type: "number", description: "Confidence score (0–100)" },
    ],
  },

  "depo-prep": {
    id: "depo-prep",
    name: "Deposition Prep",
    description:
      "Analyzes case data to find weaknesses and generates targeted deposition questions with document citations, using prior depositions as tone reference.",
    category: "Litigation",
    status: "Published",
    version: "v3",
    icon: Notepad,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    totalRuns: 324,
    lastRun: "2m ago",
    inputs: [
      { id: "in_1", name: "Case", type: "case-ref", required: true, description: "The case this depo is for", sample: "CVSA-1189" },
      {
        id: "in_2",
        name: "Case files",
        type: "file",
        required: true,
        description: "Documents to analyze — medical records, police report, phone records, social media, etc.",
        sample: "47 files (236 MB)",
      },
      {
        id: "in_3",
        name: "Deposition samples",
        type: "kb-ref",
        required: true,
        description: "Knowledge base of prior depositions. Used for tone and style, not content.",
        sample: "Plaintiff Depositions (23 files)",
      },
      {
        id: "in_4",
        name: "Deponent type",
        type: "enum",
        required: true,
        description: "Who is being deposed",
        options: ["Plaintiff", "Medical Expert", "Defendant", "Police Officer", "Lay Witness"],
        sample: "Plaintiff",
      },
      {
        id: "in_5",
        name: "Focus areas",
        type: "list",
        description: "What to target. Controls question distribution.",
        options: ["Liability", "Injury severity", "Treatment gaps", "Credibility", "Timeline", "Prior conditions"],
        sample: "Liability, Treatment gaps, Credibility",
      },
      {
        id: "in_6",
        name: "Aggressiveness",
        type: "enum",
        description: "How hard to push. Controls question count and tone.",
        options: ["Light", "Moderate", "Aggressive"],
        sample: "Aggressive",
      },
    ],
    steps: [
      {
        id: "s1",
        type: "fetch",
        name: "Fetch case context",
        detail:
          "Load {{Case files}}, events timeline, and medical events for {{Case}}. Extract timestamps, provider names, diagnoses, and witness statements.",
      },
      {
        id: "s2",
        type: "fetch",
        name: "Retrieve depo samples",
        detail:
          "Pull top 10 sample chunks from {{Deposition samples}} filtered by deponent type = {{Deponent type}}. Use for tone/style reference only.",
      },
      {
        id: "s3",
        type: "prompt",
        name: "Identify weaknesses",
        detail:
          "Analyze case data for {{Case}}. Find things to attack in the depo: treatment gaps >30 days, inconsistencies between pain claims and documented activity, liability factors ({{Focus areas}}), missed or refused treatments, credibility issues, prior conditions. For each weakness, cite the specific document + page. Prioritize by {{Focus areas}}.",
        expanded: true,
        model: "Claude Sonnet 4.7",
      },
      {
        id: "s4",
        type: "prompt",
        name: "Generate depo questions",
        detail:
          "For each identified weakness, craft deposition questions that exploit it. Match the tone and phrasing patterns of the retrieved samples — do not copy their content. Scale question count to {{Aggressiveness}}: Light=20-40 questions, Moderate=50-80, Aggressive=100-150. Each question must include: text, topic category, intended outcome, and source document + page reference.",
        expanded: false,
        model: "Claude Sonnet 4.7",
      },
      {
        id: "s5",
        type: "extract",
        name: "Parse structured output",
        detail: "Extract JSON: questions[], weaknesses[], treatment_gaps, estimated_duration, question_count",
      },
    ],
    outputs: [
      {
        id: "out_1",
        name: "questions",
        type: "list",
        description: "Deposition questions with text, category, rationale, and source citation (doc + page)",
      },
      { id: "out_2", name: "weaknesses", type: "list", description: "Vulnerabilities identified in the case data" },
      { id: "out_3", name: "treatment_gaps", type: "number", description: "Count of documentation gaps >30 days" },
      { id: "out_4", name: "estimated_duration", type: "text", description: "Expected depo length — e.g. '3-4 hours'" },
      { id: "out_5", name: "question_count", type: "number", description: "Total questions generated" },
    ],
  },

  "demand-letter-draft": {
    id: "demand-letter-draft",
    name: "Demand Letter Draft",
    description: "Generates a first-draft demand letter using case facts, damages calculations, and precedent language.",
    category: "Pre-litigation",
    status: "Published",
    version: "v5",
    icon: Notepad,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    totalRuns: 2341,
    lastRun: "3m ago",
    inputs: [
      { id: "in_1", name: "Case", type: "case-ref", required: true, sample: "CVSA-1189" },
      { id: "in_2", name: "Damages estimate", type: "number", required: true, sample: "2400000" },
      { id: "in_3", name: "Templates", type: "kb-ref", required: true, description: "Firm letter templates", sample: "Demand Letter Templates" },
    ],
    steps: [
      { id: "s1", type: "fetch", name: "Fetch case facts", detail: "Load {{Case}} context" },
      { id: "s2", type: "prompt", name: "Draft letter", detail: "Draft demand letter for {{Case}} seeking {{Damages estimate}}." },
      { id: "s3", type: "extract", name: "Parse", detail: "Extract final draft" },
    ],
    outputs: [
      { id: "out_1", name: "draft", type: "text" },
      { id: "out_2", name: "pages", type: "number" },
      { id: "out_3", name: "tone", type: "text" },
    ],
  },
}

/** Fallback to Medical Records Summary if id not found */
export function getPlaybook(id: string): PlaybookDef {
  return PLAYBOOK_DEFS[id] ?? PLAYBOOK_DEFS["medical-records-summary"]
}

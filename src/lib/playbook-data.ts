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

export type StepType = "fetch" | "prompt"

export interface Step {
  id: string
  type: StepType
  name: string
  detail: string
  expanded?: boolean
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
          "Analyze the medical records for {{Case}} (plaintiff: {{Plaintiff}}). Identify treatment gaps exceeding 30 days, flag pre-existing conditions, and produce a chronological summary. Return: summary (text), gaps_found (number), confidence (0-100).",
        expanded: true,
      },
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
      "Analyzes case files to find weaknesses and generates targeted deposition questions with reasoning and document citations.",
    category: "Litigation",
    status: "Published",
    version: "v3",
    icon: Notepad,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    totalRuns: 324,
    lastRun: "2m ago",
    inputs: [
      {
        id: "in_1",
        name: "Case",
        type: "case-ref",
        required: true,
        description: "The case you're preparing to depose someone for. Includes all case files — medical records, police report, interrogatories, etc.",
        sample: "CVSA-1189",
      },
      {
        id: "in_2",
        name: "Deposition samples",
        type: "kb-ref",
        required: true,
        description: "Knowledge base of prior depositions. Used for tone and style reference.",
        sample: "Plaintiff Depositions (23 files)",
      },
      {
        id: "in_3",
        name: "Deponent type",
        type: "enum",
        required: true,
        description: "Who is being deposed",
        options: ["Plaintiff", "Medical Expert", "Defendant", "Police Officer", "Lay Witness"],
        sample: "Plaintiff",
      },
    ],
    steps: [
      {
        id: "s1",
        type: "fetch",
        name: "Load case context",
        detail:
          "Load all files from {{Case}} — medical records, police reports, interrogatories, phone records, witness statements. Extract timestamps, diagnoses, and key events.",
      },
      {
        id: "s2",
        type: "fetch",
        name: "Retrieve depo samples",
        detail:
          "Pull top sample chunks from {{Deposition samples}} filtered by {{Deponent type}}. Used for tone and phrasing patterns — not for copying content.",
      },
      {
        id: "s3",
        type: "prompt",
        name: "Find weaknesses & generate questions",
        detail:
          "Analyze the case files for {{Case}}. Find things to attack when deposing the {{Deponent type}}: discrepancies, inconsistencies between testimony and records, liability gaps, treatment gaps, credibility issues, prior conditions. For each weakness, generate a targeted deposition question with: the question text, a reasoning explanation, and the source document + page citation. Match the tone of samples from {{Deposition samples}}.",
        expanded: true,
      },
    ],
    outputs: [
      {
        id: "out_1",
        name: "questions",
        type: "list",
        description: "Deposition questions with text, category, reasoning, and source citation (doc + page)",
      },
      { id: "out_2", name: "weaknesses", type: "list", description: "Vulnerabilities identified in the case data" },
      { id: "out_3", name: "question_count", type: "number", description: "Total questions generated" },
    ],
  },

  "depo-transcript-analysis": {
    id: "depo-transcript-analysis",
    name: "Deposition Transcript Analysis",
    description:
      "Turn a completed deposition transcript into an interactive Q&A table with exhibit links, page references, and auto-indexing by document category.",
    category: "Litigation",
    status: "Published",
    version: "v1",
    icon: FileText,
    iconColor: "text-teal-700",
    iconBg: "bg-teal-50",
    totalRuns: 187,
    lastRun: "5m ago",
    inputs: [
      {
        id: "in_1",
        name: "Case",
        type: "case-ref",
        required: true,
        description: "The case the deposition belongs to. Includes the transcript file and related exhibits.",
        sample: "CVSA-1189",
      },
      {
        id: "in_2",
        name: "Reference library",
        type: "kb-ref",
        description: "Prior transcripts to use as summary style reference (optional)",
        sample: "Plaintiff Depositions (23 files)",
      },
      {
        id: "in_3",
        name: "Output detail",
        type: "enum",
        required: true,
        description: "How detailed should the summary be",
        options: ["Quick summary", "Detailed table", "Full Q&A with exhibits"],
        sample: "Full Q&A with exhibits",
      },
    ],
    steps: [
      {
        id: "s1",
        type: "fetch",
        name: "Load transcript from case",
        detail: "Load the deposition transcript file and any related exhibits from {{Case}}",
      },
      {
        id: "s2",
        type: "prompt",
        name: "Parse deponent, date, and Q&A pairs",
        detail:
          "Identify the deponent name and type (Plaintiff / Defendant / Medical Expert / etc.) and the deposition date. Extract every question/answer pair from the transcript along with its page:line reference. Match verbosity to {{Output detail}}.",
        expanded: true,
      },
      {
        id: "s3",
        type: "prompt",
        name: "Detect exhibits referenced",
        detail:
          "Scan the transcript for exhibit references (EX-001, Exhibit 4, Defendant's Ex. A, etc.). For each unique exhibit, link it to every Q&A row where it was referenced. Return exhibit identifier, name, and the rows it touches.",
      },
      {
        id: "s4",
        type: "prompt",
        name: "Auto-index by category",
        detail:
          "Assign related documents from {{Case}} to the standard deposition index categories: Notice of Deposition, Transcript, Errata Page, Exhibits. Return structured index organized by deponent.",
      },
    ],
    outputs: [
      {
        id: "out_1",
        name: "qa_table",
        type: "list",
        description: "Full Q&A table — each row has deponent, question, answer, page:line reference, and linked exhibit",
      },
      { id: "out_2", name: "deponent", type: "text", description: "Name of person deposed" },
      { id: "out_3", name: "deposition_date", type: "date", description: "Date the deposition took place" },
      { id: "out_4", name: "exhibits_count", type: "number", description: "Number of unique exhibits referenced" },
      { id: "out_5", name: "total_questions", type: "number", description: "Total Q&A pairs extracted" },
    ],
  },

  "depo-indexing": {
    id: "depo-indexing",
    name: "Deposition Indexing",
    description:
      "Auto-organizes deposition-related documents into standard bookmark categories (Notice, Transcript, Errata, Exhibits) grouped by deponent. Paralegal confirms.",
    category: "Litigation",
    status: "Published",
    version: "v1",
    icon: FileText,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    totalRuns: 92,
    lastRun: "14m ago",
    inputs: [
      {
        id: "in_1",
        name: "Case",
        type: "case-ref",
        required: true,
        description: "The case whose deposition documents need indexing. Includes all uploaded files.",
        sample: "CVSA-1189",
      },
      {
        id: "in_2",
        name: "Index template",
        type: "kb-ref",
        description: "Firm's indexing taxonomy or past examples (optional — uses standard categories if omitted)",
        sample: "Firm Indexing Templates",
      },
      {
        id: "in_3",
        name: "Scope",
        type: "enum",
        required: true,
        description: "Which deponents to include",
        options: ["All deponents", "Plaintiff only", "Defendant only", "Experts only"],
        sample: "All deponents",
      },
    ],
    steps: [
      {
        id: "s1",
        type: "fetch",
        name: "Load case documents",
        detail:
          "Load every deposition-related document from {{Case}} — notices, transcripts, errata sheets, exhibits, cover pages.",
      },
      {
        id: "s2",
        type: "prompt",
        name: "Classify each document",
        detail:
          "For each document, assign it to one of the four standard categories: Notice of Deposition, Transcript, Errata Page, or Exhibits. Flag any document that doesn't fit cleanly.",
        expanded: true,
      },
      {
        id: "s3",
        type: "prompt",
        name: "Group by deponent",
        detail:
          "Associate each document with the right deponent (Cruz Lopez, John Doe, Dr. Marín, etc.) based on filename, cover page, and content. Respect {{Scope}} — include only matching deponents. Return nested tree: deponent → category → docs.",
      },
    ],
    outputs: [
      {
        id: "out_1",
        name: "index_tree",
        type: "list",
        description: "Nested structure — deponent → category → linked documents with filenames",
      },
      { id: "out_2", name: "total_docs", type: "number", description: "Total deposition documents indexed" },
      { id: "out_3", name: "deponents_covered", type: "number", description: "Number of distinct deponents indexed" },
      {
        id: "out_4",
        name: "uncategorized",
        type: "number",
        description: "Documents that didn't fit cleanly — paralegal should review",
      },
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
      { id: "s2", type: "prompt", name: "Draft letter", detail: "Draft demand letter for {{Case}} seeking {{Damages estimate}}. Return the draft, page count, and detected tone." },
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

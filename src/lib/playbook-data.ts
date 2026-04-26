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

export type FieldType =
  | "text"
  | "long_text"
  | "number"
  | "date"
  | "file"
  | "case-ref"
  | "enum"
  | "list"
  | "kb-ref"
  | "document"
  | "records"

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
  /** If type is "document", the template this output is applied to */
  templateId?: string
  /** If type is "records", the column schema for each row */
  itemSchema?: Field[]
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
      { id: "out_1", name: "Patient name", type: "text", description: "Plaintiff / patient name from records" },
      { id: "out_2", name: "Treatment start", type: "date", description: "First treatment date" },
      { id: "out_3", name: "Treatment end", type: "date", description: "Most recent treatment date" },
      { id: "out_4", name: "Gaps found", type: "number", description: "Number of treatment gaps over 30 days" },
      { id: "out_5", name: "Providers", type: "list", description: "Treating providers with specialty and visit counts" },
      {
        id: "out_6",
        name: "Medical summary",
        type: "document",
        description: "Formatted summary memo — extractions above fill the template placeholders",
        templateId: "medical-records-summary",
      },
    ],
  },

  "depo-prep": {
    id: "depo-prep",
    name: "Deposition Prep",
    description:
      "AI Deposition Question Engine. Classifies the deponent, extracts facts from every case document, cross-references for contradictions and gaps, generates targeted questions with reasoning, applies the firm's standard KB questions, and sequences everything into an examination order.",
    category: "Litigation",
    status: "Published",
    version: "v4",
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
        description:
          "Provides every document attached: police report, medical records, interrogatory responses, discovery production, prior deposition transcripts, expert reports.",
        sample: "CVSA-1189",
      },
      {
        id: "in_2",
        name: "Deponent identity",
        type: "text",
        required: true,
        description: "Name of the person being deposed",
        sample: "Maria Lopez",
      },
      {
        id: "in_3",
        name: "Deponent role",
        type: "enum",
        required: true,
        description:
          "Master filter — activates relevant question blocks and suppresses irrelevant ones. You don't ask a treating physician about pavement conditions.",
        options: [
          "Defendant",
          "Plaintiff",
          "Eyewitness",
          "Treating physician",
          "Expert witness",
          "Corporate representative (30(b)(6))",
        ],
        sample: "Defendant",
      },
      {
        id: "in_4",
        name: "Reference library",
        type: "kb-ref",
        required: true,
        description:
          "Historical deposition transcripts organized by deponent role. Used in step 5 for proactive standard questions experienced attorneys always ask.",
        sample: "Plaintiff Depositions (23 files)",
      },
    ],
    steps: [
      {
        id: "s1",
        type: "prompt",
        name: "Classify the deponent",
        detail:
          "Use {{Deponent role}} and {{Deponent identity}} as the master filter. Activate the appropriate logic blocks for this role. Example: 'Defendant in auto MVA' → search for contradictions vs police report, search for partial admissions in interrogatories, generate liability questions about their conduct, load standard KB questions for that role. Disable categories that don't apply (no medical-diagnosis questions for a defendant — that's for the treating physician).",
      },
      {
        id: "s2",
        type: "fetch",
        name: "Extract facts from each document",
        detail:
          "Read every document in {{Case}}. Extract structured atoms of fact tailored to each document type. Police report: date, location, weather, speed, party statements at scene, citations, diagram, witnesses. Medical records: diagnoses, visit dates, treatments, referrals, medications, restrictions, prognosis, prior conditions. Interrogatory responses: sworn version of events, witnesses identified, damages claimed, medical history disclosed. Discovery: phone records, vehicle maintenance, photos, surveillance, communications. Prior depo transcripts: locked-in testimony. Expert reports: opinions, methodology, data relied upon, qualifications. Every fact retains a citation: document + page/section.",
      },
      {
        id: "s3",
        type: "prompt",
        name: "Cross-reference: find contradictions and gaps",
        detail:
          "Compare extracted facts looking for: A) Direct contradictions — same fact with different values across documents (50 mph in police report vs 30 mph in interrogatories). B) Logical inconsistencies — facts that don't fit together (light was green vs cited for failure to obey signal). C) Gaps — info that should be present but isn't (4-month gap between accident and first medical visit). Apply matching rules: by topic, by person, by timeline, by numerical value. Group facts about the same subject even if worded differently.",
        expanded: true,
      },
      {
        id: "s4",
        type: "prompt",
        name: "Generate questions by category",
        detail:
          "For each contradiction, inconsistency, or gap, craft a question with one of four strategic purposes: Pin down a fact (lock in an admission under oath), Expose a contradiction / impeach (confront with two conflicting versions), Fill a gap (force explanation of missing info), Establish a legal element (satisfy a duty or causation requirement). Rule: every question MUST have explicit reasoning. If you can't explain why you're asking, don't include it. Tag each question with a flag: Discrepancy / Contradiction / Liability / Medical / Evidence / Damages.",
      },
      {
        id: "s5",
        type: "fetch",
        name: "Apply Knowledge Base — standard questions",
        detail:
          "Load proactive standard questions for {{Deponent role}} from {{Reference library}} — questions experienced attorneys always ask regardless of what's in the docs. Deduplicate against the case-generated set using semantic matching (not just exact text). Personalize each KB question with names, dates, and case details from {{Case}}. Tag the survivors with the 'Standard' flag so the attorney knows they came from experience, not a specific document.",
      },
      {
        id: "s6",
        type: "prompt",
        name: "Sequence into examination lines",
        detail:
          "Order the merged question set into a logical exam flow: foundational/credibility first, then case-specific facts grouped by topic (cleanly contained sections), then impeachment confrontations where the attorney lays the trap, then damages and legal-element wrap-up. Within each topic, lead from general to specific. Output the final ordered list — this is what the attorney brings into the room.",
      },
    ],
    outputs: [
      { id: "out_1", name: "Deponent name", type: "text", description: "Name of the person being deposed" },
      {
        id: "out_2",
        name: "Deponent type",
        type: "text",
        description: "Classified role — Defendant / Plaintiff / Eyewitness / etc.",
      },
      {
        id: "out_3",
        name: "Total questions",
        type: "number",
        description: "Final count after dedup and sequencing",
      },
      {
        id: "out_4",
        name: "Contradictions found",
        type: "number",
        description: "Direct contradictions detected across documents",
      },
      {
        id: "out_5",
        name: "Gaps identified",
        type: "number",
        description: "Missing information or unexplained time periods",
      },
      {
        id: "out_6",
        name: "Questions",
        type: "records",
        description: "Ordered examination list — one row per question. The core deliverable.",
        itemSchema: [
          {
            id: "col_q",
            name: "Question",
            type: "long_text",
            description: "Verbatim text the attorney will ask",
          },
          {
            id: "col_flag",
            name: "Flag",
            type: "enum",
            description: "Category — what makes this question matter",
            options: [
              "Contradiction",
              "Discrepancy",
              "Liability",
              "Medical",
              "Evidence",
              "Damages",
              "Standard",
            ],
          },
          {
            id: "col_reason",
            name: "Reasoning",
            type: "long_text",
            description: "Why ask this — strategic purpose. Required.",
          },
          {
            id: "col_source",
            name: "Source",
            type: "text",
            description: "Document and page that prompted the question — or 'Knowledge Base' for standards",
          },
        ],
      },
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
      { id: "out_1", name: "Deponent", type: "text", description: "Name of person deposed" },
      { id: "out_2", name: "Deposition date", type: "date", description: "Date the deposition took place" },
      { id: "out_3", name: "Total questions", type: "number", description: "Total Q&A pairs extracted" },
      { id: "out_4", name: "Exhibits referenced", type: "number", description: "Number of unique exhibits referenced" },
      {
        id: "out_5",
        name: "Q&A rows",
        type: "list",
        description: "Each row: deponent, question, answer, page:line, linked exhibit",
      },
      {
        id: "out_6",
        name: "Q&A summary",
        type: "document",
        description: "Interactive Q&A summary table",
        templateId: "qa-summary-table",
      },
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
        name: "Index tree",
        type: "list",
        description: "Nested structure — deponent → category → linked documents with filenames",
      },
      { id: "out_2", name: "Total documents", type: "number", description: "Total deposition documents indexed" },
      { id: "out_3", name: "Deponents covered", type: "number", description: "Number of distinct deponents indexed" },
      {
        id: "out_4",
        name: "Uncategorized",
        type: "number",
        description: "Documents that didn't fit cleanly — paralegal should review",
      },
      {
        id: "out_5",
        name: "Deposition index",
        type: "document",
        description: "Bookmark tree per deponent",
        templateId: "deposition-index",
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
      { id: "out_1", name: "Demand amount", type: "number", description: "Total damages demand" },
      { id: "out_2", name: "Injuries", type: "list", description: "Injuries itemized with severity" },
      { id: "out_3", name: "Tone", type: "text", description: "Detected tone — Firm / Assertive / Aggressive" },
      {
        id: "out_4",
        name: "Demand letter",
        type: "document",
        description: "Firm's demand letter — extractions fill the template",
        templateId: "demand-letter",
      },
    ],
  },
}

/** Fallback to Medical Records Summary if id not found */
export function getPlaybook(id: string): PlaybookDef {
  return PLAYBOOK_DEFS[id] ?? PLAYBOOK_DEFS["medical-records-summary"]
}

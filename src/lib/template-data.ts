import type { ComponentType } from "react"
import {
  Notepad,
  FileText,
  Scales,
  Stethoscope,
  UsersThree,
  ChartLineUp,
  Stack,
} from "@phosphor-icons/react"

export type TemplateFormat = "DOCX" | "PDF" | "Markdown" | "Table"
export type TemplateSourceType = "placeholder" | "examples"

export interface Template {
  id: string
  name: string
  description: string
  category: string
  format: TemplateFormat
  /** "placeholder" = a single template doc with {{fields}}. "examples" = reference samples AI uses to match format. */
  sourceType: TemplateSourceType
  icon: ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>
  iconColor: string
  iconBg: string
  sampleCount: number
  placeholders: string[]
  lastUpdated: string
  usedBy: string[]
}

export const TEMPLATES: Record<string, Template> = {
  "depo-outline": {
    id: "depo-outline",
    name: "Deposition Outline",
    description:
      "Firm's standard deposition outline format. Header with case and deponent info, question categories by topic, full Q&A with reasoning and source citations, exhibit references.",
    category: "Deposition",
    format: "DOCX",
    sourceType: "placeholder",
    icon: Notepad,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-50",
    sampleCount: 8,
    placeholders: [
      "{{deponent_name}}",
      "{{deponent_type}}",
      "{{case_name}}",
      "{{deposition_date}}",
      "{{objectives}}",
      "{{questions}}",
      "{{weaknesses}}",
      "{{exhibits}}",
    ],
    lastUpdated: "3d ago",
    usedBy: ["Deposition Prep"],
  },
  "qa-summary-table": {
    id: "qa-summary-table",
    name: "Q&A Summary Table",
    description:
      "Interactive table format for deposition transcript analysis. Columns: Deponent, Date, Question, Answer, Page Reference, Exhibit Link.",
    category: "Deposition",
    format: "Table",
    sourceType: "placeholder",
    icon: FileText,
    iconColor: "text-teal-700",
    iconBg: "bg-teal-50",
    sampleCount: 4,
    placeholders: ["{{deponent}}", "{{date}}", "{{qa_rows}}", "{{exhibits}}"],
    lastUpdated: "1w ago",
    usedBy: ["Deposition Transcript Analysis"],
  },
  "deposition-index": {
    id: "deposition-index",
    name: "Deposition Index",
    description:
      "Four-category bookmark structure per deponent: Notice of Deposition, Transcript, Errata Page, Exhibits. Collapsible tree.",
    category: "Deposition",
    format: "Markdown",
    sourceType: "placeholder",
    icon: Stack,
    iconColor: "text-indigo-700",
    iconBg: "bg-indigo-50",
    sampleCount: 3,
    placeholders: ["{{deponents}}", "{{notices}}", "{{transcripts}}", "{{errata}}", "{{exhibits}}"],
    lastUpdated: "2w ago",
    usedBy: ["Deposition Indexing"],
  },
  "demand-letter": {
    id: "demand-letter",
    name: "Demand Letter",
    description:
      "Firm's demand letter template. Heading block, facts section, injuries summary, damages calculation, settlement demand. Variants by injury severity.",
    category: "Pre-litigation",
    format: "DOCX",
    sourceType: "placeholder",
    icon: Notepad,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-50",
    sampleCount: 12,
    placeholders: [
      "{{firm_header}}",
      "{{date}}",
      "{{opposing_counsel}}",
      "{{client_name}}",
      "{{facts}}",
      "{{injuries}}",
      "{{damages_calc}}",
      "{{demand_amount}}",
    ],
    lastUpdated: "5d ago",
    usedBy: ["Demand Letter Draft"],
  },
  "medical-records-summary": {
    id: "medical-records-summary",
    name: "Medical Records Summary",
    description:
      "Chronological summary format for medical records review. Patient info, treatment timeline, gaps flagged, pre-existing conditions, providers list.",
    category: "Discovery",
    format: "DOCX",
    sourceType: "placeholder",
    icon: Stethoscope,
    iconColor: "text-rose-700",
    iconBg: "bg-rose-50",
    sampleCount: 15,
    placeholders: [
      "{{patient_name}}",
      "{{case_number}}",
      "{{treatment_timeline}}",
      "{{gaps}}",
      "{{preexisting}}",
      "{{providers}}",
    ],
    lastUpdated: "1w ago",
    usedBy: ["Medical Records Summary"],
  },
  "case-memo": {
    id: "case-memo",
    name: "Case Summary Memo",
    description:
      "Internal case strategy memo. Key facts, parties, claims, liability theory, damages, risks, recommended next steps. Partner-facing.",
    category: "Internal",
    format: "DOCX",
    sourceType: "examples",
    icon: FileText,
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    sampleCount: 6,
    placeholders: [],
    lastUpdated: "2w ago",
    usedBy: [],
  },
  "witness-list": {
    id: "witness-list",
    name: "Witness List",
    description:
      "Court-ready witness list. Name, relationship, expected testimony topics, contact info, disclosure status.",
    category: "Litigation",
    format: "DOCX",
    sourceType: "placeholder",
    icon: UsersThree,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50",
    sampleCount: 9,
    placeholders: ["{{case_caption}}", "{{witnesses}}", "{{expected_topics}}", "{{disclosure_date}}"],
    lastUpdated: "1mo ago",
    usedBy: ["Witness List Builder"],
  },
  "damages-calc-report": {
    id: "damages-calc-report",
    name: "Damages Calculation Report",
    description:
      "Itemized damages report. Economic damages table, non-economic damages analysis, future costs projection, supporting citations.",
    category: "Litigation",
    format: "DOCX",
    sourceType: "placeholder",
    icon: ChartLineUp,
    iconColor: "text-fuchsia-700",
    iconBg: "bg-fuchsia-50",
    sampleCount: 7,
    placeholders: ["{{economic_table}}", "{{non_economic}}", "{{future_costs}}", "{{total}}", "{{citations}}"],
    lastUpdated: "3w ago",
    usedBy: ["Damages Calculator"],
  },
  "discovery-response": {
    id: "discovery-response",
    name: "Discovery Response",
    description:
      "Standard discovery response format. Objections, responses by interrogatory, produced documents index.",
    category: "Discovery",
    format: "DOCX",
    sourceType: "placeholder",
    icon: Scales,
    iconColor: "text-sky-700",
    iconBg: "bg-sky-50",
    sampleCount: 11,
    placeholders: ["{{case_caption}}", "{{objections}}", "{{responses}}", "{{production_index}}"],
    lastUpdated: "6d ago",
    usedBy: ["Discovery Response"],
  },

  "records-request-letter": {
    id: "records-request-letter",
    name: "Records Request Letter",
    description: "HIPAA-compliant medical records request sent to providers, with HITECH cost-cap language and 30-day deadline.",
    format: "DOCX",
    category: "Pre-litigation",
    sourceType: "placeholder",
    icon: Notepad,
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    sampleCount: 18,
    placeholders: [
      "{{provider_name}}",
      "{{provider_address}}",
      "{{patient_name}}",
      "{{patient_dob}}",
      "{{date_range}}",
      "{{auth_attached}}",
    ],
    lastUpdated: "2d ago",
    usedBy: ["Filevine Records Request"],
  },
}

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES[id]
}

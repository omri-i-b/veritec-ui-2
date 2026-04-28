import type { ComponentType } from "react"
import { TEMPLATES } from "@/lib/template-data"
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
  PencilSimpleLine,
} from "@phosphor-icons/react"

export type FieldType =
  | "text"
  | "long_text"
  | "number"
  | "date"
  | "phone"
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

export type StepType = "fetch" | "prompt" | "format" | "voice"

export interface Step {
  id: string
  type: StepType
  name: string
  detail: string
  expanded?: boolean
  /**
   * Typed structured fields this step synthesizes.
   * Used by prompt + format steps. The last step's returns is the deliverable.
   */
  returns?: Field[]
  /** For format steps — the template this step fills */
  templateId?: string
  /** For voice steps — call configuration */
  voice?: {
    /** Who to dial — name of input field carrying the phone number */
    phoneInput?: string
    /** Persona / voice characterization */
    persona?: string
    /** Goal list — bullets that gate "qualified" outcome */
    goals?: string[]
    /** Max call duration in seconds (soft cap) */
    maxDurationSec?: number
    /** Language preference (ISO) */
    language?: "en" | "es" | "auto"
    /**
     * The conversational moves the voice-agent runtime walks through during
     * the call. The workflow gives this step its goals; the agent decides
     * how to actually execute each move (phrasing, listening, edge cases).
     * Visualized inline on the canvas so the structure is visible at a glance.
     */
    agentFlow?: AgentMove[]
  }
}

export interface AgentMove {
  id: string
  /** Short label — "Dial", "Verify identity", "Confirm appointments" */
  label: string
  /** Optional one-line note describing what the agent does at this point */
  note?: string
  /** Categorical kind — drives the leading icon */
  kind?: "dial" | "answer" | "speak" | "ask" | "listen" | "branch" | "log" | "escalate" | "decline"
  /** For branch moves: sub-flows under classification labels */
  branches?: { match: string; flow: AgentMove[] }[]
}

/** What kicks off a playbook run. Defaults to "manual" when omitted. */
export interface PlaybookTrigger {
  kind:
    | "manual"
    | "integration"
    | "webform"
    | "cadence"
    | "webhook"
    | "incoming-call"
    | "callable"
  /** Display name of the integration (e.g. "Filevine", "Typeform"). */
  source?: string
  /** The specific event this trigger fires on. */
  event?: string
  /** Sub-line shown under the trigger node in the canvas. */
  description?: string
}

/** True for triggers that run the workflow always-on (no manual Run button). */
export function isAlwaysOnTrigger(t: PlaybookTrigger | undefined): boolean {
  if (!t) return false
  return (
    t.kind === "incoming-call" ||
    t.kind === "integration" ||
    t.kind === "webform" ||
    t.kind === "cadence" ||
    t.kind === "webhook" ||
    t.kind === "callable"
  )
}

/** Anything with a non-manual trigger is an agent. Manual = workflow. */
export function isAgentByTrigger(p: PlaybookDef): boolean {
  return isAlwaysOnTrigger(p.trigger)
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
  /** What fires this playbook. Defaults to manual when omitted. */
  trigger?: PlaybookTrigger
  /** @deprecated — derive from last step's returns instead. Kept for compat during migration. */
  outputs?: Field[]
}

/**
 * The memory variable name a Fetch step writes — derived from the step name.
 * Returns null for non-fetch steps.
 */
export function getStepMemoryName(step: Step): string | null {
  if (step.type !== "fetch") return null
  const n = step.name.trim()
  return n.length > 0 ? n : null
}

/**
 * Effective returns for a step:
 *   - Format steps derive a single `document` return from their template.
 *   - Other steps use their stored `returns`.
 */
export function getStepReturns(step: Step): Field[] {
  if (step.returns && step.returns.length > 0) return step.returns
  if (step.type === "format" && step.templateId) {
    const tpl = TEMPLATES[step.templateId]
    if (tpl) {
      return [
        {
          id: `${step.id}_doc`,
          name: tpl.name,
          type: "document",
          templateId: tpl.id,
          description: `Filled ${tpl.format}`,
        },
      ]
    }
  }
  return []
}

/** The playbook's deliverable = the last step's effective returns. */
export function getPlaybookDeliverable(p: PlaybookDef): Field[] {
  const last = p.steps[p.steps.length - 1]
  if (!last) return p.outputs ?? []
  const r = getStepReturns(last)
  return r.length > 0 ? r : p.outputs ?? []
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
      {
        id: "s1",
        type: "fetch",
        name: "Records text",
        detail: "Load all PDFs from {{Records}} and extract concatenated text.",
      },
      {
        id: "s2",
        type: "format",
        name: "Write Medical Summary memo",
        detail:
          "Read {{Records text}} for {{Case}} (plaintiff: {{Plaintiff}}) and fill the firm's Medical Records Summary template. Build a chronological treatment history with provider visit counts. Identify treatment gaps exceeding 30 days. Flag pre-existing conditions. Use plain language for the narrative; preserve dates, dosages, and diagnostic codes verbatim.",
        templateId: "medical-records-summary",
        expanded: true,
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
          "Historical deposition transcripts organized by deponent role. Used by the KB-application step for proactive standard questions experienced attorneys always ask.",
        sample: "Plaintiff Depositions (23 files)",
      },
    ],
    steps: [
      {
        id: "s0",
        type: "fetch",
        name: "Case documents",
        detail:
          "Pull every document attached to {{Case}} into memory: police report, medical records, interrogatory responses, discovery production, prior deposition transcripts, expert reports.",
      },
      {
        id: "s1",
        type: "prompt",
        name: "Classify the deponent",
        detail:
          "Use {{Deponent role}} and {{Deponent identity}} as the master filter. Activate the appropriate logic blocks for this role. Example: 'Defendant in auto MVA' → search for contradictions vs police report, search for partial admissions in interrogatories, generate liability questions about their conduct, load standard KB questions for that role. Disable categories that don't apply (no medical-diagnosis questions for a defendant — that's for the treating physician).",
        returns: [
          {
            id: "r1_a",
            name: "Deponent type",
            type: "text",
            description: "Classified role — used to filter the rest of the pipeline",
          },
        ],
      },
      {
        id: "s2",
        type: "prompt",
        name: "Extract facts from each document",
        detail:
          "For each item in {{Case documents}}, extract structured atoms of fact tailored to that document type. Police report: date, location, weather, speed, party statements at scene, citations, diagram, witnesses. Medical records: diagnoses, visit dates, treatments, referrals, medications, restrictions, prognosis, prior conditions. Interrogatory responses: sworn version of events, witnesses identified, damages claimed, medical history disclosed. Discovery: phone records, vehicle maintenance, photos, surveillance, communications. Prior depo transcripts: locked-in testimony. Expert reports: opinions, methodology, data relied upon, qualifications. Every fact retains a citation: document + page/section.",
        returns: [
          {
            id: "r2_a",
            name: "Facts",
            type: "records",
            description: "Atomic facts pulled from each document, with citations",
            itemSchema: [
              { id: "f_topic", name: "Topic", type: "text" },
              { id: "f_value", name: "Value", type: "long_text" },
              { id: "f_doc", name: "Document", type: "text" },
              { id: "f_cite", name: "Citation", type: "text" },
            ],
          },
        ],
      },
      {
        id: "s3",
        type: "prompt",
        name: "Cross-reference: find contradictions and gaps",
        detail:
          "Compare extracted facts looking for: A) Direct contradictions — same fact with different values across documents (50 mph in police report vs 30 mph in interrogatories). B) Logical inconsistencies — facts that don't fit together (light was green vs cited for failure to obey signal). C) Gaps — info that should be present but isn't (4-month gap between accident and first medical visit). Apply matching rules: by topic, by person, by timeline, by numerical value. Group facts about the same subject even if worded differently.",
        expanded: true,
        returns: [
          {
            id: "r3_a",
            name: "Findings",
            type: "records",
            description: "Each contradiction / inconsistency / gap with its source pair",
            itemSchema: [
              { id: "fi_topic", name: "Topic", type: "text" },
              {
                id: "fi_kind",
                name: "Kind",
                type: "enum",
                options: ["Contradiction", "Inconsistency", "Gap"],
              },
              { id: "fi_a", name: "Source A", type: "text" },
              { id: "fi_b", name: "Source B", type: "text" },
            ],
          },
          {
            id: "r3_b",
            name: "Contradictions found",
            type: "number",
            description: "Count of direct contradictions",
          },
          {
            id: "r3_c",
            name: "Gaps identified",
            type: "number",
            description: "Count of timeline / info gaps",
          },
        ],
      },
      {
        id: "s4",
        type: "prompt",
        name: "Generate questions by category",
        detail:
          "For each finding from step 3, craft a question with one of four strategic purposes: Pin down a fact (lock in an admission under oath), Expose a contradiction / impeach (confront with two conflicting versions), Fill a gap (force explanation of missing info), Establish a legal element (satisfy a duty or causation requirement). Rule: every question MUST have explicit reasoning. If you can't explain why you're asking, don't include it. Tag each question with a flag: Discrepancy / Contradiction / Liability / Medical / Evidence / Damages.",
        returns: [
          {
            id: "r4_a",
            name: "Questions (initial)",
            type: "records",
            description: "Case-derived questions, before KB merge",
            itemSchema: [
              { id: "q_text", name: "Question", type: "long_text" },
              {
                id: "q_flag",
                name: "Flag",
                type: "enum",
                options: ["Contradiction", "Discrepancy", "Liability", "Medical", "Evidence", "Damages"],
              },
              { id: "q_reason", name: "Reasoning", type: "long_text" },
              { id: "q_source", name: "Source", type: "text" },
            ],
          },
        ],
      },
      {
        id: "s5",
        type: "prompt",
        name: "Apply Knowledge Base — standard questions",
        detail:
          "Load proactive standard questions for {{Deponent role}} from {{Reference library}} — questions experienced attorneys always ask regardless of what's in the docs. Deduplicate against the case-generated set using semantic matching (not just exact text). Personalize each KB question with names, dates, and case details from {{Case}}. Tag the survivors with the 'Standard' flag so the attorney knows they came from experience, not a specific document.",
        returns: [
          {
            id: "r5_a",
            name: "Questions (with KB)",
            type: "records",
            description: "Case questions merged with personalized KB standards",
            itemSchema: [
              { id: "q_text", name: "Question", type: "long_text" },
              {
                id: "q_flag",
                name: "Flag",
                type: "enum",
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
              { id: "q_reason", name: "Reasoning", type: "long_text" },
              { id: "q_source", name: "Source", type: "text" },
            ],
          },
        ],
      },
      {
        id: "s6",
        type: "prompt",
        name: "Sequence into examination lines",
        detail:
          "Order the merged question set into a logical exam flow: foundational/credibility first, then case-specific facts grouped by topic (cleanly contained sections), then impeachment confrontations where the attorney lays the trap, then damages and legal-element wrap-up. Within each topic, lead from general to specific. The final ordered list is what the attorney brings into the room.",
        returns: [
          {
            id: "r6_a",
            name: "Deponent name",
            type: "text",
            description: "Pass-through from input",
          },
          {
            id: "r6_b",
            name: "Deponent type",
            type: "text",
            description: "Classified role",
          },
          {
            id: "r6_c",
            name: "Total questions",
            type: "number",
            description: "Final count after dedup and sequencing",
          },
          {
            id: "r6_d",
            name: "Contradictions found",
            type: "number",
          },
          {
            id: "r6_e",
            name: "Gaps identified",
            type: "number",
          },
          {
            id: "r6_f",
            name: "Questions",
            type: "records",
            description: "Ordered examination list — the deliverable",
            itemSchema: [
              { id: "q_text", name: "Question", type: "long_text" },
              {
                id: "q_flag",
                name: "Flag",
                type: "enum",
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
              { id: "q_reason", name: "Reasoning", type: "long_text" },
              { id: "q_source", name: "Source", type: "text" },
            ],
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
        name: "Transcript",
        detail: "Load the deposition transcript file and any related exhibits from {{Case}}.",
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
        returns: [
          { id: "r4_a", name: "Deponent", type: "text" },
          { id: "r4_b", name: "Deposition date", type: "date" },
          { id: "r4_c", name: "Total questions", type: "number" },
          { id: "r4_d", name: "Exhibits referenced", type: "number" },
          {
            id: "r4_e",
            name: "Q&A rows",
            type: "records",
            description: "Each row: deponent, question, answer, page:line, exhibit",
            itemSchema: [
              { id: "qa_q", name: "Question", type: "long_text" },
              { id: "qa_a", name: "Answer", type: "long_text" },
              { id: "qa_pl", name: "Page:Line", type: "text" },
              { id: "qa_ex", name: "Exhibit", type: "text" },
            ],
          },
        ],
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
        name: "Deposition documents",
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
        returns: [
          {
            id: "r3_a",
            name: "Index tree",
            type: "records",
            description: "Each row: deponent → category → document filename",
            itemSchema: [
              { id: "ix_dep", name: "Deponent", type: "text" },
              {
                id: "ix_cat",
                name: "Category",
                type: "enum",
                options: ["Notice of Deposition", "Transcript", "Errata Page", "Exhibits"],
              },
              { id: "ix_doc", name: "Document", type: "text" },
            ],
          },
          { id: "r3_b", name: "Total documents", type: "number" },
          { id: "r3_c", name: "Deponents covered", type: "number" },
          {
            id: "r3_d",
            name: "Uncategorized",
            type: "number",
            description: "Documents that didn't fit cleanly — paralegal should review",
          },
        ],
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
      {
        id: "s1",
        type: "fetch",
        name: "Case facts",
        detail: "Load compiled context from {{Case}} — facts, parties, timeline.",
      },
      {
        id: "s2",
        type: "prompt",
        name: "Extract damages and injuries",
        detail:
          "From the case facts, extract total damages, itemized injuries with severity, and detect the appropriate tone (Firm / Assertive / Aggressive) based on case strength.",
        returns: [
          { id: "r2_a", name: "Demand amount", type: "number" },
          { id: "r2_b", name: "Injuries", type: "list", description: "Itemized with severity" },
          { id: "r2_c", name: "Tone", type: "text" },
        ],
      },
      {
        id: "s3",
        type: "format",
        name: "Format as Demand Letter",
        detail: "Apply extractions to the firm's Demand Letter template.",
        templateId: "demand-letter",
        returns: [
          { id: "r3_a", name: "Demand letter", type: "long_text", description: "Filled letter (DOCX)" },
        ],
      },
    ],
  },

  // ── Voice agents ────────────────────────────────────────────────────
  // A voice agent is a playbook with one Voice step. The step's prompt
  // is the agent's instructions + goals (Retell-style); its returns are
  // the structured fields the conversation should extract.

  "intake-callback-voice": {
    id: "intake-callback-voice",
    name: "Intake Callback",
    description:
      "Calls a web-form lead within 90 seconds. Qualifies the matter, captures the basics, and books a consult — or hands off to a human if the conversation goes off-script.",
    category: "Intake",
    status: "Published",
    version: "v2",
    icon: PhoneCall,
    iconColor: "text-blue-800",
    iconBg: "bg-blue-50",
    totalRuns: 1284,
    lastRun: "11m ago",
    inputs: [
      { id: "in_1", name: "Lead phone", type: "phone", required: true, description: "Phone number from the web form", sample: "+1 (415) 555-0142" },
      { id: "in_2", name: "Lead name", type: "text", required: true, description: "Name from the web form", sample: "Camille Estrada" },
      { id: "in_3", name: "Form summary", type: "long_text", required: true, description: "What the lead wrote in the contact form", sample: "Rear-ended on the 101 Friday night, back is hurting" },
      { id: "in_4", name: "Reference library", type: "kb-ref", required: false, description: "Standard intake objections + answers (optional)", sample: "Intake KB v3 (47 entries)" },
    ],
    steps: [
      {
        id: "s1",
        type: "voice",
        name: "Qualify and book consult",
        detail:
          "You are a warm, plainspoken intake specialist for Veritec Law calling {{Lead name}} back about their inquiry. Be warm, never pushy. Don't give legal advice. If they ask about money, mention contingency and defer specifics to the attorney consult.\n\nReason for call (from form): {{Form summary}}.\n\nGOALS — work through these naturally; don't read them as a script:\n  1. Confirm identity and that this is a good time to talk.\n  2. Get a clean version of what happened and the date.\n  3. Confirm injury was reported / treatment started.\n  4. Confirm they have not signed with the other side's insurer or another firm.\n  5. Book a free consultation (default tomorrow 3:30pm with James Rivera).\n  6. If anything is off-script (criminal, settled, out-of-state), escalate to a human.",
        voice: {
          phoneInput: "Lead phone",
          maxDurationSec: 600,
          language: "auto",
          agentFlow: [
            { id: "dial", kind: "dial", label: "Dial", note: "Call {{Lead phone}}" },
            { id: "intro", kind: "speak", label: "Open warmly", note: "Reference the form, set tone" },
            { id: "story", kind: "ask", label: "Get the incident story", note: "What happened, when, where" },
            { id: "injury", kind: "ask", label: "Confirm injury + treatment", note: "What hurts, urgent care or ER, ongoing" },
            { id: "represented", kind: "ask", label: "Check representation", note: "Other firm? Insurance reached out?" },
            { id: "objection", kind: "branch", label: "Handle objection", note: "If money concern \u2192 explain contingency" },
            { id: "book", kind: "ask", label: "Book consultation", note: "Default 3:30pm next business day with James Rivera" },
            { id: "escalate", kind: "escalate", label: "Escalate if off-script", note: "Criminal / settled / out-of-state" },
            { id: "log", kind: "log", label: "Hang up + log", note: "Write extracted fields to lead record" },
          ],
        },
        returns: [
          { id: "r1_a", name: "Caller name", type: "text" },
          { id: "r1_b", name: "Matter type", type: "enum", options: ["MVA", "Premises", "Dog bite", "Workplace", "Product", "Other"] },
          { id: "r1_c", name: "Incident date", type: "date" },
          { id: "r1_d", name: "Injury reported", type: "text", description: "What hurts / how badly" },
          { id: "r1_e", name: "Treatment started", type: "text" },
          { id: "r1_f", name: "Already represented", type: "enum", options: ["No", "Yes — by another firm", "Yes — by other side's insurer"] },
          { id: "r1_g", name: "Consult booked", type: "text", description: "Date/time + attorney name, or 'No'" },
          { id: "r1_h", name: "Outcome", type: "enum", options: ["Qualified", "Not qualified", "Escalated", "Voicemail", "Failed"] },
          { id: "r1_i", name: "Outcome reason", type: "long_text", description: "1–2 sentences for the operator review" },
        ],
      },
    ],
  },

  "med-treatment-verification-voice": {
    id: "med-treatment-verification-voice",
    name: "Medical Treatment Verification",
    description:
      "Weekly cadence call to active clients confirming they're attending PT, the next appointment is on the calendar, and there are no new symptoms or providers to track. Flags treatment gaps before they hurt the case.",
    category: "Pre-litigation",
    status: "Published",
    version: "v1",
    icon: PhoneCall,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-50",
    totalRuns: 612,
    lastRun: "2h ago",
    trigger: {
      kind: "cadence",
      source: "Cadence",
      event: "Weekly check-in",
      description: "Fires every Tuesday for cases in active treatment phase",
    },
    inputs: [
      { id: "in_1", name: "Case", type: "case-ref", required: true, description: "The case this check-in is for", sample: "CVSA-1189" },
      { id: "in_2", name: "Client phone", type: "phone", required: true, description: "Client's primary phone", sample: "+1 (510) 555-0421" },
      { id: "in_3", name: "Client name", type: "text", required: true, sample: "Maria Lopez" },
    ],
    steps: [
      {
        id: "s0",
        type: "fetch",
        name: "Prior treatment record",
        detail: "Pull the most recent provider list, last appointment, and current symptoms from {{Case}} so the agent can reference them.",
      },
      {
        id: "s1",
        type: "voice",
        name: "Weekly treatment check-in",
        detail:
          "You are Mei from Veritec Law calling {{Client name}} for our weekly treatment check-in. Be warm and unhurried — these calls average three to four minutes. Switch to Spanish if the client opens in Spanish.\n\nThis is NOT a legal call. It's a wellness check tied to their physical-therapy schedule. If they ask anything legal — settlement value, status of the case, whether to talk to the other side — say \"Let me have your attorney call you back\" and offer to schedule that.\n\nContext from the case file:\n{{Prior treatment record}}\n\nWORK THROUGH THESE NATURALLY (don't read them as a list):\n\n  1. Open with their name. Confirm you're speaking with {{Client name}} and not a family member, housemate, or kid who picked up. If it's not them, ask when's a good time and end politely.\n\n  2. Reference the appointments from {{Prior treatment record}} by name. Were last week's attended? If one was missed, ask why — transportation, work, pain, scheduling — without judgment.\n\n  3. Confirm the next appointment is on the calendar. If it's not, offer to flag the case manager to help reschedule.\n\n  4. Ask about new symptoms or new providers. \"Anything new with how you're feeling?\" — wait through the silence. If they mention seeing someone new, capture the provider's name and clinic.\n\n  5. Close with \"Anything else we should know about?\" — wait through the silence again. Clients often share the most important thing here.\n\nESCALATE to the case manager if:\n  • The client says they've stopped going to PT.\n  • There's a gap with no next appointment booked.\n  • They mention seeing a new doctor we don't have on file.\n  • They're in distress — pain crisis, mental-health concern, family emergency.\n\nDon't promise anything legal. Don't quote settlement amounts. Don't comment on case strength. If pushed, fall back on \"That's a great question for your attorney — let me get them to call you back.\"",
        voice: {
          phoneInput: "Client phone",
          maxDurationSec: 300,
          language: "auto",
          agentFlow: [
            { id: "dial", kind: "dial", label: "Dial", note: "Call {{Client phone}}" },
            { id: "verify", kind: "ask", label: "Verify identity", note: "Confirm speaking with {{Client name}}, not a family member" },
            { id: "appts", kind: "ask", label: "Confirm last week\u2019s appointments", note: "Compare against {{Prior treatment record}}" },
            { id: "next", kind: "ask", label: "Confirm next appointment", note: "If none booked \u2192 offer to flag the case manager" },
            { id: "symptoms", kind: "ask", label: "Ask about new symptoms / providers", note: "Capture name + clinic for any new providers" },
            { id: "outcome", kind: "branch", label: "Determine outcome", note: "Continuing per plan / Gap flagged / Escalated" },
            { id: "log", kind: "log", label: "Hang up + log", note: "Write extracted fields back to the case" },
          ],
        },
        returns: [
          { id: "r1_a", name: "Client reached", type: "enum", options: ["Yes", "Family member", "Voicemail", "No answer"] },
          { id: "r1_b", name: "Last appointments status", type: "text", description: "e.g. 'Both attended', '1 attended, 1 rescheduled'" },
          { id: "r1_c", name: "Next appointment", type: "text", description: "Date/time + provider, or 'None booked'" },
          { id: "r1_d", name: "New symptoms", type: "long_text", description: "Free text — anything to flag for the case manager" },
          { id: "r1_e", name: "New providers", type: "list", description: "Any provider not in the prior record" },
          { id: "r1_f", name: "Outcome", type: "enum", options: ["Continuing per plan", "Gap flagged", "Escalated", "Voicemail", "No answer"] },
        ],
      },
    ],
  },
}

/** Callable knowledge agent: lives in chat, answers questions about medical chronologies. */
PLAYBOOK_DEFS["med-chron-expert"] = {
  id: "med-chron-expert",
  name: "Med Chron Expert",
  description:
    "Always-on expert on medical chronologies for personal injury cases. Ask about treatment patterns, gap analysis, red flags, or how a case's medical record compares to similar PI cases the firm has handled.",
  category: "Knowledge",
  status: "Published",
  version: "v3",
  icon: Notepad,
  iconColor: "text-blue-800",
  iconBg: "bg-blue-50",
  totalRuns: 4823,
  lastRun: "8m ago",
  trigger: {
    kind: "callable",
    source: "Chat",
    event: "Question asked",
    description: "Available in the global chat surface and on every case page",
  },
  inputs: [
    {
      id: "in_1",
      name: "Question",
      type: "long_text",
      required: true,
      description: "What you want to ask the expert",
      sample: "Are there any treatment gaps in this case that opposing counsel will flag?",
    },
    {
      id: "in_2",
      name: "Case",
      type: "case-ref",
      required: false,
      description: "Optional \u2014 bind to a case for case-aware answers; omit for general questions",
      sample: "CVSA-1189",
    },
    {
      id: "in_3",
      name: "Med chron knowledge",
      type: "kb-ref",
      required: true,
      description: "Treatment patterns, gap thresholds, prior PI cases, ICD code reference",
      sample: "PI Med Chron KB v6 (2,140 entries)",
    },
  ],
  steps: [
    {
      id: "s1",
      type: "prompt",
      name: "Answer the question",
      detail:
        "You are an expert on medical chronologies for personal injury cases. Use {{Med chron knowledge}} as your reference. If a {{Case}} is bound, ground the answer in that case's medical record; otherwise answer in general terms.\n\nQuestion: {{Question}}\n\nBe direct. If you don't know, say so. Cite the source from {{Med chron knowledge}} when answering with specifics. Don't speculate about the legal strategy \u2014 the attorney owns that.",
      returns: [
        { id: "r1_a", name: "Answer", type: "long_text", description: "The expert's response" },
        { id: "r1_b", name: "Sources cited", type: "list", description: "References from the bound knowledge" },
      ],
    },
  ],
}

/** Inbound intake: always-on workflow answering the firm's main line. */
PLAYBOOK_DEFS["intake-reception-voice"] = {
  id: "intake-reception-voice",
  name: "Intake Reception",
  description:
    "Live agent answering the firm's main line. Greets callers, classifies the matter type, qualifies or declines, books a consult, and creates a lead in Filevine.",
  category: "Intake",
  status: "Published",
  version: "v2",
  icon: PhoneCall,
  iconColor: "text-blue-800",
  iconBg: "bg-blue-50",
  totalRuns: 3147,
  lastRun: "2m ago",
  trigger: {
    kind: "incoming-call",
    source: "Phone line",
    event: "Incoming call",
    description: "Always-on. Picks up calls to (415) 555-LAW1.",
  },
  inputs: [],
  steps: [
    {
      id: "s1",
      type: "voice",
      name: "Live intake call",
      detail:
        "You are the receptionist for Veritec Law's main line. Answer warmly. Get the caller's name and a callback number. Identify the matter type, then walk the right qualification track. Decline politely for matter types we don't handle (criminal, family, immigration) and for callers who already have an attorney. Book a free consultation if they qualify.\n\nNever give legal advice. Never quote settlement amounts. Switch to Spanish if the caller opens in Spanish.",
      voice: {
        maxDurationSec: 600,
        language: "auto",
        agentFlow: [
          { id: "answer", kind: "answer", label: "Answer warmly", note: "\u201cThanks for calling Veritec Law\u201d" },
          { id: "name", kind: "ask", label: "Get name + callback number" },
          {
            id: "classify",
            kind: "branch",
            label: "Classify matter type",
            note: "Listen for the type before going deeper",
            branches: [
              {
                match: "Auto / MVA / Personal injury",
                flow: [
                  { id: "mva-incident", kind: "ask", label: "Date + location of incident" },
                  { id: "mva-injury", kind: "ask", label: "Injuries + treatment status" },
                  { id: "mva-rep", kind: "ask", label: "Already represented?" },
                  { id: "mva-book", kind: "ask", label: "Book free consult" },
                ],
              },
              {
                match: "Premises / slip and fall",
                flow: [
                  { id: "prem-where", kind: "ask", label: "Where + circumstances" },
                  { id: "prem-injury", kind: "ask", label: "Injuries + treatment" },
                  { id: "prem-book", kind: "ask", label: "Book free consult" },
                ],
              },
              {
                match: "Criminal / family / immigration",
                flow: [
                  { id: "decline-matter", kind: "decline", label: "Decline politely + refer", note: "\u201cWe focus on personal injury\u201d" },
                ],
              },
              {
                match: "Already represented",
                flow: [
                  { id: "decline-rep", kind: "decline", label: "Decline politely", note: "Conflict-of-interest rule" },
                ],
              },
              {
                match: "Off-script (settled, out-of-state, distress)",
                flow: [
                  { id: "escalate", kind: "escalate", label: "Hand off to bilingual associate" },
                ],
              },
            ],
          },
          { id: "log", kind: "log", label: "Hang up + create Lead in Filevine" },
        ],
      },
      returns: [
        { id: "r1_a", name: "Caller name", type: "text" },
        { id: "r1_b", name: "Callback phone", type: "phone" },
        { id: "r1_c", name: "Matter type", type: "enum", options: ["MVA", "Premises", "Dog bite", "Workplace", "Criminal (declined)", "Family (declined)", "Already represented (declined)", "Off-script (escalated)", "Other"] },
        { id: "r1_d", name: "Outcome", type: "enum", options: ["Qualified \u2014 consult booked", "Qualified \u2014 callback needed", "Declined \u2014 matter type", "Declined \u2014 already represented", "Voicemail / hangup", "Escalated"] },
        { id: "r1_e", name: "Consult booked", type: "text", description: "Date/time + attorney, or 'No'" },
        { id: "r1_f", name: "Outcome reason", type: "long_text", description: "1\u20132 sentences for the operator review" },
      ],
    },
  ],
}

/** Filevine integration: fires when a project moves into "Records pending" phase. */
PLAYBOOK_DEFS["filevine-records-request"] = {
  id: "filevine-records-request",
  name: "Filevine Records Request",
  description:
    "When a Filevine project moves into the 'Records pending' phase, fetch the project context and draft a HIPAA-compliant records request letter for each treating provider — ready for the paralegal to review and send.",
  category: "Pre-litigation",
  status: "Published",
  version: "v3",
  icon: Notepad,
  iconColor: "text-blue-800",
  iconBg: "bg-blue-50",
  totalRuns: 287,
  lastRun: "44m ago",
  trigger: {
    kind: "integration",
    source: "Filevine",
    event: "Project phase changed",
    description: "Fires when a project moves into phase: Records pending",
  },
  inputs: [
    {
      id: "in_1",
      name: "Project",
      type: "case-ref",
      required: true,
      description: "Filevine project — passed from the trigger payload",
      sample: "FV-PRJ-44218 (Estrada v. CityRide)",
    },
    {
      id: "in_2",
      name: "Provider",
      type: "text",
      required: true,
      description: "Provider this letter goes to (one letter per provider)",
      sample: "St. Mary's Medical Center",
    },
    {
      id: "in_3",
      name: "Patient",
      type: "text",
      required: true,
      description: "Plaintiff / patient name",
      sample: "Camille Estrada",
    },
    {
      id: "in_4",
      name: "DOB",
      type: "date",
      required: true,
      description: "Patient date of birth",
      sample: "1992-07-14",
    },
  ],
  steps: [
    {
      id: "s0",
      type: "fetch",
      name: "Project context",
      detail:
        "Pull case info and authorization-on-file status from Filevine for {{Project}}. Includes patient, DOB, dates of treatment, signed HIPAA auth.",
    },
    {
      id: "s1",
      type: "format",
      name: "Draft records request letter",
      detail:
        "Read {{Project context}} and fill the firm's Records Request Letter template for {{Provider}}. Use the HITECH cost-cap language. Set the response deadline to 30 days from today. Attach the patient's signed HIPAA authorization (already on file in Filevine).",
      templateId: "records-request-letter",
      expanded: true,
    },
  ],
}

/** Empty draft used as the starting point on /playbooks/new. */
const NEW_PLAYBOOK: PlaybookDef = {
  id: "_new",
  name: "Untitled playbook",
  description: "Add a description so other operators know what this does.",
  category: "Draft",
  status: "Draft",
  version: "v0",
  icon: PencilSimpleLine,
  iconColor: "text-zinc-600",
  iconBg: "bg-gray-100",
  totalRuns: 0,
  lastRun: "—",
  inputs: [],
  steps: [],
}

/** Fallback to Medical Records Summary if id not found */
export function getPlaybook(id: string): PlaybookDef {
  if (id === "_new" || id === "new") return NEW_PLAYBOOK
  return PLAYBOOK_DEFS[id] ?? PLAYBOOK_DEFS["medical-records-summary"]
}

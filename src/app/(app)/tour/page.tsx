import type { ComponentType } from "react"
import Link from "next/link"
import {
  BookOpen,
  Stack,
  Books,
  FlowArrow,
  Sparkle,
  Tray,
  Notepad,
  ArrowSquareOut,
  CaretRight,
  CheckCircle,
  PencilRuler,
  Database,
  Play,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
} from "@phosphor-icons/react/dist/ssr"

type IconType = ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" }>

type Tile = {
  title: string
  blurb: string
  href: string
  icon: IconType
  iconBg: string
  iconColor: string
  // small bullet list of what's there
  bullets?: string[]
  // optional pill labels
  tags?: { label: string; tone?: "blue" | "amber" | "violet" | "teal" | "green" }[]
}

const SECTIONS: { title: string; subtitle: string; tiles: Tile[] }[] = [
  {
    title: "AI procedures",
    subtitle: "How AI work gets defined, run, and inspected",
    tiles: [
      {
        title: "Playbooks library",
        blurb:
          "Browse all AI procedures and their runs. Filter by playbook, drill into any run.",
        href: "/playbooks",
        icon: BookOpen,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-800",
        bullets: [
          "12 published playbooks across discovery, depo prep, demand letters",
          "Unified runs grid with per-deliverable shape rendering",
          "Document deliverables show as teal pills, records as violet",
        ],
      },
      {
        title: "Playbook editor",
        blurb:
          "Visual canvas to compose playbook logic. Inputs → memory → prompts → deliverable.",
        href: "/playbooks/medical-records-summary/edit",
        icon: PencilRuler,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-700",
        bullets: [
          "Inline step editor — click any step to expand it in place",
          "Three step types: Fetch (writes memory) · Prompt (typed returns) · Format (fills a template)",
          "Variable picker grouped by Inputs · Memory · Data",
        ],
        tags: [
          { label: "Memory model", tone: "amber" },
          { label: "Inline editor", tone: "blue" },
        ],
      },
      {
        title: "Run — records deliverable",
        blurb:
          "Drill into a depo-prep run — the deliverable is a typed Questions table.",
        href: "/runs/run_01HMW",
        icon: Play,
        iconBg: "bg-green-50",
        iconColor: "text-green-700",
        bullets: [
          "Sample: depo-prep on CVSA-1189 (Maria Lopez deposition)",
          "Records-shaped deliverable rendered inline",
        ],
      },
      {
        title: "Run — document deliverable",
        blurb:
          "Drill into a demand-letter run — the deliverable is a filled DOCX.",
        href: "/runs/run_02DLD",
        icon: Play,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-700",
        bullets: [
          "Sample: demand-letter-draft on CVSA-1189",
          "Filled document rendered as a paper-style preview",
        ],
      },
    ],
  },
  {
    title: "Building blocks",
    subtitle: "What playbooks reach for — context and finished forms",
    tiles: [
      {
        title: "Templates",
        blurb:
          "Document templates that Format steps fill. Placeholder-style or example-based.",
        href: "/templates",
        icon: Stack,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-700",
        bullets: [
          "Demand letter, depo outline, medical records summary, etc.",
          "DOCX, PDF, Markdown, table — Format step output matches the template",
        ],
        tags: [{ label: "DOCX · PDF · Markdown · Table", tone: "teal" }],
      },
      {
        title: "Knowledge Base",
        blurb:
          "Static reference libraries — depo banks, expert notes, prior testimony.",
        href: "/knowledge",
        icon: Books,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-700",
        bullets: [
          "Plaintiff / defendant / expert deposition banks",
          "Referenced as Memory inputs from prompt steps",
        ],
        tags: [{ label: "Memory source", tone: "amber" }],
      },
    ],
  },
  {
    title: "Agents — beginning to end",
    subtitle:
      "Compose a blank workflow → fill it out → review every run in one place.",
    tiles: [
      {
        title: "1. Blank canvas",
        blurb:
          "Start fresh — same canvas as a filled-out agent, just empty. Add inputs, then steps.",
        href: "/agents/new",
        icon: PencilRuler,
        iconBg: "bg-zinc-100",
        iconColor: "text-zinc-700",
        bullets: [
          "Inputs collected \u2192 Add steps \u2192 Ends",
          "Same chrome as the filled editor",
        ],
      },
      {
        title: "2. Filled — Med Treatment Verification",
        blurb:
          "A real agent: Fetch the prior treatment record, then a Voice step that calls the client.",
        href: "/playbooks/med-treatment-verification-voice/edit",
        icon: PhoneCall,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-700",
        bullets: [
          "Inputs: Case, Client phone, Client name",
          "Editable Call Configuration: dial, language, max duration",
          "Returns: typed extraction fields",
        ],
        tags: [{ label: "Voice agent", tone: "violet" }],
      },
      {
        title: "3. All agent runs",
        blurb:
          "Centralized list across every agent — not per-agent. Filter, search, click any row to drill in.",
        href: "/agents",
        icon: Play,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-800",
        bullets: [
          "Library tab: agents in a table",
          "Runs tab: every voice run across all agents",
          "Click a row \u2192 transcript, fields, audit trail",
        ],
      },
    ],
  },
  {
    title: "Integration-triggered playbooks",
    subtitle:
      "Same canvas, but the run kicks off from an outside system event \u2014 not a manual click.",
    tiles: [
      {
        title: "Filevine Records Request",
        blurb:
          "Fires when a Filevine project moves into 'Records pending'. Drafts a HIPAA-compliant records request letter for each provider.",
        href: "/playbooks/filevine-records-request/edit",
        icon: PhoneCall,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-800",
        bullets: [
          "Trigger node at the top of the canvas: Filevine \u2192 Project phase changed",
          "Fetch the project context, then Format step fills the Records Request Letter template",
          "287 runs to date; rendered as a download pill in the runs grid",
        ],
        tags: [{ label: "Filevine", tone: "blue" }, { label: "Trigger: integration", tone: "violet" }],
      },
      {
        title: "Sample run \u2014 Estrada records request",
        blurb:
          "St. Mary's Medical Center letter, drafted 44 minutes ago when the Filevine project flipped phases.",
        href: "/runs/run_15FV",
        icon: Play,
        iconBg: "bg-green-50",
        iconColor: "text-green-700",
      },
    ],
  },
  {
    title: "Operations",
    subtitle: "Day-to-day flows around case files",
    tiles: [
      {
        title: "FileFlow Inbox",
        blurb:
          "Inbound case files routed by intent. First response, urgent, internal review queues.",
        href: "/",
        icon: Tray,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-700",
        bullets: ["Triage queue with first-response SLAs", "Drill into any incoming file"],
      },
      {
        title: "Workflows (case lifecycles)",
        blurb:
          "Multi-stage workflows that span the whole case: intake → litigation → settlement.",
        href: "/workflows",
        icon: FlowArrow,
        iconBg: "bg-sky-50",
        iconColor: "text-sky-700",
        bullets: [
          "Distinct from playbooks — playbooks are AI tasks; workflows are process",
          "Templates for pre-lit, intake, litigation lifecycles",
        ],
      },
    ],
  },
  {
    title: "Concept explorations",
    subtitle: "Standalone mockups outside the main app",
    tiles: [
      {
        title: "Magic wand",
        blurb: "Spot test of an inline AI-edit affordance.",
        href: "/mockups/magic-wand",
        icon: Sparkle,
        iconBg: "bg-fuchsia-50",
        iconColor: "text-fuchsia-700",
      },
      {
        title: "Playbooks flow",
        blurb: "Earlier flow diagram exploration for the editor canvas.",
        href: "/mockups/playbooks-flow",
        icon: FlowArrow,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-700",
      },
    ],
  },
]

const TONE_CLASS: Record<NonNullable<Tile["tags"]>[number]["tone"] & string, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  green: "bg-green-50 text-green-700 border-green-200",
}

const HIGHLIGHTS = [
  "Inline step editor with grouped variable picker (Inputs · Memory · Data)",
  "Fetch steps write context to memory; Prompt steps emit typed returns",
  "Format steps auto-derive their deliverable from the template",
  "Runs grid renders document, records, and scalar deliverables differently",
  "Voice agents: inbox, live inbound queue, and outbound pipeline",
  "Transcript ↔ extracted-fields coupling on every call review",
]

export default function TourPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50 overflow-auto">
      {/* Hero */}
      <header className="border-b border-gray-200 bg-white px-6 py-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-800 mb-2">
            <Notepad className="h-3.5 w-3.5" weight="bold" />
            Veritec AI · Tour
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 mb-1">
            What we&rsquo;ve built so far
          </h1>
          <p className="text-sm text-zinc-600 max-w-[640px] leading-relaxed">
            A pass through the modules that exist in the app today. Click any tile to open it.
          </p>

          {/* Highlights strip */}
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5 max-w-[860px]">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h}
                className="flex items-start gap-1.5 text-xs text-zinc-700 leading-relaxed"
              >
                <CheckCircle
                  className="h-3.5 w-3.5 text-blue-800 mt-0.5 shrink-0"
                  weight="fill"
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Concepts — Workflow vs Agent runtime */}
      <div className="px-6 pt-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-zinc-900">Workflow vs Agent</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Two layers, not two kinds. The workflow defines structure; the voice agent is
              the runtime that conducts the conversation inside it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ConceptCard
              kind="Workflow"
              maps="The structure"
              tone="blue"
              tagline="What the automation accomplishes, in what order"
              touches="The sequence — inputs, fetches, conversational steps, deliverable"
              starts="A trigger — manual, integration event, web form, cadence, webhook"
              produces="A run record + extracted fields written to memory / case"
              steps="Fetch \u00b7 Prompt \u00b7 Format \u00b7 Voice"
              risk="Low \u2014 deterministic at the high level, re-runnable"
              examples={[
                "Filevine Records Request (drafts a letter on phase change)",
                "Med Treatment Verification (Fetch \u2192 Voice)",
                "Intake Callback (Voice)",
              ]}
            />
            <ConceptCard
              kind="Voice agent"
              maps="The runtime"
              tone="violet"
              tagline="Conversational intelligence inside conversational steps"
              touches="The actual call \u2014 speaks naturally, listens, adapts"
              starts="When a Voice step in the workflow fires"
              produces="A transcript + extracted structured fields"
              steps="Speech \u00b7 listening \u00b7 phrasing \u00b7 edge-case handling"
              risk="High \u2014 can mis-speak; needs review, escalation, take-over"
              examples={[
                "Authored as a persona + goals + extraction schema",
                "Runs inside any Voice step; not its own page",
                "Same runtime regardless of which workflow it's inside",
              ]}
            />
          </div>
          <div className="mt-3 rounded-[10px] border border-gray-200 bg-white p-4 flex items-start gap-3">
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-amber-50 shrink-0">
              <CheckCircle className="h-4 w-4 text-amber-700" weight="fill" />
            </div>
            <div className="text-xs leading-relaxed text-zinc-700 max-w-[680px]">
              <span className="font-semibold text-zinc-900">Why both \u2014</span>{" "}
              workflow alone is rigid (call tree breaks on unexpected human responses).
              Agent alone is chatty and off-script (no measurable outcome). The
              power is in <em>structured workflow + adaptive agent</em>: the workflow
              owns the goal and sequence; the agent owns how each conversational step
              actually plays out.
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 py-8">
        <div className="max-w-[1100px] mx-auto space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-zinc-900">{section.title}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{section.subtitle}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {section.tiles.map((t) => (
                  <Link
                    key={t.title}
                    href={t.href}
                    className="group rounded-[10px] border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col"
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      <div
                        className={`flex items-center justify-center h-9 w-9 rounded-md ${t.iconBg} shrink-0`}
                      >
                        <t.icon className={`h-5 w-5 ${t.iconColor}`} weight="bold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-800 transition-colors">
                            {t.title}
                          </h3>
                          <ArrowSquareOut
                            className="h-3 w-3 text-zinc-300 group-hover:text-blue-800 transition-colors"
                            weight="bold"
                          />
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                          {t.blurb}
                        </p>
                      </div>
                    </div>

                    {t.bullets && (
                      <ul className="mt-2 space-y-1 pl-0.5">
                        {t.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-1.5 text-[11px] text-zinc-600 leading-relaxed"
                          >
                            <CaretRight
                              className="h-3 w-3 text-zinc-300 mt-0.5 shrink-0"
                              weight="bold"
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {t.tags && (
                      <div className="mt-3 flex items-center gap-1 flex-wrap">
                        {t.tags.map((tag) => (
                          <span
                            key={tag.label}
                            className={`inline-flex items-center rounded-md border px-1.5 py-0 text-[10px] font-medium ${
                              TONE_CLASS[tag.tone ?? "blue"]
                            }`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex-1" />
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-[11px] font-medium text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open
                      <CaretRight className="h-2.5 w-2.5" weight="bold" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {/* Footer note */}
          <div className="rounded-[10px] border border-dashed border-gray-300 bg-white px-4 py-3 flex items-start gap-2">
            <Database className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" weight="bold" />
            <div className="text-xs text-zinc-600 leading-relaxed">
              All data shown is sample data. Sidebar has additional entries
              (Reporting, DocIntel, Drafting, Voice, Cases, Documents, Contacts) —
              those are placeholder routes and not yet built out.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConceptCard({
  kind,
  maps,
  tone,
  tagline,
  touches,
  starts,
  produces,
  steps,
  risk,
  examples,
}: {
  kind: "Playbook" | "Agent" | "Workflow" | "Voice agent"
  maps: string
  tone: "blue" | "violet"
  tagline: string
  touches: string
  starts: string
  produces: string
  steps: string
  risk: string
  examples: string[]
}) {
  const cls =
    tone === "violet"
      ? { ring: "border-violet-200 bg-violet-50/30", header: "text-violet-800", pill: "bg-violet-100 text-violet-800" }
      : { ring: "border-blue-200 bg-blue-50/30", header: "text-blue-800", pill: "bg-blue-100 text-blue-800" }
  return (
    <div className={`rounded-[10px] border ${cls.ring} p-4`}>
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className={`text-base font-semibold ${cls.header}`}>{kind}</h3>
        <span className={`text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0 ${cls.pill}`}>
          {maps}
        </span>
      </div>
      <p className="text-xs text-zinc-700 mb-3 italic">{tagline}.</p>
      <dl className="text-xs space-y-2">
        <ConceptRow term="Touches" desc={touches} />
        <ConceptRow term="Starts when" desc={starts} />
        <ConceptRow term="Produces" desc={produces} />
        <ConceptRow term="Steps" desc={steps} mono />
        <ConceptRow term="Risk" desc={risk} />
      </dl>
      <div className="mt-3 pt-3 border-t border-gray-200/70">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">
          Today
        </div>
        <ul className="space-y-0.5">
          {examples.map((e) => (
            <li key={e} className="text-xs text-zinc-700">
              · {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ConceptRow({ term, desc, mono = false }: { term: string; desc: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mt-0.5">
        {term}
      </dt>
      <dd className={`text-zinc-700 ${mono ? "font-mono text-[11px]" : ""}`}>{desc}</dd>
    </div>
  )
}

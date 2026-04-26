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
        title: "Run detail",
        blurb:
          "Drill into a single playbook run — inputs used, steps executed, deliverable rendered.",
        href: "/runs/run_03DPT",
        icon: Play,
        iconBg: "bg-green-50",
        iconColor: "text-green-700",
        bullets: [
          "Sample: depo-prep run on CVSA-1189 (Cruz Lopez deposition)",
          "Records-shaped deliverable with the question table inline",
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
      {
        title: "Agents",
        blurb: "Agents library — purpose-built assistants for specific tasks.",
        href: "/agents",
        icon: Sparkle,
        iconBg: "bg-rose-50",
        iconColor: "text-rose-700",
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

"use client"

import { useState } from "react"
import {
  Books,
  ChatCircleText,
  ShieldCheck,
  Lightning,
  PaperPlaneRight,
  Question,
  ArrowSquareOut,
} from "@phosphor-icons/react"
import { getPlaybook, type Field } from "@/lib/playbook-data"

/**
 * Callable agents are not workflows. They're configuration bundles:
 * persona + bound knowledge + sample questions + guardrails. This editor
 * is a single configuration page, not the canvas.
 */
export function CallableAgentEditor({ playbookId }: { playbookId: string }) {
  const pb = getPlaybook(playbookId)

  // The single Prompt step carries the persona / instructions
  const promptStep = pb.steps.find((s) => s.type === "prompt")
  const persona = promptStep?.detail ?? ""

  const knowledgeInputs = pb.inputs.filter((i) => i.type === "kb-ref")
  const otherInputs = pb.inputs.filter((i) => i.type !== "kb-ref")
  const returns = promptStep?.returns ?? []
  const sampleQuestions = pb.sampleQuestions ?? []
  const guardrails = pb.guardrails ?? []

  return (
    <div className="flex flex-1 min-h-0 bg-gray-50 overflow-auto">
      <div className="flex-1 min-w-0 px-6 py-6">
        <div className="max-w-[760px] mx-auto space-y-5">
          {/* Identity */}
          <Section
            label="Identity"
            description="What this agent is and when staff should ask it"
          >
            <div className="rounded-[10px] border border-gray-200 bg-white p-4 space-y-2">
              <div className="text-base font-semibold text-zinc-900">{pb.name}</div>
              <p className="text-sm text-zinc-600 leading-relaxed">{pb.description}</p>
            </div>
          </Section>

          {/* Knowledge */}
          <Section
            label="Knowledge"
            description="What the agent knows. Without this it can't answer specifics."
            icon={Books}
            tone="indigo"
          >
            <div className="space-y-2">
              {knowledgeInputs.map((kb) => (
                <KnowledgeCard key={kb.id} field={kb} />
              ))}
              {knowledgeInputs.length === 0 && (
                <div className="rounded-md border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-zinc-500">
                  No knowledge bound. Add a Knowledge Base reference so the agent has something to draw from.
                </div>
              )}
              <button className="w-full rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors">
                + Add knowledge source
              </button>
            </div>
          </Section>

          {/* Persona / Instructions */}
          <Section
            label="Persona & instructions"
            description="How the agent talks. Read out loud — does it sound right?"
            icon={ChatCircleText}
            tone="violet"
          >
            <div className="rounded-[10px] border border-gray-200 bg-white">
              <textarea
                defaultValue={persona}
                rows={8}
                className="w-full px-4 py-3 text-sm bg-white rounded-[10px] focus:outline-none resize-none leading-relaxed"
                placeholder="You are a [specialist] who [tone]. Use the bound knowledge as your reference..."
              />
            </div>
          </Section>

          {/* Sample questions */}
          <Section
            label="Sample questions"
            description="Surface these in the chat invocation surface so staff know what to ask"
            icon={Question}
            tone="amber"
          >
            <div className="space-y-1.5">
              {sampleQuestions.map((q, i) => (
                <SampleQuestionRow key={i} question={q} />
              ))}
              <button className="w-full rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors">
                + Add sample question
              </button>
            </div>
          </Section>

          {/* Guardrails */}
          {guardrails.length > 0 && (
            <Section
              label="Guardrails"
              description="What the agent must not do, no matter what's asked"
              icon={ShieldCheck}
              tone="rose"
            >
              <ul className="space-y-1.5">
                {guardrails.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900"
                  >
                    <ShieldCheck
                      className="h-3.5 w-3.5 text-rose-600 mt-0.5 shrink-0"
                      weight="bold"
                    />
                    <span>{g}</span>
                  </li>
                ))}
                <button className="w-full rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-zinc-500 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50/40 transition-colors">
                  + Add guardrail
                </button>
              </ul>
            </Section>
          )}

          {/* Returns */}
          {returns.length > 0 && (
            <Section
              label="Returns"
              description="What the agent's answer carries back to the caller"
            >
              <div className="rounded-[10px] border border-gray-200 bg-white p-3 space-y-1">
                {returns.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                  >
                    <span className="text-zinc-900 font-medium">{r.name}</span>
                    <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600">
                      {r.type === "long_text" ? "Long text" : r.type === "list" ? "List" : r.type}
                    </span>
                    {r.description && (
                      <span className="text-[11px] text-zinc-500 truncate">
                        {r.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Inputs other than knowledge — for completeness */}
          {otherInputs.length > 0 && (
            <Section
              label="Optional bindings"
              description="Other inputs the agent can be invoked with (case context, etc.)"
            >
              <div className="rounded-[10px] border border-gray-200 bg-white p-3 space-y-1">
                {otherInputs.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                  >
                    <span className="text-zinc-900 font-medium">{f.name}</span>
                    <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600">
                      {f.type === "case-ref" ? "Case" : f.type}
                    </span>
                    {f.description && (
                      <span className="text-[11px] text-zinc-500 truncate">
                        {f.description}
                      </span>
                    )}
                    {f.required ? (
                      <span className="text-[10px] text-rose-600 font-medium">required</span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">optional</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* Right rail — chat preview */}
      <ChatPreview agentName={pb.name} sampleQuestions={sampleQuestions} />
    </div>
  )
}

function Section({
  label,
  description,
  children,
  icon: Icon,
  tone,
}: {
  label: string
  description?: string
  children: React.ReactNode
  icon?: typeof Books
  tone?: "indigo" | "violet" | "amber" | "rose"
}) {
  const toneCls = tone
    ? {
        indigo: "text-indigo-700 bg-indigo-50 border-indigo-200",
        violet: "text-violet-700 bg-violet-50 border-violet-200",
        amber: "text-amber-700 bg-amber-50 border-amber-200",
        rose: "text-rose-700 bg-rose-50 border-rose-200",
      }[tone]
    : ""
  return (
    <section>
      <header className="flex items-center gap-2 mb-2">
        {Icon && tone && (
          <span className={`flex items-center justify-center h-5 w-5 rounded border ${toneCls}`}>
            <Icon className="h-3 w-3" weight="bold" />
          </span>
        )}
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
          {label}
        </h3>
        {description && (
          <span className="text-[11px] text-zinc-500">· {description}</span>
        )}
      </header>
      {children}
    </section>
  )
}

function KnowledgeCard({ field }: { field: Field }) {
  return (
    <div className="rounded-md border border-indigo-200 bg-indigo-50/40 px-3 py-2.5 flex items-start gap-2.5">
      <Books className="h-4 w-4 text-indigo-700 mt-0.5 shrink-0" weight="bold" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-zinc-900">{field.name}</span>
          {field.required && (
            <span className="text-[10px] font-medium text-rose-600">required</span>
          )}
          <code className="ml-auto font-mono text-[10px] text-indigo-700 bg-white border border-indigo-200 px-1 py-0 rounded">
            {`{{${field.name}}}`}
          </code>
        </div>
        {field.sample && (
          <div className="text-[11px] text-zinc-500 italic mt-0.5">
            Example: {field.sample}
          </div>
        )}
        {field.description && (
          <div className="text-[11px] text-zinc-600 mt-0.5">{field.description}</div>
        )}
      </div>
    </div>
  )
}

function SampleQuestionRow({ question }: { question: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/40 px-3 py-2 text-sm text-zinc-800 group">
      <Question className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" weight="bold" />
      <span className="flex-1">{question}</span>
      <button
        className="text-[11px] text-zinc-500 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit"
      >
        Edit
      </button>
    </div>
  )
}

// ── Chat preview rail ────────────────────────────────────────────────

function ChatPreview({
  agentName,
  sampleQuestions,
}: {
  agentName: string
  sampleQuestions: string[]
}) {
  const [draft, setDraft] = useState("")
  return (
    <aside className="w-[360px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-100">
          <ChatCircleText className="h-4 w-4 text-blue-800" weight="bold" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900 truncate">Test in chat</div>
          <div className="text-[11px] text-zinc-500">Ask {agentName} anything</div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-4 py-3 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Try one of these
        </div>
        <div className="space-y-1.5">
          {sampleQuestions.slice(0, 4).map((q, i) => (
            <button
              key={i}
              onClick={() => setDraft(q)}
              className="w-full text-left text-xs text-zinc-700 leading-relaxed rounded-md border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 transition-colors px-2.5 py-2"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-zinc-400 italic pt-2 border-t border-gray-100">
          Bind to a case to get case-aware answers \u2014 the agent will read that case's medical record automatically.
        </div>
      </div>

      <footer className="border-t border-gray-200 p-3 shrink-0 bg-white">
        <div className="rounded-md border border-gray-200 bg-white focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-transparent focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center gap-1 px-2 py-1.5 border-t border-gray-100">
            <span className="text-[10px] text-zinc-400">
              Hit Enter to send
            </span>
            <div className="flex-1" />
            <button
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-blue-800 hover:bg-blue-900 text-white px-2 h-7 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PaperPlaneRight className="h-3 w-3" weight="fill" />
              Ask
            </button>
          </div>
        </div>
      </footer>
    </aside>
  )
}

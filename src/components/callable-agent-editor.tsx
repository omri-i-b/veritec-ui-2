"use client"

import { useState } from "react"
import {
  Books,
  ChatCircleText,
  ShieldCheck,
  PaperPlaneRight,
  Question,
  Plus,
  Trash,
  Sparkle,
} from "@phosphor-icons/react"
import { getPlaybook, type Field } from "@/lib/playbook-data"

/**
 * Callable agents are configuration bundles, not workflows.
 * Two-column layout: editable config on the left, chat preview on the right.
 * Sections are compact and scannable; the heavy textareas (persona) get the
 * most space because that's where authoring time goes.
 */
export function CallableAgentEditor({ playbookId }: { playbookId: string }) {
  const pb = getPlaybook(playbookId)

  const promptStep = pb.steps.find((s) => s.type === "prompt")
  const persona = promptStep?.detail ?? ""
  const knowledgeInputs = pb.inputs.filter((i) => i.type === "kb-ref")
  const otherInputs = pb.inputs.filter((i) => i.type !== "kb-ref")
  const returns = promptStep?.returns ?? []
  const sampleQuestions = pb.sampleQuestions ?? []
  const guardrails = pb.guardrails ?? []

  return (
    <div className="flex flex-1 min-h-0 bg-gray-50 overflow-hidden">
      {/* Left column — editable config */}
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-[720px] mx-auto px-6 py-6 space-y-5">
          {/* Description */}
          <div className="rounded-[10px] border border-gray-200 bg-white px-4 py-3">
            <p className="text-sm text-zinc-700 leading-relaxed">{pb.description}</p>
          </div>

          {/* Persona — biggest authoring surface */}
          <Block label="Persona & instructions">
            <textarea
              defaultValue={persona}
              rows={9}
              className="w-full px-3.5 py-3 text-sm rounded-[10px] border border-gray-200 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 resize-y leading-relaxed font-mono text-[13px]"
              placeholder="You are a [role] who [tone]. Use the bound knowledge as your reference..."
            />
          </Block>

          {/* Knowledge */}
          <Block label="Knowledge" hint="What the agent draws from">
            <div className="space-y-1.5">
              {knowledgeInputs.length === 0 ? (
                <EmptyAdd label="Add knowledge source" />
              ) : (
                <>
                  {knowledgeInputs.map((kb) => (
                    <KnowledgeRow key={kb.id} field={kb} />
                  ))}
                  <SubtleAdd label="Add knowledge source" />
                </>
              )}
            </div>
          </Block>

          {/* Sample questions */}
          <Block
            label="Sample questions"
            hint="Surface in chat so staff know what to ask"
          >
            <div className="space-y-1">
              {sampleQuestions.map((q, i) => (
                <SampleQuestionRow key={i} question={q} />
              ))}
              <SubtleAdd label="Add sample question" />
            </div>
          </Block>

          {/* Guardrails */}
          <Block label="Guardrails" hint="What the agent must not do">
            <div className="space-y-1">
              {guardrails.map((g, i) => (
                <GuardrailRow key={i} text={g} />
              ))}
              <SubtleAdd label="Add guardrail" />
            </div>
          </Block>

          {/* Returns + bindings — compact at the bottom */}
          {(returns.length > 0 || otherInputs.length > 0) && (
            <details className="rounded-[10px] border border-gray-200 bg-white">
              <summary className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 cursor-pointer hover:text-zinc-900">
                Advanced — bindings & return schema
              </summary>
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {otherInputs.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">
                      Bindings
                    </div>
                    <div className="space-y-1">
                      {otherInputs.map((f) => (
                        <FieldRow key={f.id} field={f} />
                      ))}
                    </div>
                  </div>
                )}
                {returns.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 mb-1">
                      Returns
                    </div>
                    <div className="space-y-1">
                      {returns.map((r) => (
                        <FieldRow key={r.id} field={r} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* Right rail — chat preview */}
      <ChatPreview agentName={pb.name} sampleQuestions={sampleQuestions} />
    </div>
  )
}

// ── Building blocks ────────────────────────────────────────────────────

function Block({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="flex items-baseline gap-2 mb-1.5 px-0.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
          {label}
        </h3>
        {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
      </header>
      {children}
    </section>
  )
}

function KnowledgeRow({ field }: { field: Field }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 flex items-center gap-2.5 group hover:border-indigo-300 transition-colors">
      <Books className="h-4 w-4 text-indigo-700 shrink-0" weight="bold" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-900 truncate">{field.name}</div>
        {field.sample && (
          <div className="text-[11px] text-zinc-500 truncate">{field.sample}</div>
        )}
      </div>
      <code className="font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded shrink-0">
        {`{{${field.name}}}`}
      </code>
      <button
        className="flex items-center justify-center h-6 w-6 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        title="Remove"
      >
        <Trash className="h-3 w-3" />
      </button>
    </div>
  )
}

function SampleQuestionRow({ question }: { question: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 flex items-start gap-2 group hover:border-amber-300 transition-colors">
      <Question className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" weight="bold" />
      <span className="flex-1 text-sm text-zinc-800 leading-snug">{question}</span>
      <button
        className="flex items-center justify-center h-6 w-6 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        title="Remove"
      >
        <Trash className="h-3 w-3" />
      </button>
    </div>
  )
}

function GuardrailRow({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-rose-200 bg-rose-50/40 px-3 py-2 flex items-start gap-2 group hover:border-rose-300 transition-colors">
      <ShieldCheck className="h-3.5 w-3.5 text-rose-600 mt-0.5 shrink-0" weight="bold" />
      <span className="flex-1 text-sm text-rose-900 leading-snug">{text}</span>
      <button
        className="flex items-center justify-center h-6 w-6 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        title="Remove"
      >
        <Trash className="h-3 w-3" />
      </button>
    </div>
  )
}

function FieldRow({ field }: { field: Field }) {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm">
      <span className="text-zinc-900 font-medium">{field.name}</span>
      <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0 text-[10px] font-medium text-zinc-600">
        {field.type === "long_text" ? "Long text" : field.type === "case-ref" ? "Case" : field.type}
      </span>
      {field.required ? (
        <span className="text-[10px] text-rose-600 font-medium uppercase tracking-wide">req</span>
      ) : (
        <span className="text-[10px] text-zinc-400">optional</span>
      )}
      {field.description && (
        <span className="text-[11px] text-zinc-500 truncate ml-auto max-w-[280px]">
          {field.description}
        </span>
      )}
    </div>
  )
}

function SubtleAdd({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors">
      <Plus className="h-3 w-3" weight="bold" />
      {label}
    </button>
  )
}

function EmptyAdd({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-zinc-500 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/40 transition-colors">
      <Plus className="h-4 w-4" weight="bold" />
      {label}
    </button>
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
    <aside className="w-[340px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-50">
          <Sparkle className="h-4 w-4 text-blue-800" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900 truncate">Test in chat</div>
          <div className="text-[11px] text-zinc-500">Ask {agentName} anything</div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto px-4 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-2">
          Try
        </div>
        <div className="space-y-1.5">
          {sampleQuestions.slice(0, 5).map((q, i) => (
            <button
              key={i}
              onClick={() => setDraft(q)}
              className="w-full text-left text-xs text-zinc-700 leading-relaxed rounded-md border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 transition-colors px-2.5 py-2"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <footer className="border-t border-gray-200 p-3 shrink-0 bg-white">
        <div className="rounded-lg border border-gray-200 bg-white focus-within:border-blue-800 focus-within:ring-2 focus-within:ring-blue-100">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-transparent focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-end px-2 pb-2">
            <button
              disabled={!draft.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-blue-800 hover:bg-blue-900 text-white px-2.5 h-7 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

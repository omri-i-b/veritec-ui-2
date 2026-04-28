"use client"

import { useState } from "react"
import { ArrowSquareOut, PencilSimple, Eye, EyeSlash, ShieldCheck, Check, X } from "@phosphor-icons/react"
import type { ExtractedField } from "@/lib/voice-data"

export function ExtractedFieldsPanel({
  fields,
  onJumpToTurn,
  onFieldEdit,
  initialPhiVisible = true,
  showToolbar = true,
}: {
  fields: ExtractedField[]
  onJumpToTurn?: (turnId: string) => void
  onFieldEdit?: (key: string, newValue: string) => void
  /** When false, PHI fields are masked until the operator reveals them. */
  initialPhiVisible?: boolean
  /** Hide the field-count + PHI toggle row (we already have a chrome above). */
  showToolbar?: boolean
}) {
  const [phiVisible, setPhiVisible] = useState(initialPhiVisible)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draftValue, setDraftValue] = useState("")
  const hasPhi = fields.some((f) => f.phi)

  const startEdit = (f: ExtractedField) => {
    setEditingKey(f.key)
    setDraftValue(f.value === null ? "" : String(f.value))
  }

  const commitEdit = (f: ExtractedField) => {
    onFieldEdit?.(f.key, draftValue)
    setEditingKey(null)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50/60 shrink-0">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Extracted fields
          </h3>
          <span className="text-[11px] text-zinc-400">· {fields.length}</span>
          <div className="flex-1" />
          {hasPhi && (
            <button
              onClick={() => setPhiVisible((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                phiVisible
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-gray-200 bg-white text-zinc-700 hover:border-gray-300"
              }`}
              title={phiVisible ? "Mask PHI fields" : "Reveal PHI fields"}
            >
              {phiVisible ? <Eye className="h-3 w-3" weight="bold" /> : <EyeSlash className="h-3 w-3" weight="bold" />}
              PHI {phiVisible ? "shown" : "masked"}
            </button>
          )}
        </div>
      )}

      {/* Field list */}
      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
        {fields.map((f) => {
          const isEditing = editingKey === f.key
          const isPhiHidden = f.phi && !phiVisible
          return (
            <div
              key={f.key}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {f.label}
                </span>
                {f.phi && (
                  <span
                    className="inline-flex items-center rounded bg-amber-50 text-amber-800 border border-amber-200 px-1 py-0 text-[9px] font-semibold uppercase tracking-wide"
                    title="Contains PHI — gated in summary views"
                  >
                    PHI
                  </span>
                )}
                {typeof f.confidence === "number" && (
                  <ConfidencePill value={f.confidence} />
                )}
                {f.edited && (
                  <span
                    className="inline-flex items-center gap-1 rounded bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0 text-[9px] font-semibold uppercase tracking-wide"
                    title={`Edited by ${f.edited.by} at ${f.edited.at}`}
                  >
                    <PencilSimple className="h-2.5 w-2.5" weight="bold" />
                    Edited
                  </span>
                )}
                <div className="flex-1" />
                {f.sourceTurnId && !isEditing && (
                  <button
                    onClick={() => onJumpToTurn?.(f.sourceTurnId!)}
                    className="inline-flex items-center gap-0.5 text-[10px] text-blue-800 opacity-0 group-hover:opacity-100 hover:underline transition-opacity"
                    title="Jump to source turn"
                  >
                    Source
                    <ArrowSquareOut className="h-2.5 w-2.5" weight="bold" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(f)
                      if (e.key === "Escape") setEditingKey(null)
                    }}
                    className="flex-1 h-7 px-2 text-sm rounded border border-blue-300 bg-white focus:outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    onClick={() => commitEdit(f)}
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-blue-800 text-white hover:bg-blue-900 transition-colors"
                    title="Save"
                  >
                    <Check className="h-3.5 w-3.5" weight="bold" />
                  </button>
                  <button
                    onClick={() => setEditingKey(null)}
                    className="flex items-center justify-center h-7 w-7 rounded-md border border-gray-200 text-zinc-600 hover:bg-gray-100 transition-colors"
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(f)}
                  className="w-full text-left text-sm text-zinc-900 leading-snug hover:bg-gray-50 -mx-1 px-1 py-0.5 rounded transition-colors"
                  title="Click to edit"
                >
                  {isPhiHidden ? (
                    <span className="inline-flex items-center gap-1 text-zinc-400 italic">
                      <ShieldCheck className="h-3 w-3" weight="bold" />
                      Hidden — click PHI shown to reveal
                    </span>
                  ) : f.value === null ? (
                    <span className="text-zinc-400 italic">Not extracted</span>
                  ) : (
                    f.value
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const cls =
    value >= 0.9
      ? "bg-green-50 text-green-700 border-green-200"
      : value >= 0.75
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200"
  return (
    <span
      className={`inline-flex items-center rounded border px-1 py-0 text-[9px] font-semibold tabular-nums ${cls}`}
      title={`Model confidence: ${pct}%`}
    >
      {pct}%
    </span>
  )
}

"use client"

import { MagicWand, PaperPlaneTilt, Plus, SuitcaseSimple, X, Sparkle, ArrowRight } from "@phosphor-icons/react"

export default function MagicWandMockup() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Header */}
      <div className="w-full max-w-[720px] pt-12 pb-8 px-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-800">
            <MagicWand className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">Improve Prompt</h1>
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          A magic wand button appears in the chat input toolbar when the user has typed a prompt.
          Clicking it rewrites the prompt to be more specific and actionable.
        </p>
      </div>

      {/* Flow */}
      <div className="w-full max-w-[720px] px-6 flex flex-col gap-10 pb-16">

        {/* State 1: Empty */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-500">1</span>
            <span className="text-sm font-medium text-zinc-700">Empty state</span>
            <span className="text-xs text-zinc-400">Wand is hidden when there's no input</span>
          </div>
          <div className="rounded-[10px] bg-gray-50 border border-gray-200 overflow-clip">
            <div className="bg-white rounded-[10px] border border-zinc-200 flex flex-col justify-between h-[120px] p-3">
              <p className="text-sm text-zinc-400">Message AI...</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 rounded-[10px] px-2 py-0.5 text-xs font-medium">
                    <SuitcaseSimple className="h-3 w-3" weight="bold" />
                    CVSA-1234
                    <X className="h-3 w-3" />
                  </div>
                  <div className="flex items-center justify-center h-5 w-5 rounded-[10px] bg-gray-100">
                    <Plus className="h-3 w-3 text-zinc-600" />
                  </div>
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-800 opacity-50">
                  <PaperPlaneTilt className="h-3.5 w-3.5 text-white" weight="fill" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4 text-zinc-300 rotate-90" />
        </div>

        {/* State 2: User typed */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-500">2</span>
            <span className="text-sm font-medium text-zinc-700">User types a prompt</span>
            <span className="text-xs text-zinc-400">Wand appears next to send button</span>
          </div>
          <div className="rounded-[10px] bg-gray-50 border border-gray-200 overflow-clip">
            <div className="bg-white rounded-[10px] border border-zinc-200 flex flex-col justify-between h-[120px] p-3">
              <p className="text-sm text-zinc-900">Summarize the medical records for the plaintiff and identify any gaps in treatment</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 rounded-[10px] px-2 py-0.5 text-xs font-medium">
                    <SuitcaseSimple className="h-3 w-3" weight="bold" />
                    CVSA-1234
                    <X className="h-3 w-3" />
                  </div>
                  <div className="flex items-center justify-center h-5 w-5 rounded-[10px] bg-gray-100">
                    <Plus className="h-3 w-3 text-zinc-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-medium px-2 py-1 rounded-md">
                      Improve prompt
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                    </div>
                    <button className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-zinc-500">
                      <MagicWand className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-800">
                    <PaperPlaneTilt className="h-3.5 w-3.5 text-white" weight="fill" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4 text-zinc-300 rotate-90" />
        </div>

        {/* State 3: Improved */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-[11px] font-semibold text-blue-800">3</span>
            <span className="text-sm font-medium text-zinc-700">After clicking wand</span>
            <span className="text-xs text-zinc-400">Prompt is rewritten, blue highlight confirms improvement</span>
          </div>
          <div className="rounded-[10px] bg-gray-50 border border-gray-200 overflow-clip">
            <div className="bg-white rounded-[10px] border border-blue-200 ring-2 ring-blue-100 flex flex-col justify-between h-[120px] p-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkle className="h-3 w-3 text-blue-800" weight="fill" />
                  <span className="text-[11px] font-medium text-blue-800">Improved</span>
                </div>
                <p className="text-sm text-zinc-900">Analyze all medical records for the plaintiff in CVSA-1234. Create a chronological summary of treatments, identify gaps exceeding 30 days, and flag any pre-existing conditions relevant to causation.</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 rounded-[10px] px-2 py-0.5 text-xs font-medium">
                    <SuitcaseSimple className="h-3 w-3" weight="bold" />
                    CVSA-1234
                    <X className="h-3 w-3" />
                  </div>
                  <div className="flex items-center justify-center h-5 w-5 rounded-[10px] bg-gray-100">
                    <Plus className="h-3 w-3 text-zinc-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-800">
                    <MagicWand className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-800">
                    <PaperPlaneTilt className="h-3.5 w-3.5 text-white" weight="fill" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

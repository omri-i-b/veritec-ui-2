"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, PencilSimple, FloppyDisk } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DefinitionPanel } from "@/components/workflow-builder"
import { getPlaybook } from "@/lib/playbook-data"

function EditorIdentityHeader({ playbookId }: { playbookId: string }) {
  const pb = getPlaybook(playbookId)
  const Icon = pb.icon
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-start gap-3">
        <Link
          href={`/workflows/${pb.id}`}
          className="shrink-0 mt-1 flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
          title="Back to runs"
        >
          <ArrowLeft className="h-4 w-4" weight="bold" />
        </Link>
        <div className={`shrink-0 flex items-center justify-center h-10 w-10 rounded-[10px] ${pb.iconBg}`}>
          <Icon className={`h-5 w-5 ${pb.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            <PencilSimple className="h-3 w-3" />
            Editing playbook
          </div>
          <h1 className="text-base font-semibold text-zinc-900">{pb.name}</h1>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-[720px] leading-relaxed">{pb.description}</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 bg-blue-800 hover:bg-blue-900 shrink-0">
          <FloppyDisk className="h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  )
}

export function WorkflowEditor() {
  const params = useParams()
  const playbookId = (params?.id as string | undefined) ?? "medical-records-summary"

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      <EditorIdentityHeader playbookId={playbookId} />
      <div className="flex-1 min-h-0">
        <DefinitionPanel />
      </div>
    </div>
  )
}

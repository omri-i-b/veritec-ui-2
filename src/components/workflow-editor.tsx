"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, FloppyDisk } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DefinitionPanel } from "@/components/workflow-builder"
import { getPlaybook } from "@/lib/playbook-data"

function EditorHeader({ playbookId }: { playbookId: string }) {
  const pb = getPlaybook(playbookId)
  const Icon = pb.icon
  return (
    <div className="flex h-12 items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 shrink-0">
      <Link
        href={`/workflows/${pb.id}`}
        className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 text-zinc-500 hover:text-zinc-900 transition-colors"
        title="Back to runs"
      >
        <ArrowLeft className="h-4 w-4" weight="bold" />
      </Link>
      <div className={`flex items-center justify-center h-5 w-5 rounded ${pb.iconBg}`}>
        <Icon className={`h-3 w-3 ${pb.iconColor}`} weight="bold" />
      </div>
      <span className="text-sm font-semibold text-zinc-900 truncate">{pb.name}</span>
      <div className="flex-1" />
      <Button size="sm" className="h-8 gap-1.5 bg-blue-800 hover:bg-blue-900">
        <FloppyDisk className="h-3.5 w-3.5" />
        Save
      </Button>
    </div>
  )
}

export function WorkflowEditor() {
  const params = useParams()
  const playbookId = (params?.id as string | undefined) ?? "medical-records-summary"

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-white">
      <EditorHeader playbookId={playbookId} />
      <div className="flex-1 min-h-0">
        <DefinitionPanel />
      </div>
    </div>
  )
}

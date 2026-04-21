import { WorkflowEditor } from "@/components/workflow-editor"

export function generateStaticParams() {
  return [
    { id: "medical-records-summary" },
    { id: "depo-prep" },
    { id: "demand-letter-draft" },
    { id: "case-timeline" },
    { id: "damage-calculator" },
    { id: "similar-case-finder" },
    { id: "discovery-response" },
  ]
}

export default function WorkflowEditPage() {
  return <WorkflowEditor />
}

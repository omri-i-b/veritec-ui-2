import { ProcessDefinition } from "@/components/process-definition"

export function generateStaticParams() {
  return [{ id: "pre-lit-v3" }, { id: "intake-v2" }, { id: "lit-v1" }]
}

export default function Page() {
  return <ProcessDefinition />
}

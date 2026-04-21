import { KnowledgeDetail } from "@/components/knowledge-detail"

export function generateStaticParams() {
  return [
    { id: "plaintiff-depositions" },
    { id: "medical-expert-depositions" },
    { id: "police-officer-depositions" },
    { id: "defense-witness-depositions" },
    { id: "case-law-pi" },
    { id: "demand-letter-templates" },
    { id: "medical-billing-codes" },
  ]
}

export default function Page() {
  return <KnowledgeDetail />
}

import { TemplateDetail } from "@/components/template-detail"

export function generateStaticParams() {
  return [
    { id: "depo-outline" },
    { id: "qa-summary-table" },
    { id: "deposition-index" },
    { id: "demand-letter" },
    { id: "medical-records-summary" },
    { id: "case-memo" },
    { id: "witness-list" },
    { id: "damages-calc-report" },
    { id: "discovery-response" },
  ]
}

export default function Page() {
  return <TemplateDetail />
}

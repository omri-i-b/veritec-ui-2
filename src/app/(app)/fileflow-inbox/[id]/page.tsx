import { FileDetailView } from "@/components/file-detail-view"

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({ id: String(i) }))
}

export default function FileDetailPage() {
  return <FileDetailView />
}

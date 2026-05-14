import type { MediaType, IRendererProps } from "../veritec-viewer.types"
import { PdfRenderer } from "./pdf-renderer"

const rendererRegistry = [
  {
    mediaType: "pdf" as MediaType,
    component: PdfRenderer,
    extensions: ["pdf"],
  },
]

export function detectMediaType(url: string): MediaType {
  // For signed URLs, the actual extension is often buried — default to PDF for fileflow
  const extension = url.split(".").pop()?.toLowerCase().split("?")[0] || ""
  for (const entry of rendererRegistry) {
    if (entry.extensions.includes(extension)) return entry.mediaType
  }
  // Default to PDF for blob storage URLs (signed URLs won't have .pdf extension)
  return "pdf"
}

export function getRenderer(mediaType: MediaType): React.ComponentType<IRendererProps> | null {
  const entry = rendererRegistry.find((r) => r.mediaType === mediaType)
  return entry?.component || null
}

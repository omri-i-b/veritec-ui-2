import { notFound } from "next/navigation"
import { VoiceCallDetail } from "@/components/voice-call-detail"
import { VOICE_CALLS, getCall } from "@/lib/voice-data"

export function generateStaticParams() {
  return VOICE_CALLS.map((c) => ({ id: c.id }))
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const call = getCall(id)
  if (!call) notFound()
  return <VoiceCallDetail call={call} backHref="/agents" />
}

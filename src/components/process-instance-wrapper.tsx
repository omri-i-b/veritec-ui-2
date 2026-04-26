"use client"

import { ProcessInstance } from "@/components/process-instance"
import { SAMPLE_PROCESS } from "@/lib/process-data"

export function ProcessInstanceWrapper() {
  return <ProcessInstance process={SAMPLE_PROCESS} />
}

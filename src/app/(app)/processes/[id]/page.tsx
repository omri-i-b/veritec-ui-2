import { ProcessInstanceWrapper } from "@/components/process-instance-wrapper"

export function generateStaticParams() {
  return [
    { id: "PROC-4127" },
    { id: "PROC-3941" },
    { id: "PROC-4012" },
    { id: "PROC-4099" },
    { id: "PROC-4101" },
    { id: "PROC-4123" },
    { id: "PROC-4133" },
    { id: "PROC-4108" },
  ]
}

export default function Page() {
  return <ProcessInstanceWrapper />
}

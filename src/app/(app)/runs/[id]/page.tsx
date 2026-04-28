import { RunDetail } from "@/components/run-detail"

export function generateStaticParams() {
  return [
    { id: "run_01HMW" },
    { id: "run_01HMX" },
    { id: "run_03DPT" },
    { id: "run_04DTA" },
    { id: "run_08DI" },
    { id: "run_02DLD" },
    { id: "run_17CPU" },
  ]
}

export default function Page() {
  return <RunDetail />
}

"use client"

import { useEffect, useState } from "react"
import {
  Play,
  Pause,
  SpeakerHigh,
  Rewind,
  FastForward,
  DownloadSimple,
} from "@phosphor-icons/react"
import { formatDuration } from "./badges"

export function RecordingPlayer({
  durationSec,
  scrubToMs,
}: {
  durationSec: number
  /** When set, the player jumps to this position (ms) and starts playing. */
  scrubToMs?: number | null
}) {
  const [playing, setPlaying] = useState(false)
  const [posSec, setPosSec] = useState(0)
  const [speed, setSpeed] = useState<1 | 1.25 | 1.5 | 2>(1)

  // Mocked playback — advance posSec while playing
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setPosSec((p) => {
        const next = p + speed
        if (next >= durationSec) {
          setPlaying(false)
          return durationSec
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playing, speed, durationSec])

  // External scrub
  useEffect(() => {
    if (typeof scrubToMs === "number") {
      setPosSec(Math.floor(scrubToMs / 1000))
      setPlaying(true)
    }
  }, [scrubToMs])

  const pct = durationSec > 0 ? (posSec / durationSec) * 100 : 0

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 border-t border-gray-200 bg-white">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors shrink-0"
        title={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-4 w-4" weight="fill" /> : <Play className="h-4 w-4" weight="fill" />}
      </button>

      <button
        onClick={() => setPosSec((p) => Math.max(0, p - 10))}
        className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-600 hover:bg-gray-100 transition-colors"
        title="Back 10s"
      >
        <Rewind className="h-3.5 w-3.5" weight="bold" />
      </button>
      <button
        onClick={() => setPosSec((p) => Math.min(durationSec, p + 10))}
        className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-600 hover:bg-gray-100 transition-colors"
        title="Forward 10s"
      >
        <FastForward className="h-3.5 w-3.5" weight="bold" />
      </button>

      {/* Time + scrub bar */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-[11px] font-mono text-zinc-600 tabular-nums shrink-0 w-10 text-right">
          {formatDuration(posSec)}
        </span>
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            setPosSec(Math.floor(ratio * durationSec))
          }}
          className="flex-1 group relative h-1.5 rounded-full bg-gray-200 overflow-hidden"
          title="Scrub"
        >
          <div
            className="absolute inset-y-0 left-0 bg-blue-800 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </button>
        <span className="text-[11px] font-mono text-zinc-500 tabular-nums shrink-0 w-10">
          {formatDuration(durationSec)}
        </span>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-0 rounded-md border border-gray-200 bg-white p-0.5">
        {([1, 1.25, 1.5, 2] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors ${
              speed === s ? "bg-blue-800 text-white" : "text-zinc-600 hover:bg-gray-100"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      <button
        className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-600 hover:bg-gray-100 transition-colors"
        title="Volume"
      >
        <SpeakerHigh className="h-3.5 w-3.5" weight="bold" />
      </button>
      <button
        className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-600 hover:bg-gray-100 transition-colors"
        title="Download recording"
      >
        <DownloadSimple className="h-3.5 w-3.5" weight="bold" />
      </button>
    </div>
  )
}

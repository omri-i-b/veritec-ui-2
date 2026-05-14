import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface HighlightedTextProps {
  text: string
  query: string | null | undefined
  caseSensitive?: boolean
  className?: string
  markClassName?: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function HighlightedText({
  text,
  query,
  caseSensitive = false,
  className,
  markClassName,
}: HighlightedTextProps) {
  const trimmed = query?.trim() ?? ""

  const parts = useMemo(() => {
    if (!trimmed || !text) return null
    const regex = new RegExp(
      `(${escapeRegExp(trimmed)})`,
      caseSensitive ? "g" : "gi",
    )
    return text.split(regex)
  }, [text, trimmed, caseSensitive])

  if (!parts) {
    return <span className={className}>{text}</span>
  }

  const matcher = new RegExp(
    `^${escapeRegExp(trimmed)}$`,
    caseSensitive ? "" : "i",
  )

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part && matcher.test(part) ? (
          <mark
            // biome-ignore lint/suspicious/noArrayIndexKey: parts list is derived from a single immutable split
            key={index}
            className={cn(
              "rounded-sm bg-yellow-200 px-0.5 font-semibold text-neutral-900 dark:bg-yellow-400 dark:text-neutral-900",
              markClassName,
            )}
          >
            {part}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: parts list is derived from a single immutable split
          <span key={index}>{part}</span>
        ),
      )}
    </span>
  )
}

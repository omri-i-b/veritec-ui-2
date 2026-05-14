import { isValid, parse, parseISO } from "date-fns"
import type { SpreadsheetColumnType } from "./types"

export interface CoerceResult {
  ok: boolean
  value: unknown
  reason?: string
}

export function coerceValue(
  raw: unknown,
  type: SpreadsheetColumnType,
  opts: { maxLength?: number } = {},
): CoerceResult {
  if (type === "readonly") return { ok: false, value: raw, reason: "readonly" }

  const str = raw == null ? "" : String(raw).trim()

  if (type === "text") {
    const v = opts.maxLength ? str.slice(0, opts.maxLength) : str
    return { ok: true, value: v }
  }

  if (type === "number") {
    if (str === "") return { ok: true, value: null }
    const cleaned = str.replace(/[\s$,]/g, "")
    const n = Number(cleaned)
    if (!Number.isFinite(n))
      return { ok: false, value: raw, reason: "not a number" }
    return { ok: true, value: n }
  }

  if (type === "date") {
    if (str === "") return { ok: true, value: null }
    const iso = tryParseDate(str)
    if (!iso) return { ok: false, value: raw, reason: "unparseable date" }
    return { ok: true, value: iso }
  }

  return { ok: false, value: raw, reason: "unknown type" }
}

const DATE_FORMATS = [
  "yyyy-MM-dd",
  "yyyy/MM/dd",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "MM-dd-yyyy",
  "M-d-yyyy",
]

// 2-digit years use a 1950 pivot (Excel convention): < 50 → 20xx, else 19xx.
function expandTwoDigitYear(str: string): string {
  const m = /^(\d{1,2})([/-])(\d{1,2})([/-])(\d{2})$/.exec(str)
  if (!m) return str
  const [, mo, sep1, day, sep2, yr2] = m
  const yr = Number(yr2)
  const full = yr < 50 ? 2000 + yr : 1900 + yr
  return `${mo}${sep1}${day}${sep2}${full}`
}

function tryParseDate(raw: string): string | null {
  const str = expandTwoDigitYear(raw)
  const ref = new Date()
  // Anchor to UTC midnight — date-fns parses in local time, which would
  // drift by a day in negative UTC offsets.
  const toUtcIso = (d: Date): string =>
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString()

  if (/T|Z/.test(str)) {
    const iso = parseISO(str)
    return isValid(iso) ? toUtcIso(iso) : null
  }

  for (const fmt of DATE_FORMATS) {
    const parsed = parse(str, fmt, ref)
    if (isValid(parsed)) return toUtcIso(parsed)
  }
  return null
}

export function formatForClipboard(
  value: unknown,
  type: SpreadsheetColumnType,
): string {
  if (value == null) return ""
  if (type === "date") {
    const d = parseISO(String(value))
    if (!isValid(d)) return ""
    // UTC components keep output stable across time zones.
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  return String(value)
}

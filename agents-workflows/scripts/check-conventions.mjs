#!/usr/bin/env node
// Convention checker for the Veritec UI template.
// Prints warnings (does not fail the build) so prototype JSX stays
// portable to the app without a translation pass on import.
//
// Run with `npm run lint:conventions`.

import { readFileSync, readdirSync, statSync } from "node:fs"
import { extname, join, relative } from "node:path"

const ROOT = new URL("../src", import.meta.url).pathname
const TARGET_EXT = new Set([".ts", ".tsx"])

// Raw Tailwind color utilities that should be replaced with semantic
// tokens. Listing the most common offenders. The trailing `-NNN` is
// matched broadly via the regex.
const RAW_COLOR_RE = new RegExp(
  String.raw`\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|divide|placeholder|caret|accent|decoration|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b`,
  "g",
)

// Off-scale text sizes — `text-[10px]`, `text-[11px]`, etc.
const OFF_SCALE_TEXT_RE = /\btext-\[\d+px\]/g

// Shadows on bordered containers — caught conservatively as any
// `shadow-` utility, since the design system says "borders only".
const SHADOW_RE = /\bshadow-(?:sm|md|lg|xl|2xl|inner)\b/g

// Off-scale tracking values like `tracking-[0.08em]` (use `tracking-tight`/`tracking-wide`/`tracking-wider`).
const ARBITRARY_TRACKING_RE = /\btracking-\[[^\]]+\]/g

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) {
      yield* walk(full)
    } else if (TARGET_EXT.has(extname(full))) {
      yield full
    }
  }
}

const findings = []

// Vendored / established directories whose internals are not subject to
// the prototype-portability conventions. Prototypes consume their public
// APIs but should not be modifying their internals.
const VENDORED = [
  "/components/ui/",
  "/components/veritec-viewer/",
  "/components/spreadsheet-table/",
  "/lib/services/",
]

for (const file of walk(ROOT)) {
  if (VENDORED.some((v) => file.includes(v))) continue

  const text = readFileSync(file, "utf8")
  text.split("\n").forEach((line, i) => {
    const lineNo = i + 1
    const checks = [
      ["raw color", RAW_COLOR_RE],
      ["off-scale text size", OFF_SCALE_TEXT_RE],
      ["shadow on bordered surface", SHADOW_RE],
      ["arbitrary tracking", ARBITRARY_TRACKING_RE],
    ]
    for (const [label, re] of checks) {
      const matches = line.match(re)
      if (matches) {
        for (const m of matches) {
          findings.push({
            file: relative(ROOT, file),
            line: lineNo,
            label,
            match: m,
          })
        }
      }
    }
  })
}

if (findings.length === 0) {
  console.log("✓ No convention warnings — prototypes will port cleanly.")
  process.exit(0)
}

const grouped = new Map()
for (const f of findings) {
  if (!grouped.has(f.file)) grouped.set(f.file, [])
  grouped.get(f.file).push(f)
}

console.log(
  `\n⚠ ${findings.length} convention warning(s) across ${grouped.size} file(s).`,
)
console.log(
  "These will fail review when ported into the app. Replace with semantic tokens:\n",
)
console.log("  text-blue-700 / bg-blue-50    →  text-primary / bg-primary/10")
console.log("  bg-emerald-50 text-emerald-700 →  bg-success-muted text-success")
console.log("  bg-red-100 text-red-700        →  bg-danger-muted text-destructive")
console.log("  border-gray-200                →  border-border")
console.log("  text-zinc-500                  →  text-muted-foreground")
console.log("  text-[11px]                    →  text-xs")
console.log("  hover:shadow-sm                →  drop the shadow; use border\n")

for (const [file, items] of grouped) {
  console.log(`  ${file}`)
  for (const it of items) {
    console.log(`    ${it.line}: ${it.label} — ${it.match}`)
  }
}

// Exit 0 — warn-level, never fail the build.
process.exit(0)

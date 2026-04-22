<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Veritec AI — Design Conventions

This project is designed collaboratively with non-developers. When a user describes a screen, follow these conventions **without needing to be reminded**. The user should not have to specify colors, icons, spacing, or component libraries — use the defaults below.

## Stack

- **Next.js 16** with static export (`output: "export"`)
- **Tailwind CSS v4** with oklch color tokens
- **shadcn/ui** components — note this project uses shadcn v2 which is **built on base-ui, not Radix**. Use the `render` prop pattern instead of `asChild`.
- **Phosphor Icons** (`@phosphor-icons/react`) — **NOT** lucide-react. Never import from lucide.
- **Inter** font via `next/font/google`

## Route groups

- `src/app/(app)/` — routes that get the app layout (sidebar + main content area). Put new app pages here.
- `src/app/mockups/` — standalone mockup pages with no sidebar. Good for design explorations, stakeholder demos, visual tests.
- Dynamic routes must have `generateStaticParams()` (static export requirement).

## Visual defaults

Apply these automatically unless the user explicitly asks otherwise:

- **Page background**: `bg-gray-50`
- **Card / panel background**: `bg-white`
- **Card styling**: `rounded-[10px] border border-gray-200`
- **Accent color**: `blue-800` (Tailwind `blue-800`, **not** `blue-600`)
- **Active nav / filter**: `bg-blue-50 text-blue-800`
- **Detail page headers**: `h-12` tall, `bg-gray-50`, bottom border `border-gray-200`, `px-4` padding
- **Tabs**: custom with `border-b-[3px] border-blue-800` on active, 14px font-semibold
- **Table rows**: hover `bg-gray-50`, border between rows `border-gray-100`
- **Status pills** (use these color families):
  - Success: `bg-green-50 text-green-700 border-green-200`
  - Error/Failed: `bg-red-50 text-red-700 border-red-200`
  - Warning/In-progress: `bg-amber-50 text-amber-700 border-amber-200`
  - Info/Blue: `bg-blue-50 text-blue-700 border-blue-200`
- **Avatars**: 6px square rounded-full with 2-letter initials, `text-[10px] font-semibold`, pastel color per person

## Icons

- Always use `@phosphor-icons/react` — never lucide, never heroicons, never emoji-as-icons.
- Default weight: `regular` for content, `bold` for sidebar items, `fill` for status badges.
- Size `h-4 w-4` for content, `h-3 w-3` for inline badges, `h-5 w-5` for card headers.
- When you need a "missing" icon (e.g., a shield or police badge), search Phosphor first; `Shield`, `Badge`, `Scales`, `Gavel`, `Notepad`, `Books` are all available.

## Typography

- Primary: 14px (`text-sm`)
- Labels / uppercase overlines: 11px (`text-[11px]`) with `uppercase tracking-wide text-zinc-500`
- Headings: 16px semibold (`text-base font-semibold`)
- Compact metadata: 12px (`text-xs text-zinc-500`)
- Numeric values: add `tabular-nums` class

## Spacing rhythm

- Page padding: `px-4` (16px)
- Card padding: `p-3` or `p-4`
- Small gaps: `gap-1.5` or `gap-2`
- Section spacing: `space-y-3` inside panels, `py-3` between page sections

## Layout

- `/src/app/(app)/layout.tsx` wraps all in-app pages with the sidebar. The `<main>` must have `min-w-0` so inner flex content can shrink.
- Sidebar is route-aware — `/workflows/*` highlights "Workflows", `/knowledge/*` highlights "Knowledge Base", etc.
- Pages render inside `flex flex-col flex-1 min-h-0`.

## Component patterns (reference, don't re-invent)

When building a new screen, **look at the closest existing component** and adapt it. Do NOT build from scratch unless none of these match:

| Pattern | Example |
|---|---|
| List + filter + table | `src/components/fileflow-inbox.tsx` |
| Detail view with tabs + sidebar cards | `src/components/file-detail-view.tsx` |
| Card grid (library) | `src/components/playbooks-library.tsx` |
| Data grid with click-to-drawer | `src/components/unified-runs.tsx` |
| Split builder + test panel | `src/components/workflow-builder.tsx` |
| File upload + search tabs | `src/components/knowledge-detail.tsx` |
| Tabbed page shell | `src/components/workflows-page.tsx` |
| Focused editor with identity header | `src/components/workflow-editor.tsx` |

## Data conventions

- Playbook definitions: `src/lib/playbook-data.ts` (single registry — all playbooks live here)
- Sample data lives inline in components (this is a design mockup app, not production). Keep sample data realistic for legal context.
- Prefer structured sample data over lorem ipsum (real case numbers like CVSA-1189, real names like James Rivera).

## Behavioral defaults when the user asks for a new screen

1. **Ask no questions if the request is clear.** Just build it. Assume the user wants it to match the existing patterns.
2. **Start a dev server** (`mcp__Claude_Preview__preview_start` with name `dev` from `.claude/launch.json`).
3. **Screenshot at 1680x1100** after building. Show the user the result proactively.
4. **If it looks wrong**, self-critique in one sentence and offer to fix.
5. **Deploy** via git push to `main` — GitHub Pages auto-deploys. Provide the link.
6. **Never ask the user to read or write code.** Stay in chat, deliver screenshots + links.

## When pulling from Figma

- Use `mcp__figma__get_design_context` with the nodeId + fileKey.
- **Never use the raw React/Tailwind code returned verbatim.** Figma exports have absolute positioning, hex colors, and non-shadcn structure.
- **Adapt**: map Figma colors to our tokens (e.g., Figma's `#1e40af` → `blue-800`), replace absolute layouts with flex/grid, swap image assets for Phosphor icons, use existing shadcn components.
- Use the Figma screenshot as a *visual target*, not the code as a *structural blueprint*.

## When the user is non-technical

- Never show raw code in chat unless they ask.
- Proactively screenshot and describe what you built in plain English.
- If the user says "the padding is off", ask for a screenshot or specific area; don't guess.
- Deploy eagerly when they say "share" or "looks good".
- When commits are made, use short conventional commit messages; don't narrate every step.

## Do not

- Don't install new dependencies without asking.
- Don't touch `eslint.config.mjs`, `tsconfig.json`, or workflow files unless asked.
- Don't add dark mode unless requested.
- Don't add animations beyond `transition-colors` / `animate-spin` / `animate-pulse` — keep the UI quiet and professional.
- Don't use emoji. The user adds them if they want them.

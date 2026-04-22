# How to Design New Screens

**For non-developers using Claude Code.** You don't need to know React, TypeScript, or any framework — Claude does that. Your job is to describe what you want, point at examples, and give feedback on screenshots.

---

## One-time setup (30 minutes, ask a dev to help)

1. Install [Claude Code](https://claude.com/claude-code)
2. Clone this repo to your machine
3. Have a dev run `npm install` once
4. Install the **Claude Preview** MCP and **Figma** MCP (built-in options in Claude Code settings)
5. Have a dev confirm you can push to GitHub (you'll use this to share designs)

After setup, you won't need the dev again for normal design work.

---

## The loop in 5 steps

This is the entire workflow. You'll do this hundreds of times.

1. **Tell Claude what you want**, pointing at an existing page as reference
2. **Claude builds it** in a new mockup page
3. **Claude shows you a screenshot** automatically
4. **You give feedback** ("the padding is off", "make the card blue", "this should be a tab not a dropdown")
5. **When it looks right, tell Claude "deploy"** — you get a shareable link in ~2 minutes

You are never asked to read or write code. You stay in chat and look at pictures.

---

## How to write requests that work

The #1 reason a request fails is that it's too vague. Give Claude **a reference**, a **scope**, and a **purpose**.

### ✅ Good requests

> "Build a new mockup at `/mockups/client-intake` — a form page where a paralegal fills in a new client. Use the same patterns as the workflow editor at `/workflows/depo-prep/edit`. Fields: Name, Case type, Contact info, Incident date."

> "I want to add a Billing tab to the case detail view. Look at how the tabs work on `/workflows/medical-records-summary` and add another one. Billing shows a table of invoices — pending, paid, overdue — with similar styling to the FileFlow Inbox table."

> "Here's a Figma link: [paste URL]. Build the top half of this screen, but make it match our design system (shadcn, Phosphor icons, gray-50 background, blue-800 accent). Don't copy the raw colors from Figma."

### ❌ Bad requests

> "Make a form page." *(No reference, no scope)*

> "Design the case page." *(Too big — what part?)*

> "Make it look nicer." *(Subjective — point at what's wrong)*

### The three ingredients every good request has

1. **Reference** — "like `/workflows`" or "like this Figma link" or "like the file-detail-view component"
2. **Scope** — what's on this specific screen (don't describe a whole app)
3. **Intent** — what's this for? (helps Claude pick the right pattern)

---

## Copy-paste prompts for common tasks

### 1. New mockup screen (exploration)

> Build a new mockup page at `/mockups/[short-name]`. It should be a standalone page without the sidebar.
>
> Reference: [paste a file path like `src/components/file-detail-view.tsx` OR a URL like `/workflows`]
>
> What to show: [describe 3-5 things on the page]
>
> When done, show me a screenshot at 1680x1100.

### 2. Add a new app page (in sidebar)

> I want to add a new section to the app. Route: `/[name]`. Sidebar item: "[Name]" with the [icon-name] icon.
>
> The page should work like `/workflows` — list view with card grid OR table, filter bar on top, detail view on click.
>
> Use the existing patterns in `src/components/playbooks-library.tsx` as the blueprint.

### 3. Copy a Figma design

> Here's a Figma link: [paste URL]
>
> Build this as a new mockup at `/mockups/[name]`.
>
> Adapt it to our design system — don't copy the raw Figma classes. Use shadcn components, Phosphor icons (Regular weight for content), `bg-gray-50` page background, `rounded-[10px]` cards with `border-gray-200`, `blue-800` for accents.

### 4. Iterate on something

> Look at the current `/[route]` page. I want to:
> - Change [specific thing]
> - Keep everything else the same
>
> Show me a screenshot after.

### 5. Deploy and share

> Build, commit, and push. Give me the GitHub Pages link when it's live.

### 6. "This padding is weird"

> Take a screenshot of `/[route]`. I think the [specific section] has inconsistent spacing. Fix it and show me the result.

---

## What patterns already exist (so you can reference them)

Ask Claude to look at these when you want a new screen to match:

| Pattern you need | Reference file |
|---|---|
| List + filter + table | `src/components/fileflow-inbox.tsx` |
| Detail view with tabs + sidebar cards | `src/components/file-detail-view.tsx` |
| Card grid library page | `src/components/playbooks-library.tsx` |
| Data grid with click-to-drawer | `src/components/unified-runs.tsx` |
| Form-like builder with live preview | `src/components/workflow-builder.tsx` |
| File upload + search + tabs | `src/components/knowledge-detail.tsx` |
| Tabbed page shell | `src/components/workflows-page.tsx` |

When in doubt, just say: **"Look at the existing components in `src/components/` and pick the one closest to what I'm describing, then adapt."**

---

## Design system cheat sheet

Claude will follow these automatically via `AGENTS.md`, but it's good to know:

- **Background**: `bg-gray-50` (page), `bg-white` (cards)
- **Cards**: `rounded-[10px] border border-gray-200 bg-white`
- **Accent color**: `blue-800` (never blue-600)
- **Icons**: Phosphor Icons — Bold weight in sidebar, Regular in content
- **Fonts**: Inter (already set up)
- **Status pills**: green-50/700, red-50/700, blue-50/800 with borders
- **Headers on detail pages**: `h-12` tall with gray-50 bg + gray-200 bottom border

If a design you want would break these, tell Claude explicitly: "I want this to have a dark mode card." Otherwise Claude defaults to the patterns.

---

## Sharing work

**Standard flow:**
1. Say "build and deploy"
2. Wait ~2 min
3. Claude gives you a link like `https://omri-i-b.github.io/veritec-ui-2/mockups/your-thing`
4. Paste into Slack/email/etc. — it's a real clickable page anyone can open

**Before showing stakeholders:**
- Do a screenshot pass: "Screenshot `/[route]` at 1680x1100. Does anything look off?" — Claude can self-review
- If multiple views, tell Claude "give me a one-paragraph message I can paste to share this with X, explaining what they're looking at"

---

## When Claude gets stuck

- **"It looks wrong but I can't say why."** — Ask Claude: "Take a screenshot, then describe what you see and what might be off." Sometimes it spots the issue.
- **"It built a totally different thing than I wanted."** — You were too vague. Rewrite with the three ingredients (reference + scope + intent).
- **"Build failed."** — Ask: "Fix the build error. Don't change anything else." Then keep going.
- **"Preview isn't updating."** — Say: "Reload the preview and re-screenshot."

---

## What NOT to do

- ❌ Don't edit code files directly. Only chat with Claude.
- ❌ Don't approve random file writes you don't understand. Ask "what did you change?"
- ❌ Don't describe the entire app in one message. Work one screen at a time.
- ❌ Don't skip references. "Build a thing" always goes worse than "Build a thing like X."

---

## Want deeper reference?

- `DESIGN.md` — full design system spec (colors, spacing, components)
- `AGENTS.md` — what Claude reads automatically
- `README.md` — project overview

You don't need to read these. Claude reads them.

---

**TL;DR:** Point at an existing page, describe what's different, look at the screenshot, iterate, deploy. Claude does the code.

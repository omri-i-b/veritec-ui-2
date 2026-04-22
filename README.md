# Veritec AI — Design Exploration

A living design system and mockup environment for Veritec AI, built with Next.js + shadcn + Tailwind + Claude Code. Designed collaboratively between non-developers and AI agents.

---

## 📘 Who are you?

### I'm a **designer / PM / non-developer** and I want to create new screens
→ Read **[HOW_TO_DESIGN.md](./HOW_TO_DESIGN.md)**

That's the whole hand-off. You'll talk to Claude in chat, get screenshots back, iterate, and deploy shareable links. You don't need to read any code.

### I'm an **engineer** and I want to understand the codebase
- Stack: Next.js 16 (static export), Tailwind CSS v4, shadcn/ui v2 (base-ui), Phosphor Icons
- Route groups: `src/app/(app)/` for app pages (with sidebar), `src/app/mockups/` for standalone previews
- Shared data: `src/lib/playbook-data.ts`
- Start: `npm install && npm run dev` (port 3002)
- Deploy: push to `main`, GitHub Actions handles GitHub Pages

### I'm a **Claude / AI agent** working on this repo
→ Read **[AGENTS.md](./AGENTS.md)** — it has the conventions you should follow automatically

### I want the full design system spec
→ **[DESIGN.md](./DESIGN.md)** — colors, typography, spacing, component patterns

### I want to see what patterns already exist (with screenshots)
→ **[REFERENCE.md](./REFERENCE.md)** — visual gallery of every pattern

---

## Live preview

https://omri-i-b.github.io/veritec-ui-2

Main entry points:
- `/` — FileFlow Inbox
- `/workflows` — Playbooks + Runs
- `/knowledge` — Knowledge Base
- `/mockups/*` — design exploration sandboxes

---

## Local development

```bash
npm install
npm run dev    # starts on port 3002
```

To build static export:
```bash
npm run build  # outputs to /out
```

---

## Philosophy

This repo is a **design tool**, not a production app. We build real, clickable, deployable screens to explore ideas — faster and more concrete than Figma alone. Non-developers describe what they want, Claude builds it, stakeholders get a shareable URL.

If you're adding to this repo, preserve that: match existing patterns, reuse components, keep sample data realistic, and deploy eagerly.

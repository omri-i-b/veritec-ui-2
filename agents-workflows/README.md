# Veritec UI Template

A minimal React + Vite + Tailwind v4 + shadcn template that mirrors the Veritec
production frontend's design system. Use it to prototype UI/layout fast — what
you build here ports into the app with copy-paste imports and no token
translation.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Open `src/App.tsx` — every primitive lives there as a working example. Click
through to see what semantic tokens look like in practice.

## What's in here

- **`src/index.css`** — every design token (OKLCH colors, radius scale,
  typography, dark mode). Identical to the production app.
- **`src/components/ui/`** — all 44 shadcn primitives, including custom
  additions: `DebouncedSearch`, `FilterButton`, `SearchSelect`,
  `TablePagination`, `ToggleSwitch`, `Stepper`, `PhoneInput`,
  `DateRangeFilter`, `HighlightedText`.
- **`src/components/full-screen-loader.tsx`** — generic loading screen.
- **`src/components/collapsed-rail.tsx`** — collapsed-panel affordance for
  two-card layouts.
- **`src/components/spreadsheet-table/`** — Excel-like editable grid with
  TSV clipboard ops.
- **`src/components/veritec-viewer/`** — PDF viewer (PDF.js + Virtuoso).
  Has a plugin system (navigation, search, OCR), annotation overlay, page
  thumbnails. Requires `pdfjs-dist` and the `predev`/`prebuild` asset sync.
- **`src/lib/utils.ts`** — `cn()` helper.
- **`src/lib/services/`** — viewer cache services (PDF, page render, page
  dimension).
- **`src/hooks/`** — UI-only hooks: `useDebounce`, `useIsMobile`,
  `usePersistedState`, `usePaginationMeta`.

This is **100% parity** with the app's `src/components/` and the relevant
`src/lib/services/` — 92 component files, exact match.

## Scripts

```bash
npm run dev                # Vite dev server, port 3000
npm run build              # tsc + Vite build
npm run typecheck          # tsc --noEmit
npm run lint               # Biome
npm run lint:fix           # Biome auto-fix
npm run lint:conventions   # Warn on raw colors / off-scale sizes / shadows
```

`lint:conventions` is the porting safety net — run it before you hand a
prototype off. It does not fail the build, just flags things that will need
translating in the app repo.

## Out of scope

This template is **UI + layout only**. By design, it does not include:

- Auth, permissions, user model
- API client, TanStack Query, axios
- Routing (TanStack Router)
- Domain features (PDF viewer, file tree, charts beyond Recharts deps)
- Any backend integration

Prototypes should be stateless or use `useState` with mock data. When you port
into the app, the dev wires up routes / queries / auth on the receiving side.

## Next steps

See `PORTING.md` for the prototype → app handoff procedure. See `CLAUDE.md` for
the design conventions a coding agent in this repo will follow.

# Porting prototypes into the app

A short guide for moving a prototype from this template into
`application-veritec-frontend`. Designed for a coding agent to follow with
minimal hand-holding.

## TL;DR

Imports stay the same. Move JSX into a feature folder, wire data, ship.

```
src/SomePrototype.tsx                          (template)
  → app/src/features/<area>/components/some-prototype.tsx   (app)
```

Imports like `@/components/ui/button`, `@/lib/utils`, `@/hooks/use-debounce`
resolve identically in both repos.

## Procedure (for an agent)

### 1. Run conventions check in the template

```bash
npm run lint:conventions
```

Fix every warning before porting. The app's lint is stricter — raw colors and
off-scale sizes will fail review on import.

Common substitutions:

| Prototype          | App                                  |
| ------------------ | ------------------------------------ |
| `text-blue-700`    | `text-primary`                       |
| `bg-blue-50`       | `bg-primary/10` or `bg-accent`       |
| `bg-emerald-50` + `text-emerald-700` | `bg-success-muted text-success` |
| `bg-red-100` + `text-red-700`        | `bg-danger-muted text-destructive` |
| `border-gray-200`  | `border-border`                      |
| `text-zinc-500`    | `text-muted-foreground`              |
| `text-[11px]`      | `text-xs`                            |
| `hover:shadow-sm`  | drop the shadow, use `border`        |

### 2. Identify the destination feature folder

In the app repo, features live under `src/features/<area>/`. Pick the matching
area (or create one if new):

- `cases/` — case-related surfaces
- `fileflow/` — inbox / triage
- `settings/` — admin panels
- `auth/` — login, recovery, invite

If your prototype is page-level, also create the route file under
`src/routes/_app/<area>/...`. The route is thin — it just renders the
component and applies a permission gate.

### 3. Move the JSX

Copy the prototype `.tsx` into:

```
app/src/features/<area>/components/<prototype-name>.tsx
```

Imports stay the same. The path alias `@/*` resolves to `src/*` in both
repos.

### 4. Replace mock data with TanStack Query

Prototypes use `useState` and inline arrays. In the app, all server data flows
through Query hooks. Replace:

```tsx
const [runs] = useState(MOCK_RUNS)
```

with:

```tsx
import { useRuns } from "@/features/<area>/api"

const { data: runs = [], isLoading } = useRuns()
```

Add a query hook in `features/<area>/api.ts` if it doesn't exist. Pattern is
documented in the app's `CLAUDE.md` under "API Layer".

### 5. Wire forms to react-hook-form + Zod

Prototypes can use `useState` per field. Production forms use the
`react-hook-form` + Zod pattern. See any existing `manage/` form in the cases
feature for the canonical shape.

### 6. Verify

```bash
cd app
npx tsc --noEmit
npx biome check src/
npx vite build           # catches Phosphor icon name typos tsc misses
```

If any of these fail, the prototype is not yet portable. Fix it before
opening the PR.

## What you should NOT change during port

- **Don't rewrite the visual structure.** If the prototype was approved, the
  layout is the spec. Only swap data wiring.
- **Don't add error boundaries / loading states beyond what the app already
  uses.** Skeleton on initial load + sonner toast on mutation error is the
  pattern.
- **Don't introduce new shadcn primitives during port.** If the prototype
  needs one that's not in `components/ui/`, install it in the template first,
  then port both.

## Common gotchas

- **The app's biome.json blocks `lucide-react`** — every icon must come from
  `@phosphor-icons/react`. The template uses Phosphor too, so this should
  already be the case.
- **The app forbids `placeholderData: keepPreviousData`** on list queries —
  it kills the table skeleton on refetch. Remove it if your `useXxx` hook
  has it.
- **`useLocation().search`** in TanStack Router returns a parsed object, not
  the raw query string. For OAuth-style flows reading `?code=…`, use
  `window.location.search`.
- **Click-to-edit cells**: rendering N `<Select>` components in a table is
  expensive. Render plain text by default and only mount the Select for the
  row being edited, or use `SearchSelect` (its popover content lazy-mounts).

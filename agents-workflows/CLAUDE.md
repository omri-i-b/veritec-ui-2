# CLAUDE.md

This is the **Veritec UI Template** — a UI/layout playground that mirrors the
production app's design system. Prototypes built here port into
`application-veritec-frontend` with copy-paste imports.

**Goal**: every primitive, token, and convention here is identical to the
app, so prototypes drop in without translation.

## Tech stack (UI surface only)

| Concern      | Choice                             |
| ------------ | ---------------------------------- |
| Framework    | React 19 + TypeScript 5.9 (strict) |
| Build        | Vite 7                             |
| Styling      | Tailwind CSS 4 (CSS-based config in `index.css`) |
| Components   | shadcn/ui (Radix + custom additions) — all in `components/ui/` |
| Icons        | `@phosphor-icons/react` ONLY (never `lucide-react`) |
| Dates        | `date-fns` ONLY |
| Forms        | React Hook Form + Zod (when needed) |
| Toasts       | Sonner (`<Toaster richColors />` in `App.tsx`) |
| Lint/format  | Biome |

**Out of scope** (deliberately): routing, auth, API client, TanStack Query,
permissions, domain features. The template is for prototyping UI; data is
mocked or stateful via `useState`.

## Commands

```bash
npm run dev                # http://localhost:3000
npm run typecheck          # tsc --noEmit
npm run lint               # Biome
npm run lint:conventions   # Warn on raw colors / off-scale / shadows
npm run build              # tsc + Vite
```

Always run `npm run typecheck` and `npm run lint:conventions` before
suggesting a prototype is ready to port. Convention warnings will become
review failures in the app repo.

## Design system

### Color tokens — use these, never raw colors

| Use                      | Token                                 |
| ------------------------ | ------------------------------------- |
| Borders                  | `border-border`                       |
| Background highlights    | `bg-muted`                            |
| Selected/accent surfaces | `bg-accent`                           |
| Primary brand            | `bg-primary` / `text-primary`         |
| Destructive              | `text-destructive` / `bg-destructive` |
| Muted text               | `text-muted-foreground`               |
| Foreground               | `text-foreground`                     |
| Loading overlay bg       | `bg-background/60`                    |

**Status tokens** (badges, flags, tone-based chips):

| Tone     | Token pair                                 | Muted-bg pair                              |
| -------- | ------------------------------------------ | ------------------------------------------ |
| Success  | `text-success` / `bg-success`              | `bg-success-muted text-success`            |
| Warning  | `text-warning` / `bg-warning`              | `bg-warning-muted text-warning`            |
| Danger   | `text-destructive` / `bg-destructive`      | `bg-danger-muted text-destructive`         |

Use the muted-bg pair for tinted badge chips. **Never** `bg-red-100
text-red-700` or `bg-emerald-100`.

**Chart palette** (Recharts fills/strokes, category colors):

| Purpose                     | Token                                                 |
| --------------------------- | ----------------------------------------------------- |
| Categorical series (1–8)    | `var(--chart-1)` … `var(--chart-8)`                   |
| Semantic danger series      | `var(--chart-danger)`                                 |
| Semantic warning series     | `var(--chart-warn)`                                   |
| Semantic ok series          | `var(--chart-ok)`                                     |
| Grid lines                  | `var(--chart-grid)`                                   |

Pass these as `stroke="var(--chart-1)"` on Recharts elements. **Never
hardcode hex** anywhere, including Recharts props.

The CSS variables live in `index.css` using OKLCH.

### Typography

- Inter variable, self-hosted via `@fontsource-variable/inter`
- Max weight: **semibold (600)** for body text — never bold
- Page title: `text-base font-semibold` (or `text-2xl font-semibold` for a
  hero / playground header)
- Section header: `text-sm font-semibold`
- Body: `text-sm`
- Captions/labels: `text-xs text-muted-foreground`

### Spacing & radius

- `--radius: 0.625rem` (10px) — most cards use `rounded-xl`
- Border style: `border border-border` (single weight, never drop shadows
  on bordered surfaces)
- Spacing scale: stick to `1`, `2`, `2.5`, `3`, `4`, `6`, `8`. Avoid `7`,
  `9`, `11`.

## Component usage principles

### Reach for primitives first

Before writing JSX for any UI element, ask: **does shadcn already have
this?** The full list is in `components/ui/`.

| Don't write | Use instead |
|-------------|-------------|
| `<button onClick={...}>` | `<Button variant="ghost"\|"outline"\|"link" size="icon"\|"sm">` |
| `<input>` directly | `<Input>` |
| Search `<Input>` + manual debounce | `<DebouncedSearch>` |
| `<select>` for ≤ ~20 options | `<Select>` |
| `<select>` for many/searchable options | `<SearchSelect>` |
| `<Switch>` + `<Label>` flex combo | `<ToggleSwitch>` |
| Custom expand/collapse state | `<Collapsible>` |
| Manual context menu | `<DropdownMenu>` |
| Custom modal | `<Dialog>` (forms) or `<AlertDialog>` (destructive confirms) |
| Inline SVG spinner | `<SpinnerGap className="size-5 animate-spin" />` from Phosphor |
| Custom tooltip | `<TooltipProvider><Tooltip><TooltipTrigger><TooltipContent>` |
| Loading text "Loading..." | `<Skeleton>` matching the actual shape |

### Don't wrap, don't reinvent

- **Don't create wrapper components around shadcn primitives.** Edit
  `components/ui/` directly.
- **Don't recreate behavior shadcn ships with.**
- **Don't create one-off "helper components"** for things only used once.
- **Variant the existing primitive** instead of creating a sibling.
- **Three similar lines is better than a premature abstraction.**

### Idiomatic Tailwind

- **Always use `cn()`** for conditional classes. Never template literals.
- **Use semantic tokens, never raw colors.**
- **Use `size-N`** for square dimensions (`size-4` not `h-4 w-4`).
- **Border radius**: `rounded-xl` (cards), `rounded-lg` (inner),
  `rounded-md` (inputs/buttons).
- **Borders, not shadows** — bordered surfaces never carry `shadow-*`.

## Filter bar standard

```tsx
<div className="flex flex-wrap items-center gap-3">
  <DebouncedSearch value={...} onChange={...} placeholder="…" />
  <FilterButton active={count > 0} onClear={...}>
    <Icon className="size-3.5" />
    {count > 0 ? `Label (${count})` : "Label"}
  </FilterButton>
  {/* …more FilterButton popovers… */}
  <ToggleSwitch id="…" label="Hide duplicates" … />     {/* always last */}
  <div className="ml-auto">{/* Export / bulk actions */}</div>
</div>
```

- Gap: `gap-3` (not `gap-2`).
- Icon sizes: filter-button icons `size-3.5`. Action icons `size-4`.
- Count embedded in label: `"Status (3)"`, never a `<Badge>` suffix.
- **Toggle ordering**: every `ToggleSwitch` goes at the end of the bar.

## Page layout patterns

### Single-card page (table-driven views)

```tsx
<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-lg bg-background p-4">
  <header className="flex items-center gap-3">
    <h2 className="text-base font-semibold text-foreground">Page title</h2>
  </header>
  <Toolbar ... />
  <MyTable ... />
</div>
```

The `flex min-h-0 flex-1` chain propagates height down so `overflow-auto`
on the table scroll area has something finite to scroll inside. **Never
use `max-h-[Npx]`** for content that should fill the viewport.

### Two-card detail layout (list + content)

```tsx
<ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1 overflow-hidden">
  <ResizablePanel defaultSize="380px" minSize="280px" collapsible className="pr-2">
    <div className="h-full min-h-0 overflow-hidden rounded-xl border border-border bg-background p-4">
      <LeftListPanel ... />
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel minSize="400px" className="pl-2">
    <div className="h-full min-h-0 overflow-hidden rounded-xl border border-border bg-background p-4">
      <RightDetailPanel ... />
    </div>
  </ResizablePanel>
</ResizablePanelGroup>
```

- **No outer `rounded-lg bg-background p-4`** wrapper around the
  ResizablePanelGroup. Each card owns its own border.
- Cards: `h-full min-h-0 overflow-hidden rounded-xl border border-border
  bg-background p-4`.

### Page title standard

Every page title uses the same shape:

```tsx
<header className="flex items-center gap-3">
  <h2 className="text-base font-semibold text-foreground">{title}</h2>
  {/* optional right-slot */}
</header>
```

- Element is `<h2>` inside a `<header>` — semantic.
- `text-base font-semibold` everywhere. **One scale, one weight.**
- **No icon next to the title.**
- No subtitle. Supporting copy goes in the toolbar.
- No `border-b` under the title — card border is enough.

## Table pattern (TanStack Table)

Every list/grid view uses the shared primitives in `components/ui/table.tsx`.

### Canonical composition

```tsx
<TableContainer>
  <TableScrollArea>
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((h) => (
              <TableHead
                key={h.id}
                sortable={SORTABLE.has(h.id)}
                sortOrder={isActive ? sort.order : null}
                onSortChange={() => handleSort(h.id)}
                sticky={h.id === "actions" ? "right" : undefined}
              >
                {flexRender(h.column.columnDef.header, h.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton columns={columns.length} />
        ) : data.length === 0 ? (
          <TableEmpty colSpan={columns.length}>No X found</TableEmpty>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  sticky={cell.column.id === "actions" ? "right" : undefined}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableScrollArea>
  <TablePagination ... />
</TableContainer>
```

### Rules

- **Loading is always `<TableSkeleton>`** — never overlay+opacity dim
  patterns.
- **Empty is `<TableEmpty>`** — short message, no action buttons.
- **Sticky `right`** for action columns only on tables wide enough to
  scroll horizontally.
- **Row click**: `onClick` on `TableRow` with `cursor-pointer`. Every
  interactive element inside the row must `e.stopPropagation()`.
- **Selection**: put the `<Checkbox>` inside the first column's cell.
  Don't add a dedicated selection column.

## Anti-patterns to avoid

❌ Raw `<button>`, `<input>`, `<select>` — use shadcn primitives
❌ `className={`p-${size}`}` — use `cn()` and conditional classes
❌ `border-gray-200`, `bg-gray-50`, `text-red-500` — use semantic tokens
❌ Hex colors in Recharts props — use `var(--chart-N)`
❌ `shadow-md`/`shadow-sm` on bordered containers
❌ Inline SVG spinners — use `SpinnerGap` from Phosphor
❌ Wrapper components around shadcn primitives — edit `components/ui/`
❌ Local `DebouncedSearch` / `FilterButton` copies inside feature folders
❌ Ad-hoc `setTimeout`/`timeoutRef` debouncing — use `useDebounce`
❌ `<Select>` with 2–3 enum options inside a filter bar — use FilterButton + popover
❌ Toggle switches anywhere except the end of the filter bar
❌ `<Badge>` count suffix after a `FilterButton` label — embed in label text
❌ `text-[10px]`, `text-[11px]`, `py-3` off-scale values
❌ Filter expressions outside `useMemo` when feeding TanStack Table
❌ Fixed `max-h-[Npx]` on tables — use `flex min-h-0 flex-1` chain
❌ "Loading..." text — use `Skeleton`
❌ Plain text for confirmation actions — use `AlertDialog`

## Path alias

- `@/` → `src/`
- All component imports use `@/components/ui/...`
- Always import `cn` from `@/lib/utils`

## When the prototype is "done"

A prototype is portable when:

1. `npm run typecheck` passes
2. `npm run lint` passes
3. `npm run lint:conventions` reports no warnings
4. The visual matches the design intent in the dev server

Then — and only then — move it to the app following `PORTING.md`.

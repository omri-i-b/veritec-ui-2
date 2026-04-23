---
name: Veritec AI
colors:
  # Core surfaces
  surface: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f9fafb"
  surface-container: "#f3f4f6"
  surface-container-high: "#e5e7eb"
  surface-container-highest: "#d1d5db"
  on-surface: "#18181b"
  on-surface-variant: "#3f3f46"
  on-surface-muted: "#71717a"
  on-surface-disabled: "#a1a1aa"
  on-surface-whisper: "#d4d4d8"

  # Brand & primary
  primary: "#1e40af"
  on-primary: "#ffffff"
  primary-container: "#eff6ff"
  on-primary-container: "#1e40af"
  primary-hover: "#1e3a8a"
  primary-soft: "#dbeafe"

  # Secondary (neutral action)
  secondary: "#f3f4f6"
  on-secondary: "#18181b"
  secondary-container: "#f9fafb"
  on-secondary-container: "#3f3f46"

  # Tertiary accents (category colors, used for icons + pills)
  tertiary-purple: "#7e22ce"
  tertiary-purple-container: "#faf5ff"
  tertiary-teal: "#0f766e"
  tertiary-teal-container: "#f0fdfa"
  tertiary-violet: "#6d28d9"
  tertiary-violet-container: "#f5f3ff"
  tertiary-emerald: "#047857"
  tertiary-emerald-container: "#ecfdf5"
  tertiary-indigo: "#4338ca"
  tertiary-indigo-container: "#eef2ff"
  tertiary-rose: "#be123c"
  tertiary-rose-container: "#fff1f2"
  tertiary-sky: "#0369a1"
  tertiary-sky-container: "#f0f9ff"
  tertiary-fuchsia: "#a21caf"
  tertiary-fuchsia-container: "#fdf4ff"
  tertiary-amber: "#b45309"
  tertiary-amber-container: "#fffbeb"

  # Status semantics
  success: "#15803d"
  on-success: "#ffffff"
  success-container: "#f0fdf4"
  on-success-container: "#15803d"
  success-outline: "#bbf7d0"
  success-marker: "#22c55e"

  warning: "#b45309"
  on-warning: "#ffffff"
  warning-container: "#fffbeb"
  on-warning-container: "#b45309"
  warning-outline: "#fde68a"
  warning-marker: "#f59e0b"

  error: "#b91c1c"
  on-error: "#ffffff"
  error-container: "#fef2f2"
  on-error-container: "#b91c1c"
  error-outline: "#fecaca"
  error-marker: "#ef4444"

  info: "#1d4ed8"
  info-container: "#eff6ff"
  on-info-container: "#1d4ed8"
  info-outline: "#bfdbfe"

  # Borders & outlines
  outline: "#e5e7eb"
  outline-variant: "#f1f5f9"
  outline-strong: "#d1d5db"
  outline-focus: "#1e40af"
  outline-focus-ring: "#dbeafe"

  # Sidebar (the only slightly tinted neutral in the UI)
  sidebar: "#f9fafb"
  on-sidebar: "#3f3f46"
  sidebar-active: "#eff6ff"
  on-sidebar-active: "#1e40af"
  sidebar-outline: "#e5e7eb"

  # Overlays
  scrim: "rgba(24, 24, 27, 0.15)"
  scrim-blur: "rgba(24, 24, 27, 0.05)"

typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: -0.005em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
  headline-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  body-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: "400"
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 16px
  eyebrow:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.06em
    textTransform: uppercase
  code-sm:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 16px
  code-md:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px

rounded:
  none: 0px
  xs: 2px
  sm: 4px
  DEFAULT: 6px
  md: 8px
  lg: 10px
  xl: 12px
  2xl: 16px
  pill: 9999px

spacing:
  unit: 4px
  base: 8px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 24px
  3xl: 32px
  gutter: 16px
  page-padding: 16px
  card-padding: 12px
  card-padding-roomy: 16px
  row-padding-y: 8px
  row-padding-x: 10px
  stack-tight: 4px
  stack-default: 8px
  stack-loose: 16px

sizing:
  header-height: 48px
  toolbar-height: 40px
  row-height: 32px
  button-md: 32px
  button-sm: 28px
  input-md: 32px
  input-sm: 28px
  icon-xs: 12px
  icon-sm: 14px
  icon-md: 16px
  icon-lg: 20px
  avatar-sm: 20px
  avatar-md: 24px
  drawer-width: 520px
  runs-drawer-width: 560px
  detail-sidebar-width: 300px
  app-sidebar-width: 220px
  content-max-width: 1280px

elevation:
  none: "none"
  card-hover: "0 2px 8px rgba(30, 64, 175, 0.08)"
  popover: "0 4px 12px rgba(0, 0, 0, 0.08)"
  drawer: "0 16px 48px rgba(0, 0, 0, 0.12)"
  dropdown: "0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.02)"
  ring-focus: "0 0 0 3px rgba(30, 64, 175, 0.15)"

motion:
  duration-instant: 80ms
  duration-quick: 150ms
  duration-standard: 200ms
  duration-emphasized: 300ms
  ease-standard: "cubic-bezier(0.2, 0, 0, 1)"
  ease-emphasized: "cubic-bezier(0.3, 0, 0, 1)"

border-width:
  DEFAULT: 1px
  strong: 2px
  tab-underline: 3px
  accent-left: 4px

icons:
  library: Phosphor Icons
  weight-content: regular
  weight-sidebar: bold
  weight-status-badge: fill

components:
  page-header:
    height: "{sizing.header-height}"
    backgroundColor: "{colors.surface-container-low}"
    borderBottom: "1px solid {colors.outline}"
    paddingX: "{spacing.xl}"
    textColor: "{colors.on-surface}"
    typography: "{typography.headline-sm}"

  sidebar-nav-item:
    height: "{sizing.row-height}"
    paddingX: "{spacing.md}"
    paddingY: "{spacing.md}"
    rounded: "{rounded.DEFAULT}"
    textColor: "{colors.on-sidebar}"
    typography: "{typography.body-md}"
    gap: "{spacing.md}"
    iconWeight: "bold"

  sidebar-nav-item-active:
    backgroundColor: "{colors.sidebar-active}"
    textColor: "{colors.on-sidebar-active}"
    fontWeight: "600"

  card-standard:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    textColor: "{colors.on-surface}"

  card-standard-hover:
    borderColor: "{colors.primary-soft}"
    shadow: "{elevation.card-hover}"

  card-panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: "1px"
    rounded: "{rounded.lg}"
    headerBackground: "{colors.surface-container-low}"
    headerBorderBottom: "1px solid {colors.outline}"
    headerPaddingX: "{spacing.lg}"
    headerPaddingY: "{spacing.md}"
    headerTypography: "{typography.headline-sm}"

  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.DEFAULT}"
    height: "{sizing.button-md}"
    paddingX: "{spacing.lg}"
    typography: "{typography.label-md}"
    gap: "{spacing.sm}"

  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"

  button-outline:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: "1px"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.DEFAULT}"
    height: "{sizing.button-md}"
    paddingX: "{spacing.lg}"
    typography: "{typography.label-md}"

  button-outline-hover:
    borderColor: "{colors.outline-strong}"
    backgroundColor: "{colors.surface-container-low}"

  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-muted}"
    rounded: "{rounded.DEFAULT}"
    height: "{sizing.button-md}"

  button-ghost-hover:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-surface}"

  input-base:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: "1px"
    rounded: "{rounded.DEFAULT}"
    height: "{sizing.input-md}"
    paddingX: "{spacing.lg}"
    typography: "{typography.body-md}"
    placeholderColor: "{colors.on-surface-muted}"

  input-base-focus:
    borderColor: "{colors.outline-focus}"
    shadow: "{elevation.ring-focus}"

  status-pill-success:
    backgroundColor: "{colors.success-container}"
    borderColor: "{colors.success-outline}"
    textColor: "{colors.on-success-container}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"
    paddingX: "{spacing.md}"
    paddingY: "2px"
    iconWeight: "fill"

  status-pill-warning:
    backgroundColor: "{colors.warning-container}"
    borderColor: "{colors.warning-outline}"
    textColor: "{colors.on-warning-container}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"

  status-pill-error:
    backgroundColor: "{colors.error-container}"
    borderColor: "{colors.error-outline}"
    textColor: "{colors.on-error-container}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"

  status-pill-info:
    backgroundColor: "{colors.info-container}"
    borderColor: "{colors.info-outline}"
    textColor: "{colors.on-info-container}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"

  status-pill-neutral:
    backgroundColor: "{colors.surface-container-low}"
    borderColor: "{colors.outline}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"

  tab-underline-active:
    borderBottomWidth: "{border-width.tab-underline}"
    borderBottomColor: "{colors.primary}"
    textColor: "{colors.on-primary-container}"
    fontWeight: "600"
    paddingY: "{spacing.md}"
    paddingX: "{spacing.lg}"
    typography: "{typography.body-md}"

  tab-underline-inactive:
    textColor: "{colors.on-surface-variant}"
    fontWeight: "400"

  filter-chip:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"
    paddingX: "{spacing.md}"
    paddingY: "2px"
    gap: "{spacing.xs}"

  filter-chip-active:
    backgroundColor: "{colors.primary-container}"
    borderColor: "{colors.info-outline}"
    textColor: "{colors.on-primary-container}"

  table-header:
    backgroundColor: "{colors.surface-container-low}"
    borderBottom: "1px solid {colors.outline}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.eyebrow}"
    paddingX: "{spacing.lg}"
    paddingY: "{spacing.md}"
    stickyOffset: "0px"

  table-row:
    borderBottom: "1px solid {colors.outline-variant}"
    paddingY: "{spacing.md}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"

  table-row-hover:
    backgroundColor: "{colors.surface-container-low}"

  case-chip:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.DEFAULT}"
    typography: "{typography.label-sm}"
    paddingX: "{spacing.sm}"
    paddingY: "2px"
    iconWeight: "bold"

  variable-chip:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.sm}"
    typography: "{typography.code-md}"
    paddingX: "{spacing.sm}"
    paddingY: "0"

  field-row:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: "1px"
    rounded: "{rounded.DEFAULT}"
    paddingX: "{spacing.lg}"
    paddingY: "{spacing.md}"
    gap: "{spacing.md}"
    textColor: "{colors.on-surface}"

  field-row-hover:
    borderColor: "{colors.primary-soft}"
    shadow: "{elevation.card-hover}"

  field-row-document:
    backgroundColor: "{colors.tertiary-teal-container}"
    borderColor: "#ccfbf1"
    accent: "{colors.tertiary-teal}"

  field-row-records:
    backgroundColor: "{colors.tertiary-violet-container}"
    borderColor: "#ede9fe"
    accent: "{colors.tertiary-violet}"

  step-block-fetch:
    backgroundColor: "{colors.surface}"
    borderLeftWidth: "{border-width.accent-left}"
    borderLeftColor: "#f59e0b"
    borderColor: "{colors.outline}"
    rounded: "{rounded.DEFAULT}"
    iconContainer: "{colors.tertiary-amber-container}"
    iconColor: "{colors.tertiary-amber}"

  step-block-prompt:
    backgroundColor: "{colors.surface}"
    borderLeftWidth: "{border-width.accent-left}"
    borderLeftColor: "#3b82f6"
    borderColor: "{colors.outline}"
    rounded: "{rounded.DEFAULT}"
    iconContainer: "{colors.primary-container}"
    iconColor: "{colors.primary}"

  drawer-right:
    width: "{sizing.drawer-width}"
    backgroundColor: "{colors.surface}"
    borderLeft: "1px solid {colors.outline}"
    shadow: "{elevation.drawer}"
    headerHeight: "{sizing.header-height}"
    overlayColor: "{colors.scrim}"
    overlayBlur: "4px"

  avatar-initials:
    size: "{sizing.avatar-md}"
    rounded: "{rounded.pill}"
    typography: "{typography.label-xs}"
    fontWeight: "600"
    fontSize: "10px"

  empty-add-button:
    backgroundColor: "transparent"
    borderStyle: "dashed"
    borderColor: "{colors.outline-strong}"
    borderWidth: "1px"
    rounded: "{rounded.DEFAULT}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
    paddingY: "{spacing.md}"

  empty-add-button-hover:
    borderColor: "{colors.primary-soft}"
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"

  kbd-key:
    backgroundColor: "{colors.surface-container}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.sm}"
    typography: "{typography.code-sm}"
    paddingX: "{spacing.sm}"
    textColor: "{colors.on-surface-variant}"

  live-indicator-dot:
    size: "6px"
    rounded: "{rounded.pill}"
    backgroundColor: "{colors.success-marker}"
    animation: "pulse 2s ease-in-out infinite"
---

## Brand & Style

Veritec AI is a **professional legal automation platform** for personal-injury law firms. The aesthetic is closer to Linear, Notion, or AirOps than any consumer app: **quiet, data-dense, tool-like, and enterprise-grade**. The product is used by partners, associates, and paralegals who spend 6+ hours a day in front of it — so the UI prioritizes **scannability and density over decoration**.

- **Light-mode-first.** No dark mode. Surfaces are white and pale neutrals. Color is used sparingly to carry meaning, never for decoration.
- **Navy-blue brand accent.** The primary is a deep indigo navy (`#1e40af`), not a bright blue. It signals legal gravitas — the color of a suit pocket square, not a SaaS splash page.
- **Rounded-10 cards.** Cards use a slightly larger radius than shadcn's default 8px. The extra 2px softens density without feeling playful.
- **Borders over shadows.** Structure is almost entirely communicated through 1px gray borders. Shadows are reserved for floating elements (drawer, popovers) and one hover state.
- **Inter everywhere.** No serifs, no script, no branded display face. Legal sobriety means getting out of the way of the content.
- **Phosphor icons.** Regular weight in content, bold in the sidebar, fill only for status. Never lucide, never emoji.

## Colors

The palette is built on **pure grayscale neutrals** (zinc and gray — both present, used semantically) plus a single brand navy and a wide set of **pastel pastel-50 + saturated-700** pairs for status and category identification.

- **Surfaces ladder by tint.** `#ffffff` for active content surfaces (cards, inputs, run detail main area). `#f9fafb` (gray-50) for *passive* surfaces: the sidebar, page headers, detail-page backgrounds that host white cards, table headers, and row hover. `#f3f4f6` for muted chip fills. Anything darker is a border, never a fill.
- **Text walks down a ladder of zinc.** `#18181b` for primary (headings, table cells), `#3f3f46` for secondary (body copy in nav), `#71717a` for tertiary (metadata, placeholders), `#a1a1aa` for disabled, `#d4d4d8` for whisper-thin icons and dashed-button borders.
- **Brand blue appears in three strengths.** `#1e40af` for active nav, primary buttons, focus borders, and active tab underlines. `#dbeafe` (blue-100) for variable chips in prompts and Case pill fills. `#eff6ff` (blue-50) for hover and active backgrounds, and for filter-chip "active" state. Never blue-600 — it's too consumer, too bright.
- **Status uses a strict 4-tone system.** Success green, warning amber, error red, informational blue. Each status pill is a pastel-50 background, a pastel-200 border, and a saturated-700 text+icon — all on a rounded-full shape. The `bg-50 / text-700 / border-200` formula is the single most-repeated pattern in the app.
- **Category colors live in tertiary.** Eight paired tones (purple, teal, violet, emerald, indigo, rose, sky, fuchsia, amber) identify playbook types, knowledge-base types, and field types. Each is used exclusively as `container` for icon backgrounds and `700` for the icon itself. Never as a fill for anything larger than a 40×40 square.
- **Records outputs are violet.** Document outputs are teal. This is an important, intentional distinction — the two types behave differently, so they wear different uniforms.
- **No gradients.** Anywhere. The only exception is the one "Featured templates" banner on the Playbooks library page, which uses a very pale blue→indigo→purple wash — and even there it's subtle enough that you barely register it as a gradient.

## Typography

- **One family: Inter.** Loaded via `next/font/google` and used from 10px eyebrows up to 32px page titles. The platform also uses a fallback monospace stack (`ui-monospace, SFMono-Regular, Menlo`) for run IDs, `{{variable}}` placeholders, and JSON previews — never for UI chrome.
- **Default body is 14px.** `text-sm` is the default for *everything* in the content area: row text, form inputs, buttons. 16px is reserved for page titles and section headings. 12px is for metadata. 11px is for the eyebrow and pill labels.
- **Weights are tight.** Regular (400), Medium (500), Semi Bold (600). No bolder. No italics except rare emphasis.
- **Numeric values get `tabular-nums`.** Stats cards, durations, counts — all numeric displays lock to fixed-width digits so they don't shimmy as values change.
- **Eyebrows are uppercase.** 11px, semibold, letterspacing 0.06em, usually in muted zinc-500. They sit above section content as a field label: "INPUTS", "OUTPUTS", "STEPS", "ACTIVITY LOG".

## Layout & Spacing

- **Spacing scale is Tailwind's default 4px base.** Common values: 4 (tight), 6 (compact nav), 8 (row gap), 12 (card padding), 16 (section padding), 24 (page padding on mockups).
- **Headers are universally 48px tall** (`h-12`). Sidebar header, every page header, every detail-view header, the editor toolbar, the drawer header — all 48px. This gives the app a single horizontal rhythm.
- **Content caps at 1280px on runs pages, 920px in the playbook editor, 720px in form layouts.** Beyond 1280px the layout stops growing and stays centered.
- **The app sidebar is a fixed 220px.** It never collapses on desktop. Inside: 8px padding, 4px gap between items, 32px tall menu rows.
- **Drawers are 520px (edit forms) or 560px (run detail).** They slide in from the right over a 15%-zinc scrim with 4px backdrop blur.
- **Tables use short row padding (8px vertical).** Data density is a feature. Rows pack in tightly, the hover state is the only visual change until the user clicks.

## Elevation & Depth

Veritec AI is almost flat. There are exactly three elevation levels:

- **Base (0).** All content cards, inputs, sidebar items, field rows. Structure is defined by 1px borders, not shadow.
- **Hover elevation.** Card-style interactive elements get a faint tinted shadow `0 2px 8px rgba(30, 64, 175, 0.08)` — a blue-washed lift that hints at the brand without shouting. This appears on playbook cards, knowledge-base cards, template cards, and field rows.
- **Floating (popovers, drawers, dropdowns).** Strong drop shadows: `0 16px 48px rgba(0,0,0,0.12)` for right-side drawers, `0 4px 12px rgba(0,0,0,0.08)` for popovers and dropdowns. The overlay behind a drawer is `rgba(24, 24, 27, 0.15)` with a 4px backdrop blur — strong enough to isolate but light enough to preserve context.

Focus states use a 3px-offset ring in blue (15% alpha) rather than a shadow — crisp, not muddy.

## Shapes

- **10px is the hero radius.** Every content card, every section panel, every primary input, every knowledge-base card, every template card, every drawer — all use `rounded-[10px]`. This is 2px larger than shadcn's default and gives the UI its subtle signature softness.
- **6px for buttons and rows.** Interactive elements that live *inside* cards get a tighter 6px radius — the visual rule is "always tighter than your parent".
- **Pill (9999px) for status, filters, and avatars.** Never for buttons. The shape alone communicates "this is a piece of metadata, not an action".
- **4px left accents on step blocks.** Playbook steps get a vertical 4px colored bar on the left — amber for Fetch, blue for Prompt. The only place in the app that uses a colored left-border.
- **3px tab underline.** The only place rectangles get a bottom accent. Active tabs grow a 3px blue-800 underline that does not span the full padding — just the label's width plus 8px each side.

## Components

### Buttons & Inputs

- **Primary button** is 32px tall, 12px horizontal padding, `#1e40af` background, white text, 6px radius. Hover goes to `#1e3a8a` (blue-900). Used sparingly — one per major surface.
- **Outline button** is the default. White background, 1px gray-200 border, zinc-700 text. Hover strengthens the border to gray-300 and tints the background gray-50.
- **Ghost button** has no border, transparent background, icon-only is common. Used for row-hover action menus (copy, re-run, delete).
- **Inputs** are 32px tall with a 12px horizontal padding, placeholder in zinc-500. Focus adds a 2px blue-100 ring and shifts the border to blue-800.
- **Search inputs** have a 14px Phosphor `MagnifyingGlass` prefixed 12px from the left, placeholder text offset 32px. Width is usually 280–320px.
- **Empty "Add" buttons** are dashed borders in gray-300, zinc-500 text, hover flips to dashed blue-200 + blue-50 tint + blue-800 text. They sit at the end of every repeatable list: "Add input", "Add output", "Add column", "Add Fetch", "Add Prompt".

### Cards & Lists

- **Content card** is white, 1px gray-200 border, `rounded-[10px]`, 12–16px padding. A soft hover shadow appears on interactive cards only.
- **Section panel** is a content card with a header strip: `bg-gray-50`, 1px gray-200 bottom border, 14px semibold title, 11px zinc-500 subtitle on the same line. Example: "Inputs — What users fill in when they run this playbook".
- **Field rows** (input/output definitions in the playbook editor) are white cards with an icon container on the left, field name + type pill on the right, optional description line. Document-type rows wear a teal tint and "Deliverable" badge. Records-type rows wear a violet tint and show a column-preview strip beneath the main row.
- **Step rows** in the playbook editor have a 4px colored left border by type (amber for Fetch, blue for Prompt), drag handle, step number, icon tile, name, type pill, and one-line detail preview.

### Navigation

- **The app sidebar** is a fixed 220px panel tinted `bg-gray-50`. Nav items are 32px tall, 8px horizontal padding, 4px gap between. Icons use Phosphor Bold weight at 16px. Active nav gets `bg-blue-50 text-blue-800 font-semibold`.
- **Custom tabs** (not shadcn's) — 14px, semibold when active, with a 3px blue-800 underline. Ghost tabs are zinc-600. Tab bar sits on a 48px white row with a 1px gray-200 bottom border.
- **Breadcrumbs** use `/` separators, 14px regular weight, semibold on the final segment. Trail items are clickable and hover to blue-800.

### Status & Feedback

- **Status pills** are the main semantic device. Always `bg-{color}-50 text-{color}-700 border-{color}-200`, 11px medium, 16px line-height, 8px horizontal padding, 2px vertical, rounded-full. Icon fills the pill at 12px. Filtering tags, category labels, state badges, and flag chips all use this pattern.
- **"Live" indicator.** 6px green-500 dot with a pulse animation. Used on the runs grid footer and anywhere data auto-refreshes.
- **Avatar initials.** 20px (list contexts) or 24px (detail) perfect circles, pastel-100 background with saturated-800 text, two uppercase initials at 10px semibold. Each person in the sample data has a consistent color.

### Tables & Grids

- **Table headers** are `bg-gray-50`, 11px uppercase eyebrow, zinc-500 text, 12px horizontal padding, 8px vertical. Sticky when the surface scrolls.
- **Table rows** use 1px gray-100 bottom borders (lighter than outer borders), 8px vertical padding, hover state is `bg-gray-50`. Row click opens a drawer or navigates — never an expand-in-place.
- **Data grid in runs view** is the most information-dense surface. Each row shows 6–8 columns. Inline content types include: status pill, case chip, output preview (rendered per playbook), duration in tabular-nums, and an avatar-stack column for "triggered by".
- **The Questions table** (Records output on the run detail page) adds filter chips above — one per `Flag` category, with counts. Active filter chip uses blue-50 + blue-800, inactive chips are neutral. Search input sits on the left of the same row.

### Runtime & Workflow

- **Variable chips** render `{{field_name}}` as blue-100 pill-rounded monospace inside prompt text. They're interactive in the editor — clicking inserts at cursor.
- **Drawers** slide in from the right over a 15% zinc scrim. 48px header (back button, title, close icon), scrollable body, 56px footer with action buttons right-aligned. Delete is a red ghost icon on the far left; primary action always rightmost.
- **Empty states** inside cards use center-aligned muted text at 12px with an optional Phosphor icon at 16px zinc-400. No illustrations — this isn't a consumer app.

### Layout & Density Rules

- **Never use text larger than 18px.** Even page titles cap there.
- **Never stack more than 3 vertical paddings in a row.** Collapse with dividers instead.
- **Never use a colored background larger than 48×48 unless it's a status pill or a sidebar/header strip.** Category color lives in icon containers, never in card bodies.
- **Always show density.** The UI is designed for users with 300+ active cases. If a list has 50 items, show 20 at a time, not 5. Sparse layouts feel wrong here.

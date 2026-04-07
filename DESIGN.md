# Veritec AI — Design System

## 1. Visual Theme & Atmosphere

Veritec AI is a legal document management platform built for law firms. The design is light-mode-first, professional, and data-dense — prioritizing clarity and scannability over decoration. The UI uses a clean white canvas with subtle gray borders, blue accents for active/brand elements, and a compact sidebar navigation.

Typography uses Inter across all surfaces. The overall feel is structured, tool-like, and enterprise-grade — closer to Linear or Notion than a consumer app.

**Key Characteristics:**
- Light-mode-native: white backgrounds with gray-50 sidebar
- Inter font family throughout
- Blue-800 (`#1e40af`) as the primary brand color
- Compact, data-dense table layouts
- shadcn/ui component library as the foundation
- Phosphor Icons (Bold weight for sidebar, Regular weight for content areas)
- Minimal decoration — borders and spacing create structure
- Status badges with semantic color coding (green/red)

## 2. Color Palette & Roles

### Background Surfaces
- **Page Background** (`#ffffff`): Main content area
- **Sidebar Background** (`#f9fafb` / gray-50): Left navigation panel
- **Table Header** (`#f9fafb` / gray-50): Column header row
- **Hover Row** (`#f9fafb` / gray-50): Table row hover state
- **Active Nav Item** (`#eff6ff` / blue-50): Selected sidebar item background

### Text & Content
- **Primary Text** (`#18181b` / zinc-900): Headings, important labels
- **Secondary Text** (`#3f3f46` / zinc-700): Sidebar text, table cell values
- **Tertiary Text** (`#71717a` / zinc-500): Muted labels, metadata, placeholders
- **Quaternary Text** (`#a1a1aa` / zinc-400): Disabled text, "No Date" values

### Brand & Accent
- **Brand Blue** (`#1e40af` / blue-800): Logo background, active nav text, primary accent
- **Active Background** (`#eff6ff` / blue-50): Active sidebar item fill
- **Document Type - Affidavit** (`#1d4ed8` / blue-700): Affidavit type label
- **Document Type - Motion** (`#15803d` / green-700): Motion type label

### Status Colors
- **Filing Completed** — bg: `#f0fdf4` (green-50), text: `#15803d` (green-700), border: `#bbf7d0` (green-200)
- **Filing Error** — bg: `#fef2f2` (red-50), text: `#b91c1c` (red-700), border: `#fecaca` (red-200)
- **Classifier Error** — bg: `#fef2f2` (red-50), text: `#b91c1c` (red-700), border: `#fecaca` (red-200)

### Border & Divider
- **Primary Border** (`#e5e7eb` / gray-200): Sidebar border, table borders, header divider
- **Subtle Border** (`#f1f5f9` / slate-100): Upgrade card border
- **Input Border** (`#e4e4e7` / zinc-200): Form input borders

## 3. Typography Rules

### Font Family
- **Primary**: Inter (variable), loaded via `next/font/google`
- **CSS Variable**: `--font-sans`

### Hierarchy

| Role | Size | Weight | Use |
|------|------|--------|-----|
| Page Title | 18px (text-lg) | 600 (semibold) | "All Inboxes" |
| Section Header | 14px (text-sm) | 600 (semibold) | "FileFlow Inbox" in top bar |
| Sidebar Nav | 14px (text-sm) | 400 (normal) | Inactive nav items |
| Sidebar Nav Active | 14px (text-sm) | 600 (semibold) | Active nav item (FileFlow Inbox) |
| Sidebar Group Label | 12px (text-xs) | 500 (medium) | "Records" section label |
| Table Header | 12px (text-xs) | 500 (medium) | Column headers |
| Table Cell | 14px (text-sm) | 400 (normal) | Data values |
| Table Cell Bold | 14px (text-sm) | 500 (medium) | Due dates with values |
| Badge Text | 12px (text-xs) | 500 (medium) | Notification counts |
| Button Text | 14px (text-sm) | 500 (medium) | Action buttons |
| Upgrade Title | 14px (text-sm) | 500 (medium) | Upgrade card heading |
| Upgrade Description | 12px (text-xs) | 400 (normal) | Upgrade card body |

## 4. Iconography

### Icon Library
- **Library**: Phosphor Icons (`@phosphor-icons/react`)
- **9,000+ icons** available across 6 weights

### Icon Weights by Context
- **Bold**: Sidebar navigation icons, action icons (menu dots, carets)
- **Regular**: Content area icons (toolbar, table actions)

### Icon Sizing
- **Sidebar icons**: 16x16 (`h-4 w-4`)
- **Toolbar icons**: 16x16 (`h-4 w-4`)
- **Caret/chevron icons**: 12x12 (`h-3 w-3`) or 16x16 (`h-4 w-4`)

### Icon Mapping

| Context | Icon | Phosphor Name |
|---------|------|---------------|
| Chat | Chat bubble with text | `ChatCircleText` |
| FileFlow Inbox | Tray | `Tray` |
| Agents | Sparkle | `Sparkle` |
| Intake | Clipboard with text | `ClipboardText` |
| Workflows | Flow arrow | `FlowArrow` |
| Reporting | Bar chart | `ChartBar` |
| DocIntel | Brain | `Brain` |
| Drafting | Pencil | `PencilSimpleLine` |
| Voice | Phone call | `PhoneCall` |
| More | Three dots | `DotsThree` |
| Cases | Suitcase | `SuitcaseSimple` |
| Documents | File with text | `FileText` |
| Contacts | Users | `Users` |
| Dropdown | Caret down | `CaretDown` |
| Upload | Upload arrow | `UploadSimple` |
| Sort | Sort ascending | `SortAscending` |
| Filter | Funnel | `Funnel` |
| Grid view | Four squares | `SquaresFour` |
| Search | Magnifying glass | `MagnifyingGlass` |
| Row menu | Vertical dots | `DotsThreeVertical` |
| Group | List bullets | `ListBullets` |
| Upgrade | Diamond four | `DiamondsFour` |

## 5. Component Stylings

### Buttons

**Outline Button (Default)**
- Background: white
- Text: zinc-900
- Border: 1px solid zinc-200
- Radius: 8px (rounded-lg)
- Padding: 8px 12px (size sm)
- Font: 14px medium

**Ghost Button**
- Background: transparent
- Hover: zinc-100
- No border
- Used for: row action menus

### Sidebar

**Component**: shadcn/ui `<Sidebar>` with `<SidebarProvider>`
- Width: 16rem (256px, shadcn default)
- Background: gray-50
- Border-right: 1px solid gray-200
- Header height: 48px (h-12), with bottom border matching main content header

**Nav Item (Inactive)**
- Padding: 8px
- Height: 32px
- Text: 14px normal, zinc-700
- Icon: 16px, zinc-700
- Radius: 6px
- Hover: sidebar-accent background

**Nav Item (Active)**
- Background: blue-50
- Text: blue-800 semibold
- Icon: blue-800
- Radius: 10px (rounded container)

**Sub Item**
- Left padding: 24px (indented under parent)
- Height: 28px
- Text: 14px normal, zinc-700
- Badge: 12px semibold, gray-500

**Group Label**
- Text: 12px medium, zinc-500
- Opacity: 70%
- Padding: 8px horizontal

### Data Table

**Component**: shadcn/ui `<Table>`

**Header Row**
- Background: gray-50
- Text: 12px medium, zinc-500
- Padding: default shadcn

**Body Row**
- Background: white
- Hover: gray-50
- Border-bottom: 1px solid gray-200

**Status Badge**
- Variant: outline
- Radius: default badge radius
- Filing Completed: green-50 bg, green-700 text, green-200 border
- Filing Error: red-50 bg, red-700 text, red-200 border
- Classifier Error: red-50 bg, red-700 text, red-200 border

**Document Type Labels**
- Affidavit: blue-700 text, medium weight
- Motion: green-700 text, medium weight
- N/A: red-500 text, medium weight

**Reviewed By Cell**
- Avatar circle: 24px, zinc-100 bg, User icon 12px zinc-500
- Name: 14px, zinc-700

### Upgrade Card (Sidebar Footer)
- Background: white
- Border: 1px solid slate-100
- Radius: 10px (rounded-lg)
- Padding: 12px
- Backdrop blur: sm
- Button: outline variant, full width

### Top Header Bar
- Height: 48px (h-12)
- Border-bottom: 1px solid gray-200
- Padding: 16px horizontal
- Icon + title layout, vertically centered

## 6. Layout Principles

### Spacing System
- Base unit: 4px (Tailwind default)
- Common values: 4px, 8px, 12px, 16px, 24px, 32px

### Page Structure
- Sidebar: fixed left, 256px wide
- Main content: flex-1, fills remaining width
- Top bar: 48px, spans main content width, border-bottom aligned with sidebar header
- Content area: 24px padding (p-6)

### Data Table Layout
- Rounded border container (rounded-md, border gray-200)
- Overflow auto for horizontal scrolling
- Fixed column widths for consistency

### Whitespace Philosophy
The design is data-dense but breathable. Tables use compact row heights with adequate horizontal padding. The sidebar uses tight 4px gaps between nav items. Section separation relies on borders and group labels rather than large gaps.

## 7. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No shadow, white bg | Page content, table rows |
| Surface (1) | gray-50 background | Sidebar, table headers |
| Card (2) | White bg, 1px border, subtle backdrop-blur | Upgrade card |
| Overlay (3) | Not yet implemented | Dropdowns, modals (future) |

Veritec avoids drop shadows in favor of borders for depth. The sidebar uses a right border, the header uses a bottom border, and the table uses a full border container.

## 8. Do's and Don'ts

### Do
- Use Phosphor Icons (`@phosphor-icons/react`) for all icons — Bold weight in sidebar, Regular in content
- Use shadcn/ui components as the foundation for all UI elements
- Use Inter as the sole font family
- Use blue-800/blue-50 for active/brand states
- Use semantic status colors (green for success, red for errors)
- Keep table layouts data-dense with compact row heights
- Use borders (not shadows) for visual separation
- Align sidebar header height with main content header (both h-12)

### Don't
- Don't use Lucide, Heroicons, or other icon libraries — Phosphor Icons only
- Don't use drop shadows for elevation (use borders instead)
- Don't use decorative gradients or background patterns
- Don't use colors outside the defined palette for status indicators
- Don't make the sidebar wider than 256px
- Don't use bold weight (700) for body text — max is semibold (600)
- Don't add rounded corners larger than rounded-lg (8px) on buttons/inputs

## 9. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (base-ui foundation) |
| Icons | Phosphor Icons (`@phosphor-icons/react`) |
| Font | Inter (via `next/font/google`) |
| Deployment | GitHub Pages (static export) |

### Key Dependencies
```json
{
  "@phosphor-icons/react": "^2.x",
  "next": "^16.x",
  "react": "^19.x",
  "tailwindcss": "^4.x",
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x",
  "tailwind-merge": "^3.x"
}
```

### shadcn/ui Components in Use
- `Sidebar` (with Provider, Header, Content, Footer, Menu, MenuButton, MenuItem, MenuSub, MenuSubButton, MenuSubItem, MenuBadge, GroupLabel)
- `Table` (with Header, Body, Row, Head, Cell)
- `Button` (outline, ghost variants)
- `Badge` (outline variant with semantic colors)
- `Input`
- `Collapsible` (for expandable nav items)
- `Tooltip` (via TooltipProvider in layout)

## 10. Agent Prompt Guide

### Quick Color Reference
- Brand: Blue-800 (`#1e40af`)
- Active BG: Blue-50 (`#eff6ff`)
- Page BG: White (`#ffffff`)
- Sidebar BG: Gray-50 (`#f9fafb`)
- Primary Text: Zinc-900 (`#18181b`)
- Secondary Text: Zinc-700 (`#3f3f46`)
- Muted Text: Zinc-500 (`#71717a`)
- Border: Gray-200 (`#e5e7eb`)
- Success: Green-700 on Green-50
- Error: Red-700 on Red-50

### Implementation Checklist
1. Always use `@phosphor-icons/react` — never Lucide or other icon libraries
2. Use shadcn/ui components — don't build custom when shadcn has it
3. Inter font via `next/font/google` with `--font-sans` CSS variable
4. Sidebar and main content headers must be same height (h-12) with aligned bottom borders
5. Status badges use outline variant with semantic bg/text/border colors
6. Table headers are gray-50 background with 12px medium text
7. All nav icons are 16px (`h-4 w-4`), Phosphor Bold weight in sidebar
8. Active nav items: blue-50 background, blue-800 text, semibold weight

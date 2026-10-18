---
name: Ledger Flow
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#444653'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#4c2e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b4200'
  on-tertiary-container: '#ffa929'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-regular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-compact:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-text:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  mono-num-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  mono-num-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  mono-num-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for modern financial technology, business accounting, and invoicing workflows. Built to serve fast-growing startups, accounting professionals, and SMEs, the aesthetic bridges Scandinavian precision with fintech rigor. 

The emotional signature is **uncompromising reliability, clarity under pressure, and effortless velocity**. Invoicing and tax reconciliation inherently induce administrative fatigue; the UI counters this by presenting structured order, crisp hierarchy, and instantaneous visual cues.

Drawing on **Modern Corporate Minimalism with Tactile Precision**, the design language couples flat content surfaces with micro-elevations, hairline dividers, and purposeful status accents. Critical financial transitions (Quotation → Invoice → Tax Invoice → Receipt) move along explicit, high-contrast pathways, minimizing friction in dense data operations.

## Colors

The palette balances authoritative institution-grade blues with high-visibility contextual semantic signals.

- **Primary (`#1E40AF`)**: Deep Royal Blue. Carries authority and core interaction targets (primary triggers, document conversion CTA bars, focused table heads).
- **Secondary / Positive (`#0D9488` with `#10B981` tints)**: Teal Emerald. Exclusively handles finalized monetary statuses: "Paid", "Reconciled", and positive cash flow metrics.
- **Tertiary / Warning (`#F59E0B`)**: Warm Amber. Indicates pending review, unbilled quotations, and awaiting payment windows.
- **Critical / Overdue (`#E11D48`)**: Vivid Crimson Rose. Highlights overdue accounts receivable, tax mismatch flags, and voided transactions.
- **Neutral Core (`#0F172A` to `#F8FAFC`)**: Slate foundations. Backgrounds use crisp off-whites (`#F8FAFC`), structural panels use pure white (`#FFFFFF`), and borders rely on subtle neutral slates (`#E2E8F0`). Text layers employ `#0F172A` (Headings) and `#334155` (Body text) to preserve extreme optical clarity for numerical and multi-language characters.

## Typography

The type system prioritizes universal legibility across Latin script and loopless Thai script systems. **Inter** serves as the primary typographic backbone, delivering exceptional geometric balance, open counterforms, and optimal rendering at micro screen sizes.

Financial data, transaction codes, currency units, and ledger balances strictly consume tabular numerals through **JetBrains Mono**. This guarantees zero jitter during inline editing, instant vertical column scanning, and seamless alignment across multi-line ledger tallies.

### Typographic Principles:
- **Tabular Alignment**: All values representing currency (THB, USD), tax rates, and document IDs (`QT-2024-001`) use monospaced figures with identical character widths.
- **Hierarchy Distinction**: Subheads and table headers convert to uppercase with positive tracking (`letterSpacing: 0.05em`) in compact labels, cleanly distinguishing data labels from user-generated values.

## Layout & Spacing

This design system uses a flexible 12-column layout on desktop and tablet, collapsing to a single-column stacked canvas on mobile devices.

### Breakpoints & Canvas Behavior:
- **Desktop (1280px+)**: 12-column fluid grid, 24px (`1.5rem`) gutters, with a persistent collapsible 260px administrative navigation drawer. Main document canvas clamps at a max-width of 1440px for comfortable invoice reading geometry.
- **Tablet (768px - 1279px)**: 8-column layout, 16px (`1rem`) gutters. The side panel collapses into an icon-only rail or popover sheet. Tables toggle horizontal container scrolling with pinned action columns.
- **Mobile (< 768px)**: 4-column layout, 16px outer margin. Financial tabular rows transform into segmented list cards with status chips pegged top-right.

### Density Tiers:
- **Comfortable**: `space-lg` (20px) cell padding for executive dashboards and client-facing invoice previews.
- **Compact**: `space-xs` (4px vertical) and `space-sm` (8px horizontal) padding for line-item data grids, enabling high information density during mass journal entry or reconcile processes.

## Elevation & Depth

Visual hierarchy uses a refined hybrid approach: **low-contrast neutral outlines layered over targeted ambient drop shadows**.

### Tonal Foundations & Borders
- **Border Foundation**: Flat elements use a crisp 1px perimeter border (`#E2E8F0`). High-contrast cards use pure white backgrounds (`#FFFFFF`) against the off-white application canvas (`#F8FAFC`).
- **Focus States**: High-intent inputs and selected table rows replace the subtle border with a dual-ring: 1px inner solid (`#1E40AF`) and an outer 3px diffused glow (`rgba(30, 64, 175, 0.15)`).

### Elevation Matrix
- **Level 0 (Flat)**: Work surfaces, invoice preview sheets, embedded table rows. 1px hairline border, no shadow.
- **Level 1 (Card Rest)**: Primary data widgets, metric stat cards. `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04);` with a 1px border.
- **Level 2 (Hover & Active Drag)**: Interactive cards, dropdown flyouts, date-range pickers. `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);`.
- **Level 3 (Modals & Sticky Floating Bars)**: PDF export docks, bottom transition action rails (`QT -> IV`), payment receipt dialogue boxes. `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05);`.

## Shapes

The design system enforces a **Soft (`1`)** shape language (base radius 4px / `0.25rem`). This restraint projects corporate precision, prevents wasted screen space in tabular sheets, and aligns with standard accounting spreadsheet expectations while remaining distinctly modern.

### Radius Assignments:
- **Base (4px / 0.25rem)**: Text input fields, dropdown triggers, compact buttons, table row highlights, and nested line items.
- **Rounded-LG (8px / 0.5rem)**: Data cards, dashboard widgets, modal dialog windows, and persistent utility trays.
- **Rounded-XL (12px / 0.75rem)**: Master document containers (e.g., standard printable A4 invoice sheet wrappers on screen).
- **Pill (9999px)**: Reserved exclusively for status indicators, tag badges, and workflow sequence pills.

## Components

### 1. Action Buttons & Workflow Triggers
- **Primary Action (Document Lifecycle)**: Deep indigo fill (`#1E40AF`), pure white text, 4px corner radius, bold label. Hover state darkens to `#1E3A8A`.
- **Workflow Stepper Buttons (QT → IV → TAX → RE)**: Connected segment group. Completed stages show muted teal outline with checkmark; current stage is solid primary blue; upcoming steps are soft slate with subtle borders.
- **Export & Utility Buttons**: Ghost style with hairline border (`#E2E8F0`), slate text (`#334155`), with an icon slot reserved on the left (e.g., PDF or CSV glyph).

### 2. Status Chips & Badges
- Pill-shaped (`rounded-full`) with a fixed height of 22px, enclosing `label-text` (12px medium).
- **Paid / Approved**: Background `#ECFDF5`, text `#065F46`, leading circular dot (`#10B981`).
- **Pending / Awaiting Action**: Background `#FFFBEB`, text `#92400E`, leading dot (`#F59E0B`).
- **Overdue / Void**: Background `#FFF1F2`, text `#9F1239`, leading dot (`#E11D48`).
- **Draft / Quotation**: Background `#F1F5F9`, text `#475569`, leading dot (`#94A3B8`).

### 3. Data Tables & Ledger Grids
- **Header Cell**: Neutral tint (`#F8FAFC`), uppercase 11px semi-bold slate text, border-bottom 2px `#CBD5E1`.
- **Data Rows**: 1px `#F1F5F9` bottom divider. Alternating or clear hover states with `#F8FAFC`.
- **Numeric Columns**: Right-aligned, utilizing `JetBrains Mono` with fixed tabular numbers.
- **Action Column**: Pinned to the right edge with quick actions (View, PDF Download, Contextual Menu).

### 4. Input Fields & Calculation Rows
- **Text Inputs**: Crisp `#FFFFFF` surface, 1px `#CBD5E1` border, 36px standard height (28px in compact mode).
- **Monetary Inputs**: Prefix fixed with currency tag (e.g., `THB` or `฿`) set in neutral slate; text aligns right with tabular mono numbers.
- **Subtotal/Total Blocks**: Right-aligned card container featuring a highlighted grand total tier highlighted via a subtle primary tint (`#EFF6FF`).

### 5. Document Stage Pipeline Bar
- A contextual workflow banner affixed above document editors visualizing the chain:
  `Quotation (QT)` ➔ `Invoice (IV)` ➔ `Tax Invoice (TAX)` ➔ `Receipt (RE)`.
- Displays active conversion status with one-click transition buttons (`Convert to Tax Invoice`).
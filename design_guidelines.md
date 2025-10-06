# Design Guidelines: Business Database Management Application

## Design Approach
**Selected Approach:** Design System (Material Design 3 with Linear/Notion inspiration)
**Rationale:** This is a utility-focused, data-intensive application requiring excellent information hierarchy, clear interaction patterns, and professional aesthetics. Drawing from Material Design's robust component library while incorporating the clean, efficient patterns of Linear and Notion's database views.

## Core Design Principles
1. **Clarity First:** Every element serves the primary goal of efficient data management
2. **Information Hierarchy:** Clear visual distinction between data, actions, and navigation
3. **Efficient Workflows:** Minimize clicks and cognitive load for common tasks
4. **Professional Aesthetics:** Clean, modern interface that builds user confidence

## Color Palette

**Dark Mode (Primary):**
- Background Primary: 220 15% 12%
- Background Secondary: 220 15% 16%
- Background Tertiary: 220 15% 20%
- Text Primary: 220 10% 95%
- Text Secondary: 220 10% 70%
- Border: 220 15% 25%
- Primary Accent: 217 91% 60% (Blue for primary actions)
- Success: 142 71% 45% (Green for success states, exports)
- Warning: 38 92% 50% (Amber for tag indicators)

**Light Mode:**
- Background Primary: 0 0% 100%
- Background Secondary: 220 15% 97%
- Background Tertric: 220 15% 94%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%
- Border: 220 15% 88%
- Primary Accent: 217 91% 55%
- Success: 142 71% 40%
- Warning: 38 92% 48%

## Typography
**Font Stack:** Inter (Google Fonts) for UI, JetBrains Mono for data fields/IDs
- Headings: Inter 600 (Semibold)
- Body Text: Inter 400 (Regular)
- Data Fields: Inter 400
- Monospace (IDs/Codes): JetBrains Mono 400
- Size Scale: Base 14px for data tables, 16px for UI elements, 24-32px for headings

## Layout System
**Spacing Units:** Primarily use Tailwind units of 2, 4, 6, and 8 (e.g., p-4, gap-6, mt-8)
- Component padding: p-4 or p-6
- Section spacing: mt-8 or mb-8
- Grid gaps: gap-4 or gap-6
- Tight spacing for data tables: gap-2

**Container Structure:**
- Full-bleed layout with sidebar navigation
- Main content area: max-width constrained to ensure readable table width
- Responsive breakpoints: Mobile-first with tablet (768px) and desktop (1024px) optimizations

## Component Library

**Navigation:**
- Left sidebar (240px width on desktop, collapsible)
- Top actions bar with import/export/search
- Breadcrumbs for context within filtered views

**Data Display:**
- Primary component: Data table with sortable columns, row selection, inline editing
- Column headers: Sticky on scroll with sort indicators
- Row hover states: Subtle background change
- Zebra striping: Very subtle alternating row colors for readability
- Cell padding: Comfortable spacing for scanning (py-3 px-4)

**Forms & Inputs:**
- Import modal: Large dropzone for Excel files with tag selector
- Inline editing: Click to edit cells with subtle border highlight
- Search bar: Prominent placement with instant filtering
- Tag input: Multi-select dropdown with color-coded tag chips

**Buttons & Actions:**
- Primary actions: Filled button with accent color (Import, Export, Save)
- Secondary actions: Outline or ghost buttons (Cancel, Clear filters)
- Destructive actions: Red accent (Delete)
- Icon buttons for row actions: Edit, Delete with tooltips

**Tags System:**
- Color-coded tag chips with rounded corners
- Tag filter pills: Removable with × icon
- Tag management: Dedicated section with color picker

**Data Views:**
- Default: Table view with all columns visible
- Filtered: Active filters shown as removable chips above table
- Search results: Highlighted matching terms in yellow background
- Empty states: Helpful illustrations with CTA to import data

**Modals & Overlays:**
- Import dialog: File upload, tag assignment, preview before import
- Export dialog: Format selection (.xlsx, .csv, mailing list), field selection
- Confirmation dialogs: For destructive actions with clear consequences
- Edit drawer: Slide-in panel for detailed business record editing

## Interaction Patterns
- **Bulk Operations:** Checkbox selection in table header selects all, individual row checkboxes
- **Quick Actions:** Row hover reveals action buttons (Edit, Delete, Duplicate)
- **Keyboard Shortcuts:** Support for common actions (Ctrl+F for search, Ctrl+E for export)
- **Drag & Drop:** Import files by dragging onto designated dropzone

## Animations
**Minimal and Purposeful:**
- Smooth transitions on hover states (150ms ease)
- Modal/drawer entry: Slide-in from right (200ms)
- Loading states: Subtle skeleton screens for data fetching
- No decorative or scroll-triggered animations

## Accessibility Considerations
- Maintain consistent dark/light mode across all form inputs
- High contrast ratios for text (WCAG AAA where possible)
- Focus indicators on all interactive elements
- Screen reader labels for icon-only buttons
- Keyboard navigation for all functionality

## Images
**No hero images** for this utility application. The focus is entirely on the data table and functional elements. All visual interest comes from well-designed UI components, clear typography, and efficient layouts.
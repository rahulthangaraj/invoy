# InvoiceFlow — Product Requirements Document

**Version:** 1.2  
**Author:** Rahul Thangaraj  
**Date:** February 25, 2026  
**Status:** Ready for Development

---

## 1. Vision & Problem Statement

### The Problem
Freelancers, small businesses, and increasingly AI agents need a simple, open-source way to create, send, and track invoices without being locked into expensive SaaS tools (FreshBooks, Zoho Invoice, etc.) or dealing with clunky spreadsheet templates.

### The Vision
**InvoiceFlow** is an open-source invoicing platform designed for both humans and AI agents. It provides a clean interface to create one-time and recurring invoices, manage customers, and collect payments through flexible payment integrations. Being open-source means anyone can self-host it, extend it, and integrate it into their workflows.

### Target Users
- Freelancers and solopreneurs who need quick, professional invoices
- Small agencies and studios managing multiple clients
- AI agents and automation tools that need to generate and send invoices programmatically via API
- Developers who want to self-host and customize their billing workflow

### What Makes This Different
- **Agent-first API:** Every action available in the UI is also available via API, making it fully automatable
- **Open source and self-hostable:** No vendor lock-in, full data ownership
- **Payment-provider agnostic:** Works with Stripe, Razorpay, PayPal, bank transfers, or any custom payment link
- **Dead simple:** Not trying to be an accounting suite. Just invoicing, done well

---

## 2. Tech Stack & Architecture

### Stack (Optimized for solo developer using AI-assisted coding)

| Layer | Technology | Why This |
|-------|-----------|----------|
| Framework | Next.js 14+ (App Router) | Full-stack in one repo. Vercel deploys free |
| UI Library | Tailwind CSS + Shadcn/ui | Accessible components, easy to customize |
| Backend DB | Supabase (PostgreSQL) | Free tier: Auth + DB + Storage all-in-one |
| Auth | Supabase Auth | Built into Supabase, no separate service |
| File Storage | Supabase Storage | Logo uploads, PDF storage. Same dashboard |
| Email | Resend | 100 emails/day free. Simple API |
| PDF Generation | @react-pdf/renderer | Client-side, no server dependency |
| Hosting | Vercel (free tier) | Zero-config Next.js deployment |
| Package Manager | pnpm | Fast, disk efficient |

### Why This Stack
- 3 services total (Supabase + Vercel + Resend) instead of 6-7
- All have free tiers sufficient for launch and early growth
- Supabase dashboard lets you view/edit data visually without SQL
- AI coding tools understand all of these extremely well
- One repo, one deploy command via Vercel

### Cost Breakdown

| Service | Free Tier Limit | When You Pay |
|---------|----------------|--------------|
| Supabase | 500MB DB, 1GB storage, 50K auth users | $25/mo if you exceed |
| Vercel | 100GB bandwidth, serverless functions | $20/mo at scale |
| Resend | 100 emails/day, 3000/month | $20/mo for 50K emails |
| Domain | Use .vercel.app free | ~$10/year for custom |
| **Total at launch** | **$0/month** | |

### Database Schema

```sql
-- Organizations (the business sending invoices)
create table organizations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  country text,
  tax_id text,
  website text,
  logo_url text,
  brand_color text default '#0f172a',
  invoice_prefix text default 'INV',
  next_invoice_number integer default 1,
  default_currency text default 'USD',
  default_tax_rate numeric(5,2) default 0,
  default_tax_label text default 'Tax',
  default_payment_terms integer default 30,
  default_notes text,
  default_terms text,
  payment_link_url text,
  payment_link_label text default 'Pay Now',
  bank_name text,
  bank_account_holder text,
  bank_account_number text,
  bank_routing_code text,
  bank_swift_code text,
  upi_id text,
  payment_instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customers (people/companies being invoiced)
create table customers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company_name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  country text,
  tax_id text,
  currency_preference text,
  payment_terms integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  invoice_number text not null,
  status text default 'draft' check (status in ('draft','pending','paid','overdue','scheduled','cancelled')),
  type text default 'one-time' check (type in ('one-time','recurring')),
  issue_date date not null default current_date,
  due_date date not null,
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,2) default 0,
  tax_label text default 'Tax',
  tax_amount numeric(12,2) default 0,
  discount_type text default 'flat' check (discount_type in ('percentage','flat')),
  discount_value numeric(12,2) default 0,
  discount_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  currency text default 'USD',
  notes text,
  terms text,
  payment_link_url text,
  public_id text unique default gen_random_uuid()::text,
  sent_at timestamptz,
  paid_at timestamptz,
  recurring_frequency text check (recurring_frequency in ('weekly','monthly','quarterly','yearly')),
  recurring_start_date date,
  recurring_end_date date,
  recurring_next_send date,
  recurring_auto_send boolean default false,
  parent_invoice_id uuid references invoices(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoice Line Items
create table invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) default 0,
  amount numeric(12,2) default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- RLS Policies for organizations
create policy "Users can view own org" on organizations
  for select using (auth.uid() = user_id);
create policy "Users can insert own org" on organizations
  for insert with check (auth.uid() = user_id);
create policy "Users can update own org" on organizations
  for update using (auth.uid() = user_id);

-- Similar RLS policies needed for customers, invoices, invoice_items
-- filtered by organization_id matching the user's org
```

### Project Structure

See Section 3b for the complete, updated project structure with design system files, composed components, data layer separation, and all conventions.

---

## 3. Design System & Visual Direction

### Design Philosophy
The design should feel like Mercury meets Linear. A fintech-grade interface that feels trustworthy with money, but with the speed and polish of a modern dev tool. Clean, precise, confident. Every pixel intentional.

### Reference Products
- **Mercury** (banking): Clean layouts, generous whitespace, subtle depth, professional typography
- **Brex** (spend management): Bold type hierarchy, confident color usage, data-dense but breathable
- **Linear** (project management): Snappy interactions, keyboard-first, dark sidebar + light content
- **Stripe Dashboard**: Information density done right, excellent table design

### Color System

```css
/* Core Palette */
--background: #fafafa;
--surface: #ffffff;
--surface-secondary: #f5f5f7;
--border: #e5e5e5;
--border-subtle: #f0f0f0;

/* Text hierarchy */
--text-primary: #0a0a0a;
--text-secondary: #525252;
--text-tertiary: #a3a3a3;

/* Accent: deep financial blue, not typical SaaS blue */
--accent: #1a1a2e;
--accent-hover: #16213e;
--accent-subtle: #e8eaf6;

/* Status Colors: muted, professional */
--status-paid: #059669;
--status-paid-bg: #ecfdf5;
--status-pending: #d97706;
--status-pending-bg: #fffbeb;
--status-overdue: #dc2626;
--status-overdue-bg: #fef2f2;
--status-draft: #737373;
--status-draft-bg: #f5f5f5;
--status-scheduled: #4f46e5;
--status-scheduled-bg: #eef2ff;

/* Sidebar */
--sidebar-bg: #0a0a0a;
--sidebar-text: #a3a3a3;
--sidebar-text-active: #ffffff;
--sidebar-hover: #171717;
--sidebar-active: #1a1a2e;
```

### Typography

```css
/* Geist by Vercel: comes with Next.js, clean and modern */
--font-display: 'Geist', sans-serif;
--font-body: 'Geist', sans-serif;
--font-mono: 'Geist Mono', monospace;

/* Scale: tighter, Mercury-like */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.8125rem;    /* 13px */
--text-base: 0.875rem;   /* 14px body default */
--text-lg: 1rem;          /* 16px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 2rem;         /* 32px dashboard hero numbers */

--tracking-tight: -0.02em;
--tracking-normal: -0.01em;
```

### Spacing & Layout

```css
/* 4px base grid */
--sidebar-width: 240px;       /* Collapsed: 64px */
--content-max-width: 1200px;
--page-padding: 32px;

--radius-sm: 6px;    /* Buttons, inputs */
--radius-md: 8px;    /* Cards */
--radius-lg: 12px;   /* Modals */
--radius-full: 9999px; /* Pills */
```

### Component Strategy: Shadcn First, Customize Second

**DO NOT build UI components from scratch.** Use Shadcn/ui for every base component. Shadcn components are copied into your `components/ui/` folder as real files you own. Restyle them using the design tokens. Only build custom "composed" components when combining multiple Shadcn primitives into an app-specific pattern.

**Three layers of components:**

```
Layer 1: Shadcn Primitives (components/ui/)
  Installed via CLI. Restyled with design tokens. Never rebuilt from scratch.
  These handle accessibility, keyboard nav, focus management, animations.

Layer 2: Composed Components (components/composed/)
  Combine multiple Shadcn primitives into reusable app patterns.
  Example: StatusBadge = Shadcn Badge restyled with status token colors
  Example: DataTable = Shadcn Table + sorting + filtering + pagination
  Example: CustomerSelector = Shadcn Command (combobox) + custom list items

Layer 3: Feature Components (components/invoice/, components/dashboard/)
  Page-specific components that compose Layer 1 + Layer 2.
  Example: InvoiceForm uses CustomerSelector + Shadcn Input + Shadcn DatePicker
```

**Shadcn components to install on day one (via CLI):**

```bash
# Install all needed Shadcn components upfront
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add command          # Search/combobox for customer selector
pnpm dlx shadcn@latest add popover          # Date picker, dropdowns
pnpm dlx shadcn@latest add calendar         # Date picker
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add badge            # Status badges
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add skeleton         # Loading states
pnpm dlx shadcn@latest add toast            # Notifications
pnpm dlx shadcn@latest add sonner           # Better toast alternative
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add form             # React Hook Form integration
pnpm dlx shadcn@latest add alert-dialog     # Confirmation modals
pnpm dlx shadcn@latest add sheet            # Mobile sidebar
pnpm dlx shadcn@latest add switch           # Toggle switches
```

**After installing, restyle Shadcn components to match design tokens.** Shadcn uses CSS variables in `globals.css`. Map our design tokens to those variables so every Shadcn component automatically picks up our theme:

```css
/* app/globals.css - Map design tokens to Shadcn CSS variables */
@layer base {
  :root {
    --background: 0 0% 98%;        /* #fafafa */
    --foreground: 0 0% 4%;          /* #0a0a0a */
    --card: 0 0% 100%;              /* #ffffff */
    --card-foreground: 0 0% 4%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 4%;
    --primary: 240 27% 14%;         /* #1a1a2e (accent) */
    --primary-foreground: 0 0% 100%;
    --secondary: 240 5% 96%;        /* #f5f5f7 */
    --secondary-foreground: 0 0% 4%;
    --muted: 240 5% 96%;
    --muted-foreground: 0 0% 32%;   /* #525252 */
    --accent: 240 27% 14%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;       /* #dc2626 */
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 90%;             /* #e5e5e5 */
    --input: 0 0% 90%;
    --ring: 240 27% 14%;            /* accent for focus ring */
    --radius: 0.375rem;             /* 6px */
  }
}
```

This way, every Shadcn Button, Input, Dialog, Table automatically looks like our Mercury/Brex design without touching individual component files.

**Composed components (what we build on top of Shadcn):**

| Component | Wraps | Purpose |
|-----------|-------|---------|
| StatusBadge | Badge | Status-specific colors from tokens |
| CurrencyDisplay | span | Formatted money, tabular-nums, split currency symbol styling |
| DateDisplay | Tooltip + span | Relative dates ("3 days ago") with full date on hover |
| EmptyState | Card | Illustration + headline + description + CTA pattern |
| PageHeader | div | Page title + description + action buttons layout |
| DataTable | Table + Command | Sortable, filterable, paginated table pattern |
| SearchInput | Command | Global search with Cmd+K shortcut |
| ConfirmDialog | AlertDialog | "Are you sure?" pattern with destructive action |
| LogoUpload | Input + Card | Drag & drop with preview |
| CustomerSelector | Command (combobox) | Search customers + quick-add new |

**NEVER rebuild what Shadcn provides.** If Shadcn has it, install it. If you need it different, restyle the installed file. Only write custom components for business-specific patterns that combine multiple Shadcn pieces.

### Component Visual Specifications

These specs define the visual appearance. Use Shadcn components as the base and apply these styles via design tokens and Tailwind classes.

**Sidebar (Dark)**
- Width: 240px, collapsible to 64px icon-only
- Background: near-black (#0a0a0a)
- Nav items: 36px height, active state = white text + left 2px accent bar
- Icons: 18px Lucide icons, 1.5px stroke
- Sections: Invoices, Customers, Settings
- Bottom: User avatar + name + logout
- All transitions: 150ms

**Summary Cards**
- 4 cards responsive grid
- White bg, 1px border, 8px radius, no shadow (Mercury-style)
- Label: 13px medium, secondary color
- Amount: 32px bold, primary, tabular-nums
- Overdue card: 2px red top border accent

**Invoice Table**
- No alternating row colors
- Header: 12px uppercase, 0.05em letter-spacing, tertiary color
- Rows: 52px height, bottom border only (#f0f0f0)
- Hover: surface-secondary bg, 100ms
- Status badges: pill-shaped, 12px medium, distinct bg+text per status
- Amount: right-aligned, tabular-nums
- Actions: appear on row hover (icon buttons)
- Empty state: illustration + headline + CTA

**Buttons**
- Primary: accent bg, white text, 36px height, 6px radius
- Secondary: white bg, 1px border, primary text
- Ghost: transparent, secondary text
- Press: scale(0.98) 100ms
- Disabled: 50% opacity

**Form Inputs**
- 40px height, 1px border, 6px radius, 14px text
- Focus: accent border, 2px accent ring at 20% opacity
- Error: red border, red ring, 13px error text below

**Modals**
- Overlay: black 40%, backdrop-blur(4px)
- Modal: white, 12px radius
- Enter: fade + scale from 0.95, 200ms
- Exit: fade + scale to 0.95, 150ms

### Motion & Interactions
- Page transitions: 150ms fade
- Button press: scale(0.98) 100ms
- Dropdowns: slide down 200ms
- Toasts: slide in from top-right
- Loading: skeleton shimmer, NOT spinners
- Invoice preview: instant updates, no debounce

### Micro-Details That Matter
- `font-feature-settings: 'tnum'` on all monetary amounts
- Currency symbols in text-secondary, amounts in text-primary
- Relative dates with full date on hover ("Due in 5 days")
- Skeleton loading everywhere (Mercury-style)
- Keyboard shortcuts: Cmd+N new invoice, Cmd+K search
- Toast for actions: "Invoice sent to billing@acme.co" with undo option
- Auto-format monetary inputs with commas
- Invoice numbers in Geist Mono

### CRITICAL: Design System as Single Source of Truth

Every visual property in this app MUST come from the design system. No hardcoded colors, no magic numbers, no one-off styles. If you need a new token, add it to the system first, then use it. This ensures that changing one value (e.g., the accent color) updates the entire app instantly.

**Implementation: Design Tokens File**

Create `lib/design-tokens.ts` as the single source of truth for all design values. Every component imports from here. Nothing is hardcoded.

```typescript
// lib/design-tokens.ts
// SINGLE SOURCE OF TRUTH. Every color, size, spacing, shadow, and
// animation value in the entire app MUST come from this file.
// To change the look of the app, edit ONLY this file.

export const tokens = {
  colors: {
    background: '#fafafa',
    surface: '#ffffff',
    surfaceSecondary: '#f5f5f7',
    border: '#e5e5e5',
    borderSubtle: '#f0f0f0',

    textPrimary: '#0a0a0a',
    textSecondary: '#525252',
    textTertiary: '#a3a3a3',

    accent: '#1a1a2e',
    accentHover: '#16213e',
    accentSubtle: '#e8eaf6',

    status: {
      paid:        { text: '#059669', bg: '#ecfdf5' },
      pending:     { text: '#d97706', bg: '#fffbeb' },
      overdue:     { text: '#dc2626', bg: '#fef2f2' },
      draft:       { text: '#737373', bg: '#f5f5f5' },
      scheduled:   { text: '#4f46e5', bg: '#eef2ff' },
      cancelled:   { text: '#737373', bg: '#f5f5f5' },
    },

    sidebar: {
      bg: '#0a0a0a',
      text: '#a3a3a3',
      textActive: '#ffffff',
      hover: '#171717',
      active: '#1a1a2e',
    },
  },

  typography: {
    fontFamily: {
      display: "'Geist', sans-serif",
      body: "'Geist', sans-serif",
      mono: "'Geist Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.8125rem',
      base: '0.875rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '-0.01em',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
    },
  },

  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },

  layout: {
    sidebarWidth: '240px',
    sidebarCollapsed: '64px',
    contentMaxWidth: '1200px',
    pagePadding: '32px',
    pagePaddingMobile: '16px',
  },

  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
    lg: '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)',
    xl: '0 4px 6px rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.08)',
  },

  transitions: {
    fast: '100ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  components: {
    button: {
      height: { sm: '32px', md: '36px', lg: '40px' },
      paddingX: '16px',
    },
    input: {
      height: '40px',
      paddingX: '12px',
    },
    table: {
      rowHeight: '52px',
      headerFontSize: '0.75rem',
      headerLetterSpacing: '0.05em',
    },
    sidebar: {
      navItemHeight: '36px',
      iconSize: '18px',
      activeBorderWidth: '2px',
    },
    card: {
      padding: '24px',
    },
    modal: {
      overlayOpacity: 0.4,
      backdropBlur: '4px',
    },
    statusBadge: {
      paddingX: '10px',
      paddingY: '4px',
      fontSize: '0.75rem',
    },
  },
} as const;
```

**Tailwind Integration**

All tokens MUST be wired into `tailwind.config.ts` so they are available as utility classes. No raw hex values in className strings.

```typescript
// tailwind.config.ts
// Import tokens and map them to Tailwind's theme
import { tokens } from './lib/design-tokens';

export default {
  theme: {
    extend: {
      colors: {
        background: tokens.colors.background,
        surface: tokens.colors.surface,
        'surface-secondary': tokens.colors.surfaceSecondary,
        border: tokens.colors.border,
        'border-subtle': tokens.colors.borderSubtle,
        'text-primary': tokens.colors.textPrimary,
        'text-secondary': tokens.colors.textSecondary,
        'text-tertiary': tokens.colors.textTertiary,
        accent: {
          DEFAULT: tokens.colors.accent,
          hover: tokens.colors.accentHover,
          subtle: tokens.colors.accentSubtle,
        },
        // ... map all status colors, sidebar colors etc.
      },
      borderRadius: tokens.radius,
      boxShadow: tokens.shadows,
      // ... map spacing, fontSize, etc.
    },
  },
};
```

**Usage Rules (STRICTLY ENFORCED)**

1. NEVER use raw hex values in components. Always reference tokens via Tailwind classes or the tokens object.

```tsx
// WRONG - hardcoded color
<div className="bg-[#fafafa] text-[#0a0a0a]">

// CORRECT - uses token via Tailwind
<div className="bg-background text-text-primary">
```

2. NEVER use arbitrary spacing. Always use the spacing scale.

```tsx
// WRONG
<div className="p-[13px] mt-[22px]">

// CORRECT
<div className="p-3 mt-5">  // maps to 12px, 20px from tokens
```

3. ALL status rendering MUST use the status token map. One function, used everywhere.

```tsx
// lib/utils.ts
export function getStatusStyle(status: InvoiceStatus) {
  return tokens.colors.status[status];
  // Returns { text: '#059669', bg: '#ecfdf5' } for 'paid'
}
```

4. Changing a token value in `design-tokens.ts` MUST update everywhere. Zero exceptions. If any component looks wrong after a token change, it means that component has a hardcoded value, which is a bug.

---

## 3b. Code Quality & Architecture Standards

### Guiding Principle
This is an open-source project. Any developer should be able to clone the repo, understand the structure in 5 minutes, and contribute a feature without reading a novel. Code should be self-documenting, consistently structured, and easy to change.

### Project Structure (Updated with Design System)

```
invoiceflow/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── invoice/page.tsx
│   │       └── payment/page.tsx
│   ├── invoice/
│   │   └── [publicId]/page.tsx
│   └── api/
│       ├── invoices/
│       ├── customers/
│       ├── settings/
│       └── webhooks/
│
├── components/
│   ├── ui/                          # Shadcn primitives (Button, Input, Dialog, etc.)
│   │   ├── button.tsx               # Shadcn component, styled via design tokens
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── command.tsx              # For search/combobox
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   ├── composed/                    # App-specific reusable components
│   │   ├── status-badge.tsx         # Invoice status badge (uses tokens)
│   │   ├── currency-display.tsx     # Formatted money display (tabular nums)
│   │   ├── date-display.tsx         # Relative dates with hover tooltip
│   │   ├── empty-state.tsx          # Reusable empty state pattern
│   │   ├── page-header.tsx          # Page title + action buttons pattern
│   │   ├── data-table.tsx           # Reusable table with sort/filter/pagination
│   │   ├── search-input.tsx         # Global search pattern
│   │   ├── confirm-dialog.tsx       # Reusable confirmation modal
│   │   └── logo-upload.tsx          # Drag & drop logo uploader
│   ├── invoice/                     # Invoice-specific components
│   │   ├── invoice-preview.tsx
│   │   ├── invoice-form.tsx
│   │   ├── line-item-row.tsx
│   │   └── customer-selector.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── summary-cards.tsx
│   │   └── invoice-table.tsx
│   └── layout/                      # Layout components
│       ├── app-shell.tsx            # Sidebar + content wrapper
│       ├── topbar.tsx
│       └── mobile-nav.tsx
│
├── lib/
│   ├── design-tokens.ts             # SINGLE SOURCE OF TRUTH for all design values
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   ├── server.ts                # Server Supabase client
│   │   └── middleware.ts            # Auth middleware
│   ├── actions/                     # Server Actions (data mutations)
│   │   ├── invoice-actions.ts
│   │   ├── customer-actions.ts
│   │   └── settings-actions.ts
│   ├── queries/                     # Data fetching functions
│   │   ├── invoice-queries.ts
│   │   ├── customer-queries.ts
│   │   └── settings-queries.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-invoices.ts
│   │   ├── use-customers.ts
│   │   ├── use-organization.ts
│   │   └── use-debounce.ts
│   ├── validations/                 # Zod schemas for form + API validation
│   │   ├── invoice-schema.ts
│   │   ├── customer-schema.ts
│   │   └── settings-schema.ts
│   ├── types.ts                     # TypeScript types and interfaces
│   ├── constants.ts                 # App constants (currencies, payment terms, etc.)
│   └── utils.ts                     # Pure utility functions
│
├── supabase/
│   └── migrations/                  # SQL migration files (versioned)
│
├── public/
├── .env.local
├── .env.example                     # Template for env vars (committed to git)
├── tailwind.config.ts               # Imports from design-tokens.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

### File & Folder Conventions

**Naming:**
- Files: `kebab-case.ts` / `kebab-case.tsx` (e.g., `invoice-form.tsx`)
- Components: `PascalCase` exports (e.g., `export function InvoiceForm()`)
- Hooks: `use-camel-case.ts` (e.g., `use-invoices.ts`)
- Types: `PascalCase` (e.g., `Invoice`, `Customer`, `InvoiceStatus`)

**One concern per file:**
- A component file has ONE exported component
- A hook file has ONE exported hook
- An actions file groups related server actions for one domain

**Co-location rule:**
- If something is used by ONE page, keep it in that page's folder
- If something is used by 2+ pages, move it to `components/composed/` or `lib/`
- Never reach more than 2 levels deep for an import

### TypeScript Standards

**Strict mode. No `any`. Ever.**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**All data shapes defined in `lib/types.ts`:**

```typescript
// lib/types.ts
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'scheduled' | 'cancelled';
export type InvoiceType = 'one-time' | 'recurring';
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type DiscountType = 'percentage' | 'flat';

export interface Organization {
  id: string;
  userId: string;
  name: string;
  email: string;
  // ... all fields typed, no optional unless truly optional
}

export interface Customer { /* ... */ }
export interface Invoice { /* ... */ }
export interface InvoiceItem { /* ... */ }

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Form types (separate from DB types, used by forms and validation)
export interface InvoiceFormData { /* ... */ }
export interface CustomerFormData { /* ... */ }
```

### Validation with Zod

Every form and every API endpoint uses Zod schemas. Define once, use in both client (form validation) and server (API validation).

```typescript
// lib/validations/customer-schema.ts
import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  // ...
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Used in form: zodResolver(customerSchema)
// Used in API: customerSchema.parse(req.body)
```

### Data Layer Pattern

**Separation of concerns:**
- `lib/queries/` = READ operations (SELECT). Used in Server Components and API GET routes.
- `lib/actions/` = WRITE operations (INSERT, UPDATE, DELETE). Used as Server Actions in forms and API mutation routes.
- `lib/hooks/` = Client-side state and data management. Wraps queries/actions for use in Client Components.

```typescript
// lib/queries/invoice-queries.ts
export async function getInvoices(orgId: string, filters?: InvoiceFilters) {
  const supabase = createServerClient();
  // query logic
  return { data, error };
}

// lib/actions/invoice-actions.ts
'use server';
export async function createInvoice(formData: InvoiceFormData) {
  // validate, insert, return result
}

// lib/hooks/use-invoices.ts
export function useInvoices(filters?: InvoiceFilters) {
  // client-side state management wrapping the query
}
```

### Component Patterns

**Every component follows this structure:**

```tsx
// components/composed/status-badge.tsx

// 1. Imports
import { tokens } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/lib/types';

// 2. Props interface (always typed, always exported)
export interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

// 3. Component (named export, not default)
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = tokens.colors.status[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        className
      )}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

**Composed components wrap Shadcn primitives** with app-specific logic. Shadcn stays generic, composed components add business context.

### Error Handling

```typescript
// Consistent error pattern everywhere
try {
  const result = await someAction();
  if (result.error) {
    toast.error(result.error);
    return;
  }
  toast.success('Action completed');
} catch (error) {
  toast.error('Something went wrong. Please try again.');
  console.error('[ActionName]:', error);
}
```

### Code Quality Tooling

**Set up in the project from day one:**

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

**ESLint config:**
- next/core-web-vitals (comes with Next.js)
- No unused variables
- No unused imports
- Consistent import ordering

**Prettier config:**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

### Git Conventions

- Commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `chore:`
- Example: `feat: add customer selector with search and quick-add`
- One logical change per commit
- Never commit `.env.local` (it's in `.gitignore`)
- Always commit `.env.example` with placeholder values

### README Standards

The README.md must include:
1. One-line description
2. Screenshot/GIF of the app
3. Features list
4. Quick start (clone, install, configure, run) in under 2 minutes
5. Environment variables reference
6. Tech stack
7. Project structure overview
8. Contributing guidelines
9. License

### Accessibility Baseline
- All interactive elements keyboard accessible
- Proper aria labels on icon-only buttons
- Focus rings visible (using accent ring from design system)
- Semantic HTML (nav, main, aside, header, etc.)
- Color contrast meets WCAG AA minimum
- All form inputs have associated labels

### Performance Rules
- Use Next.js Server Components by default, Client Components only when needed (interactivity, hooks, browser APIs)
- Lazy load heavy components (PDF preview, date pickers)
- Optimize images via next/image
- No layout shifts: always define dimensions for dynamic content areas
- Use `loading.tsx` files for route-level loading states (skeleton UI)

---

## 4. Module 1: Invoice Dashboard

### Overview
Main landing page after login. All invoices at a glance.

### Summary Cards (Top)
- Total Outstanding (pending + overdue sum)
- Total Paid (current month)
- Overdue Amount (count + sum, red accent)
- Upcoming (scheduled in next 7 days)

### Invoice List
- Columns: Invoice #, Customer, Amount, Status, Issue Date, Due Date, Actions
- Status auto-calculated: unpaid past due date = Overdue
- Filter: status chips, customer dropdown, date range, search
- Sort: any column
- Row hover actions: View, Edit (draft only), Send, Duplicate, Mark as Paid, PDF, Delete

### Empty State
- Clean illustration + "Create your first invoice" headline + CTA

### Flow
```
Dashboard loads -> See summary cards + invoice list
  -> Filter/search as needed
  -> Click "Create Invoice" -> Full-screen creator (Module 2)
  -> Click invoice row -> Invoice detail/preview
  -> Hover action "Send" -> Toast confirmation -> Email sent
  -> Hover action "Mark as Paid" -> Status update, paid_at recorded
```

---

## 5. Module 2: Invoice Creator (Full-Screen)

### Layout
```
+--------------------------------------------------------------+
|  <- Back to Invoices                      Save Draft | Send   |
+----------------------------+---------------------------------+
|                            |                                 |
|   LIVE PREVIEW (45%)       |   FORM (55%)                    |
|                            |                                 |
|   Real-time invoice        |   1. Select Customer            |
|   rendering that           |      Search / Add New           |
|   updates instantly        |                                 |
|   as you fill the form     |   2. Invoice Details            |
|                            |      Number, dates, type        |
|   Shows your logo,         |                                 |
|   branding, exact          |   3. Line Items                 |
|   PDF output               |      Description, Qty, Rate     |
|                            |      + Add Line Item            |
|                            |                                 |
|                            |   4. Tax & Discount             |
|                            |                                 |
|                            |   5. Notes & Terms              |
+----------------------------+---------------------------------+

Below 1024px: panels stack vertically (form first, preview below)
```

### Customer Selection Flow

**Existing customer:**
1. Type in search field, dropdown shows matches (name, company, email)
2. Select customer, Bill To section auto-fills
3. Customer's payment terms auto-set due date

**New customer (inline):**
1. Click "+ Add New Customer" in dropdown
2. Form: Name*, Email*, Phone, Company, Address, Tax ID
3. Save creates customer in DB AND selects for current invoice
4. Available for all future invoices

**Quick-add:**
1. Type name with no match
2. Dropdown shows: "Create '[typed name]' as new customer"
3. One-click create with just the name, fill details later

### Line Items
- Rows: Description, Quantity, Unit Price, Amount (auto-calculated)
- Add/remove dynamically, drag to reorder
- Min 1 item required

### Invoice Number
- Auto-generated: [prefix]-[padded number] e.g. INV-0001
- Editable per invoice with duplicate warning

### Live Preview
- Instant updates, pixel-perfect PDF representation
- Shows: logo, company, customer, meta, items, totals, payment, notes

---

## 6. Module 3: Settings

### Company Profile
- Name*, Email*, Phone, Address, Tax ID, Website

### Branding
- Logo upload (drag & drop, PNG/SVG/JPG)
- Brand color picker

### Invoice Defaults
- Prefix, next number, currency, tax rate, tax label
- Payment terms (Net 15 / 30 / 45 / 60 / Due on Receipt)
- Default notes and terms

### Payment Configuration

**Payment Link:**
- URL: paste any link (Stripe, Razorpay, PayPal.me, etc.)
- Label: button text (e.g., "Pay Now")
- Shows as clickable button on invoice

**Bank Transfer:**
- Bank Name, Account Holder, Account Number
- IFSC / SWIFT / Routing Code
- UPI ID (optional)
- Additional instructions (free text)
- Displayed as section on invoice

Both can coexist on same invoice. Per-invoice override possible.

---

## 7. Customer Management

### List Page
- Table: Name, Company, Email, Total Invoiced, Outstanding, Last Invoice
- Search, sort, "Add Customer" button
- Bulk CSV import

### Detail Page
- Editable info, invoice history, lifetime value, outstanding
- Quick: "Create Invoice" (pre-selects customer)
- Internal notes

### Fields
| Field | Required | On Invoice |
|-------|----------|-----------|
| Name | Yes | Yes |
| Email | Yes | Yes (for sending) |
| Phone | No | No |
| Company | No | Yes (Bill To) |
| Address | No | Yes |
| Tax ID | No | Yes |
| Currency | No | Overrides default |
| Payment Terms | No | Overrides default |
| Notes | No | Never (internal) |

---

## 8. Email & Public Invoice

### Send Invoice (via Resend)
When "Send Invoice" is clicked:
- Email to customer's email
- Subject: "Invoice [INV-0001] from [Company Name]"
- HTML email: summary, "View Invoice" button, PDF attached

### Public Invoice Page
- URL: `/invoice/[publicId]` (no auth required)
- Clean branded view of invoice
- Download PDF button
- Pay Now button (if payment link configured)
- Bank details (if configured)
- "Paid" badge if marked paid

---

## 9. API Design (Agent-Friendly)

Every UI action has a corresponding API endpoint.

### Endpoints
```
POST   /api/auth/token
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
DELETE /api/invoices/:id
POST   /api/invoices/:id/send
POST   /api/invoices/:id/paid
GET    /api/invoices/:id/pdf
POST   /api/invoices/:id/duplicate
GET    /api/settings
PUT    /api/settings
POST   /api/settings/logo
GET    /api/dashboard/summary
```

### Agent Example
```
Agent receives: "Invoice Acme Corp $5000 for website redesign, due in 30 days"

1. GET  /api/customers?search=Acme Corp
2. POST /api/invoices { customer_id, items, due_date }
3. POST /api/invoices/:id/send

Result: "INV-0042 for $5,000 sent to billing@acme.co, due Mar 27"
```

---

## 10. Phased Rollout

### Phase 1: MVP (4-6 weeks)
- Supabase auth (email signup/login)
- Organization setup (company details, logo, defaults)
- Customer CRUD
- Invoice creation with live preview (two-panel)
- One-time invoices
- Client-side PDF generation
- Payment link + bank details
- Dashboard with status tracking + summary cards
- Manual Mark as Paid
- Send invoice email (Resend)
- Public invoice page
- REST API
- Mobile responsive

### Phase 2: Polish (2-3 weeks)
- Recurring invoices
- Duplicate invoice
- CSV customer import
- 2-3 invoice templates
- Auto overdue detection
- Bulk actions
- Keyboard shortcuts + Cmd+K search

### Phase 3: Integrations
- Stripe auto-payment + webhooks
- Razorpay integration
- Payment reminders
- Multi-currency
- Advanced tax
- Client portal
- Webhooks/Zapier
- Dark mode

---

## 11. Pre-Development Setup Guide

### Accounts to Create (all free)

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub | github.com | Code repository |
| Supabase | supabase.com | Database + Auth + Storage |
| Vercel | vercel.com | Hosting + Deployment |
| Resend | resend.com | Email sending |

### Local Machine Setup

```bash
# 1. Install Node.js v18+ from https://nodejs.org/
# 2. Install pnpm
npm install -g pnpm

# 3. Install Git from https://git-scm.com/

# Verify:
node --version    # Should show v18+
pnpm --version    # Should show 8+
git --version     # Should show 2+
```

### Supabase Setup
1. Go to supabase.com, create New Project, name "invoiceflow"
2. Set a database password (save this somewhere safe)
3. Choose region closest to you (Mumbai for India)
4. Once created, go to Settings then API
5. Copy: Project URL, anon public key, and service_role key

### Supabase Storage Setup
1. In Supabase dashboard go to Storage
2. Create new bucket named "logos"
3. Set it as a Public bucket (logos need to be publicly accessible)

### Resend Setup
1. Go to resend.com and sign up
2. Go to API Keys, create a new key
3. Copy the key

### Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Project Bootstrap
```bash
pnpm create next-app invoiceflow --typescript --tailwind --app --src-dir=false
cd invoiceflow

# Core dependencies
pnpm add @supabase/supabase-js @supabase/ssr resend @react-pdf/renderer

# UI dependencies
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react

# Validation
pnpm add zod @hookform/resolvers react-hook-form

# Initialize Shadcn
pnpm dlx shadcn@latest init

# Install all Shadcn components needed for MVP (see PRD Section 3 for full list)
pnpm dlx shadcn@latest add button input label textarea select dialog dropdown-menu command popover calendar table badge card skeleton sonner separator avatar tooltip tabs form alert-dialog sheet switch

# Code quality (dev dependencies)
pnpm add -D prettier eslint-config-prettier

# Start dev server
pnpm dev
```

---

## 12. Claude Code Kickoff Prompt

Paste this when starting with Claude Code:

```
I'm building InvoiceFlow, an open-source invoicing app. The full PRD is in
PRD.md at the repo root. Read it COMPLETELY before writing any code. Every
design value, architecture decision, and code pattern is specified there.

CRITICAL REQUIREMENTS:
1. DESIGN SYSTEM FIRST: Before building any UI, create lib/design-tokens.ts
   as specified in PRD Section 3. Wire ALL tokens into tailwind.config.ts.
   Every color, spacing, radius, shadow, and font value in the entire app
   MUST come from this file. NEVER hardcode hex values, pixel values, or
   magic numbers in components. If I change accent color in design-tokens.ts,
   it must update everywhere instantly.

2. CODE QUALITY: This is open-source. Any developer must understand the
   codebase in 5 minutes. Follow PRD Section 3b exactly:
   - Strict TypeScript, zero 'any' types
   - All data types in lib/types.ts
   - Zod validation schemas for all forms AND APIs
   - Queries in lib/queries/, mutations in lib/actions/, hooks in lib/hooks/
   - Named exports, one component per file, kebab-case filenames
   - Shadcn for primitives, components/composed/ for app-specific components
   - ESLint + Prettier configured from the start

3. COMPONENT ARCHITECTURE: Build reusable composed components that wrap
   Shadcn primitives (StatusBadge, CurrencyDisplay, DateDisplay, DataTable,
   EmptyState, PageHeader, ConfirmDialog). These composed components enforce
   consistency. Pages should compose these, not rebuild patterns.

Stack: Next.js 14 App Router + Supabase (auth, db, storage) + Resend
(email) + Tailwind + Shadcn/ui

Design: Mercury/Brex-inspired fintech UI. See PRD Section 3 for exact
specs. Geist font (comes with Next.js). Phase 1 MVP features only.

Build order:
1. Design system: lib/design-tokens.ts + tailwind.config.ts integration
2. Code foundation: lib/types.ts, lib/utils.ts, lib/constants.ts
3. Supabase client utilities + auth middleware
4. Database schema
5. Shadcn setup + composed components (StatusBadge, CurrencyDisplay, etc.)
6. Layout shell (sidebar + topbar)
7. Invoice dashboard (Module 1)
8. Customer management
9. Invoice creator with live preview (Module 2)
10. Settings pages (Module 3)
11. Email sending + public invoice page
12. API endpoints

Start with steps 1-6 (foundation, design system, layout).
```

---

## 13. Competitive Landscape

| Product | Price | Open Source | Agent API | Self-Host |
|---------|-------|------------|-----------|-----------|
| FreshBooks | $17+/mo | No | Limited | No |
| Zoho Invoice | $0-29/mo | No | Yes | No |
| Invoice Ninja | $0-14/mo | Yes | Yes | Yes |
| **InvoiceFlow** | **$0** | **Yes** | **First-class** | **Yes** |

### Our Edge Over Invoice Ninja (Closest Competitor)
1. Modern stack (Next.js vs Laravel) attracts more contributors
2. Agent-first API designed for AI automation from day one
3. Simpler scope: invoicing only, not accounting software
4. Better DX: one-command deploy, great docs, Supabase dashboard for data

---

*This PRD is the complete blueprint. Read it top to bottom before writing any code. The design system (Section 3) is the single source of truth for all visual decisions. The code architecture (Section 3b) defines how every file is structured. No hardcoded values. No shortcuts. Build exactly to spec.*

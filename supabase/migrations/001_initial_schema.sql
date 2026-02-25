-- ─── InvoiceFlow Initial Schema ────────────────────────────────────────────
-- Migration: 001_initial_schema
-- Run this in your Supabase SQL editor or via CLI

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── organizations ──────────────────────────────────────────────────────────

create table public.organizations (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,

  -- Business info
  name                  text not null,
  email                 text not null,
  phone                 text,
  address_line1         text,
  address_line2         text,
  city                  text,
  state                 text,
  zip_code              text,
  country               text,
  tax_id                text,
  website               text,

  -- Branding
  logo_url              text,
  brand_color           text not null default '#0f172a',

  -- Invoice defaults
  invoice_prefix        text not null default 'INV',
  next_invoice_number   integer not null default 1,
  default_currency      text not null default 'USD',
  default_tax_rate      numeric(5, 2),
  default_tax_label     text not null default 'Tax',
  default_payment_terms integer,
  default_notes         text,
  default_terms         text,

  -- Payment configuration
  payment_link_url      text,
  payment_link_label    text not null default 'Pay Now',
  bank_name             text,
  bank_account_holder   text,
  bank_account_number   text,
  bank_routing_code     text,
  bank_swift_code       text,
  upi_id                text,
  payment_instructions  text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── customers ──────────────────────────────────────────────────────────────

create table public.customers (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references public.organizations(id) on delete cascade,

  name                text not null,
  email               text not null,
  phone               text,
  company_name        text,
  address_line1       text,
  address_line2       text,
  city                text,
  state               text,
  zip_code            text,
  country             text,
  tax_id              text,
  currency_preference text,
  payment_terms       integer,
  notes               text,  -- internal, never shown on invoice

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── invoices ───────────────────────────────────────────────────────────────

create type invoice_status as enum (
  'draft', 'pending', 'paid', 'overdue', 'scheduled', 'cancelled'
);

create type invoice_type as enum ('one-time', 'recurring');

create type recurring_frequency as enum ('weekly', 'monthly', 'quarterly', 'yearly');

create type discount_type as enum ('percentage', 'flat');

create table public.invoices (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations(id) on delete cascade,
  customer_id           uuid references public.customers(id) on delete set null,

  invoice_number        text not null,
  status                invoice_status not null default 'draft',
  type                  invoice_type not null default 'one-time',

  issue_date            date not null default current_date,
  due_date              date not null,

  -- Financials
  subtotal              numeric(12, 2) not null default 0,
  tax_rate              numeric(5, 2),
  tax_label             text not null default 'Tax',
  tax_amount            numeric(12, 2) not null default 0,
  total                 numeric(12, 2) not null default 0,
  discount_type         discount_type,
  discount_value        numeric(12, 2),
  discount_amount       numeric(12, 2) not null default 0,
  currency              text not null default 'USD',

  -- Content
  notes                 text,
  terms                 text,
  payment_link_url      text,

  -- Public access
  public_id             text not null unique default encode(gen_random_bytes(12), 'hex'),

  -- Timestamps
  sent_at               timestamptz,
  paid_at               timestamptz,

  -- Recurring fields
  recurring_frequency   recurring_frequency,
  recurring_start_date  date,
  recurring_end_date    date,
  recurring_next_send   date,
  recurring_auto_send   boolean not null default false,
  parent_invoice_id     uuid references public.invoices(id) on delete set null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- Invoice numbers must be unique within an org
  unique (organization_id, invoice_number)
);

-- ─── invoice_items ──────────────────────────────────────────────────────────

create table public.invoice_items (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references public.invoices(id) on delete cascade,

  description     text not null,
  quantity        numeric(12, 4) not null default 1,
  unit_price      numeric(12, 2) not null default 0,
  amount          numeric(12, 2) not null default 0,  -- quantity * unit_price
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index on public.customers (organization_id);
create index on public.invoices (organization_id);
create index on public.invoices (customer_id);
create index on public.invoices (status);
create index on public.invoices (due_date);
create index on public.invoices (public_id);
create index on public.invoice_items (invoice_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- organizations: users see only their own org
create policy "Users manage own organization"
  on public.organizations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- customers: users see customers that belong to their org
create policy "Users manage own customers"
  on public.customers
  for all
  using (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  )
  with check (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  );

-- invoices: same pattern
create policy "Users manage own invoices"
  on public.invoices
  for all
  using (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  )
  with check (
    organization_id in (
      select id from public.organizations where user_id = auth.uid()
    )
  );

-- invoice_items: accessible when parent invoice is accessible
create policy "Users manage own invoice items"
  on public.invoice_items
  for all
  using (
    invoice_id in (
      select i.id from public.invoices i
      join public.organizations o on o.id = i.organization_id
      where o.user_id = auth.uid()
    )
  )
  with check (
    invoice_id in (
      select i.id from public.invoices i
      join public.organizations o on o.id = i.organization_id
      where o.user_id = auth.uid()
    )
  );

-- Public read for invoice public page (no auth required)
create policy "Public can read invoices by public_id"
  on public.invoices
  for select
  using (public_id is not null);

create policy "Public can read invoice items via public invoice"
  on public.invoice_items
  for select
  using (
    invoice_id in (select id from public.invoices where public_id is not null)
  );

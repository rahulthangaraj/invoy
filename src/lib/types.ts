// ─── Enums / union types ──────────────────────────────────────────────────

export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'scheduled'
  | 'cancelled';

export type InvoiceType = 'one-time' | 'recurring';

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type DiscountType = 'percentage' | 'flat';

export type PaymentTerms = 0 | 15 | 30 | 45 | 60; // 0 = due on receipt

// ─── Database row types ───────────────────────────────────────────────────

export interface Organization {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  tax_id: string | null;
  website: string | null;
  logo_url: string | null;
  brand_color: string;
  invoice_prefix: string;
  next_invoice_number: number;
  default_currency: string;
  default_tax_rate: number | null;
  default_tax_label: string;
  default_payment_terms: number | null;
  default_notes: string | null;
  default_terms: string | null;
  payment_link_url: string | null;
  payment_link_label: string;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_routing_code: string | null;
  bank_swift_code: string | null;
  upi_id: string | null;
  payment_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  tax_id: string | null;
  currency_preference: string | null;
  payment_terms: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  customer_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  type: InvoiceType;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number | null;
  tax_label: string;
  tax_amount: number;
  total: number;
  discount_type: DiscountType | null;
  discount_value: number | null;
  discount_amount: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  payment_link_url: string | null;
  public_id: string;
  sent_at: string | null;
  paid_at: string | null;
  recurring_frequency: RecurringFrequency | null;
  recurring_start_date: string | null;
  recurring_end_date: string | null;
  recurring_next_send: string | null;
  recurring_auto_send: boolean;
  parent_invoice_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  customer?: Customer | null;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
  created_at: string;
}

// ─── Form data types ──────────────────────────────────────────────────────

export interface InvoiceItemFormData {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
}

export interface InvoiceFormData {
  customer_id: string | null;
  invoice_number: string;
  status?: InvoiceStatus;
  type: InvoiceType;
  issue_date: string;
  due_date: string;
  currency: string;
  tax_rate: number | null;
  tax_label: string;
  discount_type: DiscountType | null;
  discount_value: number | null;
  notes: string | null;
  terms: string | null;
  payment_link_url: string | null;
  items: InvoiceItemFormData[];
  // Recurring
  recurring_frequency: RecurringFrequency | null;
  recurring_start_date: string | null;
  recurring_end_date: string | null;
  recurring_auto_send: boolean;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  tax_id: string | null;
  currency_preference: string | null;
  payment_terms: number | null;
  notes: string | null;
}

export interface OrganizationFormData {
  name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  tax_id: string | null;
  website: string | null;
  brand_color: string;
  invoice_prefix: string;
  default_currency: string;
  default_tax_rate: number | null;
  default_tax_label: string;
  default_payment_terms: number | null;
  default_notes: string | null;
  default_terms: string | null;
  payment_link_url: string | null;
  payment_link_label: string;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  bank_routing_code: string | null;
  bank_swift_code: string | null;
  upi_id: string | null;
  payment_instructions: string | null;
}

// ─── API types ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  error: string | null;
}

// ─── Dashboard types ──────────────────────────────────────────────────────

export interface DashboardSummary {
  totalOutstanding: number;
  totalPaidThisMonth: number;
  overdueAmount: number;
  overdueCount: number;
  upcomingAmount: number;
  upcomingCount: number;
}

// ─── Filter types ─────────────────────────────────────────────────────────

export interface InvoiceFilters {
  status?: InvoiceStatus | 'all';
  customer_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'invoice_number' | 'issue_date' | 'due_date' | 'total' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CustomerFilters {
  search?: string;
  sort_by?: 'name' | 'company_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

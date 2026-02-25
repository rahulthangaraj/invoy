import type { InvoiceStatus, RecurringFrequency } from './types';

// ─── App ──────────────────────────────────────────────────────────────────

export const APP_NAME = 'Invoy';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ─── Invoice ─────────────────────────────────────────────────────────────

export const INVOICE_STATUSES: InvoiceStatus[] = [
  'draft',
  'pending',
  'paid',
  'overdue',
  'scheduled',
  'cancelled',
];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
};

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

// ─── Currencies ───────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol]),
);

// ─── Payment terms ────────────────────────────────────────────────────────

export const PAYMENT_TERMS_OPTIONS = [
  { value: 0, label: 'Due on Receipt' },
  { value: 15, label: 'Net 15' },
  { value: 30, label: 'Net 30' },
  { value: 45, label: 'Net 45' },
  { value: 60, label: 'Net 60' },
] as const;

// ─── Pagination ───────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 25;

// ─── Storage ──────────────────────────────────────────────────────────────

export const LOGO_BUCKET = 'logos';
export const LOGO_MAX_SIZE_MB = 2;
export const LOGO_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'] as const;

import { z } from 'zod';

export const companyProfileSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().nullable().optional(),
  address_line1: z.string().nullable().optional(),
  address_line2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  tax_id: z.string().nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal('')),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
});

export const invoiceDefaultsSchema = z.object({
  invoice_prefix: z.string().min(1, 'Prefix is required'),
  default_currency: z.string().min(1, 'Currency is required'),
  default_tax_rate: z.number().nullable().optional(),
  default_tax_label: z.string().min(1),
  default_payment_terms: z.number().nullable().optional(),
  default_notes: z.string().nullable().optional(),
  default_terms: z.string().nullable().optional(),
});

export const paymentConfigSchema = z.object({
  payment_link_url: z.string().url().nullable().optional().or(z.literal('')),
  payment_link_label: z.string(),
  bank_name: z.string().nullable().optional(),
  bank_account_holder: z.string().nullable().optional(),
  bank_account_number: z.string().nullable().optional(),
  bank_routing_code: z.string().nullable().optional(),
  bank_swift_code: z.string().nullable().optional(),
  upi_id: z.string().nullable().optional(),
  payment_instructions: z.string().nullable().optional(),
});

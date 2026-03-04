import { z } from 'zod';

const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  unit_price: z.number().min(0.01, 'Unit price must be greater than 0'),
  amount: z.number(),
  sort_order: z.number(),
});

export const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  type: z.enum(['one-time', 'recurring']),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.string().min(1, 'Currency is required'),
  tax_rate: z.number().nullable(),
  tax_label: z.string(),
  discount_type: z.enum(['percentage', 'flat']).nullable(),
  discount_value: z.number().nullable(),
  notes: z.string().nullable(),
  terms: z.string().nullable(),
  payment_link_url: z.string().url().nullable().or(z.literal('')),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  recurring_frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).nullable(),
  recurring_start_date: z.string().nullable(),
  recurring_end_date: z.string().nullable(),
  recurring_auto_send: z.boolean(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

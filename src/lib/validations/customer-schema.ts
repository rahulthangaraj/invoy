import { z } from 'zod';

const nullableString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => v ?? null);

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: nullableString,
  company_name: nullableString,
  address_line1: nullableString,
  address_line2: nullableString,
  city: nullableString,
  state: nullableString,
  zip_code: nullableString,
  country: nullableString,
  tax_id: nullableString,
  currency_preference: nullableString,
  payment_terms: z
    .number()
    .optional()
    .nullable()
    .transform((v) => v ?? null),
  notes: nullableString,
});

export type CustomerFormData = z.infer<typeof customerSchema>;

import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .refine(
    (email) => {
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      const domain = parts[1] ?? '';
      const domainParts = domain.split('.');
      if (domainParts.length < 2) return false;
      const tld = domainParts[domainParts.length - 1] ?? '';
      return tld.length >= 2;
    },
    { message: 'Please enter a valid email with a proper domain (e.g. user@company.com)' },
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { createOrganization } from '@/lib/actions/organization-actions';
import { CURRENCIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  email: z.string().email('Enter a valid email'),
  default_currency: z.string().min(1),
  default_tax_rate: z
    .string()
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : parseFloat(v))),
});

type FormInput = z.input<typeof onboardingSchema>;
type FormOutput = z.output<typeof onboardingSchema>;

interface OnboardingFormProps {
  userEmail: string;
}

export function OnboardingForm({ userEmail }: OnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      email: userEmail,
      default_currency: 'USD',
      default_tax_rate: '',
    },
  });

  async function onSubmit(data: FormOutput) {
    setIsSubmitting(true);
    try {
      const result = await createOrganization({
        name: data.name,
        email: data.email,
        default_currency: data.default_currency,
        default_tax_rate: data.default_tax_rate,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Business name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Business name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Acme Inc."
          {...register('name')}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Business email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Business email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="hello@acme.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Currency */}
      <div className="space-y-1.5">
        <Label>Default currency</Label>
        <Select
          value={watch('default_currency')}
          onValueChange={(v) => setValue('default_currency', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.code} — {c.symbol} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tax rate (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="tax_rate">
          Default tax rate{' '}
          <span className="text-text-tertiary font-normal">(optional)</span>
        </Label>
        <div className="relative">
          <Input
            id="tax_rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            {...register('default_tax_rate')}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary pointer-events-none">
            %
          </span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Setting up…' : 'Continue to dashboard'}
      </Button>
    </form>
  );
}

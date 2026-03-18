'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
  full_name: z.string().min(1, 'Full name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Enter a valid email'),
  default_currency: z.string().min(1),
});

type FormInput = z.input<typeof onboardingSchema>;
type FormOutput = z.output<typeof onboardingSchema>;

interface OnboardingFormProps {
  userEmail: string;
  userName?: string;
}

export function OnboardingForm({ userEmail, userName }: OnboardingFormProps) {
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
      full_name: userName ?? '',
      company_name: '',
      email: userEmail,
      default_currency: 'USD',
    },
  });

  async function onSubmit(data: FormOutput) {
    setIsSubmitting(true);
    try {
      const result = await createOrganization({
        name: data.company_name,
        email: data.email,
        default_currency: data.default_currency,
        default_tax_rate: null,
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
      {/* Full name */}
      <div className="space-y-1.5">
        <Label htmlFor="full_name">
          Full name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="full_name"
          placeholder="Jane Doe"
          {...register('full_name')}
          autoFocus
        />
        {errors.full_name && (
          <p className="text-xs text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      {/* Company name */}
      <div className="space-y-1.5">
        <Label htmlFor="company_name">
          Company name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="company_name"
          placeholder="Acme Inc."
          {...register('company_name')}
        />
        {errors.company_name && (
          <p className="text-xs text-destructive">{errors.company_name.message}</p>
        )}
      </div>

      {/* Company email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Company email <span className="text-destructive">*</span>
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
        <Label>Currency preference</Label>
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
        {isSubmitting ? 'Setting up...' : 'Continue to dashboard'}
      </Button>
    </form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { customerSchema, type CustomerFormData } from '@/lib/validations/customer-schema';
import { type z } from 'zod';

type CustomerFormInputs = z.input<typeof customerSchema>;
import { createCustomer, updateCustomer } from '@/lib/actions/customer-actions';
import type { Customer } from '@/lib/types';
import { CURRENCIES, PAYMENT_TERMS_OPTIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: (customer: Customer) => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInputs, unknown, CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company_name: customer.company_name,
          address_line1: customer.address_line1,
          address_line2: customer.address_line2,
          city: customer.city,
          state: customer.state,
          zip_code: customer.zip_code,
          country: customer.country,
          tax_id: customer.tax_id,
          currency_preference: customer.currency_preference,
          payment_terms: customer.payment_terms,
          notes: customer.notes,
        }
      : { name: '', email: '' },
  });

  async function onSubmit(data: CustomerFormData) {
    try {
      const result = isEdit
        ? await updateCustomer(customer.id, data)
        : await createCustomer(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? 'Customer updated' : 'Customer created');
      if (onSuccess && result.data) {
        onSuccess(result.data);
      } else {
        router.push('/customers');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Basic information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name *</Label>
            <Input id="name" {...register('name')} placeholder="Jane Doe" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company name</Label>
            <Input id="company_name" {...register('company_name')} placeholder="Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} placeholder="jane@acme.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} placeholder="+1 555 000 0000" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address_line1">Address line 1</Label>
            <Input id="address_line1" {...register('address_line1')} placeholder="123 Main St" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input id="address_line2" {...register('address_line2')} placeholder="Suite 100" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} placeholder="San Francisco" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state">State / Province</Label>
            <Input id="state" {...register('state')} placeholder="CA" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip_code">ZIP / Postal code</Label>
            <Input id="zip_code" {...register('zip_code')} placeholder="94105" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register('country')} placeholder="United States" />
          </div>
        </div>
      </div>

      {/* Billing preferences */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Billing preferences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tax_id">Tax ID / VAT</Label>
            <Input id="tax_id" {...register('tax_id')} placeholder="US123456789" />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select
              defaultValue={customer?.currency_preference ?? ''}
              onValueChange={(v) => setValue('currency_preference', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Use account default" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment terms</Label>
            <Select
              defaultValue={customer?.payment_terms?.toString() ?? ''}
              onValueChange={(v) => setValue('payment_terms', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Use account default" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Internal notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Internal notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Notes about this customer (never shown on invoices)"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create customer'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

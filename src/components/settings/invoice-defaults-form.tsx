'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { invoiceDefaultsSchema } from '@/lib/validations/organization-schema';
import { updateOrganization } from '@/lib/actions/organization-actions';
import { CURRENCIES, PAYMENT_TERMS_OPTIONS } from '@/lib/constants';
import type { Organization } from '@/lib/types';
import type { z } from 'zod';
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

type FormData = z.infer<typeof invoiceDefaultsSchema>;

export function InvoiceDefaultsForm({ organization }: { organization: Organization | null }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(invoiceDefaultsSchema),
    defaultValues: {
      invoice_prefix: organization?.invoice_prefix ?? 'INV',
      default_currency: organization?.default_currency ?? 'USD',
      default_tax_rate: organization?.default_tax_rate ?? undefined,
      default_tax_label: organization?.default_tax_label ?? 'Tax',
      default_payment_terms: organization?.default_payment_terms ?? undefined,
      default_notes: organization?.default_notes ?? '',
      default_terms: organization?.default_terms ?? '',
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await updateOrganization(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Invoice defaults saved');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Invoice numbering</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invoice_prefix">Invoice prefix</Label>
            <Input
              id="invoice_prefix"
              {...register('invoice_prefix')}
              placeholder="INV"
              className="font-mono"
            />
            {errors.invoice_prefix && (
              <p className="text-xs text-destructive">{errors.invoice_prefix.message}</p>
            )}
            <p className="text-xs text-text-tertiary">
              Current: {organization?.invoice_prefix ?? 'INV'}-
              {String(organization?.next_invoice_number ?? 1).padStart(4, '0')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Default currency</Label>
            <Select
              defaultValue={organization?.default_currency ?? 'USD'}
              onValueChange={(v) => setValue('default_currency', v)}
            >
              <SelectTrigger>
                <SelectValue />
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
            <Label>Default payment terms</Label>
            <Select
              defaultValue={organization?.default_payment_terms?.toString() ?? '30'}
              onValueChange={(v) => setValue('default_payment_terms', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-1.5">
            <Label htmlFor="default_tax_label">Tax label</Label>
            <Input
              id="default_tax_label"
              {...register('default_tax_label')}
              placeholder="Tax / VAT / GST"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="default_tax_rate">Default tax rate (%)</Label>
            <Input
              id="default_tax_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0"
              {...register('default_tax_rate', {
                valueAsNumber: true,
                setValueAs: (v: string) => (v === '' ? null : parseFloat(v)),
              })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Default content</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="default_notes">Default notes</Label>
            <Textarea
              id="default_notes"
              rows={3}
              placeholder="Thank you for your business!"
              {...register('default_notes')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="default_terms">Default terms & conditions</Label>
            <Textarea
              id="default_terms"
              rows={3}
              placeholder="Payment due within 30 days…"
              {...register('default_terms')}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}

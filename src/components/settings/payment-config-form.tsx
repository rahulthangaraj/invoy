'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { paymentConfigSchema } from '@/lib/validations/organization-schema';
import { updateOrganization } from '@/lib/actions/organization-actions';
import type { Organization } from '@/lib/types';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

type FormData = z.infer<typeof paymentConfigSchema>;

export function PaymentConfigForm({ organization }: { organization: Organization | null }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      payment_link_url: organization?.payment_link_url ?? '',
      payment_link_label: organization?.payment_link_label ?? 'Pay Now',
      bank_name: organization?.bank_name ?? '',
      bank_account_holder: organization?.bank_account_holder ?? '',
      bank_account_number: organization?.bank_account_number ?? '',
      bank_routing_code: organization?.bank_routing_code ?? '',
      bank_swift_code: organization?.bank_swift_code ?? '',
      upi_id: organization?.upi_id ?? '',
      payment_instructions: organization?.payment_instructions ?? '',
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await updateOrganization(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Payment configuration saved');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Payment link */}
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary mb-1">Payment link</h3>
        <p className="text-xs text-text-tertiary mb-3">
          Paste any payment URL — Stripe, Razorpay, PayPal.me, etc. Shown as a button on invoices.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="payment_link_url">Payment link URL</Label>
            <Input
              id="payment_link_url"
              type="url"
              placeholder="https://buy.stripe.com/…"
              {...register('payment_link_url')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment_link_label">Button label</Label>
            <Input
              id="payment_link_label"
              placeholder="Pay Now"
              {...register('payment_link_label')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Bank transfer */}
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary mb-1">Bank transfer details</h3>
        <p className="text-xs text-text-tertiary mb-3">
          Shown as a section on invoices. Leave blank to hide.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank_name">Bank name</Label>
            <Input id="bank_name" placeholder="Chase" {...register('bank_name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_account_holder">Account holder</Label>
            <Input
              id="bank_account_holder"
              placeholder="Acme Inc."
              {...register('bank_account_holder')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_account_number">Account number</Label>
            <Input
              id="bank_account_number"
              {...register('bank_account_number')}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_routing_code">Routing / IFSC / Sort code</Label>
            <Input
              id="bank_routing_code"
              {...register('bank_routing_code')}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank_swift_code">SWIFT / BIC</Label>
            <Input
              id="bank_swift_code"
              {...register('bank_swift_code')}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upi_id">UPI ID</Label>
            <Input id="upi_id" placeholder="yourname@bank" {...register('upi_id')} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="payment_instructions">Additional payment instructions</Label>
            <Textarea
              id="payment_instructions"
              rows={3}
              placeholder="Please use invoice number as payment reference…"
              {...register('payment_instructions')}
            />
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="sticky bottom-0 bg-background border-t border-border py-3 mt-6 flex items-center justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

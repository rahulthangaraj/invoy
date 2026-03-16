'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

import { invoiceSchema, type InvoiceFormValues } from '@/lib/validations/invoice-schema';
import { createInvoice, updateInvoice } from '@/lib/actions/invoice-actions';
import { CURRENCIES, PAYMENT_TERMS_OPTIONS } from '@/lib/constants';
import type { Organization, Customer, Invoice, InvoiceFormData } from '@/lib/types';

import { InvoicePreview } from './invoice-preview';
import { CustomerSelector } from './customer-selector';
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
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InvoiceCreatorProps {
  organization: Organization | null;
  customers: Customer[];
  nextInvoiceNumber: string;
  existingInvoice?: Invoice;
  preselectedCustomerId?: string;
}

export function InvoiceCreator({
  organization,
  customers,
  nextInvoiceNumber,
  existingInvoice,
  preselectedCustomerId,
}: InvoiceCreatorProps) {
  const router = useRouter();
  const isEdit = !!existingInvoice;
  const [saving, setSaving] = useState<'draft' | 'pending' | 'send' | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [sendEmailError, setSendEmailError] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultTerms = organization?.default_payment_terms ?? 30;
  const defaultDue = format(addDays(new Date(), defaultTerms), 'yyyy-MM-dd');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    preselectedCustomerId
      ? (customers.find((c) => c.id === preselectedCustomerId) ?? null)
      : existingInvoice?.customer ?? null,
  );

  // Keep customers list updated when a new customer is created inline
  const [allCustomers, setAllCustomers] = useState(customers);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: existingInvoice
      ? {
          customer_id: existingInvoice.customer_id ?? '',
          invoice_number: existingInvoice.invoice_number,
          type: existingInvoice.type,
          issue_date: existingInvoice.issue_date,
          due_date: existingInvoice.due_date,
          currency: existingInvoice.currency,
          tax_rate: existingInvoice.tax_rate,
          tax_label: existingInvoice.tax_label,
          discount_type: existingInvoice.discount_type,
          discount_value: existingInvoice.discount_value,
          notes: existingInvoice.notes,
          terms: existingInvoice.terms,
          payment_link_url: existingInvoice.payment_link_url,
          items: existingInvoice.items?.map((i, idx) => ({
            id: i.id,
            description: i.description,
            quantity: i.quantity,
            unit_price: i.unit_price,
            amount: i.amount,
            sort_order: idx,
          })) ?? [{ description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 }],
          recurring_frequency: existingInvoice.recurring_frequency,
          recurring_start_date: existingInvoice.recurring_start_date,
          recurring_end_date: existingInvoice.recurring_end_date,
          recurring_auto_send: existingInvoice.recurring_auto_send,
        }
      : {
          customer_id: preselectedCustomerId ?? '',
          invoice_number: nextInvoiceNumber,
          type: 'one-time',
          issue_date: today,
          due_date: defaultDue,
          currency: organization?.default_currency ?? 'USD',
          tax_rate: organization?.default_tax_rate ?? null,
          tax_label: organization?.default_tax_label ?? 'Tax',
          discount_type: null,
          discount_value: null,
          notes: organization?.default_notes ?? null,
          terms: organization?.default_terms ?? null,
          payment_link_url: null,
          items: [{ description: '', quantity: 1, unit_price: 0, amount: 0, sort_order: 0 }],
          recurring_frequency: null,
          recurring_start_date: null,
          recurring_end_date: null,
          recurring_auto_send: false,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedValues = useWatch({ control: form.control });

  // Auto-calculate amounts when qty/price change
  useEffect(() => {
    const items = form.getValues('items');
    items.forEach((item, idx) => {
      const computed = item.quantity * item.unit_price;
      if (Math.abs(computed - item.amount) > 0.001) {
        form.setValue(`items.${idx}.amount`, computed);
      }
    });
  }, [watchedValues.items, form]);

  // Warn on browser back / tab close if form is dirty
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (form.formState.isDirty && saving === null) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty, saving]);

  function handleClose(href = '/') {
    if (form.formState.isDirty && saving === null) {
      setPendingNavigation(href);
      setShowUnsavedDialog(true);
    } else {
      router.push(href);
    }
  }

  async function handleDiscardAndNavigate() {
    setShowUnsavedDialog(false);
    router.push(pendingNavigation ?? '/');
  }

  async function handleSaveAsDraftAndNavigate() {
    setShowUnsavedDialog(false);
    await handleSave('draft');
  }

  function scrollToFirstError() {
    // Small delay to let error elements render
    setTimeout(() => {
      const firstError = formRef.current?.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }

  async function handleSave(status: 'draft' | 'pending', sendAfter = false) {
    // Clear custom errors before re-validating
    setCustomerError(null);
    setSendEmailError(null);

    // For draft: skip ALL validation, save whatever exists
    if (status === 'draft') {
      const values = form.getValues();
      setSaving('draft');

      // Fill in defaults for missing fields
      const draftValues = {
        ...values,
        customer_id: values.customer_id || null,
        due_date: values.due_date || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        issue_date: values.issue_date || today,
        invoice_number: values.invoice_number || nextInvoiceNumber,
        currency: values.currency || organization?.default_currency || 'USD',
        items: values.items?.filter((i) => i.description || i.unit_price > 0) ?? [],
        status: 'draft' as const,
      };

      try {
        const result = isEdit
          ? await updateInvoice(existingInvoice.id, draftValues as Partial<InvoiceFormData>)
          : await createInvoice(draftValues as InvoiceFormData);

        if (result.error) {
          toast.error(result.error);
          setSaving(null);
          return;
        }

        toast.success('Invoice saved as draft');
        router.push('/');
        router.refresh();
      } catch {
        toast.error('Something went wrong. Please try again.');
        setSaving(null);
      }
      return;
    }

    // For "Create & Send" / "pending": run full validation
    const valid = await form.trigger();

    // Custom validation: customer must be selected
    const customerId = form.getValues('customer_id');
    let hasCustomError = false;
    if (!customerId) {
      setCustomerError('Please select a customer');
      hasCustomError = true;
    }

    // For "Create & Send", check customer email
    if (sendAfter && selectedCustomer && !selectedCustomer.email) {
      setSendEmailError(
        'Selected customer has no email address. Add an email in customer settings to send invoices.',
      );
      hasCustomError = true;
    }

    if (!valid || hasCustomError) {
      scrollToFirstError();
      return;
    }

    const values = form.getValues();
    setSaving(sendAfter ? 'send' : status);

    try {
      const result = isEdit
        ? await updateInvoice(existingInvoice.id, { ...values, status } as Partial<InvoiceFormData>)
        : await createInvoice({ ...values, status } as InvoiceFormData);

      if (result.error) {
        toast.error(result.error);
        setSaving(null);
        return;
      }

      // If sendAfter, also send the invoice email
      if (sendAfter && result.data) {
        try {
          const res = await fetch(`/api/invoices/${result.data.id}/send`, { method: 'POST' });
          const data = (await res.json()) as { error?: string };
          if (data.error) {
            toast.error(`Invoice created but failed to send: ${data.error}`);
          } else {
            toast.success('Invoice created and sent');
          }
        } catch {
          toast.error('Invoice created but failed to send');
        }
      } else {
        toast.success(isEdit ? 'Invoice updated' : 'Invoice created');
      }

      router.push('/');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
      setSaving(null);
    }
  }

  function handleNewCustomerCreated(customer: Customer) {
    setAllCustomers((prev) => [...prev, customer]);
    setSelectedCustomer(customer);
    form.setValue('customer_id', customer.id);
    setCustomerError(null);
    setSendEmailError(null);
  }

  function handleCustomerUpdated(customer: Customer) {
    setAllCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    setSelectedCustomer(customer);
  }

  const formValues = watchedValues as InvoiceFormValues;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar — title left, close right */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
        <h1 className="text-base font-semibold text-text-primary">
          {isEdit ? 'Edit Invoice' : 'New Invoice'}
        </h1>
        <button
          onClick={() => handleClose('/')}
          className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Split panel — form LEFT, preview RIGHT */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Form (left on lg+, first on mobile) */}
        <div className="flex-1 overflow-y-auto pb-20" ref={formRef}>
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">

            {/* 1. Customer */}
            <section>
              <h2 className="text-[15px] font-semibold text-text-primary mb-4">Customer</h2>
              <div data-error={!!customerError || !!form.formState.errors.customer_id || !!sendEmailError || undefined}>
                <CustomerSelector
                  customers={allCustomers}
                  value={form.watch('customer_id') || null}
                  onChange={(id, customer) => {
                    form.setValue('customer_id', id ?? '', { shouldValidate: true });
                    setSelectedCustomer(customer);
                    setCustomerError(null);
                    setSendEmailError(null);
                    if (customer?.payment_terms != null) {
                      const due = format(
                        addDays(new Date(), customer.payment_terms),
                        'yyyy-MM-dd',
                      );
                      form.setValue('due_date', due);
                    }
                  }}
                  onNewCustomerCreated={handleNewCustomerCreated}
                  onCustomerUpdated={handleCustomerUpdated}
                />
                {(customerError || form.formState.errors.customer_id) && (
                  <p className="text-xs text-destructive mt-1.5">
                    {customerError || form.formState.errors.customer_id?.message}
                  </p>
                )}
                {sendEmailError && (
                  <p className="text-xs text-destructive mt-1.5">{sendEmailError}</p>
                )}
              </div>
            </section>

            <Separator />

            {/* 2. Invoice details */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-text-primary">Invoice details</h2>
                <div className="flex items-center rounded-md border border-border bg-secondary p-0.5 gap-0.5">
                  {(['one-time', 'recurring'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => form.setValue('type', t)}
                      className={cn(
                        'px-3 h-7 rounded text-xs font-medium transition-colors capitalize',
                        form.watch('type') === t
                          ? 'bg-background text-text-primary shadow-sm'
                          : 'text-text-tertiary hover:text-text-secondary',
                      )}
                    >
                      {t === 'one-time' ? 'One-time' : 'Recurring'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="invoice_number">Invoice number</Label>
                  <Input
                    id="invoice_number"
                    {...form.register('invoice_number')}
                    className="font-mono"
                  />
                  {form.formState.errors.invoice_number && (
                    <p className="text-xs text-destructive" data-error="true">
                      {form.formState.errors.invoice_number.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select
                    value={form.watch('currency')}
                    onValueChange={(v) => form.setValue('currency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} — {c.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="issue_date">Issue date</Label>
                  <DatePicker
                    id="issue_date"
                    value={form.watch('issue_date')}
                    onChange={(v) => form.setValue('issue_date', v, { shouldValidate: true })}
                  />
                </div>
                <div className="space-y-1.5" data-error={!!form.formState.errors.due_date || undefined}>
                  <Label htmlFor="due_date">Due date</Label>
                  <DatePicker
                    id="due_date"
                    value={form.watch('due_date')}
                    onChange={(v) => form.setValue('due_date', v, { shouldValidate: true })}
                  />
                  {form.formState.errors.due_date && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.due_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Payment terms</Label>
                  <Select
                    onValueChange={(days) => {
                      const due = format(addDays(new Date(), parseInt(days)), 'yyyy-MM-dd');
                      form.setValue('due_date', due);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Set due date" />
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

              {/* Recurring options */}
              {form.watch('type') === 'recurring' && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                    Recurring schedule
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Frequency</Label>
                      <Select
                        value={form.watch('recurring_frequency') ?? ''}
                        onValueChange={(v) =>
                          form.setValue(
                            'recurring_frequency',
                            v as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div /> {/* spacer */}
                    <div className="space-y-1.5">
                      <Label>Start date</Label>
                      <DatePicker
                        value={form.watch('recurring_start_date')}
                        onChange={(v) => form.setValue('recurring_start_date', v)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        End date{' '}
                        <span className="text-text-tertiary font-normal">(optional)</span>
                      </Label>
                      <DatePicker
                        value={form.watch('recurring_end_date')}
                        onChange={(v) => form.setValue('recurring_end_date', v)}
                        placeholder="No end date"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary">Auto-send</p>
                      <p className="text-xs text-text-tertiary">
                        Automatically send invoices on schedule
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('recurring_auto_send')}
                      onCheckedChange={(v) => form.setValue('recurring_auto_send', v)}
                    />
                  </div>
                </div>
              )}
            </section>

            <Separator />

            {/* 3. Line items */}
            <section>
              <h2 className="text-[15px] font-semibold text-text-primary mb-4">Line items</h2>

              <div className="space-y-2">
                {/* Header row */}
                <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 80px 100px 80px 40px' }}>
                  <span className="text-xs font-medium text-text-tertiary">Description</span>
                  <span className="text-xs font-medium text-text-tertiary">Qty</span>
                  <span className="text-xs font-medium text-text-tertiary">Unit price</span>
                  <span className="text-xs font-medium text-text-tertiary text-right">Amount</span>
                  <span />
                </div>

                {fields.map((field, idx) => {
                  const qty = form.watch(`items.${idx}.quantity`) ?? 0;
                  const price = form.watch(`items.${idx}.unit_price`) ?? 0;
                  const amount = qty * price;
                  const itemErrors = form.formState.errors.items?.[idx];

                  return (
                    <div key={field.id}>
                      <div
                        className="grid gap-2 items-center"
                        style={{ gridTemplateColumns: '1fr 80px 100px 80px 40px' }}
                        data-error={!!itemErrors || undefined}
                      >
                        <Input
                          placeholder="Item description"
                          {...form.register(`items.${idx}.description`)}
                          className={cn('h-9 text-sm', itemErrors?.description && 'border-destructive')}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="1"
                          {...form.register(`items.${idx}.quantity`, { valueAsNumber: true })}
                          className="h-9 text-sm"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...form.register(`items.${idx}.unit_price`, { valueAsNumber: true })}
                          className={cn('h-9 text-sm', itemErrors?.unit_price && 'border-destructive')}
                        />
                        <span className="text-sm tabular-nums text-text-secondary text-right">
                          {new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 2,
                          }).format(amount)}
                        </span>
                        <div className="flex items-center justify-center">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="text-text-tertiary hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {itemErrors && (
                        <div className="mt-1 space-y-0.5">
                          {itemErrors.description && (
                            <p className="text-xs text-destructive">{itemErrors.description.message}</p>
                          )}
                          {itemErrors.unit_price && (
                            <p className="text-xs text-destructive">{itemErrors.unit_price.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {form.formState.errors.items?.message && (
                <p className="text-xs text-destructive mt-2" data-error="true">
                  {form.formState.errors.items.message}
                </p>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 text-text-secondary"
                onClick={() =>
                  append({
                    description: '',
                    quantity: 1,
                    unit_price: 0,
                    amount: 0,
                    sort_order: fields.length,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add line item
              </Button>
            </section>

            <Separator />

            {/* 4. Tax & discount */}
            <section>
              <h2 className="text-[15px] font-semibold text-text-primary mb-4">Tax & discount</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tax_label">Tax label</Label>
                  <Input
                    id="tax_label"
                    placeholder="Tax / VAT / GST"
                    {...form.register('tax_label')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tax_rate">Tax rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...form.register('tax_rate', { valueAsNumber: true, setValueAs: (v: string) => v === '' ? null : parseFloat(v) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Discount type</Label>
                  <Select
                    value={form.watch('discount_type') ?? ''}
                    onValueChange={(v) =>
                      form.setValue(
                        'discount_type',
                        (v as 'percentage' | 'flat') || null,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No discount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="flat">Flat amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.watch('discount_type') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="discount_value">
                      Discount value
                      {form.watch('discount_type') === 'percentage' ? ' (%)' : ''}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      {...form.register('discount_value', { valueAsNumber: true })}
                    />
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* 5. Notes & terms */}
            <section>
              <h2 className="text-[15px] font-semibold text-text-primary mb-4">Notes & terms</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Thank you for your business…"
                    rows={3}
                    {...form.register('notes')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="terms">Terms & conditions</Label>
                  <Textarea
                    id="terms"
                    placeholder="Payment due within 30 days of invoice date…"
                    rows={3}
                    {...form.register('terms')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payment_link_url">Custom payment link (optional)</Label>
                  <Input
                    id="payment_link_url"
                    type="url"
                    placeholder="https://pay.stripe.com/…"
                    {...form.register('payment_link_url')}
                  />
                  <p className="text-xs text-text-tertiary">
                    Overrides the payment link set in Settings for this invoice.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Preview (right on lg+, bottom on mobile) */}
        <div className="lg:w-5/12 border-t lg:border-t-0 lg:border-l border-border bg-[#f9fafb] overflow-y-auto p-6 pb-20">
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-4">
            Preview
          </p>
          <InvoicePreview
            formValues={formValues}
            organization={organization}
            customer={selectedCustomer}
            invoiceNumber={formValues.invoice_number ?? nextInvoiceNumber}
          />
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-end gap-2 h-16 px-6 border-t border-border bg-background">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSave('draft')}
          disabled={saving !== null}
        >
          {saving === 'draft' && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
          Save as Draft
        </Button>
        <Button
          size="sm"
          onClick={() => handleSave('pending', !isEdit)}
          disabled={saving !== null}
        >
          {(saving === 'pending' || saving === 'send') && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
          {isEdit ? 'Update Invoice' : 'Create & Send'}
        </Button>
      </div>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save as draft or discard your changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardAndNavigate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAsDraftAndNavigate}>
              Save as Draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

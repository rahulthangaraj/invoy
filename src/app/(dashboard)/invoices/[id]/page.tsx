import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Send, CheckCircle, Download } from 'lucide-react';
import { format } from 'date-fns';

import { getInvoiceById } from '@/lib/queries/invoice-queries';
import { getOrganization } from '@/lib/queries/organization-queries';
import { PageHeader } from '@/components/composed/page-header';
import { StatusBadge } from '@/components/composed/status-badge';
import { CurrencyDisplay } from '@/components/composed/currency-display';
import { Button } from '@/components/ui/button';
import { InvoiceActions } from '@/components/invoice/invoice-actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const [invoice, organization] = await Promise.all([
    getInvoiceById(id),
    getOrganization(),
  ]);

  if (!invoice) notFound();

  return (
    <div>
      <PageHeader
        title={invoice.invoice_number}
        description={invoice.customer?.company_name ?? invoice.customer?.name ?? 'No customer'}
        actions={
          <InvoiceActions invoice={invoice} />
        }
      />

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Meta */}
          <div className="bg-surface rounded-lg border border-border p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-text-tertiary mb-1">Status</p>
                <StatusBadge status={invoice.status} />
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Issue date</p>
                <p className="text-sm font-medium text-text-primary">
                  {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Due date</p>
                <p className="text-sm font-medium text-text-primary">
                  {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Currency</p>
                <p className="text-sm font-medium text-text-primary">{invoice.currency}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-[11px] font-medium uppercase tracking-wide text-text-tertiary px-5 py-3">
                    Description
                  </th>
                  <th className="text-right text-[11px] font-medium uppercase tracking-wide text-text-tertiary px-3 py-3 w-16">
                    Qty
                  </th>
                  <th className="text-right text-[11px] font-medium uppercase tracking-wide text-text-tertiary px-3 py-3 w-28">
                    Unit price
                  </th>
                  <th className="text-right text-[11px] font-medium uppercase tracking-wide text-text-tertiary px-5 py-3 w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-5 py-3 text-sm text-text-primary">{item.description}</td>
                    <td className="px-3 py-3 text-sm text-text-secondary text-right tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-sm text-text-secondary text-right tabular-nums">
                      <CurrencyDisplay amount={item.unit_price} currency={invoice.currency} />
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-text-primary text-right tabular-nums">
                      <CurrencyDisplay amount={item.amount} currency={invoice.currency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="px-5 py-3 border-t border-border bg-secondary/30">
              <div className="flex justify-end">
                <div className="w-56 space-y-1.5 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <CurrencyDisplay
                      amount={invoice.subtotal}
                      currency={invoice.currency}
                      className="tabular-nums"
                    />
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Discount</span>
                      <span className="tabular-nums text-status-paid-text">
                        -{' '}
                        <CurrencyDisplay
                          amount={invoice.discount_amount}
                          currency={invoice.currency}
                        />
                      </span>
                    </div>
                  )}
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>{invoice.tax_label}</span>
                      <CurrencyDisplay
                        amount={invoice.tax_amount}
                        currency={invoice.currency}
                        className="tabular-nums"
                      />
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-border">
                    <span>Total</span>
                    <CurrencyDisplay
                      amount={invoice.total}
                      currency={invoice.currency}
                      className="tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes / Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="bg-surface rounded-lg border border-border p-5 space-y-3">
              {invoice.notes && (
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">
                    Terms
                  </p>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Customer + Payment */}
        <div className="space-y-4">
          {/* Customer */}
          {invoice.customer && (
            <div className="bg-surface rounded-lg border border-border p-5">
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">
                Bill to
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {invoice.customer.company_name ?? invoice.customer.name}
              </p>
              {invoice.customer.company_name && (
                <p className="text-sm text-text-secondary">{invoice.customer.name}</p>
              )}
              <p className="text-sm text-text-secondary">{invoice.customer.email}</p>
              {invoice.customer.address_line1 && (
                <p className="text-sm text-text-secondary mt-1">
                  {invoice.customer.address_line1}
                </p>
              )}
            </div>
          )}

          {/* Amount due */}
          <div className="bg-surface rounded-lg border border-border p-5">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Amount due
            </p>
            <CurrencyDisplay
              amount={invoice.total}
              currency={invoice.currency}
              className="text-2xl font-bold text-text-primary"
            />
            {invoice.paid_at && (
              <p className="text-xs text-status-paid-text mt-1">
                Paid on {format(new Date(invoice.paid_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>

          {/* Public link */}
          <div className="bg-surface rounded-lg border border-border p-5">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
              Public link
            </p>
            <p className="text-xs text-text-secondary break-all">
              /invoice/{invoice.public_id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

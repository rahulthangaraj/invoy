import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { getInvoiceByPublicId } from '@/lib/queries/invoice-queries';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/composed/status-badge';
import { CurrencyDisplay } from '@/components/composed/currency-display';
import type { Organization } from '@/lib/types';
import { CURRENCY_SYMBOLS } from '@/lib/constants';

interface Props {
  params: Promise<{ publicId: string }>;
}

async function getOrganizationForInvoice(orgId: string): Promise<Organization | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();
  return data as Organization | null;
}

export default async function PublicInvoicePage({ params }: Props) {
  const { publicId } = await params;
  const invoice = await getInvoiceByPublicId(publicId);

  if (!invoice) notFound();

  const organization = await getOrganizationForInvoice(invoice.organization_id);
  const brandColor = organization?.brand_color ?? '#2563eb';
  const symbol = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency;
  const fmt = (n: number) =>
    `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Invoice document */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden shadow-md">
          {/* Header */}
          <div className="p-8 border-b border-[#f0f0f0]">
            <div className="flex items-start justify-between">
              <div>
                {organization?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={organization.logo_url}
                    alt={organization.name}
                    className="h-10 w-auto object-contain mb-4"
                  />
                ) : (
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold mb-4"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(organization?.name ?? 'I')[0]}
                  </div>
                )}
                <p className="font-semibold text-base text-[#0a0a0a]">
                  {organization?.name ?? 'Unknown'}
                </p>
                {organization?.email && (
                  <p className="text-sm text-[#525252]">{organization.email}</p>
                )}
                {organization?.address_line1 && (
                  <p className="text-sm text-[#525252]">{organization.address_line1}</p>
                )}
                {(organization?.city || organization?.country) && (
                  <p className="text-sm text-[#525252]">
                    {[organization?.city, organization?.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: brandColor }}
                >
                  INVOICE
                </p>
                <p className="font-mono text-sm font-medium text-[#0a0a0a] mt-1">
                  {invoice.invoice_number}
                </p>
                <div className="mt-2">
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Dates + Bill To */}
          <div className="px-8 py-6 grid grid-cols-2 sm:grid-cols-3 gap-6 border-b border-[#f0f0f0]">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] mb-1">
                Issue date
              </p>
              <p className="text-sm font-medium text-[#0a0a0a]">
                {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] mb-1">
                Due date
              </p>
              <p className="text-sm font-medium text-[#0a0a0a]">
                {format(new Date(invoice.due_date), 'MMM d, yyyy')}
              </p>
            </div>
            {invoice.customer && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] mb-1">
                  Bill to
                </p>
                <p className="text-sm font-semibold text-[#0a0a0a]">
                  {invoice.customer.company_name ?? invoice.customer.name}
                </p>
                {invoice.customer.company_name && (
                  <p className="text-sm text-[#525252]">{invoice.customer.name}</p>
                )}
                <p className="text-sm text-[#525252]">{invoice.customer.email}</p>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="px-8 py-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] pb-3">
                    Description
                  </th>
                  <th className="text-right text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] pb-3 w-14">
                    Qty
                  </th>
                  <th className="text-right text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] pb-3 w-24">
                    Rate
                  </th>
                  <th className="text-right text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] pb-3 w-24">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="border-b border-[#f0f0f0]">
                    <td className="py-3 pr-4 text-sm text-[#0a0a0a]">{item.description}</td>
                    <td className="py-3 text-right text-sm text-[#525252] tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-sm text-[#525252] tabular-nums">
                      {fmt(item.unit_price)}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-[#0a0a0a] tabular-nums">
                      {fmt(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-4">
              <div className="w-56 space-y-2">
                <div className="flex justify-between text-sm text-[#525252]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{fmt(invoice.subtotal)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-[#525252]">
                    <span>Discount</span>
                    <span className="tabular-nums text-green-600">
                      -{fmt(invoice.discount_amount)}
                    </span>
                  </div>
                )}
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between text-sm text-[#525252]">
                    <span>{invoice.tax_label}</span>
                    <span className="tabular-nums">{fmt(invoice.tax_amount)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-bold text-base pt-2 border-t border-[#e5e5e5]"
                  style={{ color: brandColor }}
                >
                  <span>Total</span>
                  <span className="tabular-nums">{fmt(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment buttons */}
          {(invoice.payment_link_url ?? organization?.payment_link_url) && (
            <div className="px-8 pb-6 flex justify-center">
              <a
                href={(invoice.payment_link_url ?? organization?.payment_link_url) as string}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                {organization?.payment_link_label ?? 'Pay Now'}
              </a>
            </div>
          )}

          {/* Bank details */}
          {organization?.bank_account_number && (
            <div className="mx-8 mb-6 border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]">
              <p className="text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] mb-3">
                Bank transfer
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {organization.bank_name && (
                  <div>
                    <p className="text-[#a3a3a3] text-xs">Bank</p>
                    <p className="font-medium text-[#0a0a0a]">{organization.bank_name}</p>
                  </div>
                )}
                {organization.bank_account_holder && (
                  <div>
                    <p className="text-[#a3a3a3] text-xs">Account holder</p>
                    <p className="font-medium text-[#0a0a0a]">
                      {organization.bank_account_holder}
                    </p>
                  </div>
                )}
                {organization.bank_account_number && (
                  <div>
                    <p className="text-[#a3a3a3] text-xs">Account number</p>
                    <p className="font-medium font-mono text-[#0a0a0a]">
                      {organization.bank_account_number}
                    </p>
                  </div>
                )}
                {organization.bank_routing_code && (
                  <div>
                    <p className="text-[#a3a3a3] text-xs">Routing / IFSC</p>
                    <p className="font-medium font-mono text-[#0a0a0a]">
                      {organization.bank_routing_code}
                    </p>
                  </div>
                )}
                {organization.upi_id && (
                  <div>
                    <p className="text-[#a3a3a3] text-xs">UPI ID</p>
                    <p className="font-medium text-[#0a0a0a]">{organization.upi_id}</p>
                  </div>
                )}
              </div>
              {organization.payment_instructions && (
                <p className="text-sm text-[#525252] mt-3 whitespace-pre-wrap border-t border-[#e5e5e5] pt-3">
                  {organization.payment_instructions}
                </p>
              )}
            </div>
          )}

          {/* Notes / Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="px-8 pb-6 space-y-3">
              {invoice.notes && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-[#525252] whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-medium text-[#a3a3a3] mb-1">
                    Terms
                  </p>
                  <p className="text-sm text-[#525252] whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 bg-[#f5f5f7] border-t border-[#e5e5e5] flex items-center justify-between">
            <p className="text-xs text-[#a3a3a3]">Sent via Invoy</p>
            {invoice.status === 'paid' && (
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                ✓ Paid
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

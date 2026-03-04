import { format } from 'date-fns';
import type { InvoiceFormValues } from '@/lib/validations/invoice-schema';
import type { Organization, Customer } from '@/lib/types';
import { CurrencyDisplay } from '@/components/composed/currency-display';
import { StatusBadge } from '@/components/composed/status-badge';
import { CURRENCY_SYMBOLS } from '@/lib/constants';

interface InvoicePreviewProps {
  formValues: InvoiceFormValues;
  organization: Organization | null;
  customer: Customer | null;
  invoiceNumber: string;
}

function calcTotals(
  items: InvoiceFormValues['items'],
  taxRate: number | null,
  discountType: InvoiceFormValues['discount_type'],
  discountValue: number | null,
) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  let discountAmount = 0;
  if (discountType && discountValue) {
    discountAmount =
      discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  }
  const taxable = subtotal - discountAmount;
  const taxAmount = taxRate ? taxable * (taxRate / 100) : 0;
  return { subtotal, discountAmount, taxAmount, total: taxable + taxAmount };
}

export function InvoicePreview({
  formValues,
  organization,
  customer,
  invoiceNumber,
}: InvoicePreviewProps) {
  const { subtotal, discountAmount, taxAmount, total } = calcTotals(
    formValues.items,
    formValues.tax_rate,
    formValues.discount_type,
    formValues.discount_value,
  );

  const currency = formValues.currency;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const fmt = (n: number) =>
    `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;

  const brandColor = organization?.brand_color ?? '#2563eb';

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-8 min-h-full text-[13px] font-sans text-[#111]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          {organization?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="h-10 w-auto object-contain mb-3"
            />
          ) : (
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-bold mb-3"
              style={{ backgroundColor: brandColor }}
            >
              {(organization?.name ?? 'I')[0]}
            </div>
          )}
          <p className="font-semibold text-base">{organization?.name ?? 'Your Business'}</p>
          {organization?.email && <p className="text-[#555] text-xs">{organization.email}</p>}
          {organization?.address_line1 && (
            <p className="text-[#555] text-xs">{organization.address_line1}</p>
          )}
          {(organization?.city || organization?.country) && (
            <p className="text-[#555] text-xs">
              {[organization?.city, organization?.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight" style={{ color: brandColor }}>
            INVOICE
          </p>
          <p className="font-mono text-sm font-medium mt-1">{invoiceNumber}</p>
          <div className="mt-2">
            <StatusBadge status="pending" />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1">
            Issue date
          </p>
          <p className="font-medium">
            {formValues.issue_date
              ? format(new Date(formValues.issue_date), 'MMM d, yyyy')
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1">
            Due date
          </p>
          <p className="font-medium">
            {formValues.due_date
              ? format(new Date(formValues.due_date), 'MMM d, yyyy')
              : '—'}
          </p>
        </div>
      </div>

      {/* Bill to */}
      {customer && (
        <div className="mb-8">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-2">
            Bill to
          </p>
          <p className="font-semibold">{customer.company_name ?? customer.name}</p>
          {customer.company_name && (
            <p className="text-[#555] text-xs">{customer.name}</p>
          )}
          {customer.email && <p className="text-[#555] text-xs">{customer.email}</p>}
          {customer.address_line1 && (
            <p className="text-[#555] text-xs">{customer.address_line1}</p>
          )}
          {customer.tax_id && (
            <p className="text-[#555] text-xs">Tax ID: {customer.tax_id}</p>
          )}
        </div>
      )}

      {/* Line items */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-[#e5e5e5]">
            <th className="text-left text-[10px] font-medium uppercase tracking-wider text-[#999] pb-2">
              Description
            </th>
            <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#999] pb-2 w-16">
              Qty
            </th>
            <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#999] pb-2 w-24">
              Rate
            </th>
            <th className="text-right text-[10px] font-medium uppercase tracking-wider text-[#999] pb-2 w-24">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {formValues.items.map((item, idx) => (
            <tr key={idx} className="border-b border-[#f0f0f0]">
              <td className="py-2.5 pr-4">
                <p className="font-medium">{item.description || 'Item description'}</p>
              </td>
              <td className="py-2.5 text-right tabular-nums text-[#555]">{item.quantity}</td>
              <td className="py-2.5 text-right tabular-nums text-[#555]">
                {fmt(item.unit_price)}
              </td>
              <td className="py-2.5 text-right tabular-nums font-medium">
                {fmt(item.quantity * item.unit_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-56 space-y-1.5">
          <div className="flex justify-between text-[#555]">
            <span>Subtotal</span>
            <span className="tabular-nums">{fmt(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-[#555]">
              <span>Discount</span>
              <span className="tabular-nums text-green-600">-{fmt(discountAmount)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-[#555]">
              <span>{formValues.tax_label || 'Tax'}</span>
              <span className="tabular-nums">{fmt(taxAmount)}</span>
            </div>
          )}
          <div
            className="flex justify-between font-bold text-base pt-2 border-t border-[#e5e5e5]"
            style={{ color: brandColor }}
          >
            <span>Total</span>
            <span className="tabular-nums">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment link */}
      {(formValues.payment_link_url || organization?.payment_link_url) && (
        <div className="flex justify-center mb-6">
          <div
            className="px-6 py-2.5 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: brandColor }}
          >
            {organization?.payment_link_label ?? 'Pay Now'}
          </div>
        </div>
      )}

      {/* Bank details */}
      {organization?.bank_account_number && (
        <div className="border border-[#e5e5e5] rounded-md p-4 mb-4 bg-[#fafafa]">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-2">
            Bank transfer
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {organization.bank_name && (
              <div>
                <p className="text-[#999]">Bank</p>
                <p className="font-medium">{organization.bank_name}</p>
              </div>
            )}
            {organization.bank_account_holder && (
              <div>
                <p className="text-[#999]">Account holder</p>
                <p className="font-medium">{organization.bank_account_holder}</p>
              </div>
            )}
            {organization.bank_account_number && (
              <div>
                <p className="text-[#999]">Account number</p>
                <p className="font-medium font-mono">{organization.bank_account_number}</p>
              </div>
            )}
            {organization.bank_routing_code && (
              <div>
                <p className="text-[#999]">Routing / IFSC</p>
                <p className="font-medium font-mono">{organization.bank_routing_code}</p>
              </div>
            )}
            {organization.upi_id && (
              <div>
                <p className="text-[#999]">UPI ID</p>
                <p className="font-medium">{organization.upi_id}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes & terms */}
      {formValues.notes && (
        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1">
            Notes
          </p>
          <p className="text-xs text-[#555] whitespace-pre-wrap">{formValues.notes}</p>
        </div>
      )}
      {formValues.terms && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#999] mb-1">
            Terms
          </p>
          <p className="text-xs text-[#555] whitespace-pre-wrap">{formValues.terms}</p>
        </div>
      )}
    </div>
  );
}

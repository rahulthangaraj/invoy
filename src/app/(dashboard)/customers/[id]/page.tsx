import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/queries/customer-queries';
import { getInvoices } from '@/lib/queries/invoice-queries';
import { InvoiceTable } from '@/components/invoice/invoice-table';
import { CustomerDetailActions } from '@/components/invoice/customer-detail-actions';

interface Props {
  params: Promise<{ id: string }>;
}

async function CustomerDetailContent({ id }: { id: string }) {
  const [customer, { data: invoices }] = await Promise.all([
    getCustomerById(id),
    getInvoices({ customer_id: id }),
  ]);

  if (!customer) notFound();

  return (
    <CustomerDetailActions customer={customer}>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact info */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Contact</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-text-tertiary">Email</dt>
                  <dd className="text-sm text-text-primary mt-0.5">{customer.email}</dd>
                </div>
                {customer.phone && (
                  <div>
                    <dt className="text-xs text-text-tertiary">Phone</dt>
                    <dd className="text-sm text-text-primary mt-0.5">{customer.phone}</dd>
                  </div>
                )}
                {customer.tax_id && (
                  <div>
                    <dt className="text-xs text-text-tertiary">Tax ID</dt>
                    <dd className="text-sm text-text-primary mt-0.5">{customer.tax_id}</dd>
                  </div>
                )}
                {customer.address_line1 && (
                  <div>
                    <dt className="text-xs text-text-tertiary">Address</dt>
                    <dd className="text-sm text-text-primary mt-0.5">
                      <p>{customer.address_line1}</p>
                      {customer.address_line2 && <p>{customer.address_line2}</p>}
                      {(customer.city || customer.state) && (
                        <p>
                          {[customer.city, customer.state].filter(Boolean).join(', ')}
                          {customer.zip_code && ` ${customer.zip_code}`}
                        </p>
                      )}
                      {customer.country && <p>{customer.country}</p>}
                    </dd>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <dt className="text-xs text-text-tertiary">Notes</dt>
                    <dd className="text-sm text-text-secondary mt-0.5">{customer.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Invoice history */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Invoice history</h3>
            {invoices.length === 0 ? (
              <div className="text-sm text-text-secondary py-8 text-center border border-border rounded-lg">
                No invoices for this customer yet.
              </div>
            ) : (
              <InvoiceTable invoices={invoices} currency="USD" />
            )}
          </div>
        </div>
      </div>
    </CustomerDetailActions>
  );
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={
      <div>
        <div className="flex items-center justify-between h-14 px-6 border-b border-border">
          <div className="space-y-1">
            <div className="skeleton-shimmer h-5 w-28" />
            <div className="skeleton-shimmer h-3 w-36" />
          </div>
          <div className="skeleton-shimmer h-8 w-8 rounded-md" />
        </div>
        <div className="px-6 py-5">
          <div className="skeleton-shimmer h-32 w-full rounded-lg" />
        </div>
      </div>
    }>
      <CustomerDetailContent id={id} />
    </Suspense>
  );
}

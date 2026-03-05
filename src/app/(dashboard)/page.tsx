import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { getDashboardSummary, getInvoices } from '@/lib/queries/invoice-queries';
import { getOrganization } from '@/lib/queries/organization-queries';
import { PageHeader } from '@/components/composed/page-header';
import { SummaryCard } from '@/components/composed/summary-card';
import { EmptyState } from '@/components/composed/empty-state';
import { Button } from '@/components/ui/button';
import { InvoiceTable } from '@/components/invoice/invoice-table';

async function SummaryCards() {
  const [summary, org] = await Promise.all([
    getDashboardSummary(),
    getOrganization(),
  ]);
  const currency = org?.default_currency ?? 'USD';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-5">
      <SummaryCard label="Outstanding" amount={summary.totalOutstanding} currency={currency} />
      <SummaryCard label="Paid this month" amount={summary.totalPaidThisMonth} currency={currency} accentColor="green" />
      <SummaryCard
        label="Overdue"
        amount={summary.overdueAmount}
        currency={currency}
        subtext={summary.overdueCount > 0 ? `${summary.overdueCount} invoice${summary.overdueCount > 1 ? 's' : ''}` : undefined}
        accentColor="red"
      />
      <SummaryCard
        label="Upcoming (7 days)"
        amount={summary.upcomingAmount}
        currency={currency}
        subtext={summary.upcomingCount > 0 ? `${summary.upcomingCount} invoice${summary.upcomingCount > 1 ? 's' : ''}` : undefined}
      />
    </div>
  );
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-lg border border-border p-5 space-y-3">
          <div className="skeleton-shimmer h-4 w-28" />
          <div className="skeleton-shimmer h-8 w-36" />
        </div>
      ))}
    </div>
  );
}

async function InvoiceList() {
  const [{ data: invoices }, org] = await Promise.all([
    getInvoices({ per_page: 50 }),
    getOrganization(),
  ]);
  const currency = org?.default_currency ?? 'USD';

  return (
    <div className="px-6">
      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create your first invoice and start getting paid."
          action={{ label: 'Create invoice', href: '/invoices/new' }}
        />
      ) : (
        <InvoiceTable invoices={invoices} currency={currency} organization={org} />
      )}
    </div>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="px-6">
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-secondary border-b border-border">
          {['w-20', 'w-32', 'w-24', 'w-20', 'w-16'].map((w, i) => (
            <div key={i} className={`skeleton-shimmer h-3.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3.5 border-b border-border last:border-0">
            <div className="skeleton-shimmer h-4 w-24" />
            <div className="skeleton-shimmer h-4 w-36" />
            <div className="skeleton-shimmer h-4 w-20" />
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
            <div className="skeleton-shimmer h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Invoices"
        actions={
          <Button asChild size="sm">
            <Link href="/invoices/new">
              <Plus className="w-4 h-4 mr-1.5" />
              New invoice
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<SummaryCardsSkeleton />}>
        <SummaryCards />
      </Suspense>

      <Suspense fallback={<InvoiceListSkeleton />}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}

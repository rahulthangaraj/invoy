import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { getDashboardSummary, getInvoices } from '@/lib/queries/invoice-queries';
import { getOrganization } from '@/lib/queries/organization-queries';
import { PageHeader } from '@/components/composed/page-header';
import { SummaryCard } from '@/components/composed/summary-card';
import { EmptyState } from '@/components/composed/empty-state';
import { Button } from '@/components/ui/button';
import { InvoiceTable } from '@/components/invoice/invoice-table';

export default async function DashboardPage() {
  const [summary, { data: invoices }, org] = await Promise.all([
    getDashboardSummary(),
    getInvoices({ per_page: 50 }),
    getOrganization(),
  ]);

  const currency = org?.default_currency ?? 'USD';

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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-5">
        <SummaryCard
          label="Outstanding"
          amount={summary.totalOutstanding}
          currency={currency}
        />
        <SummaryCard
          label="Paid this month"
          amount={summary.totalPaidThisMonth}
          currency={currency}
          accentColor="green"
        />
        <SummaryCard
          label="Overdue"
          amount={summary.overdueAmount}
          currency={currency}
          subtext={
            summary.overdueCount > 0
              ? `${summary.overdueCount} invoice${summary.overdueCount > 1 ? 's' : ''}`
              : undefined
          }
          accentColor="red"
        />
        <SummaryCard
          label="Upcoming (7 days)"
          amount={summary.upcomingAmount}
          currency={currency}
          subtext={
            summary.upcomingCount > 0
              ? `${summary.upcomingCount} invoice${summary.upcomingCount > 1 ? 's' : ''}`
              : undefined
          }
        />
      </div>

      {/* Invoice list */}
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
    </div>
  );
}

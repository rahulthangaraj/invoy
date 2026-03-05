import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { getCustomers } from '@/lib/queries/customer-queries';
import { PageHeader } from '@/components/composed/page-header';
import { EmptyState } from '@/components/composed/empty-state';
import { Button } from '@/components/ui/button';
import { CustomerTable } from '@/components/invoice/customer-table';

async function CustomerList() {
  const { data: customers } = await getCustomers();

  return (
    <div className="px-6 py-5">
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start creating invoices."
          action={{ label: 'Add customer', href: '/customers/new' }}
        />
      ) : (
        <CustomerTable customers={customers} />
      )}
    </div>
  );
}

function CustomerListSkeleton() {
  return (
    <div className="px-6 py-5">
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-secondary/50 border-b border-border">
          {['w-28', 'w-36', 'w-24', 'w-20'].map((w, i) => (
            <div key={i} className={`skeleton-shimmer h-3.5 ${w}`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-border last:border-0">
            <div className="skeleton-shimmer h-4 w-28" />
            <div className="skeleton-shimmer h-4 w-36" />
            <div className="skeleton-shimmer h-4 w-24" />
            <div className="skeleton-shimmer h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Customers"
        actions={
          <Button asChild size="sm">
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Add customer
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<CustomerListSkeleton />}>
        <CustomerList />
      </Suspense>
    </div>
  );
}

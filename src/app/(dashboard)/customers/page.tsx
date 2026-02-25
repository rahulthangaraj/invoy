import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { getCustomers } from '@/lib/queries/customer-queries';
import { PageHeader } from '@/components/composed/page-header';
import { EmptyState } from '@/components/composed/empty-state';
import { Button } from '@/components/ui/button';
import { CustomerTable } from '@/components/invoice/customer-table';

export default async function CustomersPage() {
  const { data: customers } = await getCustomers();

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your clients and their billing details."
        actions={
          <Button asChild size="sm">
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Add customer
            </Link>
          </Button>
        }
      />

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
    </div>
  );
}

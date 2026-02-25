import { notFound } from 'next/navigation';
import { getCustomerById } from '@/lib/queries/customer-queries';
import { PageHeader } from '@/components/composed/page-header';
import { CustomerForm } from '@/components/invoice/customer-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  return (
    <div>
      <PageHeader
        title="Edit customer"
        description={`Updating ${customer.company_name ?? customer.name}`}
      />
      <div className="px-6 py-6 max-w-2xl">
        <CustomerForm customer={customer} />
      </div>
    </div>
  );
}

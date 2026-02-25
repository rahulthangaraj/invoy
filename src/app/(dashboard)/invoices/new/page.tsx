import { redirect } from 'next/navigation';
import { getOrganization } from '@/lib/queries/organization-queries';
import { getCustomers } from '@/lib/queries/customer-queries';
import { getNextInvoiceNumber } from '@/lib/queries/invoice-queries';
import { InvoiceCreator } from '@/components/invoice/invoice-creator';

interface Props {
  searchParams: Promise<{ customer?: string }>;
}

export default async function NewInvoicePage({ searchParams }: Props) {
  const { customer: preselectedCustomerId } = await searchParams;
  const [organization, { data: customers }, nextInvoiceNumber] = await Promise.all([
    getOrganization(),
    getCustomers({ per_page: 500 }),
    getNextInvoiceNumber(),
  ]);

  if (!organization) {
    redirect('/settings');
  }

  return (
    <InvoiceCreator
      organization={organization}
      customers={customers}
      nextInvoiceNumber={nextInvoiceNumber}
      preselectedCustomerId={preselectedCustomerId}
    />
  );
}

import { notFound } from 'next/navigation';
import { getInvoiceById } from '@/lib/queries/invoice-queries';
import { getOrganization } from '@/lib/queries/organization-queries';
import { getCustomers } from '@/lib/queries/customer-queries';
import { getNextInvoiceNumber } from '@/lib/queries/invoice-queries';
import { InvoiceCreator } from '@/components/invoice/invoice-creator';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: Props) {
  const { id } = await params;
  const [invoice, organization, { data: customers }, nextInvoiceNumber] = await Promise.all([
    getInvoiceById(id),
    getOrganization(),
    getCustomers({ per_page: 500 }),
    getNextInvoiceNumber(),
  ]);

  if (!invoice) notFound();

  return (
    <InvoiceCreator
      organization={organization}
      customers={customers}
      nextInvoiceNumber={nextInvoiceNumber}
      existingInvoice={invoice}
    />
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { getCustomerById } from '@/lib/queries/customer-queries';
import { CustomerForm } from '@/components/invoice/customer-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar: title left, X right */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
        <h1 className="text-base font-semibold text-text-primary">Edit Customer</h1>
        <Link
          href={`/customers/${id}`}
          className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[560px] mx-auto px-6 py-6">
          <CustomerForm customer={customer} />
        </div>
      </div>
    </div>
  );
}

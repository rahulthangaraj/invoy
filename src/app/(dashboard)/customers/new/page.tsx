import { PageHeader } from '@/components/composed/page-header';
import { CustomerForm } from '@/components/invoice/customer-form';

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="New customer" description="Add a new client to your contact list." />
      <div className="px-6 py-6 max-w-2xl">
        <CustomerForm />
      </div>
    </div>
  );
}

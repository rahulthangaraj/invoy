import Link from 'next/link';
import { X } from 'lucide-react';
import { CustomerForm } from '@/components/invoice/customer-form';

export default function NewCustomerPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Top bar: title left, X right */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
        <h1 className="text-base font-semibold text-text-primary">New Customer</h1>
        <Link
          href="/customers"
          className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[560px] mx-auto px-6 py-6">
          <CustomerForm />
        </div>
      </div>
    </div>
  );
}

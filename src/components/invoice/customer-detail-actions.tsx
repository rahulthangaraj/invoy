'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Pencil, FileText, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Customer } from '@/lib/types';
import { deleteCustomer } from '@/lib/actions/customer-actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CustomerDetailActionsProps {
  customer: Customer;
  children: React.ReactNode;
}

export function CustomerDetailActions({ customer, children }: CustomerDetailActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCustomer(customer.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Customer deleted');
      router.push('/customers');
    }
    setShowDelete(false);
    setDeleting(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">
      {/* Top bar — name left, close right */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            {customer.company_name ?? customer.name}
          </h1>
          <p className="text-xs text-text-secondary">
            {customer.company_name ? customer.name : customer.email}
          </p>
        </div>
        <button
          onClick={() => router.push('/customers')}
          className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {children}

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between h-16 px-6 border-t border-border bg-background">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4 mr-1.5" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/customers/${customer.id}/edit`}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit Customer
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/invoices/new?customer=${customer.id}`}>
              <FileText className="w-4 h-4 mr-1.5" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customer.company_name ?? customer.name} and remove them from all records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

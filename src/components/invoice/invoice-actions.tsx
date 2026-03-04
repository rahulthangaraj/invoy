'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Send, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Invoice } from '@/lib/types';
import { markInvoicePaid, deleteInvoice } from '@/lib/actions/invoice-actions';
import { Button } from '@/components/ui/button';
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

interface InvoiceActionsProps {
  invoice: Invoice;
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [sendingAction, setSendingAction] = useState<string | null>(null);

  async function handleMarkPaid() {
    setSendingAction('paid');
    const result = await markInvoicePaid(invoice.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice marked as paid');
    }
    setSendingAction(null);
  }

  async function handleSend() {
    setSendingAction('send');
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = (await res.json()) as { error?: string };
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Invoice sent successfully');
      }
    } catch {
      toast.error('Failed to send invoice');
    }
    setSendingAction(null);
  }

  async function handleDelete() {
    setSendingAction('delete');
    const result = await deleteInvoice(invoice.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice deleted');
      router.push('/');
    }
    setShowDelete(false);
    setSendingAction(null);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {invoice.status === 'draft' && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit
            </Link>
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleSend} disabled={sendingAction !== null}>
          {sendingAction === 'send' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
          Send
        </Button>
        {invoice.status !== 'paid' && (
          <Button size="sm" variant="outline" onClick={handleMarkPaid} disabled={sendingAction !== null}>
            {sendingAction === 'paid' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
            Mark paid
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive border-destructive/30"
          onClick={() => setShowDelete(true)}
          disabled={sendingAction !== null}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {invoice.invoice_number} and all its line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {sendingAction === 'delete' && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

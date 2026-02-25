'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import type { Invoice } from '@/lib/types';
import { markInvoicePaid, deleteInvoice } from '@/lib/actions/invoice-actions';
import { StatusBadge } from '@/components/composed/status-badge';
import { CurrencyDisplay } from '@/components/composed/currency-display';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export interface InvoiceTableProps {
  invoices: Invoice[];
  currency: string;
}

export function InvoiceTable({ invoices, currency }: InvoiceTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleMarkPaid(id: string) {
    const result = await markInvoicePaid(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice marked as paid');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteInvoice(deleteId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice deleted');
    }
    setDeleteId(null);
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border-subtle">
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Invoice
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Customer
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Issue date
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Due date
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary text-right">
                Amount
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="h-[52px] border-border-subtle cursor-pointer hover:bg-secondary/50 transition-colors duration-100"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <TableCell className="font-mono text-xs font-medium text-text-primary">
                  {invoice.invoice_number}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {invoice.customer?.company_name ?? invoice.customer?.name ?? '—'}
                    </p>
                    {invoice.customer?.company_name && (
                      <p className="text-xs text-text-tertiary">{invoice.customer.name}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-sm text-text-secondary">
                  {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-sm text-text-secondary">
                  {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <CurrencyDisplay
                    amount={invoice.total}
                    currency={invoice.currency ?? currency}
                    className="text-sm font-semibold text-text-primary"
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-text-tertiary hover:text-text-primary"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/invoices/${invoice.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      {invoice.status === 'draft' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                      {invoice.status !== 'paid' && (
                        <DropdownMenuItem onClick={() => handleMarkPaid(invoice.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(invoice.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invoice and all its line items. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

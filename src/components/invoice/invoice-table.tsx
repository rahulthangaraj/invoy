'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, Send, Download } from 'lucide-react';
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
  organization?: import('@/lib/types').Organization | null;
}

export function InvoiceTable({ invoices, currency, organization }: InvoiceTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleDownloadPdf(invoice: Invoice) {
    const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    const { format: formatDate } = await import('date-fns');
    const { CURRENCY_SYMBOLS } = await import('@/lib/constants');

    const sym = CURRENCY_SYMBOLS[invoice.currency ?? currency] ?? invoice.currency ?? currency;
    const fmt = (n: number) =>
      `${sym}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;

    const s = StyleSheet.create({
      page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#111' },
      header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
      companyName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
      companyDetail: { fontSize: 9, color: '#555' },
      invoiceTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
      invoiceNumber: { fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginTop: 4 },
      metaRow: { flexDirection: 'row', marginBottom: 20 },
      metaCol: { flex: 1 },
      metaLabel: { fontSize: 8, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
      metaValue: { fontSize: 10, fontWeight: 'bold' },
      billTo: { marginBottom: 20 },
      billToName: { fontSize: 11, fontWeight: 'bold' },
      billToDetail: { fontSize: 9, color: '#555' },
      tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e5e5', paddingBottom: 6, marginBottom: 4 },
      tableHeaderCell: { fontSize: 8, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
      tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', paddingVertical: 6 },
      descCol: { flex: 1 },
      qtyCol: { width: 50, textAlign: 'right' },
      rateCol: { width: 80, textAlign: 'right' },
      amountCol: { width: 80, textAlign: 'right' },
      totalsSection: { marginTop: 10, alignItems: 'flex-end' },
      totalsRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 4 },
      totalLabel: { fontSize: 10, color: '#555' },
      totalValue: { fontSize: 10 },
      totalFinalRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e5e5e5', marginTop: 4 },
      totalFinalLabel: { fontSize: 12, fontWeight: 'bold' },
      totalFinalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
      notesSection: { marginTop: 30 },
      notesLabel: { fontSize: 8, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
      notesText: { fontSize: 9, color: '#555' },
    });

    const doc = (
      <Document>
        <Page size="A4" style={s.page}>
          <View style={s.header}>
            <View>
              <Text style={s.companyName}>{organization?.name ?? 'Your Business'}</Text>
              {organization?.email && <Text style={s.companyDetail}>{organization.email}</Text>}
            </View>
            <View>
              <Text style={s.invoiceTitle}>INVOICE</Text>
              <Text style={s.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>
          </View>
          <View style={s.metaRow}>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Issue date</Text>
              <Text style={s.metaValue}>{formatDate(new Date(invoice.issue_date), 'MMM d, yyyy')}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.metaLabel}>Due date</Text>
              <Text style={s.metaValue}>{formatDate(new Date(invoice.due_date), 'MMM d, yyyy')}</Text>
            </View>
          </View>
          {invoice.customer && (
            <View style={s.billTo}>
              <Text style={s.metaLabel}>Bill to</Text>
              <Text style={s.billToName}>{invoice.customer.company_name ?? invoice.customer.name}</Text>
              {invoice.customer.email && <Text style={s.billToDetail}>{invoice.customer.email}</Text>}
            </View>
          )}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, s.descCol]}>Description</Text>
            <Text style={[s.tableHeaderCell, s.qtyCol]}>Qty</Text>
            <Text style={[s.tableHeaderCell, s.rateCol]}>Rate</Text>
            <Text style={[s.tableHeaderCell, s.amountCol]}>Amount</Text>
          </View>
          {invoice.items?.map((item) => (
            <View key={item.id} style={s.tableRow}>
              <Text style={s.descCol}>{item.description}</Text>
              <Text style={s.qtyCol}>{item.quantity}</Text>
              <Text style={s.rateCol}>{fmt(item.unit_price)}</Text>
              <Text style={[s.amountCol, { fontFamily: 'Helvetica-Bold' }]}>{fmt(item.amount)}</Text>
            </View>
          ))}
          <View style={s.totalsSection}>
            <View style={s.totalsRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {invoice.discount_amount > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalLabel}>Discount</Text>
                <Text style={s.totalValue}>-{fmt(invoice.discount_amount)}</Text>
              </View>
            )}
            {invoice.tax_amount > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalLabel}>{invoice.tax_label}</Text>
                <Text style={s.totalValue}>{fmt(invoice.tax_amount)}</Text>
              </View>
            )}
            <View style={s.totalFinalRow}>
              <Text style={s.totalFinalLabel}>Total</Text>
              <Text style={s.totalFinalValue}>{fmt(invoice.total)}</Text>
            </View>
          </View>
          {invoice.notes && (
            <View style={s.notesSection}>
              <Text style={s.notesLabel}>Notes</Text>
              <Text style={s.notesText}>{invoice.notes}</Text>
            </View>
          )}
        </Page>
      </Document>
    );

    try {
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    }
  }

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
      <div className="rounded-lg border border-border overflow-hidden bg-white">
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
                className="h-[52px] border-border-subtle cursor-pointer hover:bg-[#f9fafb] transition-colors duration-100"
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
                    {invoice.customer?.company_name && invoice.customer?.name && (
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
                      <DropdownMenuItem asChild>
                        <Link href={`/invoices/${invoice.id}/edit`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadPdf(invoice)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
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

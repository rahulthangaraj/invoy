'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Send, Download, Pencil, MoreHorizontal, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Invoice, Organization } from '@/lib/types';
import { markInvoicePaid, deleteInvoice } from '@/lib/actions/invoice-actions';
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

interface InvoiceDetailActionsProps {
  invoice: Invoice;
  organization: Organization | null;
  children: React.ReactNode;
}

export function InvoiceDetailActions({ invoice, organization, children }: InvoiceDetailActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  async function handleSend() {
    setActionInProgress('send');
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = (await res.json()) as { error?: string };
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(invoice.status === 'pending' ? 'Invoice resent' : 'Invoice sent');
      }
    } catch {
      toast.error('Failed to send invoice');
    }
    setActionInProgress(null);
  }

  async function handleMarkPaid() {
    setActionInProgress('paid');
    const result = await markInvoicePaid(invoice.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice marked as paid');
    }
    setActionInProgress(null);
  }

  async function handleDelete() {
    setActionInProgress('delete');
    const result = await deleteInvoice(invoice.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Invoice deleted');
      router.push('/');
    }
    setShowDelete(false);
    setActionInProgress(null);
  }

  async function handleDownloadPdf() {
    setActionInProgress('pdf');
    try {
      const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
      const { format } = await import('date-fns');
      const { CURRENCY_SYMBOLS } = await import('@/lib/constants');

      const sym = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency;
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
                <Text style={s.metaValue}>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</Text>
              </View>
              <View style={s.metaCol}>
                <Text style={s.metaLabel}>Due date</Text>
                <Text style={s.metaValue}>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</Text>
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
    setActionInProgress(null);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">
      {/* Top bar — title left, close right */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
        <div>
          <h1 className="text-base font-semibold text-text-primary">{invoice.invoice_number}</h1>
          <p className="text-xs text-text-secondary">
            {invoice.customer?.company_name ?? invoice.customer?.name ?? 'No customer'}
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
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
          {/* More menu with delete + mark paid */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4 mr-1.5" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {invoice.status === 'draft' && (
                <DropdownMenuItem asChild>
                  <Link href={`/invoices/${invoice.id}/edit`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              {invoice.status !== 'paid' && (
                <DropdownMenuItem onClick={handleMarkPaid} disabled={actionInProgress !== null}>
                  {actionInProgress === 'paid' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Mark as paid
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
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
          {/* Download PDF — always visible */}
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={actionInProgress !== null}>
            {actionInProgress === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Download className="w-4 h-4 mr-1.5" />
            )}
            Download PDF
          </Button>

          {/* Send/Resend — based on status */}
          {invoice.status === 'draft' && (
            <Button size="sm" onClick={handleSend} disabled={actionInProgress !== null}>
              {actionInProgress === 'send' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              Send Invoice
            </Button>
          )}
          {invoice.status === 'pending' && (
            <Button size="sm" onClick={handleSend} disabled={actionInProgress !== null}>
              {actionInProgress === 'send' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              Resend
            </Button>
          )}
          {/* paid status: no send button, just download PDF */}
        </div>
      </div>

      {/* Delete confirmation dialog */}
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
              {actionInProgress === 'delete' && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

import type { Invoice, Organization } from '@/lib/types';
import { CURRENCY_SYMBOLS } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface InvoicePdfButtonProps {
  invoice: Invoice;
  organization: Organization | null;
}

const styles = StyleSheet.create({
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
  totalValue: { fontSize: 10, fontFamily: 'Helvetica' },
  totalFinalRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e5e5e5', marginTop: 4 },
  totalFinalLabel: { fontSize: 12, fontWeight: 'bold' },
  totalFinalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  notesSection: { marginTop: 30 },
  notesLabel: { fontSize: 8, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  notesText: { fontSize: 9, color: '#555' },
});

function InvoicePdfDocument({ invoice, organization }: { invoice: Invoice; organization: Organization | null }) {
  const currency = invoice.currency;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const fmt = (n: number) =>
    `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{organization?.name ?? 'Your Business'}</Text>
            {organization?.email && <Text style={styles.companyDetail}>{organization.email}</Text>}
            {organization?.address_line1 && <Text style={styles.companyDetail}>{organization.address_line1}</Text>}
            {(organization?.city || organization?.country) && (
              <Text style={styles.companyDetail}>
                {[organization?.city, organization?.country].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Issue date</Text>
            <Text style={styles.metaValue}>{format(new Date(invoice.issue_date), 'MMM d, yyyy')}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Due date</Text>
            <Text style={styles.metaValue}>{format(new Date(invoice.due_date), 'MMM d, yyyy')}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Text>
          </View>
        </View>

        {/* Bill to */}
        {invoice.customer && (
          <View style={styles.billTo}>
            <Text style={styles.metaLabel}>Bill to</Text>
            <Text style={styles.billToName}>{invoice.customer.company_name ?? invoice.customer.name}</Text>
            {invoice.customer.company_name && <Text style={styles.billToDetail}>{invoice.customer.name}</Text>}
            {invoice.customer.email && <Text style={styles.billToDetail}>{invoice.customer.email}</Text>}
            {invoice.customer.address_line1 && <Text style={styles.billToDetail}>{invoice.customer.address_line1}</Text>}
          </View>
        )}

        {/* Line items table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.descCol]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.qtyCol]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.rateCol]}>Rate</Text>
          <Text style={[styles.tableHeaderCell, styles.amountCol]}>Amount</Text>
        </View>
        {invoice.items?.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.descCol}>{item.description}</Text>
            <Text style={styles.qtyCol}>{item.quantity}</Text>
            <Text style={styles.rateCol}>{fmt(item.unit_price)}</Text>
            <Text style={[styles.amountCol, { fontFamily: 'Helvetica-Bold' }]}>{fmt(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{fmt(invoice.subtotal)}</Text>
          </View>
          {invoice.discount_amount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>-{fmt(invoice.discount_amount)}</Text>
            </View>
          )}
          {invoice.tax_amount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>{invoice.tax_label}</Text>
              <Text style={styles.totalValue}>{fmt(invoice.tax_amount)}</Text>
            </View>
          )}
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>Total</Text>
            <Text style={styles.totalFinalValue}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* Notes & terms */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
        {invoice.terms && (
          <View style={[styles.notesSection, { marginTop: 15 }]}>
            <Text style={styles.notesLabel}>Terms</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export function InvoicePdfButton({ invoice, organization }: InvoicePdfButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvoicePdfDocument invoice={invoice} organization={organization} />
      ).toBlob();
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
    }
    setGenerating(false);
  }

  return (
    <Button size="sm" variant="outline" onClick={handleDownload} disabled={generating}>
      {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Download className="w-4 h-4 mr-1.5" />}
      Download PDF
    </Button>
  );
}

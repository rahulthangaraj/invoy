'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationId } from '@/lib/queries/invoice-queries';
import type { InvoiceFormData, ApiResponse, Invoice } from '@/lib/types';

export async function createInvoice(
  formData: InvoiceFormData,
): Promise<ApiResponse<Invoice>> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();
  if (!orgId) return { data: null, error: 'No organization found' };

  const { items, ...rest } = formData;
  // Normalize empty string to null so DB doesn't store ''
  const invoiceData = { ...rest, payment_link_url: rest.payment_link_url || null };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  let discount_amount = 0;
  if (invoiceData.discount_type && invoiceData.discount_value) {
    discount_amount =
      invoiceData.discount_type === 'percentage'
        ? subtotal * (invoiceData.discount_value / 100)
        : invoiceData.discount_value;
  }
  const taxable = subtotal - discount_amount;
  const tax_amount = invoiceData.tax_rate ? taxable * (invoiceData.tax_rate / 100) : 0;
  const total = taxable + tax_amount;

  // Insert invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      organization_id: orgId,
      subtotal,
      discount_amount,
      tax_amount,
      total,
    })
    .select()
    .single();

  if (invoiceError || !invoice) {
    return { data: null, error: invoiceError?.message ?? 'Failed to create invoice' };
  }

  // Insert line items
  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(
      items.map((item, idx) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
        sort_order: idx,
      })),
    );

    if (itemsError) {
      return { data: null, error: itemsError.message };
    }
  }

  // Increment org invoice counter
  await supabase.rpc('increment_invoice_number', { org_id: orgId });

  revalidatePath('/');
  revalidatePath('/invoices');
  return { data: invoice as Invoice, error: null };
}

export async function updateInvoice(
  id: string,
  formData: Partial<InvoiceFormData>,
): Promise<ApiResponse<Invoice>> {
  const supabase = await createClient();
  const { items, ...invoiceData } = formData;
  // Normalize empty string to null so DB doesn't store ''
  if (invoiceData.payment_link_url === '') {
    invoiceData.payment_link_url = null;
  }

  // Recalculate totals if items provided
  if (items) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    let discount_amount = 0;
    if (invoiceData.discount_type && invoiceData.discount_value) {
      discount_amount =
        invoiceData.discount_type === 'percentage'
          ? subtotal * (invoiceData.discount_value / 100)
          : invoiceData.discount_value;
    }
    const taxable = subtotal - discount_amount;
    const tax_amount = invoiceData.tax_rate ? taxable * (invoiceData.tax_rate / 100) : 0;
    const total = taxable + tax_amount;

    Object.assign(invoiceData, { subtotal, discount_amount, tax_amount, total });

    // Replace line items
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    if (items.length > 0) {
      await supabase.from('invoice_items').insert(
        items.map((item, idx) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
          sort_order: idx,
        })),
      );
    }
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/');
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return { data: data as Invoice, error: null };
}

export async function deleteInvoice(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) return { data: null, error: error.message };

  revalidatePath('/');
  revalidatePath('/invoices');
  return { data: null, error: null };
}

export async function markInvoicePaid(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { data: null, error: error.message };

  revalidatePath('/');
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return { data: null, error: null };
}

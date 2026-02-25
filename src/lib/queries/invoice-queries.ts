import { createClient } from '@/lib/supabase/server';
import type { Invoice, InvoiceFilters, DashboardSummary, PaginatedResponse } from '@/lib/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export async function getOrganizationId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return data?.id ?? null;
}

export async function getInvoices(
  filters: InvoiceFilters = {},
): Promise<PaginatedResponse<Invoice>> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();

  if (!orgId) return { data: [], count: 0, error: 'No organization found' };

  const {
    status,
    customer_id,
    search,
    sort_by = 'issue_date',
    sort_order = 'desc',
    page = 1,
    per_page = DEFAULT_PAGE_SIZE,
  } = filters;

  let query = supabase
    .from('invoices')
    .select('*, customer:customers(id, name, email, company_name)', { count: 'exact' })
    .eq('organization_id', orgId);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (customer_id) {
    query = query.eq('customer_id', customer_id);
  }
  if (search) {
    // PostgREST can't filter on joined table columns in .or() — resolve matching
    // customer IDs first, then filter invoices by invoice_number OR customer_id.
    const { data: matchingCustomers } = await supabase
      .from('customers')
      .select('id')
      .eq('organization_id', orgId)
      .or(`name.ilike.%${search}%,company_name.ilike.%${search}%`);

    const customerIds = (matchingCustomers ?? []).map((c) => c.id);

    if (customerIds.length > 0) {
      query = query.or(
        `invoice_number.ilike.%${search}%,customer_id.in.(${customerIds.join(',')})`,
      );
    } else {
      query = query.ilike('invoice_number', `%${search}%`);
    }
  }

  query = query
    .order(sort_by, { ascending: sort_order === 'asc' })
    .range((page - 1) * per_page, page * per_page - 1);

  const { data, count, error } = await query;

  if (error) return { data: [], count: 0, error: error.message };
  return { data: (data as Invoice[]) ?? [], count: count ?? 0, error: null };
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoices')
    .select('*, customer:customers(*), items:invoice_items(*)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'invoice_items', ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as Invoice;
}

export async function getInvoiceByPublicId(publicId: string): Promise<Invoice | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoices')
    .select('*, customer:customers(*), items:invoice_items(*)')
    .eq('public_id', publicId)
    .order('sort_order', { referencedTable: 'invoice_items', ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as Invoice;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();

  if (!orgId) {
    return {
      totalOutstanding: 0,
      totalPaidThisMonth: 0,
      overdueAmount: 0,
      overdueCount: 0,
      upcomingAmount: 0,
      upcomingCount: 0,
    };
  }

  const today = new Date().toISOString().split('T')[0]!;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0]!;
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, total, due_date, paid_at')
    .eq('organization_id', orgId)
    .in('status', ['pending', 'overdue', 'paid', 'scheduled']);

  let totalOutstanding = 0;
  let totalPaidThisMonth = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let upcomingAmount = 0;
  let upcomingCount = 0;

  for (const inv of invoices ?? []) {
    if (inv.status === 'pending' || inv.status === 'overdue') {
      totalOutstanding += inv.total;
    }
    if (inv.status === 'overdue') {
      overdueAmount += inv.total;
      overdueCount++;
    }
    if (inv.status === 'paid' && inv.paid_at && inv.paid_at >= monthStart) {
      totalPaidThisMonth += inv.total;
    }
    if (
      (inv.status === 'pending' || inv.status === 'scheduled') &&
      inv.due_date >= today &&
      inv.due_date <= nextWeek
    ) {
      upcomingAmount += inv.total;
      upcomingCount++;
    }
  }

  return {
    totalOutstanding,
    totalPaidThisMonth,
    overdueAmount,
    overdueCount,
    upcomingAmount,
    upcomingCount,
  };
}

export async function getNextInvoiceNumber(): Promise<string> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();
  if (!orgId) return 'INV-0001';

  const { data: org } = await supabase
    .from('organizations')
    .select('invoice_prefix, next_invoice_number')
    .eq('id', orgId)
    .single();

  if (!org) return 'INV-0001';
  const padded = String(org.next_invoice_number).padStart(4, '0');
  return `${org.invoice_prefix}-${padded}`;
}

import { createClient } from '@/lib/supabase/server';
import type { Customer, CustomerFilters, PaginatedResponse } from '@/lib/types';
import { getOrganizationId } from './invoice-queries';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export async function getCustomers(
  filters: CustomerFilters = {},
): Promise<PaginatedResponse<Customer>> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();

  if (!orgId) return { data: [], count: 0, error: 'No organization found' };

  const {
    search,
    sort_by = 'name',
    sort_order = 'asc',
    page = 1,
    per_page = DEFAULT_PAGE_SIZE,
  } = filters;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`,
    );
  }

  query = query
    .order(sort_by, { ascending: sort_order === 'asc' })
    .range((page - 1) * per_page, page * per_page - 1);

  const { data, count, error } = await query;

  if (error) return { data: [], count: 0, error: error.message };
  return { data: (data as Customer[]) ?? [], count: count ?? 0, error: null };
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Customer;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();
  if (!orgId) return [];

  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', orgId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
    .limit(10);

  return (data as Customer[]) ?? [];
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationId } from '@/lib/queries/invoice-queries';
import type { CustomerFormData } from '@/lib/validations/customer-schema';
import type { ApiResponse, Customer } from '@/lib/types';

export async function createCustomer(
  formData: CustomerFormData,
): Promise<ApiResponse<Customer>> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();
  if (!orgId) return { data: null, error: 'No organization found' };

  const { data, error } = await supabase
    .from('customers')
    .insert({ ...formData, organization_id: orgId })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/customers');
  return { data: data as Customer, error: null };
}

export async function updateCustomer(
  id: string,
  formData: Partial<CustomerFormData>,
): Promise<ApiResponse<Customer>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  return { data: data as Customer, error: null };
}

export async function deleteCustomer(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.from('customers').delete().eq('id', id);

  if (error) return { data: null, error: error.message };

  revalidatePath('/customers');
  return { data: null, error: null };
}

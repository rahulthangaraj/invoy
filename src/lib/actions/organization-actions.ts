'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationId } from '@/lib/queries/invoice-queries';
import type { OrganizationFormData, ApiResponse, Organization } from '@/lib/types';

export async function createOrganization(data: {
  name: string;
  email: string;
  default_currency?: string;
  default_tax_rate?: number | null;
}): Promise<ApiResponse<Organization>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not authenticated' };

  // Check if already exists
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) return { data: null, error: 'Organization already exists' };

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      user_id: user.id,
      name: data.name,
      email: data.email,
      default_currency: data.default_currency ?? 'USD',
      default_tax_rate: data.default_tax_rate ?? null,
    })
    .select()
    .single();

  if (error || !org) return { data: null, error: error?.message ?? 'Failed to create organization' };

  revalidatePath('/');
  return { data: org as Organization, error: null };
}

export async function updateOrganization(
  formData: Partial<OrganizationFormData>,
): Promise<ApiResponse<Organization>> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();
  if (!orgId) return { data: null, error: 'No organization found' };

  const { data, error } = await supabase
    .from('organizations')
    .update(formData)
    .eq('id', orgId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath('/settings');
  return { data: data as Organization, error: null };
}

export async function uploadLogo(file: File): Promise<ApiResponse<string>> {
  const supabase = await createClient();
  const orgId = await getOrganizationId();
  if (!orgId) return { data: null, error: 'No organization found' };

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${orgId}/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true });

  if (uploadError) return { data: null, error: uploadError.message };

  const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
  const logoUrl = urlData.publicUrl;

  await supabase.from('organizations').update({ logo_url: logoUrl }).eq('id', orgId);

  revalidatePath('/settings');
  return { data: logoUrl, error: null };
}

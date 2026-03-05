export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInvoices, getOrganizationId } from '@/lib/queries/invoice-queries';
import { createInvoice } from '@/lib/actions/invoice-actions';
import { invoiceSchema } from '@/lib/validations/invoice-schema';
import type { InvoiceFilters } from '@/lib/types';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const filters: InvoiceFilters = {
    status: (searchParams.get('status') as InvoiceFilters['status']) ?? undefined,
    customer_id: searchParams.get('customer_id') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1'),
    per_page: parseInt(searchParams.get('per_page') ?? '25'),
  };

  const result = await getInvoices(filters);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 },
    );
  }

  const result = await createInvoice(parsed.data);
  const status = result.error ? 400 : 201;
  return NextResponse.json(result, { status });
}

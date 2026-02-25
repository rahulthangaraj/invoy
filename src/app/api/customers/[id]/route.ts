import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomerById } from '@/lib/queries/customer-queries';
import { updateCustomer, deleteCustomer } from '@/lib/actions/customer-actions';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: customer, error: null });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Parameters<typeof updateCustomer>[1];
  const result = await updateCustomer(id, body);
  const status = result.error ? 400 : 200;
  return NextResponse.json(result, { status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const result = await deleteCustomer(id);
  const status = result.error ? 400 : 200;
  return NextResponse.json(result, { status });
}

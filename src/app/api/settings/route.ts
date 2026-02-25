import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrganization } from '@/lib/queries/organization-queries';
import { updateOrganization } from '@/lib/actions/organization-actions';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const org = await getOrganization();
  return NextResponse.json({ data: org, error: null });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Parameters<typeof updateOrganization>[0];
  const result = await updateOrganization(body);
  const status = result.error ? 400 : 200;
  return NextResponse.json(result, { status });
}

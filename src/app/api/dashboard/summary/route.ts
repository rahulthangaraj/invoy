import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardSummary } from '@/lib/queries/invoice-queries';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const summary = await getDashboardSummary();
  return NextResponse.json({ data: summary, error: null });
}

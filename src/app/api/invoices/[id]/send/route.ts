import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInvoiceById } from '@/lib/queries/invoice-queries';
import { getOrganization } from '@/lib/queries/organization-queries';
import { sendInvoiceEmail } from '@/lib/email/send-invoice';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [invoice, organization] = await Promise.all([
    getInvoiceById(id),
    getOrganization(),
  ]);

  if (!invoice) return NextResponse.json({ data: null, error: 'Invoice not found' }, { status: 404 });
  if (!organization) return NextResponse.json({ data: null, error: 'Organization not found' }, { status: 404 });

  const { error } = await sendInvoiceEmail(invoice, organization);
  if (error) return NextResponse.json({ data: null, error }, { status: 500 });

  // Update sent_at and status
  await supabase
    .from('invoices')
    .update({ sent_at: new Date().toISOString(), status: 'pending' })
    .eq('id', id);

  return NextResponse.json({ data: { sent: true }, error: null });
}

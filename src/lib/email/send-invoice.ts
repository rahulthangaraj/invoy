import { Resend } from 'resend';
import { APP_NAME, APP_URL, CURRENCY_SYMBOLS } from '@/lib/constants';
import type { Invoice, Organization } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(
  invoice: Invoice,
  organization: Organization,
): Promise<{ error: string | null }> {
  if (!invoice.customer?.email) {
    return { error: 'Customer email is required to send invoice' };
  }

  const symbol = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
  }).format(invoice.total);
  const total = `${symbol}${formatted}`;

  const publicUrl = `${APP_URL}/invoice/${invoice.public_id}`;

  const html = buildEmailHtml({
    orgName: organization.name,
    brandColor: organization.brand_color,
    invoiceNumber: invoice.invoice_number,
    customerName: invoice.customer.company_name ?? invoice.customer.name,
    total,
    dueDate: invoice.due_date,
    paymentLinkUrl: invoice.payment_link_url ?? organization.payment_link_url,
    paymentLinkLabel: organization.payment_link_label,
    publicUrl,
  });

  const { error } = await resend.emails.send({
    from: `${organization.name} <invoices@resend.dev>`,
    to: [invoice.customer.email],
    subject: `Invoice ${invoice.invoice_number} from ${organization.name}`,
    html,
  });

  if (error) {
    console.error('[sendInvoiceEmail]', error);
    return { error: error.message };
  }

  return { error: null };
}

function buildEmailHtml({
  orgName,
  brandColor,
  invoiceNumber,
  customerName,
  total,
  dueDate,
  paymentLinkUrl,
  paymentLinkLabel,
  publicUrl,
}: {
  orgName: string;
  brandColor: string;
  invoiceNumber: string;
  customerName: string;
  total: string;
  dueDate: string;
  paymentLinkUrl: string | null;
  paymentLinkLabel: string;
  publicUrl: string;
}) {
  const formattedDue = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <!-- Header -->
    <div style="background:${brandColor};padding:32px 40px;">
      <p style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">Invoice from</p>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0;">${orgName}</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#525252;font-size:14px;margin:0 0 24px;">Hi ${customerName},</p>
      <p style="color:#0a0a0a;font-size:14px;margin:0 0 24px;">
        Here's your invoice <strong style="font-family:monospace;">${invoiceNumber}</strong> for <strong>${total}</strong>, due on ${formattedDue}.
      </p>

      <!-- Amount card -->
      <div style="background:#f5f5f7;border-radius:8px;padding:20px 24px;margin:0 0 24px;text-align:center;">
        <p style="color:#737373;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px;">Amount due</p>
        <p style="color:#0a0a0a;font-size:28px;font-weight:700;margin:0;font-variant-numeric:tabular-nums;">${total}</p>
        <p style="color:#737373;font-size:12px;margin:4px 0 0;">Due ${formattedDue}</p>
      </div>

      <!-- CTA buttons -->
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${publicUrl}" style="display:inline-block;background:${brandColor};color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin:0 8px 8px;">
          View Invoice
        </a>
        ${
          paymentLinkUrl
            ? `<a href="${paymentLinkUrl}" style="display:inline-block;background:#059669;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin:0 8px 8px;">
          ${paymentLinkLabel}
        </a>`
            : ''
        }
      </div>

      <p style="color:#a3a3a3;font-size:12px;text-align:center;margin:0;">
        If you have questions, reply to this email or contact ${orgName}.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f5f5f7;padding:16px 40px;border-top:1px solid #e5e5e5;">
      <p style="color:#a3a3a3;font-size:11px;text-align:center;margin:0;">
        Sent via <a href="${APP_URL}" style="color:#a3a3a3;">${APP_NAME}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

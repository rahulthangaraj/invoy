import { cn } from '@/lib/utils';
import { INVOICE_STATUS_LABELS } from '@/lib/constants';
import type { InvoiceStatus } from '@/lib/types';

const statusStyles: Record<InvoiceStatus, string> = {
  paid: 'text-status-paid-text bg-status-paid-bg',
  pending: 'text-status-pending-text bg-status-pending-bg',
  overdue: 'text-status-overdue-text bg-status-overdue-bg',
  draft: 'text-status-draft-text bg-status-draft-bg',
  scheduled: 'text-status-scheduled-text bg-status-scheduled-bg',
  cancelled: 'text-status-cancelled-text bg-status-cancelled-bg',
};

export interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
        className,
      )}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}

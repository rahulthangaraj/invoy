import { cn } from '@/lib/utils';
import { CurrencyDisplay } from './currency-display';

export interface SummaryCardProps {
  label: string;
  amount: number;
  currency?: string;
  subtext?: string;
  accentColor?: 'red' | 'green' | 'none';
  className?: string;
}

export function SummaryCard({
  label,
  amount,
  currency = 'USD',
  subtext,
  accentColor = 'none',
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-lg border border-border p-5',
        accentColor === 'red' && 'border-t-2 border-t-status-overdue-text',
        accentColor === 'green' && 'border-t-2 border-t-status-paid-text',
        className,
      )}
    >
      <p className="text-sm font-medium text-text-secondary mb-2">{label}</p>
      <CurrencyDisplay
        amount={amount}
        currency={currency}
        className="text-3xl font-bold text-text-primary"
      />
      {subtext && <p className="text-xs text-text-tertiary mt-1">{subtext}</p>}
    </div>
  );
}

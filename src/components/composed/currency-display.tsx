import { cn } from '@/lib/utils';
import { CURRENCY_SYMBOLS } from '@/lib/constants';

export interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  /** Show currency symbol in muted color, amount in primary */
  split?: boolean;
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  className,
  split = false,
}: CurrencyDisplayProps) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (split) {
    return (
      <span className={cn('tabular-nums inline-flex items-baseline gap-0.5', className)}>
        <span className="text-text-secondary text-sm">{symbol}</span>
        <span>{formatted}</span>
      </span>
    );
  }

  return (
    <span className={cn('tabular-nums', className)}>
      {symbol}
      {formatted}
    </span>
  );
}

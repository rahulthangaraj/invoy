'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { href: '/settings/profile', label: 'Company profile' },
  { href: '/settings/invoice', label: 'Invoice defaults' },
  { href: '/settings/payment', label: 'Payment' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-0 border-b border-border px-6">
      {settingsTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            pathname === tab.href
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

import Link from 'next/link';
import { type ReactNode } from 'react';
import { PageHeader } from '@/components/composed/page-header';

const settingsTabs = [
  { href: '/settings/profile', label: 'Company profile' },
  { href: '/settings/invoice', label: 'Invoice defaults' },
  { href: '/settings/payment', label: 'Payment' },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and invoice defaults." />

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-border px-6">
        {settingsTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary border-b-2 border-transparent hover:border-border transition-colors -mb-px"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="px-6 py-6 max-w-2xl">{children}</div>
    </div>
  );
}

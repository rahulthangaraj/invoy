import { Suspense, type ReactNode } from 'react';
import { getOrganization } from '@/lib/queries/organization-queries';
import { SettingsNav } from './settings-nav';

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  // Fetch org once in the layout — child pages can still call getOrganization()
  // but Next.js will deduplicate within the same render pass
  void getOrganization();

  return (
    <div>
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your account and invoice defaults.</p>
      </div>

      <SettingsNav />

      <div className="px-6 py-6 max-w-2xl">
        <Suspense fallback={<SettingsFormSkeleton />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

function SettingsFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton-shimmer h-5 w-36" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <div className="skeleton-shimmer h-3.5 w-24" />
                <div className="skeleton-shimmer h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

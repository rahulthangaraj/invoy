import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrganization } from '@/lib/queries/organization-queries';
import { OnboardingForm } from './onboarding-form';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const org = await getOrganization();
  if (org) redirect('/');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-semibold text-text-primary text-lg tracking-tight">Invoy</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-text-primary">Set up your workspace</h1>
            <p className="text-sm text-text-secondary mt-1">
              Tell us about your business. You can update these details anytime in Settings.
            </p>
          </div>
          <OnboardingForm userEmail={user.email ?? ''} />
        </div>
      </div>
    </div>
  );
}

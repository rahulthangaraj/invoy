import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrganization } from '@/lib/queries/organization-queries';

export default async function FullscreenLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const org = await getOrganization();
  if (!org) {
    redirect('/onboarding');
  }

  return <>{children}</>;
}

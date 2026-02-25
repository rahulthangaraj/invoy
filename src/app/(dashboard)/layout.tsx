import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOrganization } from '@/lib/queries/organization-queries';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background pt-14 md:pt-0">{children}</main>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has an organization
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // Redirect to onboarding if no org, otherwise dashboard
        const redirectTo = org ? '/' : '/onboarding';
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }
  }

  // Fallback: redirect to login if something went wrong
  return NextResponse.redirect(`${origin}/login`);
}

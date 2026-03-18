'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupFormData } from '@/lib/validations/auth-schema';
import { GoogleButton } from '@/components/auth/google-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [existingEmail, setExistingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupFormData) {
    setLoading(true);
    setExistingEmail(false);

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Supabase returns a user with empty identities when email already exists
    if (authData.user && authData.user.identities?.length === 0) {
      setExistingEmail(true);
      setLoading(false);
      return;
    }

    if (!authData.session) {
      // Email confirmation is required — tell the user to check their inbox
      setEmailSent(true);
      setLoading(false);
      return;
    }

    // Session available immediately (email confirmation disabled) — go to onboarding
    router.push('/onboarding');
    router.refresh();
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Check your email</h1>
          <p className="text-sm text-text-secondary">
            We sent a confirmation link to your inbox. Click it to activate your account and finish
            setting up your workspace.
          </p>
          <p className="text-xs text-text-tertiary">
            Already confirmed?{' '}
            <Link href="/login" className="text-text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-base font-semibold text-text-primary tracking-tight">Invoy</span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Free forever. No credit card required.
          </p>
        </div>

        <GoogleButton />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-text-tertiary">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className={(errors.email || existingEmail) ? 'border-destructive focus-visible:ring-destructive/20' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
            {existingEmail && (
              <div className="space-y-1">
                <p className="text-xs text-destructive">
                  This email is already registered. Please sign in.
                </p>
                <Link
                  href="/login"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...register('password')}
              className={errors.password ? 'border-destructive focus-visible:ring-destructive/20' : ''}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

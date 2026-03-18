'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Loader2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);

    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    // Always show success (security best practice)
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Check your email
          </h1>
          <p className="text-sm text-text-secondary">
            If an account exists with that email, we sent a password reset link.
            Check your inbox and click the link to set a new password.
          </p>
          <p className="text-xs text-text-tertiary">
            <Link
              href="/login"
              className="text-text-primary font-medium hover:underline"
            >
              Back to sign in
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
          <span className="text-base font-semibold text-text-primary tracking-tight">
            Invoy
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register('email')}
              className={
                errors.email
                  ? 'border-destructive focus-visible:ring-destructive/20'
                  : ''
              }
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-6">
          <Link
            href="/login"
            className="text-text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

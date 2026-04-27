'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/error';

function LoginPageInner() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Redirect destination: prefer `from` query param, fall back to /catalog
  const from = searchParams.get('from') ?? '/catalog';

  useEffect(() => {
    if (user) router.replace(from);
  }, [user, from, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { getSupabaseClient } = await import('@/integrations/supabase/client');
        const supabase = await getSupabaseClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { shop_name: shopName },
          },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
        router.push(from);
      } else {
        const { getSupabaseClient } = await import('@/integrations/supabase/client');
        const supabase = await getSupabaseClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        router.push(from);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create wholesale account'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Sign in to access wholesale pricing.'
                  : 'Verified repair shops only.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="shop">Shop name</Label>
                  <Input
                    id="shop"
                    required
                    autoComplete="organization"
                    placeholder="Houston Phone Repair"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@shop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
                size="lg"
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === 'login' ? 'New to iRepair?' : 'Already have an account?'}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-primary hover:underline"
              >
                {mode === 'login' ? 'Open an account' : 'Sign in'}
              </button>
            </p>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms.{' '}
            <Link href="/" className="hover:underline">Back to home</Link>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

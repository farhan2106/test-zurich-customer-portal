'use client';

import { useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Spinner } from '@/components/ui';
import { Navbar } from '@/components/layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
}

export function ProtectedRoute({
  children,
  adminRequired = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Redirect in useEffect (not in render phase) to avoid
  // "Rendered more hooks than during the previous render" error
  // that occurs when redirect() throws mid-render during page transitions.
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (!isLoading && adminRequired && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, adminRequired, router]);

  // 1. If still loading auth state → show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Authenticating" />
      </div>
    );
  }

  // 2. If no user → render nothing (useEffect will redirect)
  if (!user) {
    return null;
  }

  // 3. If admin required but user is not admin → render nothing (useEffect will redirect)
  if (adminRequired && user.role !== 'admin') {
    return null;
  }

  // 4. All checks passed → render with Navbar and layout
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">{children}</div>
    </div>
  );
}

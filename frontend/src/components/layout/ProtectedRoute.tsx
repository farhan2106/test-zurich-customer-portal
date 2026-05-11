'use client';

import { redirect } from 'next/navigation';
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

  // 1. If still loading auth state → show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Authenticating" />
      </div>
    );
  }

  // 2. If no user → redirect to home (login page)
  if (!user) {
    redirect('/');
  }

  // 3. If admin required but user is not admin → redirect to dashboard
  if (adminRequired && user.role !== 'admin') {
    redirect('/dashboard');
  }

  // 4. All checks passed → render with Navbar and layout
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-8">{children}</div>
    </div>
  );
}

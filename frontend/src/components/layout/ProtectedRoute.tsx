'use client';

import { redirect } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Spinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
}

export function ProtectedRoute({
  children,
  adminRequired = false,
}: ProtectedRouteProps) {
  const { token, user, isLoading } = useAppSelector((state) => state.auth);

  // 1. If still loading auth state → show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Authenticating" />
      </div>
    );
  }

  // 2. If no token → redirect to login
  if (!token) {
    redirect('/login');
  }

  // 3. If token exists but no user yet → show spinner (might be mid-load)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading profile" />
      </div>
    );
  }

  // 4. If admin required but user is not admin → redirect to dashboard
  if (adminRequired && user.role !== 'admin') {
    redirect('/dashboard');
  }

  // 5. All checks passed → render children
  return <>{children}</>;
}

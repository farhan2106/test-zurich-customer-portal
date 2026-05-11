'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout';
import { Spinner } from '@/components/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    document.title = 'Admin — Zurich';
  }, []);

  // Redirect in useEffect (not in render phase) to avoid
  // "Rendered more hooks than during the previous render" error
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Auth check still initializing
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Signing in..." />
      </div>
    );
  }

  // Not authenticated → render nothing (useEffect will redirect)
  if (!user) {
    return null;
  }

  // Not admin role → render nothing (useEffect will redirect)
  if (user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-8">{children}</main>
    </div>
  );
}

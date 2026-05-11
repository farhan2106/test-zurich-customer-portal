'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout';
import { Spinner } from '@/components/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    document.title = 'Admin — Zurich';
  }, []);

  // Auth check still initializing
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Signing in..." />
      </div>
    );
  }

  // Not authenticated — redirect to home
  if (!user) {
    redirect('/');
    return null;
  }

  // Not admin role — redirect to dashboard
  if (user.role !== 'admin') {
    redirect('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-8">{children}</main>
    </div>
  );
}

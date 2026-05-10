'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout';
import { Spinner } from '@/components/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    document.title = 'Admin — Zurich';
  }, []);

  // Loading state
  if (isLoading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading" />
      </div>
    );
  }

  // No user after token loaded
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading profile" />
      </div>
    );
  }

  // Role check: non-admin redirect
  if (user.role !== 'admin') {
    redirect('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

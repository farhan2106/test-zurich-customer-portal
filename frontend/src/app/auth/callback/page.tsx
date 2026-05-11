'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, loginFailure } from '@/store/slices/authSlice';
import apiClient from '@/services/api-client';

function CallbackContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      dispatch({ type: 'auth/loginStart' });
      try {
        const response = await apiClient.get('/auth/profile');
        const profile = response.data;

        dispatch(loginSuccess({
          user: {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
          },
        }));

        // Redirect based on role
        if (profile.role === 'admin') {
          redirect('/admin/customers');
        } else {
          redirect('/dashboard');
        }
      } catch {
        dispatch(loginFailure('Authentication failed'));
        redirect('/?error=auth_failed');
      }
    };

    fetchProfile();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-lg font-medium">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

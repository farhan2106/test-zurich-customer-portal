'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  role: string;
  iat?: number;
  exp?: number;
}

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      redirect('/login?error=auth_failed');
      return;
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);

      const user = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
      };

      localStorage.setItem('token', token);
      dispatch(loginSuccess({ token, user }));

      // Redirect based on role
      if (payload.role === 'admin') {
        redirect('/admin/customers');
      } else {
        redirect('/dashboard');
      }
    } catch {
      redirect('/login?error=auth_failed');
    }
  }, [token, dispatch]);

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

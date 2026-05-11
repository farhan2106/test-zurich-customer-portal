'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { ToastProvider } from '@/components/ui';
import { useEffect } from 'react';
import apiClient from '@/services/api-client';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      dispatch(loginStart());
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
            photoUrl: profile.photoUrl ?? null,
          },
        }));
      } catch {
        // No valid cookie — user is not authenticated.
        // loginFailure sets isLoading=false so guards below it can proceed
        dispatch(loginFailure('Not authenticated'));
      }
    };

    initAuth();
  }, [dispatch]);  // Only on mount, not on pathname changes

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </ToastProvider>
    </Provider>
  );
}

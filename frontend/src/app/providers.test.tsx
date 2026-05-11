import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { usePathname } from 'next/navigation';

// We provide a mock store that can be swapped per test.
// The mockStore variable is prefixed with 'mock' so jest hoists it with jest.mock.
let mockStore: ReturnType<typeof configureStore>;

// Mock api-client so we can control its responses in tests
jest.mock('@/services/api-client');

// Must import apiClient AFTER the mock
import apiClient from '@/services/api-client';

jest.mock('@/store', () => ({
  get store() {
    return mockStore;
  },
}));

// Mock ToastProvider to avoid any DOM dependencies
jest.mock('@/components/ui', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { Providers } from './providers';

const mockProfile = {
  id: 'usr_abc123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
};

describe('AuthInitializer (inside Providers)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = configureStore({
      reducer: { auth: authReducer },
    });
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockProfile });
  });

  it('should call /auth/profile once on mount', async () => {
    render(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
    });
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('should NOT call /auth/profile again when route changes', async () => {
    const mockUsePathname = usePathname as jest.Mock;
    mockUsePathname.mockReturnValue('/dashboard');

    const { rerender } = render(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    // Simulate a route change
    mockUsePathname.mockReturnValue('/policies');

    rerender(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    // Allow effects to flush — the bug causes a second call here
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // This should be 1 (only mount). With the bug (pathname in deps), it will be 2.
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('should dispatch loginSuccess on successful response', async () => {
    render(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(mockStore.getState().auth.user).toEqual({
        id: mockProfile.id,
        email: mockProfile.email,
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        role: mockProfile.role,
        photoUrl: null
      });
    });
  });

  it('should NOT dispatch loginFailure on 401 (silently treat as not logged in)', async () => {
    const axiosError = {
      response: { status: 401 },
      config: { url: '/api/auth/profile' },
    };
    (apiClient.get as jest.Mock).mockRejectedValue(axiosError);

    const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

    render(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
    });

    // Check that loginFailure was NOT dispatched
    const loginFailureActions = dispatchSpy.mock.calls.filter(
      (call) => call[0]?.type === 'auth/loginFailure',
    );
    expect(loginFailureActions).toHaveLength(0);

    // User should remain null (not authenticated)
    expect(mockStore.getState().auth.user).toBeNull();
  });
});

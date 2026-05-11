import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import * as nextNavigation from 'next/navigation';
import apiClient from '@/services/api-client';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(), replace: jest.fn(), back: jest.fn(), forward: jest.fn(),
    refresh: jest.fn(), prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/auth/callback'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

jest.mock('@/services/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// Import the page component (will fail until implemented)
import CallbackPage from '@/app/auth/callback/page';

const mockProfileResponse = {
  id: 'usr_1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
};

describe('Auth Callback Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /auth/profile to fetch user info', async () => {
    apiClient.get.mockResolvedValue({ data: mockProfileResponse });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
    });
  });

  it('shows "Signing you in..." loading message with spinner', () => {
    apiClient.get.mockReturnValue(new Promise(() => {}));
    render(<CallbackPage />);
    expect(screen.getByText(/signing you in\.\.\./i)).toBeInTheDocument();
  });

  it('dispatches loginSuccess with user profile on success', async () => {
    apiClient.get.mockResolvedValue({ data: mockProfileResponse });
    const { store } = render(<CallbackPage />, {
      preloadedState: {
        auth: { user: null, token: null, isLoading: false, error: null },
      },
    });

    await waitFor(() => {
      expect(store.getState().auth.user).toEqual({
        id: 'usr_1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      });
    });
  });

  it('redirects admin (role="admin") to /admin/customers', async () => {
    apiClient.get.mockResolvedValue({ data: { ...mockProfileResponse, role: 'admin' } });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(nextNavigation.redirect).toHaveBeenCalledWith('/admin/customers');
    });
  });

  it('redirects customer (role="customer") to /dashboard', async () => {
    apiClient.get.mockResolvedValue({ data: mockProfileResponse });
    render(<CallbackPage />);
    await waitFor(() => {
      expect(nextNavigation.redirect).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to /?error=auth_failed when profile fetch fails', async () => {
    apiClient.get.mockRejectedValue(new Error('Unauthorized'));
    render(<CallbackPage />);
    await waitFor(() => {
      expect(nextNavigation.redirect).toHaveBeenCalledWith('/?error=auth_failed');
    });
  });
});

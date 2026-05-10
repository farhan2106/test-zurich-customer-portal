import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import * as nextNavigation from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/auth/callback'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Mock jwt-decode with explicit factory for v4 compatibility
jest.mock('jwt-decode', () => ({
  __esModule: true,
  jwtDecode: jest.fn(),
}));
const mockedJwtDecode = jwtDecode as unknown as jest.Mock;

// Import the page component (will fail until implemented)
import CallbackPage from '@/app/auth/callback/page';

const mockDecodedToken = {
  sub: 'usr_1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
  photoUrl: '',
};

describe('Auth Callback Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('reads token from URL query param ?token=<JWT>', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue(mockDecodedToken);

    render(<CallbackPage />);

    expect(nextNavigation.useSearchParams).toHaveBeenCalled();
  });

  it('decodes JWT using jwt-decode to extract user info', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue(mockDecodedToken);

    render(<CallbackPage />);

    expect(mockedJwtDecode).toHaveBeenCalledWith('mock-jwt-token');
  });

  it('stores token in localStorage', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue(mockDecodedToken);

    render(<CallbackPage />);

    expect(localStorage.getItem('token')).toBe('mock-jwt-token');
  });

  it('dispatches loginSuccess(token, user) to Redux', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue(mockDecodedToken);

    const { store } = render(<CallbackPage />, {
      preloadedState: {
        auth: { user: null, token: null, isLoading: false, error: null },
      },
    });

    expect(store.getState().auth.token).toBe('mock-jwt-token');
    expect(store.getState().auth.user).toEqual({
      id: 'usr_1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
    });
  });

  it('shows "Signing you in..." loading message with spinner', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue(mockDecodedToken);

    render(<CallbackPage />);

    expect(screen.getByText(/signing you in\.\.\./i)).toBeInTheDocument();
  });

  it('redirects admin (role="admin") to /admin/customers', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue({
      ...mockDecodedToken,
      role: 'admin',
    });

    render(<CallbackPage />);

    expect(nextNavigation.redirect).toHaveBeenCalledWith('/admin/customers');
  });

  it('redirects customer (role="customer") to /dashboard', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'mock-jwt-token' })
    );
    mockedJwtDecode.mockReturnValue(mockDecodedToken);

    render(<CallbackPage />);

    expect(nextNavigation.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /login?error=auth_failed when no token in URL', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({})
    );

    render(<CallbackPage />);

    expect(nextNavigation.redirect).toHaveBeenCalledWith('/login?error=auth_failed');
  });

  it('redirects to /login?error=auth_failed when jwt-decode throws', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: 'invalid-token' })
    );
    mockedJwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    render(<CallbackPage />);

    expect(nextNavigation.redirect).toHaveBeenCalledWith('/login?error=auth_failed');
  });
});

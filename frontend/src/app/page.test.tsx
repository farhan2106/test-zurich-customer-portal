import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import * as nextNavigation from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(), replace: jest.fn(), back: jest.fn(), forward: jest.fn(),
    refresh: jest.fn(), prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Import will fail until component is implemented
import HomePage from '@/app/page';

describe('Home Page (Login)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /dashboard when user is already authenticated (user exists)', () => {
    const authenticatedState = {
      auth: {
        user: { id: 'usr_1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'customer' },
        token: null,
        isLoading: false, error: null,
      },
    };
    render(<HomePage />, { preloadedState: authenticatedState });
    expect(nextNavigation.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('does NOT redirect when user is not authenticated', () => {
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    // Should show the login UI, not redirect
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('renders "Zurich" brand text', () => {
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    expect(screen.getByText('Zurich')).toBeInTheDocument();
  });

  it('renders "Your Insurance Portal" subtitle', () => {
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    expect(screen.getByText(/your insurance portal/i)).toBeInTheDocument();
  });

  it('renders "Sign in with Google" button', () => {
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('renders secure login helper text', () => {
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    expect(screen.getByText(/secure login/i)).toBeInTheDocument();
  });

  it('shows error alert when ?error=access_denied query param present', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ error: 'access_denied' })
    );
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    expect(screen.getByText(/authentication was cancelled/i)).toBeInTheDocument();
  });

  it('Google button triggers redirect to OAuth endpoint', () => {
    render(<HomePage />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null } },
    });
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    googleButton.click();
    expect(nextNavigation.redirect).toHaveBeenCalledWith(`${apiUrl}/auth/google`);
  });
});

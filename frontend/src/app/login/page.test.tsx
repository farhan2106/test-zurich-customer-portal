import React from 'react';
import { render, screen } from '@/test-utils';
import * as nextNavigation from 'next/navigation';

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
  usePathname: jest.fn(() => '/login'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Import the page component (will fail until implemented)
import LoginPage from '@/app/login/page';

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Welcome to Zurich" heading (card-title)', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /welcome to zurich/i })).toBeInTheDocument();
  });

  it('renders "Your Insurance Portal" subtitle', () => {
    render(<LoginPage />);

    expect(screen.getByText(/your insurance portal/i)).toBeInTheDocument();
  });

  it('renders "Sign in with Google" button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('Google button links/redirects to the Google OAuth endpoint', () => {
    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    const expectedUrl = `${API_URL}/auth/google`;

    // Button should either be a link or trigger navigation to the OAuth URL
    const parentLink = googleButton.closest('a');
    if (parentLink) {
      expect(parentLink).toHaveAttribute('href', expectedUrl);
    } else {
      // If button triggers redirect via JS, verify the redirect target
      googleButton.click();
      expect(nextNavigation.redirect).toHaveBeenCalledWith(expectedUrl);
    }
  });

  it('renders secure login helper text', () => {
    render(<LoginPage />);

    expect(screen.getByText(/secure login/i)).toBeInTheDocument();
  });

  it('renders footer with "© 2026 Zurich Insurance"', () => {
    render(<LoginPage />);

    expect(screen.getByText(/© 2026 zurich insurance/i)).toBeInTheDocument();
  });

  it('shows error alert "Authentication was cancelled" when ?error=access_denied query param present', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ error: 'access_denied' })
    );

    render(<LoginPage />);

    expect(screen.getByText(/authentication was cancelled/i)).toBeInTheDocument();
  });

  it('redirects to /dashboard when user already has JWT token', () => {
    const authenticatedState = {
      auth: {
        user: { id: 'usr_1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'customer' },
        token: 'existing-jwt-token',
        isLoading: false,
        error: null,
      },
    };

    render(<LoginPage />, { preloadedState: authenticatedState });

    expect(nextNavigation.redirect).toHaveBeenCalledWith('/dashboard');
  });
});

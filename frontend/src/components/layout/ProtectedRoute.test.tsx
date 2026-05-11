import { render, screen } from '@/test-utils';
import { ProtectedRoute } from './ProtectedRoute';
import * as nextNavigation from 'next/navigation';

jest.mock('@/services/api-client');

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

describe('ProtectedRoute', () => {
  const authenticatedCustomer = {
    auth: {
      user: { id: '1', email: 'a@b.com', firstName: 'Test', lastName: 'User', role: 'customer' },
      token: null,
      isLoading: false,
      error: null,
    },
  };

  const authenticatedAdmin = {
    auth: {
      user: { id: '1', email: 'a@b.com', firstName: 'Test', lastName: 'User', role: 'admin' },
      token: null,
      isLoading: false,
      error: null,
    },
  };

  const unauthenticated = {
    auth: {
      user: null,
      token: null,
      isLoading: false,
      error: null,
    },
  };

  const loadingState = {
    auth: {
      user: null,
      token: null,
      isLoading: true,
      error: null,
    },
  };

  const tokenButNoUser = {
    auth: {
      user: null,
      token: null,
      isLoading: false,
      error: null,
    },
  };

  it('redirects to / when user is null and not loading', () => {
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>, {
      preloadedState: unauthenticated,
    });
    expect(nextNavigation.redirect).toHaveBeenCalledWith('/');
  });

  it('shows spinner when isLoading is true', () => {
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>, {
      preloadedState: loadingState,
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Authenticating')).toHaveClass('sr-only');
  });

  it('redirects to / when user is null and not loading (no session)', () => {
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>, {
      preloadedState: tokenButNoUser,
    });
    expect(nextNavigation.redirect).toHaveBeenCalledWith('/');
  });

  it('redirects non-admin from admin route to /dashboard', () => {
    render(
      <ProtectedRoute adminRequired><div>Admin Content</div></ProtectedRoute>,
      { preloadedState: authenticatedCustomer },
    );
    expect(nextNavigation.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('renders children when authenticated with correct role', () => {
    render(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>, {
      preloadedState: authenticatedCustomer,
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when admin accesses admin route', () => {
    render(
      <ProtectedRoute adminRequired><div>Admin Content</div></ProtectedRoute>,
      { preloadedState: authenticatedAdmin },
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

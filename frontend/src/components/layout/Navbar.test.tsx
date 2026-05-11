import { render, screen, waitFor } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { Navbar } from './Navbar';
import * as nextNavigation from 'next/navigation';
import { logout } from '@/store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';

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

describe('Navbar', () => {
  const customerPreloadedState = {
    auth: {
      user: { id: '1', email: 'a@b.com', firstName: 'Test', lastName: 'User', role: 'customer', photoUrl: null },
      token: null,
      isLoading: false,
      error: null,
    },
  };

  const adminPreloadedState = {
    auth: {
      user: { id: '1', email: 'a@b.com', firstName: 'Test', lastName: 'User', role: 'admin', photoUrl: null },
      token: null,
      isLoading: false,
      error: null,
    },
  };

  it('renders Zurich brand link with shield icon', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.getByRole('link', { name: /zurich/i })).toBeInTheDocument();
  });

  it('renders nav links: Dashboard, Products, Claims (visible for customer role)', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /claims/i })).toBeInTheDocument();
  });

  it('renders Customers admin link when user role is admin', () => {
    render(<Navbar />, { preloadedState: adminPreloadedState });
    expect(screen.getByRole('link', { name: /customers/i })).toBeInTheDocument();
  });

  it('does NOT render Customers admin link when user is customer', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.queryByRole('link', { name: /customers/i })).not.toBeInTheDocument();
  });

  it('active link has btn-active class (mock usePathname to return that link href)', () => {
    jest.spyOn(nextNavigation, 'usePathname').mockReturnValue('/products');
    render(<Navbar />, { preloadedState: customerPreloadedState });
    const productsLink = screen.getByRole('link', { name: /products/i });
    expect(productsLink).toHaveClass('btn-active');
    jest.restoreAllMocks();
  });

  it('renders user name in dropdown when user is logged in', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.getByRole('button', { name: /user menu for test/i })).toBeInTheDocument();
  });

  it('renders user email in dropdown signed-in info', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getByText(/a@b\.com/i)).toBeInTheDocument();
  });

  it('renders Sign Out button in dropdown', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('dispatches logout action on Sign Out click', async () => {
    // Create store manually so we can spy on dispatch before render
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: customerPreloadedState,
    });
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(<Navbar />, { store });

    const signOutBtn = screen.getByTestId('sign-out-btn');
    await userEvent.click(signOutBtn);

    // waitFor handles the async dispatch in handleSignOut (which awaits apiClient.post before dispatching)
    await waitFor(() => {
      const logoutCall = dispatchSpy.mock.calls.find(
        (call) => call[0] && (call[0] as any).type === logout.type,
      );
      expect(logoutCall).toBeDefined();
    });
    dispatchSpy.mockRestore();
  });

  it('mobile hamburger with aria-label="Open menu" exists with lg:hidden classes', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    const hamburger = screen.getByRole('button', { name: /open menu/i });
    expect(hamburger).toBeInTheDocument();
    const dropdown = hamburger.closest('.dropdown');
    expect(dropdown).toHaveClass('lg:hidden');
  });

  it('does NOT render user dropdown when user is null (not logged in)', () => {
    render(<Navbar />, {
      preloadedState: {
        auth: { user: null, token: null, isLoading: false, error: null },
      },
    });
    expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });
});

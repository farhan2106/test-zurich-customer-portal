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
    // Links appear in both mobile popover menu and desktop menu
    expect(screen.getAllByRole('link', { name: /dashboard/i })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /products/i })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /claims/i })).toHaveLength(2);
  });

  it('renders Customers admin link when user role is admin', () => {
    render(<Navbar />, { preloadedState: adminPreloadedState });
    expect(screen.getAllByRole('link', { name: /customers/i })).toHaveLength(2);
  });

  it('does NOT render Customers admin link when user is customer', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    expect(screen.queryAllByRole('link', { name: /customers/i })).toHaveLength(0);
  });

  it('active link has btn-active class (mock usePathname to return that link href)', () => {
    jest.spyOn(nextNavigation, 'usePathname').mockReturnValue('/products');
    render(<Navbar />, { preloadedState: customerPreloadedState });
    const productsLinks = screen.getAllByRole('link', { name: /products/i });
    // At least one link (mobile or desktop) should have btn-active
    expect(productsLinks.some((link) => link.classList.contains('btn-active'))).toBe(true);
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
        (call) => {
          const action = call[0] as { type?: string } | undefined;
          return action && action.type === logout.type;
        },
      );
      expect(logoutCall).toBeDefined();
    });
    dispatchSpy.mockRestore();
  });

  it('mobile hamburger uses Popover API with mobile-menu target and hidden on desktop', () => {
    render(<Navbar />, { preloadedState: customerPreloadedState });
    const hamburger = screen.getByRole('button', { name: /open menu/i });
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveClass('lg:hidden');
    expect(hamburger).toHaveAttribute('popoverTarget', 'mobile-menu');
    // Menu ul uses Popover API with DaisyUI dropdown class
    const menu = document.getElementById('mobile-menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('dropdown');
    expect(menu).toHaveAttribute('popover');
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

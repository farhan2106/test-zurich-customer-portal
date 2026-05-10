import React from 'react';
import { redirect } from 'next/navigation';
import AdminLayout from './layout';
import { renderWithProviders, screen } from '@/test-utils';

jest.mock('@/services/api-client');

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows "Loading..." with spinner when auth isLoading (user=null, token=null, isLoading=true)', () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: {
        auth: { user: null, token: null, isLoading: true, error: null },
      },
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows loading when user is not yet set (user=null, token=exists, isLoading=true)', () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: {
        auth: { user: null, token: 'some-token', isLoading: true, error: null },
      },
    });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects non-admin user to /dashboard when user.role is customer', () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: {
        auth: {
          user: { id: 'usr_1', email: 'user@example.com', firstName: 'User', lastName: 'Test', role: 'customer' },
          token: 'some-token',
          isLoading: false,
          error: null,
        },
      },
    });

    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('shows children when user has admin role', () => {
    renderWithProviders(
      <AdminLayout>
        <div data-testid="admin-content">Admin Dashboard</div>
      </AdminLayout>,
      {
        preloadedState: {
          auth: {
            user: { id: 'usr_1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
            token: 'some-token',
            isLoading: false,
            error: null,
          },
        },
      }
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('shows Navbar component with role="navigation"', () => {
    renderWithProviders(
      <AdminLayout>
        <div data-testid="admin-content">Admin Dashboard</div>
      </AdminLayout>,
      {
        preloadedState: {
          auth: {
            user: { id: 'usr_1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
            token: 'some-token',
            isLoading: false,
            error: null,
          },
        },
      }
    );

    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('sets page title prefix "Admin — Zurich"', () => {
    renderWithProviders(
      <AdminLayout>
        <div data-testid="admin-content">Admin Dashboard</div>
      </AdminLayout>,
      {
        preloadedState: {
          auth: {
            user: { id: 'usr_1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' },
            token: 'some-token',
            isLoading: false,
            error: null,
          },
        },
      }
    );

    expect(document.title).toContain('Admin — Zurich');
  });
});

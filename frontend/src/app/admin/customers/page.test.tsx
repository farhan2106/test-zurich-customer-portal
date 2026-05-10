import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import * as adminService from '@/services/admin.service';

// Mock the admin service
jest.mock('@/services/admin.service');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock next/navigation
const mockUseParams = jest.fn(() => ({}));
const mockRedirect = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/admin/customers'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: mockUseParams,
  redirect: mockRedirect,
}));

// Mock data
const mockCustomers = [
  {
    id: 'usr_001',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    photoUrl: null,
    location: 'West Malaysia',
    premiumPaid: 1500,
    role: 'customer',
    createdAt: '2025-01-01',
    updatedAt: '2025-06-01',
  },
  {
    id: 'usr_002',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    photoUrl: null,
    location: 'East Malaysia',
    premiumPaid: 2500,
    role: 'customer',
    createdAt: '2025-02-01',
    updatedAt: '2025-07-01',
  },
];

const adminState = {
  auth: {
    user: {
      id: 'a1',
      email: 'admin@zurich.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    },
    token: 'token',
    isLoading: false,
    error: null,
  },
  admin: {
    customers: mockCustomers,
    selectedCustomer: null,
    isLoading: false,
    error: null,
  },
};

// Import the page component
import AdminCustomersPage from './page';

describe('Admin Customers List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table with customer data (name, email, location)', async () => {
    mockedAdminService.getCustomers.mockResolvedValue(mockCustomers);

    render(<AdminCustomersPage />, { preloadedState: adminState });

    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('West Malaysia').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('East Malaysia').length).toBeGreaterThanOrEqual(1);
  });

  it('renders "View" buttons for each customer row', async () => {
    mockedAdminService.getCustomers.mockResolvedValue(mockCustomers);

    render(<AdminCustomersPage />, { preloadedState: adminState });

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows search input with placeholder "Search customers..."', async () => {
    mockedAdminService.getCustomers.mockResolvedValue(mockCustomers);

    render(<AdminCustomersPage />, { preloadedState: adminState });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search customers...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('shows loading skeleton when isLoading=true', async () => {
    mockedAdminService.getCustomers.mockResolvedValue(mockCustomers);

    const loadingState = {
      ...adminState,
      admin: {
        customers: [],
        selectedCustomer: null,
        isLoading: true,
        error: null,
      },
    };

    render(<AdminCustomersPage />, { preloadedState: loadingState });

    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state "No customers match your search" when customers=[]', async () => {
    mockedAdminService.getCustomers.mockResolvedValue([]);

    const emptyState = {
      ...adminState,
      admin: {
        customers: [],
        selectedCustomer: null,
        isLoading: false,
        error: null,
      },
    };

    render(<AdminCustomersPage />, { preloadedState: emptyState });

    await waitFor(() => {
      expect(screen.getByText(/No customers match your search/i)).toBeInTheDocument();
    });
  });

  it('shows error alert with retry button on error state', async () => {
    mockedAdminService.getCustomers.mockRejectedValue(new Error('Failed to fetch customers'));

    const errorState = {
      ...adminState,
      admin: {
        customers: [],
        selectedCustomer: null,
        isLoading: false,
        error: null,
      },
    };

    render(<AdminCustomersPage />, { preloadedState: errorState });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch customers/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders mobile card view with customer cards', async () => {
    mockedAdminService.getCustomers.mockResolvedValue(mockCustomers);

    render(<AdminCustomersPage />, { preloadedState: adminState });

    await waitFor(() => {
      const cards = document.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('renders within admin layout context (page renders successfully)', async () => {
    mockedAdminService.getCustomers.mockResolvedValue(mockCustomers);

    render(<AdminCustomersPage />, { preloadedState: adminState });

    await waitFor(() => {
      // Verify the page renders — admin layout handles role check at parent level
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});

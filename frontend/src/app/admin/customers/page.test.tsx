import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@/test-utils';
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
    pagination: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
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
    mockedAdminService.getCustomers.mockResolvedValue({
      data: mockCustomers,
      meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
    });

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: adminState });
    });

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
    mockedAdminService.getCustomers.mockResolvedValue({
      data: mockCustomers,
      meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
    });

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: adminState });
    });

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: /view/i });
      expect(viewButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows filter inputs for firstName, lastName, email, location, role, premium, and search', async () => {
    mockedAdminService.getCustomers.mockResolvedValue({
      data: mockCustomers,
      meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
    });

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: adminState });
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('First name...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last name...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email...')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by location')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by role')).toBeInTheDocument();
      expect(screen.getByLabelText('Minimum premium paid')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum premium paid')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search all...')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton when isLoading=true', async () => {
    mockedAdminService.getCustomers.mockReturnValue(new Promise(() => {}));

    const loadingState = {
      ...adminState,
      admin: {
        customers: [],
        pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
        selectedCustomer: null,
        isLoading: true,
        error: null,
      },
    };

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: loadingState });
    });

    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state "No customers match your search" when customers=[]', async () => {
    mockedAdminService.getCustomers.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
    });

    const emptyState = {
      ...adminState,
      admin: {
        customers: [],
        pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
        selectedCustomer: null,
        isLoading: false,
        error: null,
      },
    };

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: emptyState });
    });

    await waitFor(() => {
      expect(screen.getByText(/No customers found/i)).toBeInTheDocument();
    });
  });

  it('shows error alert with retry button on error state', async () => {
    mockedAdminService.getCustomers.mockRejectedValue(
      new Error('Failed to fetch customers')
    );

    const errorState = {
      ...adminState,
      admin: {
        customers: [],
        pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
        selectedCustomer: null,
        isLoading: false,
        error: null,
      },
    };

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: errorState });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch customers/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /retry/i })
    ).toBeInTheDocument();
  });

  it('renders mobile card view with customer cards', async () => {
    mockedAdminService.getCustomers.mockResolvedValue({
      data: mockCustomers,
      meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
    });

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: adminState });
    });

    await waitFor(() => {
      const cards = document.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('renders within admin layout context (page renders successfully)', async () => {
    mockedAdminService.getCustomers.mockResolvedValue({
      data: mockCustomers,
      meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
    });

    await act(async () => {
      render(<AdminCustomersPage />, { preloadedState: adminState });
    });

    await waitFor(() => {
      // Verify the page renders — admin layout handles role check at parent level
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});

describe('Premium Range Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Premium range presets', () => {
    it('renders preset buttons for premium ranges', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /under 500/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /500.*1,?000/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /1,?000.*5,?000/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /5,?000\+/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
      });
    });

    it('clicking "Under 500" sets premiumMax=500 and clears premiumMin', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        screen.getByRole('button', { name: /under 500/i }).click();
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        const maxInput = screen.getByLabelText('Maximum premium paid') as HTMLInputElement;
        expect(minInput.value).toBe('');
        expect(maxInput.value).toBe('500');
      });

      await waitFor(() => {
        expect(mockedAdminService.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ premiumMax: 500, page: 1, limit: 20 })
        );
      });
    });

    it('clicking "500–1,000" sets premiumMin=500 and premiumMax=1000', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        screen.getByRole('button', { name: /500.*1,?000/i }).click();
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        const maxInput = screen.getByLabelText('Maximum premium paid') as HTMLInputElement;
        expect(minInput.value).toBe('500');
        expect(maxInput.value).toBe('1000');
      });

      await waitFor(() => {
        expect(mockedAdminService.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ premiumMin: 500, premiumMax: 1000, page: 1, limit: 20 })
        );
      });
    });

    it('clicking "1,000–5,000" sets premiumMin=1000 and premiumMax=5000', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        screen.getByRole('button', { name: /1,?000.*5,?000/i }).click();
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        const maxInput = screen.getByLabelText('Maximum premium paid') as HTMLInputElement;
        expect(minInput.value).toBe('1000');
        expect(maxInput.value).toBe('5000');
      });

      await waitFor(() => {
        expect(mockedAdminService.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ premiumMin: 1000, premiumMax: 5000, page: 1, limit: 20 })
        );
      });
    });

    it('clicking "5,000+" sets premiumMin=5000 and clears premiumMax', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        screen.getByRole('button', { name: /5,?000\+/i }).click();
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        const maxInput = screen.getByLabelText('Maximum premium paid') as HTMLInputElement;
        expect(minInput.value).toBe('5000');
        expect(maxInput.value).toBe('');
      });

      await waitFor(() => {
        expect(mockedAdminService.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ premiumMin: 5000, page: 1, limit: 20 })
        );
      });
    });

    it('clicking "All" clears both premiumMin and premiumMax', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      // First set a range
      await waitFor(() => {
        screen.getByRole('button', { name: /500.*1,?000/i }).click();
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        expect(minInput.value).toBe('500');
      });

      // Then clear with "All"
      await act(async () => {
        screen.getByRole('button', { name: /^all$/i }).click();
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        const maxInput = screen.getByLabelText('Maximum premium paid') as HTMLInputElement;
        expect(minInput.value).toBe('');
        expect(maxInput.value).toBe('');
      });
    });

    it('preset buttons do not affect other filter inputs', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      // Set a firstName filter
      await waitFor(() => {
        const firstNameInput = screen.getByPlaceholderText('First name...');
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
      });

      // Click a preset
      await act(async () => {
        screen.getByRole('button', { name: /under 500/i }).click();
      });

      // Verify firstName is still set
      await waitFor(() => {
        const firstNameInput = screen.getByPlaceholderText('First name...') as HTMLInputElement;
        expect(firstNameInput.value).toBe('John');
      });
    });
  });

  describe('Premium range inputs', () => {
    it('renders premium inputs within a labeled "Premium Range" group', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        const premiumRangeLabel = screen.getByText(/premium range/i);
        expect(premiumRangeLabel).toBeInTheDocument();
      });
    });

    it('does not allow negative values in premium inputs', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid') as HTMLInputElement;
        const maxInput = screen.getByLabelText('Maximum premium paid') as HTMLInputElement;
        expect(minInput.min).toBe('0');
        expect(maxInput.min).toBe('0');
      });
    });

    it('typing in premiumMin input updates the filter and triggers fetch', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid');
        fireEvent.change(minInput, { target: { value: '1000' } });
      });

      await waitFor(() => {
        expect(mockedAdminService.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ premiumMin: 1000, page: 1, limit: 20 })
        );
      });
    });

    it('typing in premiumMax input updates the filter and triggers fetch', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        const maxInput = screen.getByLabelText('Maximum premium paid');
        fireEvent.change(maxInput, { target: { value: '5000' } });
      });

      await waitFor(() => {
        expect(mockedAdminService.getCustomers).toHaveBeenCalledWith(
          expect.objectContaining({ premiumMax: 5000, page: 1, limit: 20 })
        );
      });
    });
  });

  describe('Active premium badge', () => {
    it('shows premium range badge when premiumMin is set', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      // Set a premium min
      await waitFor(() => {
        const minInput = screen.getByLabelText('Minimum premium paid');
        fireEvent.change(minInput, { target: { value: '500' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/premium.*500/i)).toBeInTheDocument();
      });
    });

    it('shows premium range badge when premiumMax is set', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      // Set a premium max
      await waitFor(() => {
        const maxInput = screen.getByLabelText('Maximum premium paid');
        fireEvent.change(maxInput, { target: { value: '1000' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/premium.*1,?000/i)).toBeInTheDocument();
      });
    });

    it('shows formatted range badge when both premiumMin and premiumMax are set', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      // Use preset button to set both
      await waitFor(() => {
        screen.getByRole('button', { name: /500.*1,?000/i }).click();
      });

      await waitFor(() => {
        expect(screen.getByText(/premium.*500.*1,?000/i)).toBeInTheDocument();
      });
    });

    it('does not show premium badge when no premium filters are active', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      await waitFor(() => {
        const premiumBadges = screen.queryAllByText(/premium.*rm/i);
        expect(premiumBadges.length).toBe(0);
      });
    });

    it('badge disappears when premium range is cleared', async () => {
      mockedAdminService.getCustomers.mockResolvedValue({
        data: mockCustomers,
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      });

      await act(async () => {
        render(<AdminCustomersPage />, { preloadedState: adminState });
      });

      // Set a range
      await waitFor(() => {
        screen.getByRole('button', { name: /under 500/i }).click();
      });

      await waitFor(() => {
        expect(screen.getByText(/premium.*500/i)).toBeInTheDocument();
      });

      // Clear with "All"
      await act(async () => {
        screen.getByRole('button', { name: /^all$/i }).click();
      });

      await waitFor(() => {
        const premiumBadges = screen.queryAllByText(/premium.*rm/i);
        expect(premiumBadges.length).toBe(0);
      });
    });
  });
});
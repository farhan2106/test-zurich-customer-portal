import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import * as adminService from '@/services/admin.service';

// Mock the admin service
jest.mock('@/services/admin.service');
const mockedAdminService = adminService as jest.Mocked<typeof adminService>;

// Mock next/navigation
const mockUseParams = jest.fn(() => ({ id: 'usr_001' }));
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
  usePathname: jest.fn(() => '/admin/customers/usr_001'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: mockUseParams,
  redirect: mockRedirect,
}));

// Mock data
const mockCustomerDetail = {
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
  policies: [
    {
      id: 'pol_001',
      policyNumber: 'POL-001',
      status: 'active',
      premiumAmount: 500,
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      customerId: 'usr_001',
      productId: 'prod_001',
      location: 'West Malaysia',
    },
  ],
  claims: [
    {
      id: 'clm_001',
      claimNumber: 'CLM-001',
      type: 'accident',
      status: 'submitted',
      incidentDate: '2025-06-01',
      description: 'Test',
      policyId: 'pol_001',
      customerId: 'usr_001',
    },
  ],
};

const detailState = {
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
    customers: [],
    selectedCustomer: mockCustomerDetail,
    isLoading: false,
    error: null,
  },
};

// Import the page component
import AdminCustomerDetailPage from './page';

describe('Admin Customer Detail/Edit Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'usr_001' });
  });

  it('renders Profile tab content with firstName, lastName, email, location, premiumPaid, role', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('West Malaysia')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
      expect(screen.getByText('customer')).toBeInTheDocument();
    });
  });

  it('renders Policies tab with policy data in table', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      const policiesTab = screen.getByRole('tab', { name: /policies/i });

      await act(async () => {
        fireEvent.click(policiesTab);
      });

      expect(screen.getByText('POL-001')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  it('renders Claims tab with claim data in table', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      const claimsTab = screen.getByRole('tab', { name: /claims/i });

      await act(async () => {
        fireEvent.click(claimsTab);
      });

      expect(screen.getByText('CLM-001')).toBeInTheDocument();
      expect(screen.getByText('accident')).toBeInTheDocument();
      expect(screen.getByText('submitted')).toBeInTheDocument();
    });
  });

  it('shows "Edit" button that toggles edit mode', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    });

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  });

  it('in edit mode: shows input fields for firstName and lastName', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
    });

    const firstNameInput = screen.getByDisplayValue('John');
    expect(firstNameInput).toBeInTheDocument();

    const lastNameInput = screen.getByDisplayValue('Doe');
    expect(lastNameInput).toBeInTheDocument();
  });

  it('in edit mode: shows location dropdown', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
    });

    const locationSelect = screen.getByDisplayValue('West Malaysia');
    expect(locationSelect).toBeInTheDocument();
  });

  it('in edit mode: shows premiumPaid number input', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
    });

    const premiumInput = screen.getByDisplayValue('1500');
    expect(premiumInput).toBeInTheDocument();
    expect(premiumInput).toHaveAttribute('type', 'number');
  });

  it('in edit mode: email is read-only (not an editable input)', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
    });

    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    const emailInput = screen.queryByDisplayValue('john@example.com');
    expect(emailInput).not.toBeInTheDocument();
  });

  it('shows "Save Changes" and "Cancel" buttons in edit mode', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
    });

    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it('"Cancel" button reverts to view mode', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(async () => {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
    });

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    expect(screen.queryByDisplayValue('John')).not.toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('shows "Back to Customers" navigation link/button', async () => {
    mockedAdminService.getCustomerById.mockResolvedValue(mockCustomerDetail);

    await act(async () => {
      render(<AdminCustomerDetailPage />, { preloadedState: detailState });
    });

    await waitFor(() => {
      const backLink = screen.getByRole('link', {
        name: /back to customers/i,
      });

      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/admin/customers');
    });
  });

  it('shows loading state when isLoading=true', async () => {
    mockedAdminService.getCustomerById.mockReturnValue(new Promise(() => {}));

    const loadingState = {
      ...detailState,
      admin: {
        customers: [],
        selectedCustomer: null,
        isLoading: true,
        error: null,
      },
    };

    await act(async () => {
      render(<AdminCustomerDetailPage />, {
        preloadedState: loadingState,
      });
    });

    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error alert on error state', async () => {
    mockedAdminService.getCustomerById.mockRejectedValue(
      new Error('Failed to fetch customer')
    );

    const errorState = {
      ...detailState,
      admin: {
        customers: [],
        selectedCustomer: null,
        isLoading: false,
        error: null,
      },
    };

    await act(async () => {
      render(<AdminCustomerDetailPage />, {
        preloadedState: errorState,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch customer/i)
      ).toBeInTheDocument();
    });
  });
});

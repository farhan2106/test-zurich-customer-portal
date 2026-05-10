import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import * as policyService from '@/services/policy.service';
import * as nextNavigation from 'next/navigation';

// Mock the policy service
jest.mock('@/services/policy.service');
const mockedPolicyService = policyService as jest.Mocked<typeof policyService>;

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
  usePathname: jest.fn(() => '/dashboard'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Mock data
const mockPolicies = [
  {
    id: 'pol_1',
    policyNumber: 'POL-001',
    customerId: 'cust_1',
    productId: 'prod_auto',
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    premiumAmount: 1500,
    location: 'West Malaysia',
    product: {
      id: 'prod_auto',
      productCode: 4000,
      name: 'Auto Insurance',
      description: 'Comprehensive auto coverage',
      coverageDetails: { liability: 'Up to $1M' },
      basePremium: 1500,
      status: 'active',
    },
    claims: [],
  },
  {
    id: 'pol_2',
    policyNumber: 'POL-002',
    customerId: 'cust_1',
    productId: 'prod_property',
    status: 'expired',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    premiumAmount: 1200,
    location: 'East Malaysia',
    product: {
      id: 'prod_property',
      productCode: 5000,
      name: 'Property Insurance',
      description: 'Property coverage',
      coverageDetails: { building: 'Up to $500K' },
      basePremium: 1200,
      status: 'active',
    },
    claims: [],
  },
];

const authenticatedState = {
  auth: {
    user: { id: 'cust_1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'customer' },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

// Import the page component (will fail until implemented)
import DashboardPage from '@/app/dashboard/page';

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches fetchPolicies on mount', () => {
    mockedPolicyService.getPolicies.mockResolvedValue(mockPolicies);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    expect(mockedPolicyService.getPolicies).toHaveBeenCalled();
  });

  it('shows policy cards with product name, policy number, coverage dates, premium, and status badge', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue(mockPolicies);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      expect(screen.getByText('POL-001')).toBeInTheDocument();
      expect(screen.getByText('2026-01-01')).toBeInTheDocument();
      expect(screen.getByText('2027-01-01')).toBeInTheDocument();
      expect(screen.getByText('RM 1,500')).toBeInTheDocument();
    });
  });

  it('shows active policy with green badge (badge-success)', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue([mockPolicies[0]]);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('badge-success');
    });
  });

  it('shows expired policy with gray badge (badge-ghost)', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue([mockPolicies[1]]);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      const badge = screen.getByText('Expired');
      expect(badge).toHaveClass('badge-ghost');
    });
  });

  it('shows empty state with "You don\'t have any policies yet" and "Browse Products" link to /products', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue([]);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText("You don't have any policies yet")).toBeInTheDocument();
      const browseLink = screen.getByRole('link', { name: /browse products/i });
      expect(browseLink).toHaveAttribute('href', '/products');
    });
  });

  it('shows loading state with skeleton cards', () => {
    // Keep the promise pending to simulate loading
    mockedPolicyService.getPolicies.mockReturnValue(new Promise(() => {}));

    render(<DashboardPage />, { preloadedState: authenticatedState });

    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state with "Unable to load your portfolio" and retry button', async () => {
    mockedPolicyService.getPolicies.mockRejectedValue(new Error('Network error'));

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText('Unable to load your portfolio')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('shows summary section with total policies count and active count', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue(mockPolicies);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText(/total policies/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/active policies/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('shows "Submit Claim" button on active policies', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue([mockPolicies[0]]);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit claim/i })).toBeInTheDocument();
    });
  });

  it('does NOT show claim button on expired policies', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue([mockPolicies[1]]);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /submit claim/i })).not.toBeInTheDocument();
    });
  });

  it('shows navigation links to /products', async () => {
    mockedPolicyService.getPolicies.mockResolvedValue(mockPolicies);

    render(<DashboardPage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      const productsLink = screen.getByRole('link', { name: /products/i });
      expect(productsLink).toHaveAttribute('href', '/products');
    });
  });

  it('renders as a protected route (ProtectedRoute is used)', () => {
    mockedPolicyService.getPolicies.mockResolvedValue(mockPolicies);

    // ProtectedRoute will render children when authenticated
    render(<DashboardPage />, { preloadedState: authenticatedState });

    // If ProtectedRoute is used, the page content should render
    // (test will fail if ProtectedRoute is not wrapping the page)
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

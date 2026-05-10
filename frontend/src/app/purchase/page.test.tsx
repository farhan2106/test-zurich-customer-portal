import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import * as policyService from '@/services/policy.service';
jest.mock('@/services/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import apiClient from '@/services/api-client';
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
  usePathname: jest.fn(() => '/purchase'),
  useSearchParams: jest.fn(() => new URLSearchParams({ productId: 'prod_auto' })),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Mock data
const mockProduct = {
  id: 'prod_auto',
  productCode: 4000,
  name: 'Auto Insurance',
  description: 'Comprehensive auto coverage',
  coverageDetails: { liability: 'Up to $1M' },
  basePremium: 1500,
  status: 'active',
};

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
import PurchasePage from '@/app/purchase/page';

describe('Purchase Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockProduct });
    mockedPolicyService.purchasePolicy.mockResolvedValue(mockPolicies[0]);
  });

  it('shows progress steps indicator with 3 steps', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    // At Step 1, the first step should have step-primary
    const steps = screen.getAllByRole('listitem');
    // Just verify the steps exist
    expect(steps.length).toBe(3);
  });

  it('Step 1 (Confirm): shows product info, customer details from Redux, estimated premium, and "Continue to Review" button', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/RM 1,500/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
  });

  it('Step 2 (Review): after clicking Continue, shows order summary table, terms checkbox, "Confirm Purchase" and "Back" buttons', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      expect(screen.getByText(/order summary/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /terms/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm purchase/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('Step 3 (Success): after confirming, shows success message with policy number, "View My Portfolio" link to /dashboard, and "Browse More Products" link to /products', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      // Check terms to enable Confirm Purchase
      fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
    });

    // Confirm purchase
    fireEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    await waitFor(() => {
      expect(screen.getByText(/purchase successful/i)).toBeInTheDocument();
      expect(screen.getByText('POL-001')).toBeInTheDocument();
      // Check the checkmark emoji or visual indicator
      expect(screen.getByText(/✅/)).toBeInTheDocument();
      const dashboardLink = screen.getByRole('link', { name: /view my portfolio/i });
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      const productsLink = screen.getByRole('link', { name: /browse more products/i });
      expect(productsLink).toHaveAttribute('href', '/products');
    });
  });

  it('Step 1: Back button is not visible on step 1', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });
  });

  it('Step 2: "Back" button returns to step 1', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    // Go back to step 1
    fireEvent.click(screen.getByRole('button', { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /confirm purchase/i })).not.toBeInTheDocument();
    });
  });

  it('shows loading state on purchase: button shows spinner and is disabled', async () => {
    // Simulate a slow purchase to test loading state
    mockedPolicyService.purchasePolicy.mockReturnValue(new Promise(() => {}));

    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
    });

    // Click confirm purchase
    fireEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm purchase/i });
      expect(confirmButton).toBeDisabled();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
    });
  });

  it('shows error state: red alert banner with error message and "Try Again" button', async () => {
    mockedPolicyService.purchasePolicy.mockRejectedValue(new Error('Payment processing failed'));

    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
    });

    // Click confirm purchase
    fireEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    await waitFor(() => {
      expect(screen.getByText(/payment processing failed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      const backLink = screen.getByRole('link', { name: /back to products/i });
      expect(backLink).toHaveAttribute('href', '/products');
    });
  });

  it('shows 409 duplicate policy error from API', async () => {
    const duplicateError = new Error('You already have an active policy for this product');
    (duplicateError as any).response = { status: 409 };
    mockedPolicyService.purchasePolicy.mockRejectedValue(duplicateError);

    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
    });

    // Click confirm purchase
    fireEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    await waitFor(() => {
      expect(screen.getByText(/already have an active policy/i)).toBeInTheDocument();
      // The error message should be in an alert banner (CSS class, not role)
      const errorBanner = screen.getByText(/already have an active policy/i).closest('.alert');
      expect(errorBanner).toBeInTheDocument();
      expect(errorBanner).toHaveClass('alert-error');
    });
  });

  it('terms checkbox must be checked before "Confirm Purchase" button is enabled', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Go to step 2
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm purchase/i });
      expect(confirmButton).toBeDisabled();

      // Check terms
      fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm purchase/i });
      expect(confirmButton).not.toBeDisabled();
    });
  });

  it('renders as a protected route', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  it('fetches product info via API client on mount (apiClient.get("/products/prod_auto"))', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(apiClient.get as jest.Mock).toHaveBeenCalledWith('/products/prod_auto');
    });
  });

  it('shows premium from product data', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    await waitFor(() => {
      expect(screen.getByText(/RM 1,500/)).toBeInTheDocument();
    });
  });

  it('complete purchase flow: Step 1 → Step 2 → Step 3 with success', async () => {
    render(<PurchasePage />, { preloadedState: authenticatedState });

    // Verify Step 1
    await waitFor(() => {
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to review/i })).toBeInTheDocument();
    });

    // Go to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      expect(screen.getByText(/order summary/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
    });

    // Go to Step 3
    fireEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    await waitFor(() => {
      expect(screen.getByText(/purchase successful/i)).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, waitFor, act } from '@/test-utils';
import * as claimService from '@/services/claim.service';

// Mock the claim service
jest.mock('@/services/claim.service');
const mockedClaimService = claimService as jest.Mocked<typeof claimService>;

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockRefresh = jest.fn();
const mockPrefetch = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  })),
  usePathname: jest.fn(() => '/claims/clm_1'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({ id: 'clm_1' })),
  redirect: jest.fn(),
}));

// Mock data
const mockClaim = {
  id: 'clm_1',
  claimNumber: 'CLM-2024-001',
  type: 'Accident',
  policyId: 'pol_1',
  policyNumber: 'POL-2024-001',
  status: 'submitted',
  incidentDate: '2024-06-15',
  description: 'Car accident on highway involving two vehicles',
  incidentLocation: 'Kuala Lumpur, Malaysia',
  submittedAt: '2024-06-16T10:00:00Z',
};

const authenticatedState = {
  auth: {
    user: {
      id: 'usr_1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
    },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
  policy: {
    items: [
      {
        id: 'pol_1',
        policyNumber: 'POL-2024-001',
        customerId: 'usr_1',
        productId: 'prod_1',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        premiumAmount: 500,
        location: 'Kuala Lumpur',
        product: {
          id: 'prod_1',
          productCode: 101,
          name: 'Auto Insurance',
          description: 'Comprehensive auto coverage',
          coverageDetails: {},
          basePremium: 500,
          status: 'active',
        },
      },
    ],
    isLoading: false,
    error: null,
  },
  claim: {
    items: [mockClaim],
    isLoading: false,
    error: null,
  },
};

// Import the page component
import ClaimDetailPage from '@/app/claims/[id]/page';

describe('Claim Detail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedClaimService.getClaimById.mockResolvedValue(mockClaim);
  });

  it('renders claim detail with claim number heading', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByRole('heading', { name: /CLM-2024-001/i })
    ).toBeInTheDocument();
  });

  it('shows claim type and status badge', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(screen.getByText('Accident')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('shows policy number with link to policy detail', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    const policyLink = screen.getByRole('link', { name: /POL-2024-001/i });
    expect(policyLink).toBeInTheDocument();
    expect(policyLink).toHaveAttribute('href', '/policies/pol_1');
  });

  it('shows description text', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByText('Car accident on highway involving two vehicles')
    ).toBeInTheDocument();
  });

  it('shows incident date formatted', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(screen.getByText(/june 15, 2024/i)).toBeInTheDocument();
  });

  it('shows incident location (when present)', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(screen.getByText('Kuala Lumpur, Malaysia')).toBeInTheDocument();
  });

  it('shows submission date', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByText('Submitted On', { selector: 'span' })
        .closest('div')
        ?.querySelector('p')
    ).toHaveTextContent(/june 16, 2024/i);
  });

  it('shows status timeline section', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByText(/status history/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/claim submitted/i)
    ).toBeInTheDocument();
  });

  it('shows "Back to Claims" link', async () => {
    await act(async () => {
      render(<ClaimDetailPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByRole('link', { name: /back to claims/i })
    ).toBeInTheDocument();
  });

  it('shows skeleton loader when isLoading=true', async () => {
    mockedClaimService.getClaimById.mockReturnValue(new Promise(() => {}));

    render(<ClaimDetailPage />, {
      preloadedState: {
        ...authenticatedState,
        claim: {
          items: [],
          isLoading: true,
          error: null,
        },
      },
    });

    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Claim not found" error state when fetchClaimById.rejected', async () => {
    mockedClaimService.getClaimById.mockRejectedValue(
      new Error('Claim not found')
    );

    await act(async () => {
      render(<ClaimDetailPage />, {
        preloadedState: {
          ...authenticatedState,
          claim: {
            items: [],
            isLoading: false,
            error: null,
          },
        },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/claim not found/i)
      ).toBeInTheDocument();
    });
  });

  it('shows retry button in error state', async () => {
    mockedClaimService.getClaimById.mockRejectedValue(
      new Error('Claim not found')
    );

    await act(async () => {
      render(<ClaimDetailPage />, {
        preloadedState: {
          ...authenticatedState,
          claim: {
            items: [],
            isLoading: false,
            error: null,
          },
        },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /retry/i })
      ).toBeInTheDocument();
    });
  });
});

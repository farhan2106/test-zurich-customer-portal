import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import * as claimService from '@/services/claim.service';

// Mock the claim service
jest.mock('@/services/claim.service');
const mockedClaimService = claimService as jest.Mocked<typeof claimService>;

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
  usePathname: jest.fn(() => '/claims'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Mock data
const mockClaims = [
  {
    id: 'clm_1',
    claimNumber: 'CLM-2024-001',
    type: 'auto',
    policyNumber: 'POL-2024-001',
    status: 'submitted',
    incidentDate: '2024-06-15',
    description: 'Car accident on highway',
    incidentLocation: 'Kuala Lumpur, Malaysia',
    submittedAt: '2024-06-16T10:00:00Z',
  },
  {
    id: 'clm_2',
    claimNumber: 'CLM-2024-002',
    type: 'property',
    policyNumber: 'POL-2024-002',
    status: 'under_review',
    incidentDate: '2024-07-20',
    description: 'Water damage from burst pipe',
    incidentLocation: 'Penang, Malaysia',
    submittedAt: '2024-07-21T14:30:00Z',
  },
];

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
};

// Import the page component
import ClaimsPage from '@/app/claims/page';

describe('Claims List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Submit New Claim" button', async () => {
    mockedClaimService.getClaims.mockResolvedValue([]);

    await act(async () => {
      render(<ClaimsPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByRole('link', { name: /submit new claim/i })
    ).toBeInTheDocument();
  });

  it('shows loading spinner/skeleton when isLoading=true', () => {
    mockedClaimService.getClaims.mockReturnValue(new Promise(() => {}));

    render(<ClaimsPage />, {
      preloadedState: {
        ...authenticatedState,
        claim: {
          items: [],
          isLoading: true,
          error: null,
        },
      },
    });

    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders claim cards when items populated', async () => {
    mockedClaimService.getClaims.mockResolvedValue(mockClaims);

    await act(async () => {
      render(<ClaimsPage />, { preloadedState: authenticatedState });
    });

    // First claim card
    expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('POL-2024-001')).toBeInTheDocument();

    // Second claim card
    expect(screen.getByText('CLM-2024-002')).toBeInTheDocument();
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('POL-2024-002')).toBeInTheDocument();
  });

  it('each card shows claim number, type, policy number, status badge, and View Details link', async () => {
    mockedClaimService.getClaims.mockResolvedValue([mockClaims[0]]);

    await act(async () => {
      render(<ClaimsPage />, { preloadedState: authenticatedState });
    });

    expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('POL-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument();
  });

  it('shows empty state when items=[] and isLoading=false', async () => {
    mockedClaimService.getClaims.mockResolvedValue([]);

    await act(async () => {
      render(<ClaimsPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByText(/you haven't submitted any claims yet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /submit a claim/i })
    ).toBeInTheDocument();
  });

  it('shows error alert when error is set with Retry button', async () => {
    mockedClaimService.getClaims.mockRejectedValue(
      new Error('Network error')
    );

    await act(async () => {
      render(<ClaimsPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByText(/unable to load claims/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry/i })
    ).toBeInTheDocument();
  });

  describe('status badge Daisy UI classes', () => {
    it('submitted status has badge-info class', async () => {
      mockedClaimService.getClaims.mockResolvedValue([
        { ...mockClaims[0], status: 'submitted' },
      ]);

      await act(async () => {
        render(<ClaimsPage />, { preloadedState: authenticatedState });
      });

      const badge = screen.getByText('Submitted');
      expect(badge).toHaveClass('badge-info');
    });

    it('under_review status has badge-warning class', async () => {
      mockedClaimService.getClaims.mockResolvedValue([
        { ...mockClaims[0], status: 'under_review' },
      ]);

      await act(async () => {
        render(<ClaimsPage />, { preloadedState: authenticatedState });
      });

      const badge = screen.getByText('Under Review');
      expect(badge).toHaveClass('badge-warning');
    });

    it('approved status has badge-success class', async () => {
      mockedClaimService.getClaims.mockResolvedValue([
        { ...mockClaims[0], status: 'approved' },
      ]);

      await act(async () => {
        render(<ClaimsPage />, { preloadedState: authenticatedState });
      });

      const badge = screen.getByText('Approved');
      expect(badge).toHaveClass('badge-success');
    });

    it('rejected status has badge-error class', async () => {
      mockedClaimService.getClaims.mockResolvedValue([
        { ...mockClaims[0], status: 'rejected' },
      ]);

      await act(async () => {
        render(<ClaimsPage />, { preloadedState: authenticatedState });
      });

      const badge = screen.getByText('Rejected');
      expect(badge).toHaveClass('badge-error');
    });
  });
});

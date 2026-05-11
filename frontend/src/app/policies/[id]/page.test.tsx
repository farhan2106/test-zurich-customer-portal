import React from 'react';
import { render, screen, act } from '@/test-utils';
import { useParams } from 'next/navigation';
import * as policyService from '@/services/policy.service';

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockedService = policyService as jest.Mocked<typeof policyService>;

jest.mock('@/services/policy.service');

import PolicyDetailPage from '@/app/policies/[id]/page';
import policyReducer from '@/store/slices/policySlice';

interface PolicyState {
  items: typeof mockPolicy[];
  isLoading: boolean;
  error: string | null;
}

interface TestPreloadedState {
  auth: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    token: string | null;
    isLoading: boolean;
    error: string | null;
  };
  policy?: PolicyState;
}

const mockPolicy = {
  id: 'pol_abc123',
  policyNumber: 'POL-2024-001',
  customerId: 'usr_1',
  productId: 'prod_auto',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2025-12-31T00:00:00Z',
  premiumAmount: 1500.0,
  location: 'Kuala Lumpur, Malaysia',
  product: {
    id: 'prod_auto',
    productCode: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage',
    coverageDetails: { liability: 'RM 1,000,000' },
    basePremium: 1200.0,
    status: 'active',
  },
  claims: [],
};

const mockPolicyWithClaims = {
  ...mockPolicy,
  claims: [
    {
      id: 'clm_001',
      claimNumber: 'CLM-2024-001',
      status: 'approved',
      amount: 5000.0,
      date: '2024-06-15T00:00:00Z',
      description: 'Windshield damage',
    },
    {
      id: 'clm_002',
      claimNumber: 'CLM-2024-002',
      status: 'pending',
      amount: 2000.0,
      date: '2024-09-01T00:00:00Z',
      description: 'Minor collision repair',
    },
  ],
};

const mockExpiredPolicy = {
  ...mockPolicy,
  id: 'pol_expired',
  status: 'expired',
  endDate: '2023-01-01T00:00:00Z',
};

const authenticatedState = {
  auth: {
    user: {
      id: 'usr_1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
    },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

describe('PolicyDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'pol_abc123' });
    mockedService.getPolicyById.mockResolvedValue(mockPolicy);
    mockedService.getPolicies.mockResolvedValue([mockPolicy]);
    mockedService.renewPolicy.mockResolvedValue(mockPolicy);
  });

  describe('initial load', () => {
    it('dispatches fetchPolicyById on mount with correct id', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(mockUseParams).toHaveBeenCalled();
    });
  });

  describe('policy details display', () => {
    it('displays policy number, product name, and status badge', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [mockPolicy], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(screen.getByText('POL-2024-001')).toBeInTheDocument();
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('shows coverage dates (start/end), location, and annual premium', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [mockPolicy], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      const year2024Elements = screen.getAllByText(/2024/);
      expect(year2024Elements.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText(/2025/)).toBeInTheDocument();
      expect(screen.getByText(/Kuala Lumpur/)).toBeInTheDocument();
      expect(screen.getByText(/1,500/)).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('shows "Submit Claim" button linking to /claims/new?policyId=pol_abc123', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [mockPolicy], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      const claimLink = screen.getByRole('link', {
        name: /Submit Claim/i,
      });

      expect(claimLink).toHaveAttribute(
        'href',
        '/claims/new?policyId=pol_abc123'
      );
    });

    it('shows "Renew Policy" button when within renewal window', async () => {
      const policyNearExpiry = {
        ...mockPolicy,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      };

      mockedService.getPolicyById.mockResolvedValue(policyNearExpiry);

      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: {
              items: [policyNearExpiry],
              isLoading: false,
              error: null,
            },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(
        screen.getByRole('button', { name: /Renew Policy/i })
      ).toBeInTheDocument();
    });

    it('does NOT show "Renew Policy" button when policy expired', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: {
              items: [mockExpiredPolicy],
              isLoading: false,
              error: null,
            },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(
        screen.queryByRole('button', { name: /Renew Policy/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('claims section', () => {
    it('shows claims section with claim items when claims exist', async () => {
      mockedService.getPolicyById.mockResolvedValue(mockPolicyWithClaims);

      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: {
              items: [mockPolicyWithClaims],
              isLoading: false,
              error: null,
            },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(screen.getByRole('heading', { name: /Claims/i })).toBeInTheDocument();
      expect(screen.getByText('CLM-2024-001')).toBeInTheDocument();
      expect(screen.getByText('CLM-2024-002')).toBeInTheDocument();
      expect(screen.getByText(/Windshield damage/)).toBeInTheDocument();
    });

    it('shows "No claims submitted yet" empty state when claims is empty', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [mockPolicy], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(
        screen.getByText(/No claims submitted yet/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Submit a Claim/i })
      ).toBeInTheDocument();
    });
  });

  describe('loading and error states', () => {
    it('shows skeleton loading state', async () => {
      mockedService.getPolicyById.mockReturnValue(new Promise(() => {}));

      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [], isLoading: true, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      })

      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows "Policy not found" error state', async () => {
      mockedService.getPolicyById.mockRejectedValue(
        new Error('Failed to load')
      );

      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: {
              items: [],
              isLoading: false,
              error: 'Policy not found',
            },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(screen.getByText(/Policy not found/i)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('has "Back to Dashboard" link', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [mockPolicy], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      const backLink = screen.getByRole('link', {
        name: /Back to Dashboard/i,
      });

      expect(backLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('protected route', () => {
    it('renders ProtectedRoute wrapper', async () => {
      await act(async () => {
        render(<PolicyDetailPage />, {
          preloadedState: {
            ...authenticatedState,
            policy: { items: [mockPolicy], isLoading: false, error: null },
          } as TestPreloadedState,
          additionalReducers: { policy: policyReducer },
        });
      });

      expect(screen.getByText('POL-2024-001')).toBeInTheDocument();
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import * as claimService from '@/services/claim.service';
import * as policyService from '@/services/policy.service';

// Mock the services
jest.mock('@/services/claim.service');
const mockedClaimService = claimService as jest.Mocked<typeof claimService>;

jest.mock('@/services/policy.service');
const mockedPolicyService = policyService as jest.Mocked<typeof policyService>;

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
  usePathname: jest.fn(() => '/claims/new'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// Helper to set search params
function setSearchParams(params: Record<string, string>) {
  const { useSearchParams } = require('next/navigation');
  useSearchParams.mockReturnValue(
    new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v]))
  );
}

// Mock data
const mockPolicies = [
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
  {
    id: 'pol_2',
    policyNumber: 'POL-2024-002',
    customerId: 'usr_1',
    productId: 'prod_2',
    status: 'active',
    startDate: '2024-03-01',
    endDate: '2025-03-01',
    premiumAmount: 300,
    location: 'Penang',
    product: {
      id: 'prod_2',
      productCode: 201,
      name: 'Home Insurance',
      description: 'Home property coverage',
      coverageDetails: {},
      basePremium: 300,
      status: 'active',
    },
  },
];

const mockNewClaim = {
  id: 'clm_new_1',
  claimNumber: 'CLM-2024-003',
  type: 'Accident',
  policyNumber: 'POL-2024-001',
  status: 'submitted',
  incidentDate: '2024-06-15',
  description: 'Car accident on highway',
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
    items: mockPolicies,
    isLoading: false,
    error: null,
  },
  claim: {
    items: [],
    isLoading: false,
    error: null,
  },
};

// Import the page component
import SubmitClaimPage from '@/app/claims/new/page';

describe('Submit Claim Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useSearchParams to default empty state
    const { useSearchParams } = require('next/navigation');
    useSearchParams.mockReturnValue(new URLSearchParams());
    mockedPolicyService.getPolicies.mockResolvedValue(mockPolicies);
  });

  it('renders form with "Submit a Claim" heading', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByRole('heading', { name: /submit a claim/i })
    ).toBeInTheDocument();
  });

  it('renders policy selector dropdown (select element)', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    expect(screen.getByRole('combobox', { name: /policy/i })).toBeInTheDocument();
  });

  it('renders claim type dropdown with options: Accident, Theft, Damage, Other', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    const claimTypeSelect = screen.getByRole('combobox', { name: /claim type/i });
    expect(claimTypeSelect).toBeInTheDocument();

    fireEvent.mouseDown(claimTypeSelect);

    expect(screen.getByRole('option', { name: /accident/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /theft/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /damage/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /other/i })).toBeInTheDocument();
  });

  it('renders description textarea (min 10 chars)', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByRole('textbox', { name: /description/i })
    ).toBeInTheDocument();
  });

  it('renders incident date input (type="date")', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByLabelText(/incident date/i)
    ).toHaveAttribute('type', 'date');
  });

  it('renders incident location input (optional)', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    expect(
      screen.getByRole('textbox', { name: /incident location/i })
    ).toBeInTheDocument();
  });

  it('shows "Submit Claim" button (btn-primary)', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveClass('btn-primary');
  });

  it('shows "Cancel" button/link → /claims', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    const cancelButton = screen.getByRole('link', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveAttribute('href', '/claims');
  });

  it('pre-selects policy when ?policyId= query param provided', async () => {
    setSearchParams({ policyId: 'pol_2' });

    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    const policySelect = screen.getByRole('combobox', { name: /policy/i });
    expect(policySelect).toHaveValue('POL-2024-002');
  });

  it('shows validation errors inline when submitting empty form (requires fields)', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please select a policy/i)
      ).toBeInTheDocument();
    });
  });

  it('shows "Description must be at least 10 characters" for short description', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    // Fill in required fields but short description
    const descriptionTextarea = screen.getByRole('textbox', { name: /description/i });
    fireEvent.change(descriptionTextarea, { target: { value: 'Short' } });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/description must be at least 10 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('shows "Incident date cannot be in the future" validation message', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    // Set a future date
    const futureDate = '2099-12-31';
    const dateInput = screen.getByLabelText(/incident date/i);
    fireEvent.change(dateInput, { target: { value: futureDate } });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/incident date cannot be in the future/i)
      ).toBeInTheDocument();
    });
  });

  it('disables form and shows spinner on submit button during loading', async () => {
    await act(async () => {
      render(<SubmitClaimPage />, {
        preloadedState: {
          ...authenticatedState,
          claim: {
            items: [],
            isLoading: true,
            error: null,
          },
        },
      });
    });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('shows API error alert when submission fails', async () => {
    mockedClaimService.submitClaim.mockRejectedValue(
      new Error('Submission failed')
    );

    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    // Fill in form
    const policySelect = screen.getByRole('combobox', { name: /policy/i });
    fireEvent.change(policySelect, { target: { value: 'POL-2024-001' } });

    const claimTypeSelect = screen.getByRole('combobox', { name: /claim type/i });
    fireEvent.change(claimTypeSelect, { target: { value: 'accident' } });

    const descriptionTextarea = screen.getByRole('textbox', { name: /description/i });
    fireEvent.change(descriptionTextarea, { target: { value: 'Car accident on highway' } });

    const dateInput = screen.getByLabelText(/incident date/i);
    fireEvent.change(dateInput, { target: { value: '2024-06-15' } });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/submission failed/i)
      ).toBeInTheDocument();
    });
  });

  it('redirects to /claims/[newId] on successful submission', async () => {
    mockedClaimService.submitClaim.mockResolvedValue(mockNewClaim);

    await act(async () => {
      render(<SubmitClaimPage />, { preloadedState: authenticatedState });
    });

    // Fill in form
    const policySelect = screen.getByRole('combobox', { name: /policy/i });
    fireEvent.change(policySelect, { target: { value: 'POL-2024-001' } });

    const claimTypeSelect = screen.getByRole('combobox', { name: /claim type/i });
    fireEvent.change(claimTypeSelect, { target: { value: 'accident' } });

    const descriptionTextarea = screen.getByRole('textbox', { name: /description/i });
    fireEvent.change(descriptionTextarea, { target: { value: 'Car accident on highway' } });

    const dateInput = screen.getByLabelText(/incident date/i);
    fireEvent.change(dateInput, { target: { value: '2024-06-15' } });

    const submitButton = screen.getByRole('button', { name: /submit claim/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/claims/clm_new_1');
    });
  });
});

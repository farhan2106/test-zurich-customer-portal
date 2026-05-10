import { configureStore } from '@reduxjs/toolkit';
import claimReducer, {
  fetchClaims,
  fetchClaimById,
  submitClaim,
  selectAllClaims,
  selectClaimById,
  selectClaimLoadingState,
} from './claimSlice';

jest.mock('@/services/claim.service', () => ({
  getClaims: jest.fn(),
  getClaimById: jest.fn(),
  submitClaim: jest.fn(),
}));

const createTestStore = () =>
  configureStore({
    reducer: { claim: claimReducer },
  });

const mockClaim = {
  id: 'clm_abc123',
  claimNumber: 'CLM-2024-001',
  type: 'auto',
  policyNumber: 'POL-2024-001',
  status: 'submitted',
  incidentDate: '2024-06-15',
  description: 'Car accident on highway',
  incidentLocation: 'Kuala Lumpur, Malaysia',
  submittedAt: '2024-06-16T10:00:00Z',
};

const mockClaim2 = {
  id: 'clm_def456',
  claimNumber: 'CLM-2024-002',
  type: 'property',
  policyNumber: 'POL-2024-002',
  status: 'under_review',
  incidentDate: '2024-07-20',
  description: 'Water damage from burst pipe',
  incidentLocation: 'Penang, Malaysia',
  submittedAt: '2024-07-21T14:30:00Z',
};

describe('claimSlice', () => {
  describe('initial state', () => {
    it('should have initial state { items: [], isLoading: false, error: null }', () => {
      const store = createTestStore();
      expect(store.getState().claim).toEqual({
        items: [],
        isLoading: false,
        error: null,
      });
    });
  });

  describe('fetchClaims', () => {
    it('sets isLoading: true and error: null on pending', () => {
      const store = createTestStore();

      store.dispatch(fetchClaims.pending('req-1'));

      const state = store.getState().claim;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets items to payload and isLoading: false on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(fetchClaims.pending('req-1'));

      store.dispatch(
        fetchClaims.fulfilled([mockClaim, mockClaim2], 'req-1', undefined)
      );

      const state = store.getState().claim;
      expect(state.items).toEqual([mockClaim, mockClaim2]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();
      store.dispatch(fetchClaims.pending('req-1'));

      store.dispatch(
        fetchClaims.rejected(
          new Error('Failed to fetch'),
          'req-1',
          undefined,
          undefined
        )
      );

      const state = store.getState().claim;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('fetchClaimById', () => {
    it('sets isLoading: true on pending', () => {
      const store = createTestStore();

      store.dispatch(fetchClaimById.pending('req-2', 'clm_abc123'));

      expect(store.getState().claim.isLoading).toBe(true);
    });

    it('adds or updates single claim in items array on fulfilled', () => {
      const store = createTestStore();
      // Pre-populate with one claim
      store.dispatch(
        fetchClaims.fulfilled([mockClaim2], 'req-1', undefined)
      );

      store.dispatch(
        fetchClaimById.fulfilled(mockClaim, 'req-2', 'clm_abc123')
      );

      const state = store.getState().claim;
      expect(state.items).toHaveLength(2);
      expect(state.items.find((c) => c.id === 'clm_abc123')).toEqual(mockClaim);
      expect(state.items.find((c) => c.id === 'clm_def456')).toEqual(mockClaim2);
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();

      store.dispatch(
        fetchClaimById.rejected(
          new Error('Claim not found'),
          'req-2',
          'clm_nonexistent'
        )
      );

      const state = store.getState().claim;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Claim not found');
    });
  });

  describe('submitClaim', () => {
    it('adds new claim to items on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(
        fetchClaims.fulfilled([mockClaim], 'req-1', undefined)
      );

      const newClaim = {
        ...mockClaim,
        id: 'clm_new',
        claimNumber: 'CLM-2024-003',
      };
      store.dispatch(
        submitClaim.fulfilled(newClaim, 'req-3', {
          type: 'auto',
          policyNumber: 'POL-001',
          incidentDate: '2024-08-01',
          description: 'New claim',
          incidentLocation: 'Johor',
        })
      );

      const state = store.getState().claim;
      expect(state.items).toHaveLength(2);
      expect(state.items.find((c) => c.id === 'clm_new')).toEqual(newClaim);
    });

    it('sets error on rejected', () => {
      const store = createTestStore();
      store.dispatch(
        submitClaim.rejected(
          new Error('Submission failed'),
          'request-id',
          {
            type: 'auto',
            policyNumber: 'POL-001',
            incidentDate: '2024-08-01',
            description: 'New claim',
            incidentLocation: 'Johor',
          }
        )
      );
      expect(store.getState().claim.error).toBeTruthy();
      expect(store.getState().claim.items).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    it('selectAllClaims returns all items', () => {
      const store = configureStore({
        reducer: { claim: claimReducer },
        preloadedState: {
          claim: {
            items: [mockClaim, mockClaim2],
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectAllClaims(store.getState())).toEqual([
        mockClaim,
        mockClaim2,
      ]);
    });

    it('selectClaimById returns matching claim or undefined', () => {
      const store = configureStore({
        reducer: { claim: claimReducer },
        preloadedState: {
          claim: {
            items: [mockClaim, mockClaim2],
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectClaimById(store.getState(), 'clm_abc123')).toEqual(
        mockClaim
      );
      expect(selectClaimById(store.getState(), 'nonexistent')).toBeUndefined();
    });

    it('selectClaimLoadingState returns { isLoading, error }', () => {
      const store = configureStore({
        reducer: { claim: claimReducer },
        preloadedState: {
          claim: {
            items: [],
            isLoading: true,
            error: 'Something went wrong',
          },
        },
      });

      const loadingState = selectClaimLoadingState(store.getState());
      expect(loadingState).toEqual({
        isLoading: true,
        error: 'Something went wrong',
      });
    });
  });
});

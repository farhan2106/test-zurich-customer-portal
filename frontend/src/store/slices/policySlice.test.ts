import { configureStore } from '@reduxjs/toolkit';
import policyReducer, {
  fetchPolicies,
  fetchPolicyById,
  purchasePolicy,
  renewPolicy,
  selectAllPolicies,
  selectPolicyById,
  selectPolicyLoadingState,
} from './policySlice';

jest.mock('@/services/policy.service', () => ({
  getPolicies: jest.fn(),
  getPolicyById: jest.fn(),
  purchasePolicy: jest.fn(),
  renewPolicy: jest.fn(),
}));

const createTestStore = () =>
  configureStore({
    reducer: { policy: policyReducer },
  });

const mockPolicy = {
  id: 'pol_abc123',
  policyNumber: 'POL-2024-001',
  customerId: 'usr_1',
  productId: 'prod_auto',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2025-01-01T00:00:00Z',
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

const mockPolicy2 = {
  id: 'pol_def456',
  policyNumber: 'POL-2024-002',
  customerId: 'usr_1',
  productId: 'prop_home',
  status: 'active',
  startDate: '2024-06-01T00:00:00Z',
  endDate: '2025-06-01T00:00:00Z',
  premiumAmount: 2200.0,
  location: 'Penang, Malaysia',
  product: {
    id: 'prop_home',
    productCode: 5000,
    name: 'Property Insurance',
    description: 'Home protection plan',
    coverageDetails: { fire: 'RM 500,000' },
    basePremium: 1800.0,
    status: 'active',
  },
  claims: [],
};

describe('policySlice', () => {
  describe('initial state', () => {
    it('should have initial state { items: [], isLoading: false, error: null }', () => {
      const store = createTestStore();
      expect(store.getState().policy).toEqual({
        items: [],
        isLoading: false,
        error: null,
      });
    });
  });

  describe('fetchPolicies', () => {
    it('sets isLoading: true and error: null on pending', () => {
      const store = createTestStore();

      store.dispatch(fetchPolicies.pending('req-1'));

      const state = store.getState().policy;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets items to payload and isLoading: false on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(fetchPolicies.pending('req-1'));

      store.dispatch(
        fetchPolicies.fulfilled([mockPolicy, mockPolicy2], 'req-1', undefined)
      );

      const state = store.getState().policy;
      expect(state.items).toEqual([mockPolicy, mockPolicy2]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();
      store.dispatch(fetchPolicies.pending('req-1'));

      store.dispatch(
        fetchPolicies.rejected(
          new Error('Failed to fetch'),
          'req-1',
          undefined,
          undefined
        )
      );

      const state = store.getState().policy;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('fetchPolicyById', () => {
    it('sets isLoading: true on pending', () => {
      const store = createTestStore();

      store.dispatch(fetchPolicyById.pending('req-2', 'pol_abc123'));

      expect(store.getState().policy.isLoading).toBe(true);
    });

    it('adds or updates single policy in items array on fulfilled', () => {
      const store = createTestStore();
      // Pre-populate with one policy
      store.dispatch(
        fetchPolicies.fulfilled([mockPolicy2], 'req-1', undefined)
      );

      store.dispatch(
        fetchPolicyById.fulfilled(mockPolicy, 'req-2', 'pol_abc123')
      );

      const state = store.getState().policy;
      expect(state.items).toHaveLength(2);
      expect(state.items.find((p) => p.id === 'pol_abc123')).toEqual(mockPolicy);
      expect(state.items.find((p) => p.id === 'pol_def456')).toEqual(mockPolicy2);
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();

      store.dispatch(
        fetchPolicyById.rejected(
          new Error('Policy not found'),
          'req-2',
          'pol_nonexistent'
        )
      );

      const state = store.getState().policy;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Policy not found');
    });
  });

  describe('purchasePolicy', () => {
    it('adds new policy to items on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(
        fetchPolicies.fulfilled([mockPolicy], 'req-1', undefined)
      );

      const newPolicy = {
        ...mockPolicy,
        id: 'pol_new',
        policyNumber: 'POL-NEW',
      };
      store.dispatch(
        purchasePolicy.fulfilled(newPolicy, 'req-3', 'prod_auto')
      );

      const state = store.getState().policy;
      expect(state.items).toHaveLength(2);
      expect(state.items.find((p) => p.id === 'pol_new')).toEqual(newPolicy);
    });

    it('sets error on rejected', () => {
      const store = createTestStore();
      store.dispatch(
        purchasePolicy.rejected(
          new Error('Purchase failed'),
          'request-id',
          'prod_auto'
        )
      );
      expect(store.getState().policy.error).toBeTruthy();
      expect(store.getState().policy.items).toHaveLength(0);
    });
  });

  describe('renewPolicy', () => {
    it('updates the renewed policy in items on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(
        fetchPolicies.fulfilled([mockPolicy], 'req-1', undefined)
      );

      const renewedPolicy = {
        ...mockPolicy,
        id: 'pol_abc123',
        policyNumber: 'POL-2024-001-R1',
        status: 'active',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2026-01-01T00:00:00Z',
      };
      store.dispatch(
        renewPolicy.fulfilled(renewedPolicy, 'req-4', 'pol_abc123')
      );

      const state = store.getState().policy;
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(renewedPolicy);
    });
  });

  describe('selectors', () => {
    it('selectAllPolicies returns all items', () => {
      const store = configureStore({
        reducer: { policy: policyReducer },
        preloadedState: {
          policy: {
            items: [mockPolicy, mockPolicy2],
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectAllPolicies(store.getState())).toEqual([
        mockPolicy,
        mockPolicy2,
      ]);
    });

    it('selectPolicyById returns matching policy or undefined', () => {
      const store = configureStore({
        reducer: { policy: policyReducer },
        preloadedState: {
          policy: {
            items: [mockPolicy, mockPolicy2],
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectPolicyById(store.getState(), 'pol_abc123')).toEqual(
        mockPolicy
      );
      expect(selectPolicyById(store.getState(), 'nonexistent')).toBeUndefined();
    });

    it('selectPolicyLoadingState returns { isLoading, error }', () => {
      const store = configureStore({
        reducer: { policy: policyReducer },
        preloadedState: {
          policy: {
            items: [],
            isLoading: true,
            error: 'Something went wrong',
          },
        },
      });

      const loadingState = selectPolicyLoadingState(store.getState());
      expect(loadingState).toEqual({
        isLoading: true,
        error: 'Something went wrong',
      });
    });
  });
});

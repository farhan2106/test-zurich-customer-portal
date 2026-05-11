import { configureStore } from '@reduxjs/toolkit';
import adminReducer, {
  fetchCustomers,
  fetchCustomerById,
  updateCustomer,
  selectAllCustomers,
  selectCustomerById,
  selectAdminLoadingState,
  selectCustomersPagination,
} from './adminSlice';

jest.mock('@/services/admin.service', () => ({
  getCustomers: jest.fn(),
  getCustomerById: jest.fn(),
  updateCustomer: jest.fn(),
}));

const createTestStore = () =>
  configureStore({
    reducer: { admin: adminReducer },
  });

const mockCustomer = {
  id: 'usr_001',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  photoUrl: null,
  location: 'Kuala Lumpur, Malaysia',
  premiumPaid: 3500.0,
  role: 'customer',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
};

const mockCustomer2 = {
  id: 'usr_002',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  photoUrl: 'https://example.com/photo.jpg',
  location: 'Penang, Malaysia',
  premiumPaid: 5200.0,
  role: 'customer',
  createdAt: '2024-03-20T00:00:00Z',
  updatedAt: '2024-07-10T00:00:00Z',
};

const mockPolicy = {
  id: 'pol_abc123',
  policyNumber: 'POL-2024-001',
  customerId: 'usr_001',
  productId: 'prod_auto',
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2025-01-01T00:00:00Z',
  premiumAmount: 1500.0,
  location: 'Kuala Lumpur, Malaysia',
};

const mockClaim = {
  id: 'clm_001',
  claimNumber: 'CLM-2024-001',
  policyId: 'pol_abc123',
  customerId: 'usr_001',
  type: 'Auto',
  description: 'Minor fender bender',
  incidentDate: '2024-05-10T00:00:00Z',
  status: 'pending',
};

const mockCustomerDetail = {
  ...mockCustomer,
  policies: [mockPolicy],
  claims: [mockClaim],
};

describe('adminSlice', () => {
  describe('initial state', () => {
    it('should have initial state with pagination', () => {
      const store = createTestStore();
      expect(store.getState().admin).toEqual({
        customers: [],
        pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
        selectedCustomer: null,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('fetchCustomers', () => {
    it('sets isLoading: true and error: null on pending', () => {
      const store = createTestStore();

      store.dispatch(fetchCustomers.pending('req-1'));

      const state = store.getState().admin;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('sets customers to payload.data, pagination to payload.meta, and isLoading: false on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(fetchCustomers.pending('req-1'));

      const paginatedPayload = {
        data: [mockCustomer, mockCustomer2],
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      };
      store.dispatch(
        fetchCustomers.fulfilled(
          paginatedPayload,
          'req-1',
          undefined
        )
      );

      const state = store.getState().admin;
      expect(state.customers).toEqual([mockCustomer, mockCustomer2]);
      expect(state.pagination).toEqual({ page: 1, limit: 20, totalItems: 2, totalPages: 1 });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();
      store.dispatch(fetchCustomers.pending('req-1'));

      store.dispatch(
        fetchCustomers.rejected(
          new Error('Failed to fetch customers'),
          'req-1',
          undefined,
          undefined
        )
      );

      const state = store.getState().admin;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch customers');
    });
  });

  describe('fetchCustomerById', () => {
    it('sets isLoading: true and error: null on pending', () => {
      const store = createTestStore();

      store.dispatch(fetchCustomerById.pending('req-2', 'usr_001'));

      expect(store.getState().admin.isLoading).toBe(true);
      expect(store.getState().admin.error).toBeNull();
    });

    it('sets selectedCustomer to payload and isLoading: false on fulfilled', () => {
      const store = createTestStore();
      store.dispatch(fetchCustomerById.pending('req-2', 'usr_001'));

      store.dispatch(
        fetchCustomerById.fulfilled(mockCustomerDetail, 'req-2', 'usr_001')
      );

      const state = store.getState().admin;
      expect(state.selectedCustomer).toEqual(mockCustomerDetail);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();

      store.dispatch(
        fetchCustomerById.rejected(
          new Error('Customer not found'),
          'req-2',
          'usr_nonexistent'
        )
      );

      const state = store.getState().admin;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Customer not found');
    });
  });

  describe('updateCustomer', () => {
    it('sets isLoading: true and error: null on pending', () => {
      const store = createTestStore();

      store.dispatch(
        updateCustomer.pending('req-3', { id: 'usr_001', data: { firstName: 'Jane' } })
      );

      expect(store.getState().admin.isLoading).toBe(true);
      expect(store.getState().admin.error).toBeNull();
    });

    it('updates customer in customers array and selectedCustomer on fulfilled', () => {
      const store = createTestStore();
      // Pre-populate customers
      store.dispatch(
        fetchCustomers.fulfilled(
          {
            data: [mockCustomer, mockCustomer2],
            meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
          },
          'req-1',
          undefined
        )
      );
      // Set selected customer
      store.dispatch(
        fetchCustomerById.fulfilled(mockCustomerDetail, 'req-2', 'usr_001')
      );

      const updatedCustomer = {
        ...mockCustomer,
        firstName: 'Jane',
        updatedAt: '2024-08-01T00:00:00Z',
      };

      store.dispatch(
        updateCustomer.fulfilled(
          updatedCustomer,
          'req-3',
          { id: 'usr_001', data: { firstName: 'Jane' } }
        )
      );

      const state = store.getState().admin;
      // Should update in customers array
      const updatedInList = state.customers.find((c) => c.id === 'usr_001');
      expect(updatedInList).toEqual(updatedCustomer);
      // Should update selectedCustomer if it matches (retains policies/claims from original)
      expect(state.selectedCustomer).toEqual({
        ...updatedCustomer,
        policies: [mockPolicy],
        claims: [mockClaim],
      });
      expect(state.isLoading).toBe(false);
    });

    it('updates only selectedCustomer when customer not in list', () => {
      const store = createTestStore();
      store.dispatch(
        fetchCustomerById.fulfilled(mockCustomerDetail, 'req-2', 'usr_001')
      );

      const updatedCustomer = {
        ...mockCustomer,
        firstName: 'Updated',
        updatedAt: '2024-08-01T00:00:00Z',
      };

      store.dispatch(
        updateCustomer.fulfilled(
          updatedCustomer,
          'req-3',
          { id: 'usr_001', data: { firstName: 'Updated' } }
        )
      );

      const state = store.getState().admin;
      expect(state.selectedCustomer).toEqual({
        ...updatedCustomer,
        policies: [mockPolicy],
        claims: [mockClaim],
      });
      expect(state.isLoading).toBe(false);
    });

    it('sets error and isLoading: false on rejected', () => {
      const store = createTestStore();

      store.dispatch(
        updateCustomer.rejected(
          new Error('Update failed'),
          'req-3',
          { id: 'usr_001', data: { firstName: 'Jane' } }
        )
      );

      const state = store.getState().admin;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Update failed');
    });
  });

  describe('selectors', () => {
    it('selectAllCustomers returns customers array', () => {
      const store = configureStore({
        reducer: { admin: adminReducer },
        preloadedState: {
          admin: {
            customers: [mockCustomer, mockCustomer2],
            pagination: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
            selectedCustomer: null,
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectAllCustomers(store.getState())).toEqual([
        mockCustomer,
        mockCustomer2,
      ]);
    });

    it('selectCustomersPagination returns pagination state', () => {
      const store = configureStore({
        reducer: { admin: adminReducer },
        preloadedState: {
          admin: {
            customers: [mockCustomer],
            pagination: { page: 2, limit: 10, totalItems: 25, totalPages: 3 },
            selectedCustomer: null,
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectCustomersPagination(store.getState())).toEqual({
        page: 2,
        limit: 10,
        totalItems: 25,
        totalPages: 3,
      });
    });

    it('selectCustomerById returns matching customer when exists', () => {
      const store = configureStore({
        reducer: { admin: adminReducer },
        preloadedState: {
          admin: {
            customers: [mockCustomer, mockCustomer2],
            pagination: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
            selectedCustomer: null,
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectCustomerById(store.getState(), 'usr_001')).toEqual(
        mockCustomer
      );
    });

    it('selectCustomerById returns undefined when not found', () => {
      const store = configureStore({
        reducer: { admin: adminReducer },
        preloadedState: {
          admin: {
            customers: [mockCustomer],
            pagination: { page: 1, limit: 20, totalItems: 1, totalPages: 1 },
            selectedCustomer: null,
            isLoading: false,
            error: null,
          },
        },
      });

      expect(selectCustomerById(store.getState(), 'nonexistent')).toBeUndefined();
    });

    it('selectAdminLoadingState returns { isLoading, error }', () => {
      const store = configureStore({
        reducer: { admin: adminReducer },
        preloadedState: {
          admin: {
            customers: [],
            pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
            selectedCustomer: null,
            isLoading: true,
            error: 'Network error',
          },
        },
      });

      const loadingState = selectAdminLoadingState(store.getState());
      expect(loadingState).toEqual({
        isLoading: true,
        error: 'Network error',
      });
    });
  });
});

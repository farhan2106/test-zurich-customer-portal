import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Customer, AdminCustomerDetail, UpdateCustomerDto, PaginationMeta, CustomerFilters } from '@/services/admin.service';
import * as adminService from '@/services/admin.service';

interface AdminState {
  customers: Customer[];
  pagination: PaginationMeta;
  selectedCustomer: AdminCustomerDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  customers: [],
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
  selectedCustomer: null,
  isLoading: false,
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  'admin/fetchCustomers',
  async (filters?: CustomerFilters) => {
    return adminService.getCustomers(filters);
  },
);

export const fetchCustomerById = createAsyncThunk('admin/fetchCustomerById', async (id: string) => {
  return adminService.getCustomerById(id);
});

export const updateCustomer = createAsyncThunk(
  'admin/updateCustomer',
  async ({ id, data }: { id: string; data: UpdateCustomerDto }) => {
    return adminService.updateCustomer(id, data);
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchCustomers
    builder.addCase(fetchCustomers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<adminService.PaginatedCustomersResponse>) => {
      state.customers = action.payload.data;
      state.pagination = action.payload.meta;
      state.isLoading = false;
    });
    builder.addCase(fetchCustomers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch customers';
    });

    // fetchCustomerById
    builder.addCase(fetchCustomerById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<AdminCustomerDetail>) => {
      state.selectedCustomer = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchCustomerById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch customer';
    });

    // updateCustomer
    builder.addCase(updateCustomer.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
      const updated = action.payload;
      const index = state.customers.findIndex((c) => c.id === updated.id);
      if (index >= 0) {
        state.customers[index] = { ...state.customers[index], ...updated };
      }
      if (state.selectedCustomer && state.selectedCustomer.id === updated.id) {
        state.selectedCustomer = { ...state.selectedCustomer, ...updated };
      }
      state.isLoading = false;
    });
    builder.addCase(updateCustomer.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update customer';
    });
  },
});

// Selectors
export const selectAllCustomers = (state: RootState) => state.admin.customers;
export const selectCustomersPagination = (state: RootState) => state.admin.pagination;

// selectCustomerById supports both calling conventions:
// 1. Curried: selectCustomerById(id)(state) — for useAppSelector
// 2. Direct:  selectCustomerById(state, id)  — for direct calls in tests
export function selectCustomerById(id: string): (state: RootState) => Customer | AdminCustomerDetail | undefined;
export function selectCustomerById(state: RootState, id: string): Customer | AdminCustomerDetail | undefined;
export function selectCustomerById(
  stateOrId: RootState | string,
  maybeId?: string,
): Customer | AdminCustomerDetail | undefined | ((state: RootState) => Customer | AdminCustomerDetail | undefined) {
  if (typeof stateOrId === 'string') {
    // Curried form: selectCustomerById(id) returns (state) => Customer | AdminCustomerDetail | undefined
    const id = stateOrId;
    return (state: RootState) => {
      if (state.admin.selectedCustomer?.id === id) return state.admin.selectedCustomer;
      return state.admin.customers.find((c) => c.id === id);
    };
  }
  // Direct form: selectCustomerById(state, id)
  const state = stateOrId;
  const customerId = maybeId!;
  if (state.admin.selectedCustomer?.id === customerId) return state.admin.selectedCustomer;
  return state.admin.customers.find((c) => c.id === customerId);
}

const selectAdminState = (state: RootState) => state.admin;

export const selectAdminLoadingState = createSelector(selectAdminState, (admin) => ({
  isLoading: admin.isLoading,
  error: admin.error,
}));

export default adminSlice.reducer;

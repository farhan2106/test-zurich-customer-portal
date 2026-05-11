import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Policy } from '@/services/policy.service';
import * as policyService from '@/services/policy.service';

interface RejectValue {
  status?: number;
  message?: string;
}

interface PolicyState {
  items: Policy[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PolicyState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchPolicies = createAsyncThunk('policy/fetchPolicies', async () => {
  return policyService.getPolicies();
});

export const fetchPolicyById = createAsyncThunk('policy/fetchPolicyById', async (id: string) => {
  return policyService.getPolicyById(id);
});

export const purchasePolicy = createAsyncThunk(
  'policy/purchasePolicy',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await policyService.purchasePolicy(productId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      return rejectWithValue({
        status: axiosErr.response?.status,
        message: axiosErr.response?.data?.message || axiosErr.message || 'Purchase failed',
      });
    }
  }
);

export const renewPolicy = createAsyncThunk(
  'policy/renewPolicy',
  async (policyId: string, { rejectWithValue }) => {
    try {
      return await policyService.renewPolicy(policyId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      return rejectWithValue({
        status: axiosErr.response?.status,
        message: axiosErr.response?.data?.message || axiosErr.message || 'Renewal failed',
      });
    }
  }
);

const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchPolicies
    builder.addCase(fetchPolicies.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPolicies.fulfilled, (state, action: PayloadAction<Policy[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchPolicies.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load policies';
    });

    // fetchPolicyById
    builder.addCase(fetchPolicyById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPolicyById.fulfilled, (state, action: PayloadAction<Policy>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
      state.isLoading = false;
    });
    builder.addCase(fetchPolicyById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load policy';
    });

    // purchasePolicy
    builder.addCase(purchasePolicy.fulfilled, (state, action: PayloadAction<Policy>) => {
      state.items.push(action.payload);
    });
    builder.addCase(purchasePolicy.rejected, (state, action) => {
      state.error = (action.payload as RejectValue)?.message || action.error.message || 'Purchase failed';
    });

    // renewPolicy
    builder.addCase(renewPolicy.fulfilled, (state, action: PayloadAction<Policy>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(renewPolicy.rejected, (state, action) => {
      state.error = (action.payload as RejectValue)?.message || action.error.message || 'Renewal failed';
    });
  },
});

// Selectors
export const selectAllPolicies = (state: RootState) => state.policy.items;

// selectPolicyById supports both calling conventions:
// 1. Curried: selectPolicyById(id)(state) — for useAppSelector
// 2. Direct:  selectPolicyById(state, id)  — for direct calls in tests
export function selectPolicyById(id: string): (state: RootState) => Policy | undefined;
export function selectPolicyById(state: RootState, id: string): Policy | undefined;
export function selectPolicyById(
  stateOrId: RootState | string,
  maybeId?: string,
): Policy | undefined | ((state: RootState) => Policy | undefined) {
  if (typeof stateOrId === 'string') {
    // Curried form: selectPolicyById(id) returns (state) => Policy | undefined
    const id = stateOrId;
    return (state: RootState) => state.policy.items.find((p) => p.id === id);
  }
  // Direct form: selectPolicyById(state, id)
  const state = stateOrId;
  const id = maybeId!;
  return state.policy.items.find((p) => p.id === id);
}

const selectPolicyState = (state: RootState) => state.policy;

export const selectPolicyLoadingState = createSelector(
  selectPolicyState,
  (policy) => ({
    isLoading: policy.isLoading,
    error: policy.error,
  })
);

export default policySlice.reducer;

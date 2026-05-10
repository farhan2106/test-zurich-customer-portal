import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Claim, CreateClaimDto } from '@/services/claim.service';
import * as claimService from '@/services/claim.service';

interface ClaimState {
  items: Claim[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClaimState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchClaims = createAsyncThunk('claim/fetchClaims', async () => {
  return claimService.getClaims();
});

export const fetchClaimById = createAsyncThunk('claim/fetchClaimById', async (id: string) => {
  return claimService.getClaimById(id);
});

export const submitClaim = createAsyncThunk('claim/submitClaim', async (data: CreateClaimDto) => {
  return claimService.submitClaim(data);
});

const claimSlice = createSlice({
  name: 'claim',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchClaims
    builder.addCase(fetchClaims.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchClaims.fulfilled, (state, action: PayloadAction<Claim[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchClaims.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load claims';
    });

    // fetchClaimById
    builder.addCase(fetchClaimById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchClaimById.fulfilled, (state, action: PayloadAction<Claim>) => {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
      state.isLoading = false;
    });
    builder.addCase(fetchClaimById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load claim';
    });

    // submitClaim
    builder.addCase(submitClaim.fulfilled, (state, action: PayloadAction<Claim>) => {
      state.items.push(action.payload);
    });
    builder.addCase(submitClaim.rejected, (state, action) => {
      state.error = action.error.message || 'Submission failed';
    });
  },
});

// Selectors
export const selectAllClaims = (state: RootState) => state.claim.items;

// selectClaimById supports both calling conventions:
// 1. Curried: selectClaimById(id)(state) — for useAppSelector
// 2. Direct:  selectClaimById(state, id)  — for direct calls in tests
export function selectClaimById(id: string): (state: RootState) => Claim | undefined;
export function selectClaimById(state: RootState, id: string): Claim | undefined;
export function selectClaimById(
  stateOrId: RootState | string,
  maybeId?: string,
): Claim | undefined | ((state: RootState) => Claim | undefined) {
  if (typeof stateOrId === 'string') {
    // Curried form: selectClaimById(id) returns (state) => Claim | undefined
    const id = stateOrId;
    return (state: RootState) => state.claim.items.find((c) => c.id === id);
  }
  // Direct form: selectClaimById(state, id)
  const state = stateOrId;
  const id = maybeId!;
  return state.claim.items.find((c) => c.id === id);
}

const selectClaimState = (state: RootState) => state.claim;

export const selectClaimLoadingState = createSelector(
  selectClaimState,
  (claim) => ({
    isLoading: claim.isLoading,
    error: claim.error,
  })
);

export default claimSlice.reducer;

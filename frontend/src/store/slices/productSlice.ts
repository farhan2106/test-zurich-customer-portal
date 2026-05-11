import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import apiClient from '@/services/api-client';

interface CoverageDetail {
  name: string;
  limit: string;
}

interface PremiumByLocation {
  location: string;
  premium: number;
}

export interface Product {
  id: string;
  productCode: number;
  name: string;
  description: string;
  coverageDetails: CoverageDetail[] | Record<string, string>;
  basePremium: number;
  premiumByLocation?: PremiumByLocation[];
  status: string;
}

interface ProductState {
  items: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  hasLoaded: boolean;
}

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  notFound: false,
  hasLoaded: false,
};

export const fetchProducts = createAsyncThunk('product/fetchProducts', async () => {
  const response = await apiClient.get('/products');
  return response.data as Product[];
});

export const fetchProductById = createAsyncThunk('product/fetchProductById', async (id: string) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data as Product;
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
      state.notFound = false;
    },
  },
  extraReducers: (builder) => {
    // fetchProducts
    builder.addCase(fetchProducts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.hasLoaded = true;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load products';
      state.hasLoaded = true;
    });

    // fetchProductById
    builder.addCase(fetchProductById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.notFound = false;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.push(action.payload);
      }
      state.isLoading = false;
      state.hasLoaded = true;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.isLoading = false;
      state.hasLoaded = true;
      if (action.error.message?.includes('404') || action.error.message?.includes('Not found')) {
        state.notFound = true;
      } else {
        state.error = action.error.message || 'Failed to load product';
      }
    });
  },
});

export const { clearProductError } = productSlice.actions;

// Selectors
export const selectAllProducts = (state: RootState) => state.product.items;
export const selectSelectedProduct = (state: RootState) => state.product.selectedProduct;

const selectProductState = (state: RootState) => state.product;

export const selectProductLoadingState = createSelector(
  selectProductState,
  (product) => ({
    isLoading: product.isLoading,
    error: product.error,
    notFound: product.notFound,
    hasLoaded: product.hasLoaded,
  })
);

export default productSlice.reducer;

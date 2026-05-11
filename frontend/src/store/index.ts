import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import policyReducer from './slices/policySlice';
import claimReducer from './slices/claimSlice';
import adminReducer from './slices/adminSlice';
import productReducer from './slices/productSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    policy: policyReducer,
    claim: claimReducer,
    admin: adminReducer,
    product: productReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

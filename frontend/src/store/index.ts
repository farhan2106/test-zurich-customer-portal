import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import policyReducer from './slices/policySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    policy: policyReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, ReducersMapObject } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import type { RootState } from '@/store';

interface ExtendedOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore>;
  additionalReducers?: ReducersMapObject;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: ExtendedOptions = {}
) {
  const {
    preloadedState,
    additionalReducers,
    store = configureStore({
      reducer: {
        auth: authReducer,
        ...additionalReducers,
      },
      preloadedState,
    }),
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Re-export testing library for convenience
export * from '@testing-library/react';
export { renderWithProviders as render };

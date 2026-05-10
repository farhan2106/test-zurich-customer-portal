import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  role: string;
}

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode<JwtPayload>(token);
        return {
          user: {
            id: payload.sub,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            role: payload.role,
          },
          token,
          isLoading: false,
          error: null,
        };
      } catch {
        // Invalid token — clear it
        localStorage.removeItem('token');
      }
    }
  }
  return {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      const { token, user } = action.payload;
      state.user = user;
      state.token = token;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export { getInitialState };
export default authSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';

import authReducer, { loginStart, loginSuccess, loginFailure, logout, clearError } from './authSlice';

const createStore = () => configureStore({ reducer: { auth: authReducer } });

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have initial state { user: null, token: null, isLoading: false, error: null }', () => {
      const store = createStore();
      expect(store.getState().auth).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('loginStart', () => {
    it('should set isLoading: true and error: null', () => {
      const store = createStore();

      store.dispatch(loginStart());

      expect(store.getState().auth.isLoading).toBe(true);
      expect(store.getState().auth.error).toBeNull();
      expect(store.getState().auth.user).toBeNull();
    });

    it('should clear previous error on loginStart', () => {
      const store = createStore();
      store.dispatch(loginFailure('previous error'));

      store.dispatch(loginStart());

      expect(store.getState().auth.error).toBeNull();
      expect(store.getState().auth.isLoading).toBe(true);
    });
  });

  describe('loginSuccess', () => {
    const mockUser = {
      id: 'usr_abc123',
      email: 'test@gmail.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
    };
    const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mock.token';

    it('should set user, token: null, isLoading: false, and error: null', () => {
      const store = createStore();
      store.dispatch(loginStart());

      store.dispatch(loginSuccess({ user: mockUser }));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should store correct user shape: { id, email, firstName, lastName, role }', () => {
      const store = createStore();

      store.dispatch(loginSuccess({ user: mockUser }));

      const user = store.getState().auth.user!;
      expect(user.id).toBe('usr_abc123');
      expect(user.email).toBe('test@gmail.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.role).toBe('customer');
    });
  });

  describe('loginFailure', () => {
    it('should set error and isLoading: false without modifying user/token', () => {
      const store = createStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ user: mockUser }));
      store.dispatch(loginStart());

      store.dispatch(loginFailure('Invalid credentials'));

      const state = store.getState().auth;
      expect(state.error).toBe('Invalid credentials');
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBeNull();  // token is always null (HTTP-only cookie)
    });

    it('should store the error string passed in payload', () => {
      const store = createStore();

      store.dispatch(loginFailure('Network error occurred'));

      expect(store.getState().auth.error).toBe('Network error occurred');
    });
  });

  describe('logout', () => {
    it('should clear user, token, error back to null initial state', () => {
      const store = createStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ user: mockUser }));
      store.dispatch(loginFailure('some error'));

      store.dispatch(logout());

      expect(store.getState().auth).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('clearError', () => {
    it('should set error: null without affecting other state', () => {
      const store = createStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ user: mockUser }));
      store.dispatch(loginFailure('temporary.error'));

      const before = store.getState().auth;
      expect(before.error).toBe('temporary.error');

      store.dispatch(clearError());

      const after = store.getState().auth;
      expect(after.error).toBeNull();
      expect(after.user).toEqual(mockUser);
      expect(after.token).toBeNull();  // token is always null (HTTP-only cookie)
      expect(after.isLoading).toBe(false);
    });
  });
});

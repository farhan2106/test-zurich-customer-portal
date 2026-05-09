import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} from './authSlice';

const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have initial state { user: null, token: null, isLoading: false, error: null }', () => {
      const store = createTestStore();
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
      const store = createTestStore();

      store.dispatch(loginStart());

      expect(store.getState().auth.isLoading).toBe(true);
      expect(store.getState().auth.error).toBeNull();
      expect(store.getState().auth.user).toBeNull();
    });

    it('should clear previous error on loginStart', () => {
      const store = createTestStore();
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

    it('should set user, token, isLoading: false, and error: null', () => {
      const store = createTestStore();
      store.dispatch(loginStart());

      store.dispatch(loginSuccess({ token: mockToken, user: mockUser }));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should store correct user shape: { id, email, firstName, lastName, role }', () => {
      const store = createTestStore();

      store.dispatch(loginSuccess({ token: mockToken, user: mockUser }));

      const user = store.getState().auth.user!;
      expect(user.id).toBe('usr_abc123');
      expect(user.email).toBe('test@gmail.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.role).toBe('customer');
    });

    it('should persist token to localStorage', () => {
      const store = createTestStore();

      store.dispatch(loginSuccess({ token: mockToken, user: mockUser }));

      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should store token in state matching input', () => {
      const store = createTestStore();
      const token = 'custom.jwt.token.value';

      store.dispatch(loginSuccess({ token, user: mockUser }));

      expect(store.getState().auth.token).toBe(token);
    });
  });

  describe('loginFailure', () => {
    it('should set error and isLoading: false without modifying user/token', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ token: 'existing-token', user: mockUser }));
      store.dispatch(loginStart());

      store.dispatch(loginFailure('Invalid credentials'));

      const state = store.getState().auth;
      expect(state.error).toBe('Invalid credentials');
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('existing-token');
    });

    it('should store the error string passed in payload', () => {
      const store = createTestStore();

      store.dispatch(loginFailure('Network error occurred'));

      expect(store.getState().auth.error).toBe('Network error occurred');
    });
  });

  describe('logout', () => {
    it('should clear user, token, error back to null initial state', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ token: 'some-token', user: mockUser }));
      store.dispatch(loginFailure('some error'));

      store.dispatch(logout());

      expect(store.getState().auth).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    });

    it('should remove token from localStorage', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ token: 'some-token', user: mockUser }));
      expect(localStorage.getItem('token')).toBe('some-token');

      store.dispatch(logout());

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should set error: null without affecting other state', () => {
      const store = createTestStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ token: 'active-token', user: mockUser }));
      store.dispatch(loginFailure('temporary error'));

      const before = store.getState().auth;
      expect(before.error).toBe('temporary error');

      store.dispatch(clearError());

      const after = store.getState().auth;
      expect(after.error).toBeNull();
      expect(after.user).toEqual(mockUser);
      expect(after.token).toBe('active-token');
      expect(after.isLoading).toBe(false);
    });
  });
});

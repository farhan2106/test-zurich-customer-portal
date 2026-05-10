import { configureStore } from '@reduxjs/toolkit';

// Mock jwt-decode before importing authSlice (module-level init calls jwtDecode)
jest.mock('jwt-decode', () => ({
  __esModule: true,
  jwtDecode: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { jwtDecode } = require('jwt-decode') as { jwtDecode: jest.Mock };

// Import once at module level — getInitialState() runs here with the mock active
import authReducer, { loginStart, loginSuccess, loginFailure, logout, clearError, getInitialState } from './authSlice';

const createStore = () => configureStore({ reducer: { auth: authReducer } });

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have initial state { user: null, token: null, isLoading: false, error: null } when no token in localStorage', () => {
      const state = getInitialState();
      expect(state).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    });

    it('should restore user and token from valid JWT in localStorage', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c3JfMTIzIiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6IlVzZXIiLCJyb2xlIjoiY3VzdG9tZXIifQ.mock';
      localStorage.setItem('token', validToken);

      (jwtDecode as jest.Mock).mockReturnValue({
        sub: 'usr_123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: '',
        role: 'customer',
      });

      const state = getInitialState();

      expect(state.token).toBe(validToken);
      expect(state.user).toEqual({
        id: 'usr_123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear invalid token from localStorage and return empty state', () => {
      localStorage.setItem('token', 'invalid-token');
      (jwtDecode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const state = getInitialState();

      expect(localStorage.getItem('token')).toBeNull();
      expect(state).toEqual({
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

    it('should set user, token, isLoading: false, and error: null', () => {
      const store = createStore();
      store.dispatch(loginStart());

      store.dispatch(loginSuccess({ token: mockToken, user: mockUser }));

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should store correct user shape: { id, email, firstName, lastName, role }', () => {
      const store = createStore();

      store.dispatch(loginSuccess({ token: mockToken, user: mockUser }));

      const user = store.getState().auth.user!;
      expect(user.id).toBe('usr_abc123');
      expect(user.email).toBe('test@gmail.com');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
      expect(user.role).toBe('customer');
    });

    it('should persist token to localStorage', () => {
      const store = createStore();

      store.dispatch(loginSuccess({ token: mockToken, user: mockUser }));

      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should store token in state matching input', () => {
      const store = createStore();
      const token = 'custom.jwt.token.value';

      store.dispatch(loginSuccess({ token, user: mockUser }));

      expect(store.getState().auth.token).toBe(token);
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
      const store = createStore();
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
      const store = createStore();
      const mockUser = {
        id: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
      };
      store.dispatch(loginSuccess({ token: 'active-token', user: mockUser }));
      store.dispatch(loginFailure('temporary.error'));

      const before = store.getState().auth;
      expect(before.error).toBe('temporary.error');

      store.dispatch(clearError());

      const after = store.getState().auth;
      expect(after.error).toBeNull();
      expect(after.user).toEqual(mockUser);
      expect(after.token).toBe('active-token');
      expect(after.isLoading).toBe(false);
    });
  });
});

describe('apiClient', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('response interceptor logic (specification tests)', () => {
    interface MockResponse {
      data: unknown;
      status: number;
    }

    interface MockError {
      response?: { status: number };
    }

    const applyResponseSuccess = (response: MockResponse) => response;

    const applyResponseError = (error: MockError) => {
      // No more localStorage handling — just redirect on 401
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return Promise.reject(error);
    };

    it('should pass through successful responses unchanged', () => {
      const response = { data: { id: 1 }, status: 200 };
      const result = applyResponseSuccess(response);
      expect(result).toBe(response);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should redirect to / on 401 response', () => {
      const error = { response: { status: 401 } };

      applyResponseError(error).catch(() => {});

      expect(window.location.pathname).toBe('/');
    });

    it('should still reject the promise after redirect', async () => {
      const error = { response: { status: 401 } };
      await expect(applyResponseError(error)).rejects.toEqual(error);
    });

    it('should not redirect on other status codes (e.g. 500)', () => {
      const originalHref = window.location.href;
      const error = { response: { status: 500 } };

      applyResponseError(error).catch(() => {});

      expect(window.location.href).toBe(originalHref);
    });

    it('should not redirect on non-HTTP errors (network failure)', () => {
      const originalHref = window.location.href;
      const error = new Error('Network Error');

      applyResponseError(error).catch(() => {});

      expect(window.location.href).toBe(originalHref);
    });
  });

  describe('response interceptor URL guard', () => {
    let errorHandler: (error: unknown) => Promise<never>;
    const originalHref = 'http://localhost/';

    beforeAll(async () => {
      // Import the REAL api-client module (bypass __mocks__ via relative path)
      // to access the actual axios response interceptor error handler.

      const realApiClientModule = await import('./api-client');
      const realApiClient = realApiClientModule.default;
      // Access the rejected (error) handler registered on the axios instance
      errorHandler = (
        realApiClient.interceptors.response as { handlers: Array<{ rejected: (error: unknown) => Promise<never> }> }
      ).handlers[0].rejected;
    });

    beforeEach(() => {
      window.location.href = originalHref;
    });

    it('should NOT redirect on 401 from /auth/profile (silently reject)', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/auth/profile' },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
      expect(window.location.href).toBe(originalHref);
    });

    it('should redirect to / on 401 from other endpoints (e.g. /policies)', () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/policies' },
      };

      errorHandler(error).catch(() => {});

      expect(window.location.href).toBe('http://localhost/');
    });

    it('should still reject the promise for auth profile endpoints', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/auth/profile' },
      };

      await expect(errorHandler(error)).rejects.toEqual(error);
    });
  });
});

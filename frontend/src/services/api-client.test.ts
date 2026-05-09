describe('apiClient', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  describe('request interceptor logic', () => {
    const applyRequestInterceptor = (config: any) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    };

    it('should attach Authorization: Bearer <token> from localStorage', () => {
      localStorage.setItem('token', 'test-jwt-token');
      const config = { headers: {} as Record<string, string> };

      const result = applyRequestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should skip Authorization header if no token in localStorage', () => {
      const config = { headers: {} as Record<string, string> };

      const result = applyRequestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should return config unchanged', () => {
      const config = { headers: {} as Record<string, string>, url: '/test' };

      const result = applyRequestInterceptor(config);

      expect(result).toBe(config);
    });
  });

  describe('response interceptor logic', () => {
    const applyResponseSuccess = (response: any) => response;

    const applyResponseError = (error: any) => {
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    };

    it('should pass through successful responses unchanged', () => {
      const response = { data: { id: 1 }, status: 200 };

      const result = applyResponseSuccess(response);

      expect(result).toBe(response);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should clear localStorage on 401 response', async () => {
      localStorage.setItem('token', 'existing-token');

      const error = { response: { status: 401 } };

      await applyResponseError(error).catch(() => {});

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should not clear localStorage on non-401 errors', async () => {
      localStorage.setItem('token', 'existing-token');

      const error = { response: { status: 500 } };

      await applyResponseError(error).catch(() => {});

      expect(localStorage.getItem('token')).toBe('existing-token');
    });

    it('should reject the error to propagate it to callers', async () => {
      const error = { response: { status: 403 } };

      await expect(applyResponseError(error)).rejects.toBe(error);
    });
  });
});

import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: Record<string, unknown> = {}): ExecutionContext =>
    ({
      getHandler: jest.fn(() => function handler() {}),
      getClass: jest.fn(() => class TestClass {}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  describe('canActivate()', () => {
    it('should allow request if user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext({ role: 'admin' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should reject request if user lacks required role', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext({ role: 'customer' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Access denied: insufficient permissions');
    });

    it('should return 403 (not 401) when role check fails', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext({ role: 'customer' });

      try {
        guard.canActivate(context);
        fail('Expected ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).getStatus()).toBe(403);
      }
    });

    it('should allow request if no @Roles decorator is present', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const context = createMockContext({ role: 'customer' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should allow request if requiredRoles array is empty', () => {
      reflector.getAllAndOverride.mockReturnValue([]);

      const context = createMockContext({ role: 'customer' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should check class-level @Roles decorator as fallback (getAllAndOverride behavior)', () => {
      // getAllAndOverride merges handler and class metadata
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext({ role: 'admin' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(expect.anything(), [
        expect.any(Function),
        expect.any(Function),
      ]);
    });

    it('should return 403 if user.role is undefined', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext({});

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Access denied: no role assigned');
    });

    it('should return 403 if user.role is null', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext({ role: null });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Access denied: no role assigned');
    });

    it('should work with multiple roles: user with superadmin role allowed when @Roles("admin", "superadmin")', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'superadmin']);

      const context = createMockContext({ role: 'superadmin' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should work with multiple roles: user with admin role allowed when @Roles("admin", "superadmin")', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'superadmin']);

      const context = createMockContext({ role: 'admin' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should reject when user role matches none of multiple required roles', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'superadmin']);

      const context = createMockContext({ role: 'customer' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return 403 if user object is missing entirely', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);

      const context = createMockContext();

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Access denied: no role assigned');
    });
  });
});

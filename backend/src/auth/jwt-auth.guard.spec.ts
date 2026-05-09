import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('class type', () => {
    it('should be an instance of JwtAuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });

    it('should have handleRequest method', () => {
      expect(typeof guard.handleRequest).toBe('function');
    });
  });

  describe('handleRequest()', () => {
    it('should return user when no error and user is present', () => {
      const user = { sub: 'usr_123', email: 'test@gmail.com', role: 'customer' };

      const result = guard.handleRequest(null, user, null);

      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => guard.handleRequest(null, undefined, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is false', () => {
      expect(() => guard.handleRequest(null, false, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw original error if error parameter is present', () => {
      const customError = new Error('Custom auth error');

      expect(() => guard.handleRequest(customError, null, null)).toThrow(
        customError,
      );
    });

    it('should throw original error even if user is present', () => {
      const user = { sub: 'usr_123', email: 'test@gmail.com' };
      const customError = new Error('Token expired');

      expect(() => guard.handleRequest(customError, user, null)).toThrow(
        customError,
      );
    });

    it('should return user object with all properties', () => {
      const user = {
        sub: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: 'https://example.com/photo.jpg',
        role: 'customer',
      };

      const result = guard.handleRequest(null, user, null);

      expect(result).toEqual(user);
    });
  });
});

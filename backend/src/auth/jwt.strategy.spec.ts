import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload, JwtUser } from './jwt.strategy';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-jwt-secret';

    strategy = new JwtStrategy();

    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe('constructor', () => {
    it('should read JWT_SECRET from config', () => {
      const originalJwtSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'custom-secret';

      const testStrategy = new JwtStrategy();

      expect(testStrategy.name).toBe('jwt');

      process.env.JWT_SECRET = originalJwtSecret;
    });
  });

  describe('validate()', () => {
    it('should return user object with all fields from valid JWT payload', async () => {
      const payload: JwtPayload = {
        sub: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: 'https://example.com/photo.jpg',
        role: 'customer',
        iat: 1700000000,
        exp: 1700086400,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: 'https://example.com/photo.jpg',
        role: 'customer',
      });
    });

    it('should return user object with admin role', async () => {
      const payload: JwtPayload = {
        sub: 'usr_admin',
        email: 'admin@zurich.com',
        firstName: 'Admin',
        lastName: 'User',
        photoUrl: null,
        role: 'admin',
        iat: 1700000000,
        exp: 1700086400,
      };

      const result = await strategy.validate(payload);

      expect(result.role).toBe('admin');
      expect(result.sub).toBe('usr_admin');
      expect(result.email).toBe('admin@zurich.com');
    });

    it('should throw UnauthorizedException if payload missing sub', async () => {
      const payload = {
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: null,
        role: 'customer',
        iat: 1700000000,
        exp: 1700086400,
      } as JwtPayload;

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if payload missing email', async () => {
      const payload = {
        sub: 'usr_abc123',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: null,
        role: 'customer',
        iat: 1700000000,
        exp: 1700086400,
      } as JwtPayload;

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle null photoUrl in payload', async () => {
      const payload: JwtPayload = {
        sub: 'usr_abc123',
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: null as unknown as string,
        role: 'customer',
        iat: 1700000000,
        exp: 1700086400,
      };

      const result = await strategy.validate(payload);

      expect(result.photoUrl).toBeNull();
    });
  });

  describe('jwtFromRequest (cookie extraction)', () => {
    it('should extract JWT from Bearer header when present', () => {
      const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
      const mockReq = {
        headers: {
          authorization: 'Bearer cookie-extracted-token',
        },
      } as unknown as Request;

      const token = extractor(mockReq);

      expect(token).toBe('cookie-extracted-token');
    });

    it('should return null when no Bearer header is present', () => {
      const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
      const mockReq = {
        headers: {},
      } as unknown as Request;

      const token = extractor(mockReq);

      expect(token).toBeNull();
    });

    it('should use a custom extractor that reads from cookies as fallback when no Bearer header', () => {
      const extractors = [
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.token ?? null,
      ];
      const combinedExtractor = ExtractJwt.fromExtractors(extractors);

      const mockReq = {
        headers: {},
        cookies: { token: 'cookie-jwt-token' },
      } as unknown as Request;

      const token = combinedExtractor(mockReq);

      expect(token).toBe('cookie-jwt-token');
    });

    it('should prefer Bearer header over cookie when both are present', () => {
      const extractors = [
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.token ?? null,
      ];
      const combinedExtractor = ExtractJwt.fromExtractors(extractors);

      const mockReq = {
        headers: {
          authorization: 'Bearer header-token',
        },
        cookies: { token: 'cookie-token' },
      } as unknown as Request;

      const token = combinedExtractor(mockReq);

      expect(token).toBe('header-token');
    });

    it('should return null when neither Bearer header nor cookie token exist', () => {
      const extractors = [
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.token ?? null,
      ];
      const combinedExtractor = ExtractJwt.fromExtractors(extractors);

      const mockReq = {
        headers: {},
      } as unknown as Request;

      const token = combinedExtractor(mockReq);

      expect(token).toBeNull();
    });
  });
});

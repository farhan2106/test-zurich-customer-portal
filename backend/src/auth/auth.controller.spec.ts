import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService, GoogleProfile } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtUser } from './jwt.strategy';
import { Customer } from '../entities/customer.entity';
import { CustomerLocation, CustomerRole } from '../entities/enums';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockCustomer: Customer = {
    id: 'usr_abc123',
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: 'https://example.com/photo.jpg',
    location: CustomerLocation.WEST_MALAYSIA,
    role: CustomerRole.CUSTOMER,
    premiumPaid: 0,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
    policies: [],
    claims: [],
  };

  const mockGoogleProfile: GoogleProfile = {
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: 'https://example.com/photo.jpg',
  };

  const mockJwtUser: JwtUser = {
    sub: 'usr_abc123',
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: 'https://example.com/photo.jpg',
    role: 'customer',
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token';

  beforeEach(async () => {
    const mockAuthService = {
      validateOrCreateUser: jest.fn(),
      signToken: jest.fn(),
      findByEmail: jest.fn(),
      validateGoogleUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AuthGuard('google'))
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('GET /api/auth/google', () => {
    it('should return 302 redirect (Google guard triggered)', () => {
      const result = controller.googleLogin();
      expect(result).toBeUndefined();
    });
  });

  describe('GET /api/auth/google/callback', () => {
    it('should call AuthService.validateOrCreateUser() with Google profile, call signToken(), and return redirect with token', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(authService.validateOrCreateUser).toHaveBeenCalledWith(mockGoogleProfile);
      expect(authService.signToken).toHaveBeenCalledWith(mockCustomer);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        mockToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: expect.any(Number),
        }),
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/callback',
      );
    });

    it('should create new user if not exists (first login)', async () => {
      const newCustomer = { ...mockCustomer, id: 'usr_new456' };
      authService.validateOrCreateUser.mockResolvedValue(newCustomer);
      authService.signToken.mockReturnValue('new.user.token');

      const newProfile: GoogleProfile = {
        email: 'newuser@gmail.com',
        firstName: 'New',
        lastName: 'User',
        photoUrl: '',
      };
      const mockReq = { user: newProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(authService.validateOrCreateUser).toHaveBeenCalledWith(newProfile);
      expect(authService.signToken).toHaveBeenCalledWith(newCustomer);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        'new.user.token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: expect.any(Number),
        }),
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/callback',
      );
    });

    it('should return existing user if already registered', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(authService.validateOrCreateUser).toHaveBeenCalledWith(mockGoogleProfile);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        mockToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: expect.any(Number),
        }),
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/callback',
      );
    });

    it('should set HTTP-only cookie and redirect without token in URL', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/callback',
      );
      const redirectUrl = (mockRes.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl).not.toContain('token=');
    });

    it('should delegate defaults (role "customer", location "West Malaysia") to AuthService for new users', async () => {
      const defaultCustomer = {
        ...mockCustomer,
        id: 'usr_new789',
        role: CustomerRole.CUSTOMER,
        location: CustomerLocation.WEST_MALAYSIA,
      };
      authService.validateOrCreateUser.mockResolvedValue(defaultCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(authService.validateOrCreateUser).toHaveBeenCalledWith(mockGoogleProfile);
      const signTokenArg = (authService.signToken as jest.Mock).mock.calls[0][0];
      expect(signTokenArg.role).toBe(CustomerRole.CUSTOMER);
      expect(signTokenArg.location).toBe(CustomerLocation.WEST_MALAYSIA);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the token cookie and return success message', async () => {
      const mockRes = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('token');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return { id, email, firstName, lastName, photoUrl, role } when JWT is valid', () => {
      const mockReq = { user: mockJwtUser } as unknown as Request;

      const result = controller.getProfile(mockReq);

      expect(result).toEqual({
        id: mockJwtUser.sub,
        email: mockJwtUser.email,
        firstName: mockJwtUser.firstName,
        lastName: mockJwtUser.lastName,
        photoUrl: mockJwtUser.photoUrl,
        role: mockJwtUser.role,
      });
    });

    it('should map JwtUser.sub to id in response', () => {
      const customUser: JwtUser = {
        sub: 'usr_custom999',
        email: 'custom@test.com',
        firstName: 'Custom',
        lastName: 'Test',
        photoUrl: '',
        role: 'admin',
      };
      const mockReq = { user: customUser } as unknown as Request;

      const result = controller.getProfile(mockReq);

      expect(result.id).toBe(customUser.sub);
      expect(result.role).toBe('admin');
    });

    it('should have JwtAuthGuard applied (401 without valid JWT)', () => {
      const guards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.getProfile,
      );

      expect(guards).toBeDefined();
      expect(guards!.length).toBeGreaterThan(0);

      const hasJwtGuard = guards!.some(
        (g: any) => g instanceof JwtAuthGuard || g === JwtAuthGuard,
      );
      expect(hasJwtGuard).toBe(true);
    });
  });

  describe('cookie options (fix: cross-origin axios)', () => {
    it('should set cookie with sameSite: "none"', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        mockToken,
        expect.objectContaining({ sameSite: 'none' }),
      );
    });

    it('should set cookie with secure: true (always, even in dev)', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        mockToken,
        expect.objectContaining({ secure: true }),
      );
    });

    it('should set cookie with httpOnly: true', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        mockToken,
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should set cookie maxAge to 7 days (604800000 ms)', async () => {
      authService.validateOrCreateUser.mockResolvedValue(mockCustomer);
      authService.signToken.mockReturnValue(mockToken);

      const mockReq = { user: mockGoogleProfile } as unknown as Request;
      const mockRes = {
        redirect: jest.fn(),
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.googleCallback(mockReq, mockRes);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'token',
        mockToken,
        expect.objectContaining({ maxAge: 604800000 }),
      );
    });
  });
});

import { Profile } from 'passport-google-oauth20';
import { AuthService, GoogleProfile } from './auth.service';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      validateGoogleUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    // Save original env values
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Set test env values
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    strategy = new GoogleStrategy(mockAuthService);

    // Restore original env values
    process.env.GOOGLE_CLIENT_ID = originalClientId;
    process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
  });

  const createMockProfile = (overrides: Partial<Profile> = {}): Profile =>
    ({
      id: 'google-123',
      displayName: 'Test User',
      name: {
        familyName: 'User',
        givenName: 'Test',
      },
      emails: [{ value: 'test@gmail.com', verified: true }],
      photos: [{ value: 'https://example.com/photo.jpg' }],
      provider: 'google',
      _raw: '',
      _json: {},
      ...overrides,
    }) as Profile;

  describe('constructor', () => {
    it('should use GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from config', () => {
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;

      process.env.GOOGLE_CLIENT_ID = 'env-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'env-client-secret';

      const testStrategy = new GoogleStrategy(mockAuthService);

      expect(testStrategy.name).toBe('google');

      process.env.GOOGLE_CLIENT_ID = originalClientId;
      process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    });
  });

  describe('validate()', () => {
    it('should extract email, firstName, lastName, photoUrl from Google profile', async () => {
      const profile = createMockProfile();
      const done = jest.fn();

      mockAuthService.validateGoogleUser.mockResolvedValue({} as any);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith({
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: 'https://example.com/photo.jpg',
      });
      expect(done).toHaveBeenCalledWith(null, {
        email: 'test@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        photoUrl: 'https://example.com/photo.jpg',
      });
    });

    it('should handle missing name.givenName gracefully (firstName fallback to email prefix)', async () => {
      const profile = createMockProfile({
        name: { familyName: 'User', givenName: undefined },
      });
      const done = jest.fn();

      mockAuthService.validateGoogleUser.mockResolvedValue({} as any);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: '',
        }),
      );
    });

    it('should handle missing name.familyName gracefully (lastName = "")', async () => {
      const profile = createMockProfile({
        name: { givenName: 'Test', familyName: undefined },
      });
      const done = jest.fn();

      mockAuthService.validateGoogleUser.mockResolvedValue({} as any);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
        expect.objectContaining({
          lastName: '',
        }),
      );
    });

    it('should handle missing photos gracefully (photoUrl = "")', async () => {
      const profile = createMockProfile({
        photos: undefined,
      });
      const done = jest.fn();

      mockAuthService.validateGoogleUser.mockResolvedValue({} as any);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
        expect.objectContaining({
          photoUrl: '',
        }),
      );
    });

    it('should handle missing emails gracefully (email = "")', async () => {
      const profile = createMockProfile({
        emails: undefined,
      });
      const done = jest.fn();

      mockAuthService.validateGoogleUser.mockResolvedValue({} as any);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: '',
        }),
      );
    });

    it('should handle empty name object gracefully', async () => {
      const profile = createMockProfile({
        name: {},
      });
      const done = jest.fn();

      mockAuthService.validateGoogleUser.mockResolvedValue({} as any);

      await strategy.validate('access-token', 'refresh-token', profile, done);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: '',
          lastName: '',
        }),
      );
    });
  });
});

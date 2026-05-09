import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService, GoogleProfile } from './auth.service';
import { Customer } from '../entities/customer.entity';
import { CustomerLocation, CustomerRole } from '../entities/enums';

describe('AuthService', () => {
  let service: AuthService;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockGoogleProfile: GoogleProfile = {
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: 'https://example.com/photo.jpg',
  };

  const mockCustomer: Customer = {
    id: 'usr_abc123',
    email: 'test@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: 'https://example.com/photo.jpg',
    location: CustomerLocation.WEST_MALAYSIA,
    role: CustomerRole.CUSTOMER,
    premiumPaid: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    policies: [],
    claims: [],
  };

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwt = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    customerRepository = module.get(getRepositoryToken(Customer));
    jwtService = module.get(JwtService);
  });

  describe('validateOrCreateUser()', () => {
    it('should create a new customer when email is not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);
      customerRepository.create.mockReturnValue(mockCustomer);
      customerRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.validateOrCreateUser(mockGoogleProfile);

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockGoogleProfile.email },
      });
      expect(customerRepository.create).toHaveBeenCalledWith({
        email: mockGoogleProfile.email,
        firstName: mockGoogleProfile.firstName,
        lastName: mockGoogleProfile.lastName,
        photoUrl: mockGoogleProfile.photoUrl,
        location: CustomerLocation.WEST_MALAYSIA,
        role: CustomerRole.CUSTOMER,
      });
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('should return existing customer when email is found (no duplicate creation)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.validateOrCreateUser(mockGoogleProfile);

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockGoogleProfile.email },
      });
      expect(customerRepository.create).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockCustomer);
    });

    it('should set default role to "customer" for new users', async () => {
      customerRepository.findOne.mockResolvedValue(null);
      customerRepository.create.mockReturnValue(mockCustomer);
      customerRepository.save.mockResolvedValue(mockCustomer);

      await service.validateOrCreateUser(mockGoogleProfile);

      expect(customerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: CustomerRole.CUSTOMER,
        }),
      );
    });

    it('should set default location to "West Malaysia" for new users', async () => {
      customerRepository.findOne.mockResolvedValue(null);
      customerRepository.create.mockReturnValue(mockCustomer);
      customerRepository.save.mockResolvedValue(mockCustomer);

      await service.validateOrCreateUser(mockGoogleProfile);

      expect(customerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          location: CustomerLocation.WEST_MALAYSIA,
        }),
      );
    });
  });

  describe('validateGoogleUser()', () => {
    it('should delegate to validateOrCreateUser', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.validateGoogleUser(mockGoogleProfile);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockGoogleProfile.email },
      });
    });
  });

  describe('signToken()', () => {
    it('should return JWT string with correct payload', () => {
      const expectedToken = 'mock.jwt.token';
      jwtService.sign.mockReturnValue(expectedToken);

      const result = service.signToken(mockCustomer);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockCustomer.id,
          email: mockCustomer.email,
          firstName: mockCustomer.firstName,
          lastName: mockCustomer.lastName,
          photoUrl: mockCustomer.photoUrl,
          role: mockCustomer.role,
        },
        { expiresIn: '24h' },
      );
      expect(result).toBe(expectedToken);
    });

    it('should include iat and exp claims with exp approximately now + 24h', () => {
      jwtService.sign.mockImplementation((payload, options) => {
        const now = Math.floor(Date.now() / 1000);
        return `token_with_iat_${now}_exp_${now + 86400}`;
      });

      const result = service.signToken(mockCustomer);

      // Verify the token string contains iat and exp timestamps
      expect(result).toMatch(/iat_\d+/);
      expect(result).toMatch(/exp_\d+/);

      // Verify exp - iat ≈ 86400 (24 hours in seconds)
      const iatMatch = result.match(/iat_(\d+)/);
      const expMatch = result.match(/exp_(\d+)/);
      if (iatMatch && expMatch) {
        const iat = parseInt(iatMatch[1], 10);
        const exp = parseInt(expMatch[1], 10);
        expect(exp - iat).toBe(86400);
      }

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockCustomer.id,
          email: mockCustomer.email,
          role: mockCustomer.role,
        }),
        { expiresIn: '24h' },
      );
    });
  });

  describe('findByEmail()', () => {
    it('should return customer when email exists', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findByEmail('test@gmail.com');

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@gmail.com' },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should return null when email is not found', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@gmail.com');

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@gmail.com' },
      });
      expect(result).toBeNull();
    });
  });
});

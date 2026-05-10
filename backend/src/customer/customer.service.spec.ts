import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerService } from './customer.service';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Customer } from '../entities/customer.entity';
import { Claim } from '../entities/claim.entity';
import { ProductStatus, PolicyStatus, CustomerLocation, ClaimType, ClaimStatus } from '../entities/enums';

describe('CustomerService', () => {
  let service: CustomerService;
  let productRepository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
    id: 'prod_abc123',
    productCode: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage',
    coverageDetails: JSON.stringify({ liability: 'Up to $1M', collision: 'Included' }),
    basePremium: 500.0,
    status: ProductStatus.ACTIVE,
    createdAt: new Date('2025-01-01'),
    policies: [],
  };

  const mockInactiveProduct: Product = {
    ...mockProduct,
    id: 'prod_inactive',
    status: ProductStatus.INACTIVE,
  };

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockPolicyRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockCustomerRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockClaimRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(Policy),
          useValue: mockPolicyRepo,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepo,
        },
        {
          provide: getRepositoryToken(Claim),
          useValue: mockClaimRepo,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    productRepository = module.get(getRepositoryToken(Product));
  });

  describe('findAllActiveProducts()', () => {
    it('should return only products with status active', async () => {
      productRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAllActiveProducts();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });
      expect(result).toEqual([mockProduct]);
    });

    it('should return empty array when no active products exist', async () => {
      productRepository.find.mockResolvedValue([]);

      const result = await service.findAllActiveProducts();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });
      expect(result).toEqual([]);
    });

    it('should exclude inactive products', async () => {
      productRepository.find.mockResolvedValue([mockProduct]);

      await service.findAllActiveProducts();

      // Verify the query filters by ACTIVE status only
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });

      // The inactive product should never appear in results
      const callArgs = (productRepository.find as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.status).toBe(ProductStatus.ACTIVE);
      expect(callArgs.where.status).not.toBe(ProductStatus.INACTIVE);
    });
  });

  describe('findProductById()', () => {
    it('should return product when found and active', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findProductById('prod_abc123');

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod_abc123' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product is not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findProductById('nonexistent_id')).rejects.toThrow(
        NotFoundException,
      );

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent_id' },
      });
    });

    it('should throw NotFoundException when product is inactive', async () => {
      productRepository.findOne.mockResolvedValue(mockInactiveProduct);

      await expect(service.findProductById('prod_inactive')).rejects.toThrow(
        NotFoundException,
      );

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod_inactive' },
      });
    });
  });

  describe('purchasePolicy()', () => {
    let serviceWithPolicy: CustomerService;
    let productRepo: jest.Mocked<Repository<Product>>;
    let policyRepo: jest.Mocked<Repository<Policy>>;
    let customerRepo: jest.Mocked<Repository<Customer>>;

    const mockCustomer: Customer = {
      id: 'usr_abc123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: null,
      location: CustomerLocation.WEST_MALAYSIA,
      premiumPaid: 0,
      role: 'customer',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      policies: [],
      claims: [],
    };

    const mockProduct: Product = {
      id: 'prod_abc123',
      productCode: 4000,
      name: 'Auto Insurance',
      description: 'Comprehensive auto coverage',
      coverageDetails: JSON.stringify({ liability: 'Up to $1M', collision: 'Included' }),
      basePremium: 500.0,
      status: ProductStatus.ACTIVE,
      createdAt: new Date('2025-01-01'),
      policies: [],
    };

    const mockInactiveProduct: Product = {
      ...mockProduct,
      id: 'prod_inactive',
      status: ProductStatus.INACTIVE,
    };

    beforeEach(async () => {
      const mockProductRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockPolicyRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockCustomerRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockClaimRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CustomerService,
          {
            provide: getRepositoryToken(Product),
            useValue: mockProductRepo,
          },
          {
            provide: getRepositoryToken(Policy),
            useValue: mockPolicyRepo,
          },
          {
            provide: getRepositoryToken(Customer),
            useValue: mockCustomerRepo,
          },
          {
            provide: getRepositoryToken(Claim),
            useValue: mockClaimRepo,
          },
        ],
      }).compile();

      serviceWithPolicy = module.get<CustomerService>(CustomerService);
      productRepo = module.get(getRepositoryToken(Product));
      policyRepo = module.get(getRepositoryToken(Policy));
      customerRepo = module.get(getRepositoryToken(Customer));
    });

    it('should create a policy with correct fields', async () => {
      productRepo.findOne.mockResolvedValue(mockProduct);
      customerRepo.findOne.mockResolvedValue(mockCustomer);
      policyRepo.find.mockResolvedValue([]);
      policyRepo.create.mockReturnValue({} as Policy);
      policyRepo.save.mockResolvedValue({
        id: 'pol_abc123',
        policyNumber: 'POL-20260101-0001',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(),
        premiumAmount: 500.0,
        location: CustomerLocation.WEST_MALAYSIA,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: mockCustomer,
        product: mockProduct,
        claims: [],
      } as Policy);

      const result = await serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_abc123');

      expect(policyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'usr_abc123',
          productId: 'prod_abc123',
          status: PolicyStatus.ACTIVE,
          premiumAmount: 500.0,
          location: CustomerLocation.WEST_MALAYSIA,
        }),
      );
      expect(policyRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should set startDate to now and endDate to now + 365 days', async () => {
      const now = new Date('2026-01-01T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      productRepo.findOne.mockResolvedValue(mockProduct);
      customerRepo.findOne.mockResolvedValue(mockCustomer);
      policyRepo.find.mockResolvedValue([]);
      policyRepo.create.mockReturnValue({} as Policy);
      policyRepo.save.mockResolvedValue({
        id: 'pol_abc123',
        policyNumber: 'POL-20260101-0001',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: now,
        endDate: new Date('2027-01-01T00:00:00Z'),
        premiumAmount: 500.0,
        location: CustomerLocation.WEST_MALAYSIA,
        createdAt: now,
        updatedAt: now,
        customer: mockCustomer,
        product: mockProduct,
        claims: [],
      } as Policy);

      await serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_abc123');

      const createdPolicy = (policyRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdPolicy.startDate).toEqual(now);

      const expectedEndDate = new Date(now);
      expectedEndDate.setDate(expectedEndDate.getDate() + 365);
      expect(createdPolicy.endDate.getTime()).toBeCloseTo(expectedEndDate.getTime(), -3);

      jest.useRealTimers();
    });

    it('should generate policyNumber in format POL-YYYYMMDD-NNNN', async () => {
      const now = new Date('2026-03-15T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      productRepo.findOne.mockResolvedValue(mockProduct);
      customerRepo.findOne.mockResolvedValue(mockCustomer);
      policyRepo.find.mockResolvedValue([]);
      policyRepo.create.mockReturnValue({} as Policy);
      policyRepo.save.mockResolvedValue({
        id: 'pol_abc123',
        policyNumber: 'POL-20260315-0001',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: now,
        endDate: new Date('2027-03-15T00:00:00Z'),
        premiumAmount: 500.0,
        location: CustomerLocation.WEST_MALAYSIA,
        createdAt: now,
        updatedAt: now,
        customer: mockCustomer,
        product: mockProduct,
        claims: [],
      } as Policy);

      await serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_abc123');

      const createdPolicy = (policyRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdPolicy.policyNumber).toMatch(/^POL-\d{8}-\d{4}$/);

      jest.useRealTimers();
    });

    it('should throw BadRequestException when product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);

      await expect(
        serviceWithPolicy.purchasePolicy('usr_abc123', 'nonexistent_prod'),
      ).rejects.toThrow(BadRequestException);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent_prod' },
      });
    });

    it('should throw BadRequestException when product is inactive', async () => {
      productRepo.findOne.mockResolvedValue(mockInactiveProduct);

      await expect(
        serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_inactive'),
      ).rejects.toThrow(BadRequestException);

      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'prod_inactive' },
      });
    });

    it('should throw ConflictException when customer already has active policy for same product', async () => {
      const existingPolicy: Policy = {
        id: 'pol_existing',
        policyNumber: 'POL-20250101-0001',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        premiumAmount: 500.0,
        location: CustomerLocation.WEST_MALAYSIA,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        customer: mockCustomer,
        product: mockProduct,
        claims: [],
      };

      productRepo.findOne.mockResolvedValue(mockProduct);
      customerRepo.findOne.mockResolvedValue(mockCustomer);
      policyRepo.findOne.mockResolvedValue(existingPolicy);

      await expect(
        serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_abc123'),
      ).rejects.toThrow(ConflictException);

      expect(policyRepo.findOne).toHaveBeenCalledWith({
        where: {
          customerId: 'usr_abc123',
          productId: 'prod_abc123',
          status: PolicyStatus.ACTIVE,
        },
      });
    });

    it('should set location from customer location', async () => {
      const eastMalaysiaCustomer: Customer = {
        ...mockCustomer,
        location: CustomerLocation.EAST_MALAYSIA,
      };

      productRepo.findOne.mockResolvedValue(mockProduct);
      customerRepo.findOne.mockResolvedValue(eastMalaysiaCustomer);
      policyRepo.find.mockResolvedValue([]);
      policyRepo.create.mockReturnValue({} as Policy);
      policyRepo.save.mockResolvedValue({
        id: 'pol_abc123',
        policyNumber: 'POL-20260101-0001',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(),
        premiumAmount: 500.0,
        location: CustomerLocation.EAST_MALAYSIA,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: eastMalaysiaCustomer,
        product: mockProduct,
        claims: [],
      } as Policy);

      await serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_abc123');

      const createdPolicy = (policyRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdPolicy.location).toBe(CustomerLocation.EAST_MALAYSIA);
    });

    it('should set premiumAmount from product basePremium', async () => {
      const expensiveProduct: Product = {
        ...mockProduct,
        basePremium: 1200.5,
      };

      productRepo.findOne.mockResolvedValue(expensiveProduct);
      customerRepo.findOne.mockResolvedValue(mockCustomer);
      policyRepo.find.mockResolvedValue([]);
      policyRepo.create.mockReturnValue({} as Policy);
      policyRepo.save.mockResolvedValue({
        id: 'pol_abc123',
        policyNumber: 'POL-20260101-0001',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(),
        premiumAmount: 1200.5,
        location: CustomerLocation.WEST_MALAYSIA,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: mockCustomer,
        product: expensiveProduct,
        claims: [],
      } as Policy);

      await serviceWithPolicy.purchasePolicy('usr_abc123', 'prod_abc123');

      const createdPolicy = (policyRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdPolicy.premiumAmount).toBe(1200.5);
    });
  });

  describe('findPoliciesByCustomerId()', () => {
    let policyRepository: jest.Mocked<Repository<Policy>>;

    beforeEach(async () => {
      const mockRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };

      const mockPolicyRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockCustomerRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };

      const mockClaimRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CustomerService,
          {
            provide: getRepositoryToken(Product),
            useValue: mockRepo,
          },
          {
            provide: getRepositoryToken(Policy),
            useValue: mockPolicyRepo,
          },
          {
            provide: getRepositoryToken(Customer),
            useValue: mockCustomerRepo,
          },
          {
            provide: getRepositoryToken(Claim),
            useValue: mockClaimRepo,
          },
        ],
      }).compile();

      service = module.get<CustomerService>(CustomerService);
      policyRepository = module.get(getRepositoryToken(Policy));
    });

    it('should return policies for given customerId with product relation', async () => {
      const mockPolicies: Policy[] = [{
        id: 'pol_001', policyNumber: 'POL-20260101-0001',
        customerId: 'usr_abc123', productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: new Date(), endDate: new Date(),
        premiumAmount: 500, location: CustomerLocation.WEST_MALAYSIA,
        createdAt: new Date(), updatedAt: new Date(),
        customer: {} as Customer, product: mockProduct, claims: [],
      }];

      (policyRepository.find as jest.Mock).mockResolvedValue(mockPolicies);

      const result = await service.findPoliciesByCustomerId('usr_abc123');

      expect(policyRepository.find).toHaveBeenCalledWith({
        where: { customerId: 'usr_abc123' },
        relations: ['product'],
      });
      expect(result).toEqual(mockPolicies);
    });

    it('should return empty array when customer has no policies', async () => {
      (policyRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findPoliciesByCustomerId('usr_abc123');

      expect(result).toEqual([]);
    });

    it('should call find with correct where + relations', async () => {
      (policyRepository.find as jest.Mock).mockResolvedValue([]);

      await service.findPoliciesByCustomerId('usr_xyz789');

      expect(policyRepository.find).toHaveBeenCalledWith({
        where: { customerId: 'usr_xyz789' },
        relations: ['product'],
      });
    });
  });

  describe('findPolicyById()', () => {
    let policyRepository: jest.Mocked<Repository<Policy>>;

    const mockPolicy: Policy = {
      id: 'pol_001',
      policyNumber: 'POL-20260101-0001',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {} as Customer,
      product: mockProduct,
      claims: [],
    };

    beforeEach(async () => {
      const mockRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };

      const mockPolicyRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockCustomerRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };

      const mockClaimRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CustomerService,
          {
            provide: getRepositoryToken(Product),
            useValue: mockRepo,
          },
          {
            provide: getRepositoryToken(Policy),
            useValue: mockPolicyRepo,
          },
          {
            provide: getRepositoryToken(Customer),
            useValue: mockCustomerRepo,
          },
          {
            provide: getRepositoryToken(Claim),
            useValue: mockClaimRepo,
          },
        ],
      }).compile();

      service = module.get<CustomerService>(CustomerService);
      policyRepository = module.get(getRepositoryToken(Policy));
    });

    it('should return policy with product and claims relations', async () => {
      (policyRepository.findOne as jest.Mock).mockResolvedValue(mockPolicy);

      const result = await service.findPolicyById('pol_001', 'usr_abc123');

      expect(policyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'pol_001' },
        relations: ['product', 'claims'],
      });
      expect(result).toEqual(mockPolicy);
    });

    it('should throw NotFoundException when policy not found', async () => {
      (policyRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findPolicyById('nonexistent', 'usr_abc123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when policy belongs to different customer', async () => {
      (policyRepository.findOne as jest.Mock).mockResolvedValue(mockPolicy);

      await expect(service.findPolicyById('pol_001', 'usr_different')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should call findOne with correct where clause and relations', async () => {
      (policyRepository.findOne as jest.Mock).mockResolvedValue(mockPolicy);

      await service.findPolicyById('pol_001', 'usr_abc123');

      expect(policyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'pol_001' },
        relations: ['product', 'claims'],
      });
    });
  });

  describe('renewPolicy()', () => {
    let policyRepository: jest.Mocked<Repository<Policy>>;

    const createMockPolicy = (overrides: Partial<Policy> = {}): Policy => ({
      id: 'pol_001',
      policyNumber: 'POL-20260101-0001',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
      premiumAmount: 500,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {} as Customer,
      product: mockProduct,
      claims: [],
      ...overrides,
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    beforeEach(async () => {
      const mockRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };

      const mockPolicyRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockCustomerRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
      };

      const mockClaimRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CustomerService,
          {
            provide: getRepositoryToken(Product),
            useValue: mockRepo,
          },
          {
            provide: getRepositoryToken(Policy),
            useValue: mockPolicyRepo,
          },
          {
            provide: getRepositoryToken(Customer),
            useValue: mockCustomerRepo,
          },
          {
            provide: getRepositoryToken(Claim),
            useValue: mockClaimRepo,
          },
        ],
      }).compile();

      service = module.get<CustomerService>(CustomerService);
      policyRepository = module.get(getRepositoryToken(Policy));
    });

    it('should extend endDate by 365 days from current endDate', async () => {
      const now = new Date('2025-12-15T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const policyWithinWindow = createMockPolicy();
      (policyRepository.findOne as jest.Mock).mockResolvedValue(policyWithinWindow);
      (policyRepository.save as jest.Mock).mockImplementation((p) => p);

      const result = await service.renewPolicy('pol_001', 'usr_abc123');

      const expectedEndDate = new Date('2026-01-01');
      expectedEndDate.setDate(expectedEndDate.getDate() + 365);
      expect(result.endDate.getTime()).toBeCloseTo(expectedEndDate.getTime(), -3);
    });

    it('should throw NotFoundException when policy not found', async () => {
      (policyRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.renewPolicy('nonexistent', 'usr_abc123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when policy belongs to different customer', async () => {
      (policyRepository.findOne as jest.Mock).mockResolvedValue(createMockPolicy());

      await expect(service.renewPolicy('pol_001', 'usr_different')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException when policy status is not active', async () => {
      const expiredPolicy = createMockPolicy({ status: PolicyStatus.EXPIRED });
      (policyRepository.findOne as jest.Mock).mockResolvedValue(expiredPolicy);

      await expect(service.renewPolicy('pol_001', 'usr_abc123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when not within 30-day renewal window', async () => {
      const now = new Date('2025-06-01T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      // endDate 100 days from now — well outside the 30-day window
      const farEndDate = new Date(now);
      farEndDate.setDate(farEndDate.getDate() + 100);
      const policyFarFromExpiry = createMockPolicy({ endDate: farEndDate });

      (policyRepository.findOne as jest.Mock).mockResolvedValue(policyFarFromExpiry);

      await expect(service.renewPolicy('pol_001', 'usr_abc123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow renewal within 30-day window', async () => {
      const now = new Date('2025-12-15T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      // endDate 15 days from now — within the 30-day window
      const withinWindow = new Date(now);
      withinWindow.setDate(withinWindow.getDate() + 15);
      const policyWithinWindow = createMockPolicy({ endDate: withinWindow });

      (policyRepository.findOne as jest.Mock).mockResolvedValue(policyWithinWindow);
      (policyRepository.save as jest.Mock).mockImplementation((p) => p);

      const result = await service.renewPolicy('pol_001', 'usr_abc123');

      expect(result).toBeDefined();
      expect(result.endDate).toBeDefined();
    });

    it('should return updated policy with save() called', async () => {
      const now = new Date('2025-12-15T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const withinWindow = new Date(now);
      withinWindow.setDate(withinWindow.getDate() + 15);
      const policyWithinWindow = createMockPolicy({ endDate: withinWindow });

      (policyRepository.findOne as jest.Mock).mockResolvedValue(policyWithinWindow);
      (policyRepository.save as jest.Mock).mockImplementation((p) => p);

      const result = await service.renewPolicy('pol_001', 'usr_abc123');

      expect(policyRepository.save).toHaveBeenCalled();
      expect(result).toEqual(policyWithinWindow);
    });
  });

  describe('submitClaim()', () => {
    let serviceWithClaim: CustomerService;
    let productRepo: jest.Mocked<Repository<Product>>;
    let policyRepo: jest.Mocked<Repository<Policy>>;
    let customerRepo: jest.Mocked<Repository<Customer>>;
    let claimRepo: jest.Mocked<Repository<Claim>>;

    const mockCustomer: Customer = {
      id: 'usr_abc123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: null,
      location: CustomerLocation.WEST_MALAYSIA,
      premiumPaid: 0,
      role: 'customer',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      policies: [],
      claims: [],
    };

    const mockPolicy: Policy = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-0001',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: mockCustomer,
      product: {} as Product,
      claims: [],
    };

    const mockClaimDto = {
      policyId: 'pol_abc123',
      type: ClaimType.ACCIDENT,
      description: 'Vehicle collision at intersection on main road',
      incidentDate: '2025-12-15',
      incidentLocation: 'Kuala Lumpur, Malaysia',
    };

    beforeEach(async () => {
      const mockProductRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockPolicyRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockCustomerRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const mockClaimRepo = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CustomerService,
          {
            provide: getRepositoryToken(Product),
            useValue: mockProductRepo,
          },
          {
            provide: getRepositoryToken(Policy),
            useValue: mockPolicyRepo,
          },
          {
            provide: getRepositoryToken(Customer),
            useValue: mockCustomerRepo,
          },
          {
            provide: getRepositoryToken(Claim),
            useValue: mockClaimRepo,
          },
        ],
      }).compile();

      serviceWithClaim = module.get<CustomerService>(CustomerService);
      productRepo = module.get(getRepositoryToken(Product));
      policyRepo = module.get(getRepositoryToken(Policy));
      customerRepo = module.get(getRepositoryToken(Customer));
      claimRepo = module.get(getRepositoryToken(Claim));
    });

    it('should create a claim with correct fields including claimNumber format CLM-YYYYMMDD-NNNN and status=submitted', async () => {
      const now = new Date('2026-03-15T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      policyRepo.findOne.mockResolvedValue(mockPolicy);
      claimRepo.create.mockReturnValue({} as Claim);
      claimRepo.save.mockResolvedValue({
        id: 'clm_abc123',
        claimNumber: 'CLM-20260315-0001',
        policyId: 'pol_abc123',
        customerId: 'usr_abc123',
        type: ClaimType.ACCIDENT,
        description: 'Vehicle collision at intersection on main road',
        incidentDate: new Date('2025-12-15'),
        incidentLocation: 'Kuala Lumpur, Malaysia',
        status: ClaimStatus.SUBMITTED,
        createdAt: now,
        updatedAt: now,
        policy: mockPolicy,
        customer: mockCustomer,
      } as Claim);

      const result = await serviceWithClaim.submitClaim('usr_abc123', mockClaimDto);

      const createdClaim = (claimRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdClaim.claimNumber).toMatch(/^CLM-\d{8}-\d{4}$/);
      expect(createdClaim.status).toBe(ClaimStatus.SUBMITTED);
      expect(result).toBeDefined();

      jest.useRealTimers();
    });

    it('should set customerId from authenticated user', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      claimRepo.create.mockReturnValue({} as Claim);
      claimRepo.save.mockResolvedValue({} as Claim);

      await serviceWithClaim.submitClaim('usr_abc123', mockClaimDto);

      const createdClaim = (claimRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdClaim.customerId).toBe('usr_abc123');
    });

    it('should throw NotFoundException if policy not found', async () => {
      policyRepo.findOne.mockResolvedValue(null);

      await expect(
        serviceWithClaim.submitClaim('usr_abc123', mockClaimDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if policy status is not active', async () => {
      const expiredPolicy = { ...mockPolicy, status: PolicyStatus.EXPIRED };
      policyRepo.findOne.mockResolvedValue(expiredPolicy);

      await expect(
        serviceWithClaim.submitClaim('usr_abc123', mockClaimDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if policy belongs to different customer', async () => {
      const otherCustomerPolicy = { ...mockPolicy, customerId: 'usr_different' };
      policyRepo.findOne.mockResolvedValue(otherCustomerPolicy);

      await expect(
        serviceWithClaim.submitClaim('usr_abc123', mockClaimDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should generate unique claimNumber per call', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      claimRepo.create.mockReturnValue({} as Claim);
      claimRepo.save
        .mockResolvedValueOnce({ claimNumber: 'CLM-20260315-0001' } as Claim)
        .mockResolvedValueOnce({ claimNumber: 'CLM-20260315-0002' } as Claim);

      const result1 = await serviceWithClaim.submitClaim('usr_abc123', mockClaimDto);
      const result2 = await serviceWithClaim.submitClaim('usr_abc123', mockClaimDto);

      expect(result1.claimNumber).not.toBe(result2.claimNumber);
    });

    it('should copy incidentDate and incidentLocation from DTO', async () => {
      policyRepo.findOne.mockResolvedValue(mockPolicy);
      claimRepo.create.mockReturnValue({} as Claim);
      claimRepo.save.mockResolvedValue({} as Claim);

      await serviceWithClaim.submitClaim('usr_abc123', mockClaimDto);

      const createdClaim = (claimRepo.create as jest.Mock).mock.calls[0][0];
      expect(createdClaim.incidentDate).toEqual(new Date('2025-12-15'));
      expect(createdClaim.incidentLocation).toBe('Kuala Lumpur, Malaysia');
    });

    it('should return the saved claim', async () => {
      const savedClaim: Claim = {
        id: 'clm_abc123',
        claimNumber: 'CLM-20260315-0001',
        policyId: 'pol_abc123',
        customerId: 'usr_abc123',
        type: ClaimType.ACCIDENT,
        description: 'Vehicle collision at intersection on main road',
        incidentDate: new Date('2025-12-15'),
        incidentLocation: 'Kuala Lumpur, Malaysia',
        status: ClaimStatus.SUBMITTED,
        createdAt: new Date(),
        updatedAt: new Date(),
        policy: mockPolicy,
        customer: mockCustomer,
      };

      policyRepo.findOne.mockResolvedValue(mockPolicy);
      claimRepo.create.mockReturnValue({} as Claim);
      claimRepo.save.mockResolvedValue(savedClaim);

      const result = await serviceWithClaim.submitClaim('usr_abc123', mockClaimDto);

      expect(claimRepo.save).toHaveBeenCalled();
      expect(result).toEqual(savedClaim);
    });
  });
});

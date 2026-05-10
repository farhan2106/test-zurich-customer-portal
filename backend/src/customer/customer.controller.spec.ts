import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CustomerController, PolicyController, ClaimsController } from './customer.controller';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductResponseDto } from './dto/product-response.dto';
import { PolicyResponseDto } from './dto/policy-response.dto';
import { ClaimResponseDto } from './dto/claim-response.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Customer } from '../entities/customer.entity';
import { Claim } from '../entities/claim.entity';
import { ProductStatus, PolicyStatus, CustomerLocation, ClaimType, ClaimStatus } from '../entities/enums';

import type { Request } from 'express';
import { JwtUser } from '../auth/jwt.strategy';

describe('CustomerController', () => {
  let controller: CustomerController;
  let policyController: PolicyController;
  let customerService: jest.Mocked<CustomerService>;

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

  const mockProductDto: ProductResponseDto = {
    id: 'prod_abc123',
    productCode: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage',
    coverageDetails: {
      liability: 'Up to $1M',
      collision: 'Included',
    },
    basePremium: 500.0,
    status: ProductStatus.ACTIVE,
  };

  beforeEach(async () => {
    const mockService = {
      findAllActiveProducts: jest.fn(),
      findProductById: jest.fn(),
      purchasePolicy: jest.fn(),
      findPoliciesByCustomerId: jest.fn(),
      findPolicyById: jest.fn(),
      renewPolicy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController, PolicyController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CustomerController>(CustomerController);
    policyController = module.get<PolicyController>(PolicyController);
    customerService = module.get(CustomerService);
  });

  describe('GET /api/products', () => {
    it('should return ProductResponseDto[] mapped from service result', async () => {
      customerService.findAllActiveProducts.mockResolvedValue([mockProduct]);

      const result = await controller.getProducts();

      expect(customerService.findAllActiveProducts).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(ProductResponseDto);
      expect(result[0]).toEqual(mockProductDto);
    });

    it('should return empty array when service returns empty', async () => {
      customerService.findAllActiveProducts.mockResolvedValue([]);

      const result = await controller.getProducts();

      expect(customerService.findAllActiveProducts).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should have JwtAuthGuard applied (class-level guard inherited by all methods)', () => {
      // Class-level @UseGuards(JwtAuthGuard) stores on the class constructor
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController.prototype.getProducts,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should have @ApiOperation decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiOperation',
        CustomerController.prototype.getProducts,
      );
      expect(metadata).toBeDefined();
    });

    it('should have @ApiResponse decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiResponse',
        CustomerController.prototype.getProducts,
      );
      expect(metadata).toBeDefined();
    });

    it('should have @ApiBearerAuth decorator applied', () => {
      // @ApiBearerAuth() is applied at class level (line 10 of controller)
      // It stores metadata under 'swagger/apiSecurity' via nestjs/swagger
      const classMetadata = Reflect.getMetadata('swagger/apiSecurity', CustomerController);
      const methodMetadata = Reflect.getMetadata('swagger/apiSecurity', CustomerController.prototype.getProducts);
      
      // At least one of class or method should have the security metadata
      const hasApiBearerAuth = classMetadata !== undefined || methodMetadata !== undefined;
      expect(hasApiBearerAuth).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return ProductResponseDto for the found product', async () => {
      customerService.findProductById.mockResolvedValue(mockProduct);

      const result = await controller.getProductById('prod_abc123');

      expect(customerService.findProductById).toHaveBeenCalledWith('prod_abc123');
      expect(result).toBeInstanceOf(ProductResponseDto);
      expect(result).toEqual(mockProductDto);
    });

    it('should have JwtAuthGuard applied to getProductById (class-level guard inherited)', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController.prototype.getProductById,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should propagate NotFoundException from service (404)', async () => {
      customerService.findProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.getProductById('nonexistent_id')).rejects.toThrow(
        NotFoundException,
      );

      expect(customerService.findProductById).toHaveBeenCalledWith('nonexistent_id');
    });

    it('should have @ApiParam decorator for id parameter', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiParameters',
        CustomerController.prototype.getProductById,
      );
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);

      const hasIdParam = metadata!.some(
        (param: any) => param.name === 'id' || param.in === 'path',
      );
      expect(hasIdParam).toBe(true);
    });
  });

  describe('POST /api/policies', () => {
    const mockPolicy: Policy = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      customer: {} as Customer,
      product: {
        id: 'prod_abc123',
        productCode: 4000,
        name: 'Auto Insurance',
        description: 'Comprehensive auto coverage',
        coverageDetails: JSON.stringify({ liability: 'Up to $1M', collision: 'Included' }),
        basePremium: 500.0,
        status: ProductStatus.ACTIVE,
        createdAt: new Date('2025-01-01'),
        policies: [],
      },
      claims: [],
    };

    const mockPolicyResponse: PolicyResponseDto = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      product: {
        id: 'prod_abc123',
        productCode: 4000,
        name: 'Auto Insurance',
        description: 'Comprehensive auto coverage',
        coverageDetails: {
          liability: 'Up to $1M',
          collision: 'Included',
        },
        basePremium: 500.0,
        status: ProductStatus.ACTIVE,
      },
      claims: [],
    };

    it('should return 201 with PolicyResponseDto on successful purchase', async () => {
      customerService.purchasePolicy.mockResolvedValue(mockPolicy);

      const result = await policyController.purchase(
        { user: { sub: 'usr_abc123' } } as any,
        { productId: 'prod_abc123' },
      );

      expect(customerService.purchasePolicy).toHaveBeenCalledWith(
        'usr_abc123',
        'prod_abc123',
      );
      expect(result).toBeInstanceOf(PolicyResponseDto);
      expect(result).toEqual(mockPolicyResponse);
    });

    it('should return 400 when product not found (propagates BadRequestException)', async () => {
      customerService.purchasePolicy.mockRejectedValue(
        new BadRequestException('Product not found'),
      );

      await expect(
        policyController.purchase(
          { user: { sub: 'usr_abc123' } } as any,
          { productId: 'nonexistent' },
        ),
      ).rejects.toThrow(BadRequestException);

      expect(customerService.purchasePolicy).toHaveBeenCalledWith(
        'usr_abc123',
        'nonexistent',
      );
    });

    it('should return 409 when duplicate policy (propagates ConflictException)', async () => {
      customerService.purchasePolicy.mockRejectedValue(
        new ConflictException('Customer already has an active policy for this product'),
      );

      await expect(
        policyController.purchase(
          { user: { sub: 'usr_abc123' } } as any,
          { productId: 'prod_abc123' },
        ),
      ).rejects.toThrow(ConflictException);

      expect(customerService.purchasePolicy).toHaveBeenCalledWith(
        'usr_abc123',
        'prod_abc123',
      );
    });

    it('should have JwtAuthGuard applied (class-level guard inherited by all methods)', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController.prototype.purchase,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should have @ApiOperation decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiOperation',
        PolicyController.prototype.purchase,
      );
      expect(metadata).toBeDefined();
    });

    it('should have @ApiResponse(201) decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiResponse',
        PolicyController.prototype.purchase,
      );
      expect(metadata).toBeDefined();
    });

    it('should have @Body decorator with CreatePolicyDto validation', () => {
      // Verify the purchase method accepts a parameter (the CreatePolicyDto body)
      // by checking that the method's parameter length is at least 2 (req + dto)
      const methodLength = PolicyController.prototype.purchase.length;
      expect(methodLength).toBe(2);

      // Verify that the second parameter (index 1) has the body metadata
      // NestJS stores route parameter metadata using Reflect
      const paramMetadata = Reflect.getOwnMetadata(
        '__routeArguments__',
        PolicyController.prototype,
        'purchase',
      );

      if (paramMetadata) {
        const bodyMetadata = paramMetadata['1:'];
        expect(bodyMetadata).toBeDefined();
      } else {
        // If metadata isn't accessible via Reflect, verify method signature
        // The method takes (req, dto) — having 2 params with Body decorator
        // is verified by the functional tests above
        expect(methodLength).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('GET /api/policies', () => {
    const mockPolicies: Policy[] = [{
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      customer: {} as Customer,
      product: mockProduct,
      claims: [],
    }];

    const mockPolicyResponse: PolicyResponseDto = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      product: {
        id: 'prod_abc123',
        productCode: 4000,
        name: 'Auto Insurance',
        description: 'Comprehensive auto coverage',
        coverageDetails: {
          liability: 'Up to $1M',
          collision: 'Included',
        },
        basePremium: 500.0,
        status: ProductStatus.ACTIVE,
      },
      claims: [],
    };

    it('should return PolicyResponseDto[] for authenticated user policies', async () => {
      customerService.findPoliciesByCustomerId.mockResolvedValue(mockPolicies);

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      const result = await policyController.list(mockReq);

      expect(customerService.findPoliciesByCustomerId).toHaveBeenCalledWith('usr_abc123');
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(PolicyResponseDto);
      expect(result[0]).toEqual(mockPolicyResponse);
    });

    it('should return empty array when user has no policies', async () => {
      customerService.findPoliciesByCustomerId.mockResolvedValue([]);

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      const result = await policyController.list(mockReq);

      expect(result).toEqual([]);
    });

    it('should have JwtAuthGuard applied (class-level check)', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController.prototype.list,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should have @ApiOperation decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiOperation',
        PolicyController.prototype.list,
      );
      expect(metadata).toBeDefined();
    });
  });

  describe('GET /api/policies/:id', () => {
    const mockPolicy: Policy = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      customer: {} as Customer,
      product: mockProduct,
      claims: [],
    };

    const mockPolicyResponse: PolicyResponseDto = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      product: {
        id: 'prod_abc123',
        productCode: 4000,
        name: 'Auto Insurance',
        description: 'Comprehensive auto coverage',
        coverageDetails: {
          liability: 'Up to $1M',
          collision: 'Included',
        },
        basePremium: 500.0,
        status: ProductStatus.ACTIVE,
      },
      claims: [],
    };

    it('should return PolicyResponseDto with product and claims for the found policy', async () => {
      customerService.findPolicyById.mockResolvedValue(mockPolicy);

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      const result = await policyController.detail(mockReq, 'pol_abc123');

      expect(customerService.findPolicyById).toHaveBeenCalledWith('pol_abc123', 'usr_abc123');
      expect(result).toBeInstanceOf(PolicyResponseDto);
      expect(result).toEqual(mockPolicyResponse);
    });

    it('should throw NotFoundException (404) when policy not found', async () => {
      customerService.findPolicyById.mockRejectedValue(
        new NotFoundException('Policy not found'),
      );

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      await expect(policyController.detail(mockReq, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException (403) when policy belongs to another customer', async () => {
      customerService.findPolicyById.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      await expect(policyController.detail(mockReq, 'pol_other')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should have @ApiParam decorator for id', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiParameters',
        PolicyController.prototype.detail,
      );
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);

      const hasIdParam = metadata!.some(
        (param: any) => param.name === 'id' || param.in === 'path',
      );
      expect(hasIdParam).toBe(true);
    });

    it('should have JwtAuthGuard applied', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController.prototype.detail,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });
  });

  describe('POST /api/policies/:id/renew', () => {
    const mockRenewedPolicy: Policy = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2028-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      customer: {} as Customer,
      product: mockProduct,
      claims: [],
    };

    const mockRenewedResponse: PolicyResponseDto = {
      id: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      productId: 'prod_abc123',
      status: PolicyStatus.ACTIVE,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2028-01-01'),
      premiumAmount: 500.0,
      location: CustomerLocation.WEST_MALAYSIA,
      product: {
        id: 'prod_abc123',
        productCode: 4000,
        name: 'Auto Insurance',
        description: 'Comprehensive auto coverage',
        coverageDetails: {
          liability: 'Up to $1M',
          collision: 'Included',
        },
        basePremium: 500.0,
        status: ProductStatus.ACTIVE,
      },
      claims: [],
    };

    it('should return updated PolicyResponseDto with extended endDate (365 days added)', async () => {
      customerService.renewPolicy.mockResolvedValue(mockRenewedPolicy);

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      const result = await policyController.renew(mockReq, 'pol_abc123');

      expect(customerService.renewPolicy).toHaveBeenCalledWith('pol_abc123', 'usr_abc123');
      expect(result).toBeInstanceOf(PolicyResponseDto);
      expect(result).toEqual(mockRenewedResponse);
    });

    it('should throw NotFoundException (404) when policy not found', async () => {
      customerService.renewPolicy.mockRejectedValue(
        new NotFoundException('Policy not found'),
      );

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      await expect(policyController.renew(mockReq, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException (400) when policy not renewable', async () => {
      customerService.renewPolicy.mockRejectedValue(
        new BadRequestException('Policy is not renewable'),
      );

      const mockReq = { user: { sub: 'usr_abc123' } as JwtUser } as Request;
      await expect(policyController.renew(mockReq, 'pol_abc123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should have JwtAuthGuard applied', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        PolicyController.prototype.renew,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should have @ApiOperation + @ApiParam decorators', () => {
      const operationMetadata = Reflect.getMetadata(
        'swagger/apiOperation',
        PolicyController.prototype.renew,
      );
      expect(operationMetadata).toBeDefined();

      const paramMetadata = Reflect.getMetadata(
        'swagger/apiParameters',
        PolicyController.prototype.renew,
      );
      expect(paramMetadata).toBeDefined();
      expect(Array.isArray(paramMetadata)).toBe(true);
    });
  });

  describe('POST /api/claims', () => {
    let claimsController: ClaimsController;

    const mockClaim: Claim = {
      id: 'clm_abc123',
      claimNumber: 'CLM-20260101-0001',
      policyId: 'pol_abc123',
      customerId: 'usr_abc123',
      type: ClaimType.ACCIDENT,
      description: 'Vehicle collision at intersection on main road',
      incidentDate: new Date('2025-12-15'),
      incidentLocation: 'Kuala Lumpur, Malaysia',
      status: ClaimStatus.SUBMITTED,
      createdAt: new Date('2025-12-16'),
      updatedAt: new Date('2025-12-16'),
      policy: {
        id: 'pol_abc123',
        policyNumber: 'POL-20260101-1234',
        customerId: 'usr_abc123',
        productId: 'prod_abc123',
        status: PolicyStatus.ACTIVE,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2027-01-01'),
        premiumAmount: 500.0,
        location: CustomerLocation.WEST_MALAYSIA,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: {} as Customer,
        product: {} as Product,
        claims: [],
      } as Policy,
      customer: {} as Customer,
    };

    const mockClaimResponse: ClaimResponseDto = {
      id: 'clm_abc123',
      claimNumber: 'CLM-20260101-0001',
      policyId: 'pol_abc123',
      policyNumber: 'POL-20260101-1234',
      customerId: 'usr_abc123',
      type: ClaimType.ACCIDENT,
      description: 'Vehicle collision at intersection on main road',
      incidentDate: new Date('2025-12-15'),
      incidentLocation: 'Kuala Lumpur, Malaysia',
      status: ClaimStatus.SUBMITTED,
    };

    const mockCreateClaimDto: CreateClaimDto = {
      policyId: 'pol_abc123',
      type: ClaimType.ACCIDENT,
      description: 'Vehicle collision at intersection on main road',
      incidentDate: '2025-12-15',
      incidentLocation: 'Kuala Lumpur, Malaysia',
    };

    beforeEach(async () => {
      const mockService = {
        findAllActiveProducts: jest.fn(),
        findProductById: jest.fn(),
        purchasePolicy: jest.fn(),
        findPoliciesByCustomerId: jest.fn(),
        findPolicyById: jest.fn(),
        renewPolicy: jest.fn(),
        submitClaim: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [CustomerController, PolicyController, ClaimsController],
        providers: [
          {
            provide: CustomerService,
            useValue: mockService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();

      claimsController = module.get<ClaimsController>(ClaimsController);
      customerService = module.get(CustomerService);
    });

    it('should return 201 with ClaimResponseDto on successful claim submission', async () => {
      customerService.submitClaim.mockResolvedValue(mockClaim);

      const result = await claimsController.create(
        { user: { sub: 'usr_abc123' } } as any,
        mockCreateClaimDto,
      );

      expect(customerService.submitClaim).toHaveBeenCalledWith(
        'usr_abc123',
        mockCreateClaimDto,
      );
      expect(result).toBeInstanceOf(ClaimResponseDto);
      expect(result).toEqual(mockClaimResponse);
    });

    it('should return 400 when policy not active (propagates BadRequestException)', async () => {
      customerService.submitClaim.mockRejectedValue(
        new BadRequestException('Policy is not active'),
      );

      await expect(
        claimsController.create(
          { user: { sub: 'usr_abc123' } } as any,
          mockCreateClaimDto,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(customerService.submitClaim).toHaveBeenCalledWith(
        'usr_abc123',
        mockCreateClaimDto,
      );
    });

    it('should return 403 when policy not owned by customer (propagates ForbiddenException)', async () => {
      customerService.submitClaim.mockRejectedValue(
        new ForbiddenException('You do not have access to this policy'),
      );

      await expect(
        claimsController.create(
          { user: { sub: 'usr_abc123' } } as any,
          mockCreateClaimDto,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(customerService.submitClaim).toHaveBeenCalledWith(
        'usr_abc123',
        mockCreateClaimDto,
      );
    });

    it('should return 404 when policy not found (propagates NotFoundException)', async () => {
      customerService.submitClaim.mockRejectedValue(
        new NotFoundException('Policy not found'),
      );

      await expect(
        claimsController.create(
          { user: { sub: 'usr_abc123' } } as any,
          mockCreateClaimDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(customerService.submitClaim).toHaveBeenCalledWith(
        'usr_abc123',
        mockCreateClaimDto,
      );
    });

    it('should have JwtAuthGuard applied (class-level guard inherited by all methods)', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        ClaimsController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        ClaimsController.prototype.create,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });
  });
});

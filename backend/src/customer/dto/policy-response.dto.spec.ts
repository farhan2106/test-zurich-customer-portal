import { PolicyResponseDto } from './policy-response.dto';
import { Policy } from '../../entities/policy.entity';
import { Product } from '../../entities/product.entity';
import { Claim } from '../../entities/claim.entity';
import { Customer } from '../../entities/customer.entity';
import { PolicyStatus, CustomerLocation, ProductStatus, ClaimType, ClaimStatus } from '../../entities/enums';

describe('PolicyResponseDto', () => {
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

  const mockClaim: Claim = {
    id: 'clm_abc123',
    claimNumber: 'CLM-20260101-0001',
    policyId: 'pol_abc123',
    customerId: 'usr_abc123',
    type: ClaimType.ACCIDENT,
    description: 'Rear-end collision',
    incidentDate: new Date('2026-01-15'),
    incidentLocation: 'Kuala Lumpur',
    status: ClaimStatus.SUBMITTED,
    createdAt: new Date('2026-01-16'),
    updatedAt: new Date('2026-01-16'),
    policy: {} as Policy,
    customer: mockCustomer,
  };

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
    customer: mockCustomer,
    product: mockProduct,
    claims: [mockClaim],
  };

  describe('fromEntity()', () => {
    it('should map all basic fields from policy entity', () => {
      const policyWithoutRelations: Policy = {
        ...mockPolicy,
        product: undefined as unknown as Product,
        claims: undefined as unknown as Claim[],
        customer: undefined as unknown as Customer,
      };

      const dto = PolicyResponseDto.fromEntity(policyWithoutRelations);

      expect(dto.id).toBe('pol_abc123');
      expect(dto.policyNumber).toBe('POL-20260101-1234');
      expect(dto.customerId).toBe('usr_abc123');
      expect(dto.productId).toBe('prod_abc123');
      expect(dto.status).toBe(PolicyStatus.ACTIVE);
      expect(dto.startDate).toEqual(new Date('2026-01-01'));
      expect(dto.endDate).toEqual(new Date('2027-01-01'));
      expect(dto.premiumAmount).toBe(500.0);
      expect(dto.location).toBe(CustomerLocation.WEST_MALAYSIA);
    });

    it('should map nested product when policy.product is loaded', () => {
      const dto = PolicyResponseDto.fromEntity(mockPolicy);

      expect(dto.product).toBeDefined();
      expect(dto.product?.id).toBe('prod_abc123');
      expect(dto.product?.productCode).toBe(4000);
      expect(dto.product?.name).toBe('Auto Insurance');
      expect(dto.product?.status).toBe(ProductStatus.ACTIVE);
    });

    it('should return undefined for product when not eagerly loaded', () => {
      const policyWithoutProduct: Policy = {
        ...mockPolicy,
        product: undefined as unknown as Product,
      };

      const dto = PolicyResponseDto.fromEntity(policyWithoutProduct);

      expect(dto.product).toBeUndefined();
    });

    it('should map nested claims array when policy.claims is loaded', () => {
      const dto = PolicyResponseDto.fromEntity(mockPolicy);

      expect(dto.claims).toBeDefined();
      expect(Array.isArray(dto.claims)).toBe(true);
      expect(dto.claims.length).toBe(1);
      expect(dto.claims[0].id).toBe('clm_abc123');
      expect(dto.claims[0].claimNumber).toBe('CLM-20260101-0001');
      expect(dto.claims[0].type).toBe(ClaimType.ACCIDENT);
      expect(dto.claims[0].status).toBe(ClaimStatus.SUBMITTED);
    });

    it('should return empty array for claims when not loaded', () => {
      const policyWithoutClaims: Policy = {
        ...mockPolicy,
        claims: undefined as unknown as Claim[],
      };

      const dto = PolicyResponseDto.fromEntity(policyWithoutClaims);

      expect(dto.claims).toEqual([]);
    });

    it('should return empty array for claims when claims is empty', () => {
      const policyWithEmptyClaims: Policy = {
        ...mockPolicy,
        claims: [],
      };

      const dto = PolicyResponseDto.fromEntity(policyWithEmptyClaims);

      expect(dto.claims).toEqual([]);
    });
  });

  describe('@ApiProperty decorators', () => {
    it('should have @ApiProperty on id field', () => {
      const dto = new PolicyResponseDto();
      expect('id' in dto).toBe(true);
    });

    it('should have @ApiProperty on policyNumber field', () => {
      const dto = new PolicyResponseDto();
      expect('policyNumber' in dto).toBe(true);
    });

    it('should have @ApiProperty on customerId field', () => {
      const dto = new PolicyResponseDto();
      expect('customerId' in dto).toBe(true);
    });

    it('should have @ApiProperty on productId field', () => {
      const dto = new PolicyResponseDto();
      expect('productId' in dto).toBe(true);
    });

    it('should have @ApiProperty on status field', () => {
      const dto = new PolicyResponseDto();
      expect('status' in dto).toBe(true);
    });

    it('should have @ApiProperty on startDate field', () => {
      const dto = new PolicyResponseDto();
      expect('startDate' in dto).toBe(true);
    });

    it('should have @ApiProperty on endDate field', () => {
      const dto = new PolicyResponseDto();
      expect('endDate' in dto).toBe(true);
    });

    it('should have @ApiProperty on premiumAmount field', () => {
      const dto = new PolicyResponseDto();
      expect('premiumAmount' in dto).toBe(true);
    });

    it('should have @ApiProperty on location field', () => {
      const dto = new PolicyResponseDto();
      expect('location' in dto).toBe(true);
    });

    it('should have @ApiProperty on product field', () => {
      const dto = new PolicyResponseDto();
      expect('product' in dto).toBe(true);
    });

    it('should have @ApiProperty on claims field', () => {
      const dto = new PolicyResponseDto();
      expect('claims' in dto).toBe(true);
    });
  });
});

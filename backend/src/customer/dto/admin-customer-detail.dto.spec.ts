import { AdminCustomerDetailDto } from './admin-customer-detail.dto';
import { Customer } from '../../entities/customer.entity';
import { Policy } from '../../entities/policy.entity';
import { Claim } from '../../entities/claim.entity';
import { CustomerLocation, CustomerRole, PolicyStatus } from '../../entities/enums';

describe('AdminCustomerDetailDto', () => {
  const createMockCustomer = (overrides: Partial<Customer> = {}): Customer => ({
    id: 'usr_abc123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    photoUrl: 'https://example.com/photo.jpg',
    location: CustomerLocation.WEST_MALAYSIA,
    premiumPaid: 1500.5,
    role: CustomerRole.CUSTOMER,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-06-15'),
    policies: [],
    claims: [],
    ...overrides,
  });

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
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    customer: {} as Customer,
    product: {} as any,
    claims: [],
    ...overrides,
  });

  const createMockClaim = (overrides: Partial<Claim> = {}): Claim => ({
    id: 'clm_001',
    claimNumber: 'CLM-20260101-0001',
    policyId: 'pol_001',
    customerId: 'usr_abc123',
    type: 'accident' as any,
    description: 'Test claim',
    incidentDate: new Date('2025-12-15'),
    incidentLocation: 'Kuala Lumpur',
    status: 'submitted' as any,
    createdAt: new Date('2025-12-16'),
    updatedAt: new Date('2025-12-16'),
    policy: {} as Policy,
    customer: {} as Customer,
    ...overrides,
  });

  describe('fromEntity()', () => {
    it('should include all Customer fields (id, email, firstName, lastName, photoUrl, location, premiumPaid, role, createdAt, updatedAt)', () => {
      const customer = createMockCustomer();
      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.id).toBe('usr_abc123');
      expect(dto.email).toBe('john@example.com');
      expect(dto.firstName).toBe('John');
      expect(dto.lastName).toBe('Doe');
      expect(dto.photoUrl).toBe('https://example.com/photo.jpg');
      expect(dto.location).toBe(CustomerLocation.WEST_MALAYSIA);
      expect(dto.premiumPaid).toBe(1500.5);
      expect(dto.role).toBe(CustomerRole.CUSTOMER);
      expect(dto.createdAt).toEqual(new Date('2025-01-01'));
      expect(dto.updatedAt).toEqual(new Date('2025-06-15'));
    });

    it('should include policies array from entity', () => {
      const policies = [createMockPolicy(), createMockPolicy({ id: 'pol_002' })];
      const customer = createMockCustomer({ policies });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.policies).toBeDefined();
      expect(Array.isArray(dto.policies)).toBe(true);
      expect(dto.policies.length).toBe(2);
    });

    it('should include claims array from entity', () => {
      const claims = [createMockClaim(), createMockClaim({ id: 'clm_002' })];
      const customer = createMockCustomer({ claims });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.claims).toBeDefined();
      expect(Array.isArray(dto.claims)).toBe(true);
      expect(dto.claims.length).toBe(2);
    });

    it('should handle empty policies array', () => {
      const customer = createMockCustomer({ policies: [] });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.policies).toBeDefined();
      expect(dto.policies).toEqual([]);
    });

    it('should handle empty claims array', () => {
      const customer = createMockCustomer({ claims: [] });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.claims).toBeDefined();
      expect(dto.claims).toEqual([]);
    });

    it('should handle null photoUrl', () => {
      const customer = createMockCustomer({ photoUrl: null });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.photoUrl).toBeNull();
    });

    it('should handle zero premiumPaid', () => {
      const customer = createMockCustomer({ premiumPaid: 0 });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto.premiumPaid).toBe(0);
    });

    it('should map all fields at once for a complete entity with policies and claims', () => {
      const policies = [createMockPolicy()];
      const claims = [createMockClaim()];
      const customer = createMockCustomer({ policies, claims });

      const dto = AdminCustomerDetailDto.fromEntity(customer);

      expect(dto).toEqual({
        id: 'usr_abc123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        photoUrl: 'https://example.com/photo.jpg',
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 1500.5,
        role: CustomerRole.CUSTOMER,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-06-15'),
        policies: policies,
        claims: claims,
      });
    });
  });

  describe('decorators', () => {
    it('should have policies property defined', () => {
      const dto = new AdminCustomerDetailDto();
      expect('policies' in dto).toBe(true);
    });

    it('should have claims property defined', () => {
      const dto = new AdminCustomerDetailDto();
      expect('claims' in dto).toBe(true);
    });

    it('should have id property defined (inherited from CustomerResponseDto)', () => {
      const dto = new AdminCustomerDetailDto();
      expect('id' in dto).toBe(true);
    });

    it('should have email property defined (inherited from CustomerResponseDto)', () => {
      const dto = new AdminCustomerDetailDto();
      expect('email' in dto).toBe(true);
    });
  });
});

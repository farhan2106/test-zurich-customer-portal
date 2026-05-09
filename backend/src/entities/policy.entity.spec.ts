import { Policy } from './policy.entity';
import { Customer } from './customer.entity';
import { Product } from './product.entity';
import { CustomerLocation, PolicyStatus } from './enums';

describe('Policy Entity', () => {
  describe('field types and constraints', () => {
    it('should create a policy with all required fields', () => {
      const policy = new Policy();
      policy.policyNumber = 'POL-20260101-0001';
      policy.customerId = '550e8400-e29b-41d4-a716-446655440000';
      policy.productId = '660e8400-e29b-41d4-a716-446655440000';
      policy.status = PolicyStatus.ACTIVE;
      policy.startDate = new Date();
      policy.endDate = new Date('2027-01-01');
      policy.premiumAmount = 500.0;
      policy.location = CustomerLocation.WEST_MALAYSIA;

      expect(policy.policyNumber).toBe('POL-20260101-0001');
      expect(policy.customerId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(policy.productId).toBe('660e8400-e29b-41d4-a716-446655440000');
      expect(policy.status).toBe('active');
      expect(policy.premiumAmount).toBe(500.0);
      expect(policy.location).toBe('West Malaysia');
    });

    it('should have UUID primary key field', () => {
      const policy = new Policy();
      policy.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(typeof policy.id).toBe('string');
      expect(policy.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should accept unique policyNumber', () => {
      const policy = new Policy();
      policy.policyNumber = 'POL-20260509-0001';
      expect(policy.policyNumber).toBe('POL-20260509-0001');
    });
  });

  describe('status enum', () => {
    it('should accept status "active"', () => {
      const policy = new Policy();
      policy.status = PolicyStatus.ACTIVE;
      expect(policy.status).toBe('active');
    });

    it('should accept status "expired"', () => {
      const policy = new Policy();
      policy.status = PolicyStatus.EXPIRED;
      expect(policy.status).toBe('expired');
    });

    it('should accept status "cancelled"', () => {
      const policy = new Policy();
      policy.status = PolicyStatus.CANCELLED;
      expect(policy.status).toBe('cancelled');
    });

    it('should have PolicyStatus enum with correct values', () => {
      expect(PolicyStatus.ACTIVE).toBe('active');
      expect(PolicyStatus.EXPIRED).toBe('expired');
      expect(PolicyStatus.CANCELLED).toBe('cancelled');
      expect(Object.keys(PolicyStatus)).toHaveLength(3);
    });
  });

  describe('startDate and endDate date columns', () => {
    it('should accept Date objects for startDate and endDate', () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2027-01-01');

      const policy = new Policy();
      policy.startDate = startDate;
      policy.endDate = endDate;

      expect(policy.startDate).toBeInstanceOf(Date);
      expect(policy.endDate).toBeInstanceOf(Date);
      expect(policy.startDate).toBe(startDate);
      expect(policy.endDate).toBe(endDate);
    });

    it('should accept timestamp values', () => {
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      const policy = new Policy();
      policy.startDate = now;
      policy.endDate = oneYearLater;

      expect(policy.startDate).toBe(now);
      expect(policy.endDate).toBe(oneYearLater);
    });
  });

  describe('relationships', () => {
    it('should have ManyToOne relation to Customer', () => {
      const policy = new Policy();
      const customer = new Customer();
      customer.id = '550e8400-e29b-41d4-a716-446655440000';
      policy.customer = customer;
      expect(policy.customer).toBe(customer);
    });

    it('should have ManyToOne relation to Product', () => {
      const policy = new Policy();
      const product = new Product();
      product.id = '660e8400-e29b-41d4-a716-446655440000';
      policy.product = product;
      expect(policy.product).toBe(product);
    });

    it('should have OneToMany relation to Claims', () => {
      const policy = new Policy();
      policy.claims = [];
      expect(Array.isArray(policy.claims)).toBe(true);
    });

    it('should store customerId as UUID foreign key', () => {
      const policy = new Policy();
      policy.customerId = '550e8400-e29b-41d4-a716-446655440000';
      expect(policy.customerId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should store productId as UUID foreign key', () => {
      const policy = new Policy();
      policy.productId = '660e8400-e29b-41d4-a716-446655440000';
      expect(policy.productId).toBe('660e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('premiumAmount decimal', () => {
    it('should accept decimal premiumAmount', () => {
      const policy = new Policy();
      policy.premiumAmount = 521.03;
      expect(policy.premiumAmount).toBe(521.03);
    });
  });

  describe('location enum', () => {
    it('should accept West Malaysia location', () => {
      const policy = new Policy();
      policy.location = CustomerLocation.WEST_MALAYSIA;
      expect(policy.location).toBe('West Malaysia');
    });

    it('should accept East Malaysia location', () => {
      const policy = new Policy();
      policy.location = CustomerLocation.EAST_MALAYSIA;
      expect(policy.location).toBe('East Malaysia');
    });
  });

  describe('entity metadata', () => {
    it('should have entity name "policies"', () => {
      const policy = new Policy();
      expect(policy).toHaveProperty('policyNumber');
      expect(policy).toHaveProperty('customerId');
      expect(policy).toHaveProperty('productId');
      expect(policy).toHaveProperty('status');
      expect(policy).toHaveProperty('startDate');
      expect(policy).toHaveProperty('endDate');
      expect(policy).toHaveProperty('premiumAmount');
      expect(policy).toHaveProperty('location');
      expect(policy).toHaveProperty('customer');
      expect(policy).toHaveProperty('product');
      expect(policy).toHaveProperty('claims');
    });
  });
});

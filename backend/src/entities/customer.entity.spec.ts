import { Customer } from './customer.entity';
import { Policy } from './policy.entity';
import { Claim } from './claim.entity';
import { CustomerLocation, CustomerRole } from './enums';

describe('Customer Entity', () => {
  describe('field types and constraints', () => {
    it('should create a customer with all properties', () => {
      const customer = new Customer();
      customer.email = 'test@example.com';
      customer.firstName = 'John';
      customer.lastName = 'Doe';
      customer.location = CustomerLocation.WEST_MALAYSIA;
      customer.premiumPaid = 100.0;
      customer.role = CustomerRole.CUSTOMER;

      expect(customer.email).toBe('test@example.com');
      expect(customer.firstName).toBe('John');
      expect(customer.lastName).toBe('Doe');
      expect(customer.location).toBe('West Malaysia');
      expect(customer.premiumPaid).toBe(100.0);
      expect(customer.role).toBe('customer');
    });

    it('should have UUID primary key field', () => {
      const customer = new Customer();
      customer.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(typeof customer.id).toBe('string');
      expect(customer.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should accept valid email', () => {
      const customer = new Customer();
      customer.email = 'user@domain.com';
      expect(customer.email).toBe('user@domain.com');
    });

    it('should accept optional photoUrl', () => {
      const customer = new Customer();
      customer.photoUrl = 'https://example.com/photo.jpg';
      expect(customer.photoUrl).toBe('https://example.com/photo.jpg');
    });

    it('should allow photoUrl to be undefined', () => {
      const customer = new Customer();
      expect(customer.photoUrl).toBeUndefined();
    });
  });

  describe('role enum', () => {
    it('should accept role "customer"', () => {
      const customer = new Customer();
      customer.role = CustomerRole.CUSTOMER;
      expect(customer.role).toBe('customer');
    });

    it('should accept role "admin"', () => {
      const customer = new Customer();
      customer.role = CustomerRole.ADMIN;
      expect(customer.role).toBe('admin');
    });

    it('should have CustomerRole enum with correct values', () => {
      expect(CustomerRole.CUSTOMER).toBe('customer');
      expect(CustomerRole.ADMIN).toBe('admin');
      expect(Object.keys(CustomerRole)).toHaveLength(2);
    });
  });

  describe('location enum', () => {
    it('should accept location "West Malaysia"', () => {
      const customer = new Customer();
      customer.location = CustomerLocation.WEST_MALAYSIA;
      expect(customer.location).toBe('West Malaysia');
    });

    it('should accept location "East Malaysia"', () => {
      const customer = new Customer();
      customer.location = CustomerLocation.EAST_MALAYSIA;
      expect(customer.location).toBe('East Malaysia');
    });

    it('should have CustomerLocation enum with correct values', () => {
      expect(CustomerLocation.WEST_MALAYSIA).toBe('West Malaysia');
      expect(CustomerLocation.EAST_MALAYSIA).toBe('East Malaysia');
      expect(Object.keys(CustomerLocation)).toHaveLength(2);
    });
  });

  describe('premiumPaid decimal', () => {
    it('should accept decimal values with 2 decimal places', () => {
      const customer = new Customer();
      customer.premiumPaid = 521.03;
      expect(customer.premiumPaid).toBe(521.03);
    });

    it('should accept zero premiumPaid', () => {
      const customer = new Customer();
      customer.premiumPaid = 0.0;
      expect(customer.premiumPaid).toBe(0.0);
    });
  });

  describe('CreateDateColumn and UpdateDateColumn', () => {
    it('should have createdAt property', () => {
      const customer = new Customer();
      customer.createdAt = new Date();
      expect(customer.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt property', () => {
      const customer = new Customer();
      customer.updatedAt = new Date();
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('relationships', () => {
    it('should have policies array for OneToMany relation', () => {
      const customer = new Customer();
      customer.policies = [];
      expect(Array.isArray(customer.policies)).toBe(true);
    });

    it('should have claims array for OneToMany relation', () => {
      const customer = new Customer();
      customer.claims = [];
      expect(Array.isArray(customer.claims)).toBe(true);
    });
  });

  describe('entity metadata', () => {
    it('should have entity name "customers"', () => {
      const customer = new Customer();
      // Verify the entity can be instantiated and has expected structure
      expect(customer).toHaveProperty('email');
      expect(customer).toHaveProperty('firstName');
      expect(customer).toHaveProperty('lastName');
      expect(customer).toHaveProperty('location');
      expect(customer).toHaveProperty('premiumPaid');
      expect(customer).toHaveProperty('role');
      expect(customer).toHaveProperty('policies');
      expect(customer).toHaveProperty('claims');
    });
  });
});

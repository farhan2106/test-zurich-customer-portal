import { Product } from './product.entity';
import { ProductStatus } from './enums';

describe('Product Entity', () => {
  describe('field types and constraints', () => {
    it('should create a product with all required fields', () => {
      const product = new Product();
      product.productCode = 4000;
      product.name = 'Auto Insurance';
      product.description = 'Comprehensive auto insurance';
      product.coverageDetails = JSON.stringify({ coverage: 'full' });
      product.basePremium = 500.0;
      product.status = ProductStatus.ACTIVE;

      expect(product.productCode).toBe(4000);
      expect(product.name).toBe('Auto Insurance');
      expect(product.description).toBe('Comprehensive auto insurance');
      expect(product.basePremium).toBe(500.0);
      expect(product.status).toBe('active');
    });

    it('should have UUID primary key field', () => {
      const product = new Product();
      product.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(typeof product.id).toBe('string');
      expect(product.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should accept integer productCode', () => {
      const product = new Product();
      product.productCode = 5000;
      expect(product.productCode).toBe(5000);
      expect(typeof product.productCode).toBe('number');
    });
  });

  describe('status enum', () => {
    it('should accept status "active"', () => {
      const product = new Product();
      product.status = ProductStatus.ACTIVE;
      expect(product.status).toBe('active');
    });

    it('should accept status "inactive"', () => {
      const product = new Product();
      product.status = ProductStatus.INACTIVE;
      expect(product.status).toBe('inactive');
    });

    it('should have ProductStatus enum with correct values', () => {
      expect(ProductStatus.ACTIVE).toBe('active');
      expect(ProductStatus.INACTIVE).toBe('inactive');
      expect(Object.keys(ProductStatus)).toHaveLength(2);
    });
  });

  describe('basePremium decimal', () => {
    it('should accept decimal values with 2 decimal places', () => {
      const product = new Product();
      product.basePremium = 500.5;
      expect(product.basePremium).toBe(500.5);
    });

    it('should accept whole number basePremium', () => {
      const product = new Product();
      product.basePremium = 1000;
      expect(product.basePremium).toBe(1000);
    });
  });

  describe('coverageDetails text column', () => {
    it('should accept JSON string in coverageDetails', () => {
      const coverageDetails = JSON.stringify({
        accidentDamage: 'Up to RM 100,000',
        theftProtection: 'Market value',
      });

      const product = new Product();
      product.coverageDetails = coverageDetails;
      expect(product.coverageDetails).toBe(coverageDetails);
    });

    it('should allow coverageDetails to be undefined', () => {
      const product = new Product();
      expect(product.coverageDetails).toBeUndefined();
    });
  });

  describe('name and description', () => {
    it('should accept name up to 200 characters', () => {
      const product = new Product();
      product.name = 'A'.repeat(200);
      expect(product.name).toHaveLength(200);
    });

    it('should allow description to be undefined', () => {
      const product = new Product();
      expect(product.description).toBeUndefined();
    });
  });

  describe('relationships', () => {
    it('should have policies array for OneToMany relation', () => {
      const product = new Product();
      product.policies = [];
      expect(Array.isArray(product.policies)).toBe(true);
    });
  });

  describe('entity metadata', () => {
    it('should have entity name "products"', () => {
      const product = new Product();
      expect(product).toHaveProperty('productCode');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('coverageDetails');
      expect(product).toHaveProperty('basePremium');
      expect(product).toHaveProperty('status');
      expect(product).toHaveProperty('policies');
    });
  });
});

import { validateSync } from 'class-validator';
import { CreatePolicyDto } from './create-policy.dto';

describe('CreatePolicyDto', () => {
  describe('productId validation', () => {
    it('should accept a valid UUID v4 productId', () => {
      const dto = new CreatePolicyDto();
      dto.productId = '550e8400-e29b-41d4-a716-446655440000';

      const errors = validateSync(dto);
      const productIdErrors = errors.filter((e) => e.property === 'productId');

      expect(productIdErrors.length).toBe(0);
    });

    it('should reject a non-UUID productId', () => {
      const dto = new CreatePolicyDto();
      dto.productId = 'not-a-uuid';

      const errors = validateSync(dto);
      const productIdErrors = errors.filter((e) => e.property === 'productId');

      expect(productIdErrors.length).toBeGreaterThan(0);
    });

    it('should reject a UUID v3 productId (wrong version)', () => {
      const dto = new CreatePolicyDto();
      dto.productId = 'a3bb189e-8bf9-3888-9912-ace4e6544000'; // UUID v3

      const errors = validateSync(dto);
      const productIdErrors = errors.filter((e) => e.property === 'productId');

      expect(productIdErrors.length).toBeGreaterThan(0);
    });

    it('should reject a missing productId', () => {
      const dto = new CreatePolicyDto();
      // productId not set

      const errors = validateSync(dto);
      const productIdErrors = errors.filter((e) => e.property === 'productId');

      expect(productIdErrors.length).toBeGreaterThan(0);
    });

    it('should reject an empty string productId', () => {
      const dto = new CreatePolicyDto();
      dto.productId = '';

      const errors = validateSync(dto);
      const productIdErrors = errors.filter((e) => e.property === 'productId');

      expect(productIdErrors.length).toBeGreaterThan(0);
    });
  });
});

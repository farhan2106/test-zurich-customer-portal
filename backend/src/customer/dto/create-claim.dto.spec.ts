import { validateSync } from 'class-validator';
import { CreateClaimDto } from './create-claim.dto';
import { ClaimType } from '../../entities/enums';

describe('CreateClaimDto', () => {
  const validDto = (): CreateClaimDto => {
    const dto = new CreateClaimDto();
    dto.policyId = '550e8400-e29b-41d4-a716-446655440000';
    dto.type = ClaimType.ACCIDENT;
    dto.description = 'This is a valid description with enough characters';
    dto.incidentDate = '2025-01-01';
    return dto;
  };

  describe('policyId validation', () => {
    it('should accept a valid UUID v4 policyId', () => {
      const dto = validDto();
      const errors = validateSync(dto);
      const policyIdErrors = errors.filter((e) => e.property === 'policyId');
      expect(policyIdErrors.length).toBe(0);
    });

    it('should reject a missing policyId', () => {
      const dto = validDto();
      dto.policyId = undefined as any;
      const errors = validateSync(dto);
      const policyIdErrors = errors.filter((e) => e.property === 'policyId');
      expect(policyIdErrors.length).toBeGreaterThan(0);
    });

    it('should reject a non-UUID policyId', () => {
      const dto = validDto();
      dto.policyId = 'not-a-uuid';
      const errors = validateSync(dto);
      const policyIdErrors = errors.filter((e) => e.property === 'policyId');
      expect(policyIdErrors.length).toBeGreaterThan(0);
    });
  });

  describe('type validation', () => {
    it('should accept valid ClaimType enum values', () => {
      const dto = validDto();
      dto.type = ClaimType.THEFT;
      const errors = validateSync(dto);
      const typeErrors = errors.filter((e) => e.property === 'type');
      expect(typeErrors.length).toBe(0);
    });

    it('should reject an invalid type value', () => {
      const dto = validDto();
      dto.type = 'INVALID_TYPE' as any;
      const errors = validateSync(dto);
      const typeErrors = errors.filter((e) => e.property === 'type');
      expect(typeErrors.length).toBeGreaterThan(0);
    });
  });

  describe('description validation', () => {
    it('should accept a description with 10+ characters', () => {
      const dto = validDto();
      dto.description = 'Exactly 10 chars!!';
      const errors = validateSync(dto);
      const descErrors = errors.filter((e) => e.property === 'description');
      expect(descErrors.length).toBe(0);
    });

    it('should reject a description shorter than 10 characters', () => {
      const dto = validDto();
      dto.description = 'Short';
      const errors = validateSync(dto);
      const descErrors = errors.filter((e) => e.property === 'description');
      expect(descErrors.length).toBeGreaterThan(0);
    });

    it('should reject a description longer than 2000 characters', () => {
      const dto = validDto();
      dto.description = 'a'.repeat(2001);
      const errors = validateSync(dto);
      const descErrors = errors.filter((e) => e.property === 'description');
      expect(descErrors.length).toBeGreaterThan(0);
    });
  });

  describe('incidentDate validation', () => {
    it('should accept a past incident date', () => {
      const dto = validDto();
      dto.incidentDate = '2025-01-01';
      const errors = validateSync(dto);
      const dateErrors = errors.filter((e) => e.property === 'incidentDate');
      expect(dateErrors.length).toBe(0);
    });

    it('should reject a future incident date', () => {
      const dto = validDto();
      dto.incidentDate = '2099-12-31';
      const errors = validateSync(dto);
      const dateErrors = errors.filter((e) => e.property === 'incidentDate');
      expect(dateErrors.length).toBeGreaterThan(0);
    });
  });

  describe('incidentLocation validation', () => {
    it('should accept an optional incidentLocation', () => {
      const dto = validDto();
      dto.incidentLocation = 'Kuala Lumpur, Malaysia';
      const errors = validateSync(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept when incidentLocation is not provided', () => {
      const dto = validDto();
      const errors = validateSync(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject incidentLocation longer than 500 characters', () => {
      const dto = validDto();
      dto.incidentLocation = 'a'.repeat(501);
      const errors = validateSync(dto);
      const locErrors = errors.filter((e) => e.property === 'incidentLocation');
      expect(locErrors.length).toBeGreaterThan(0);
    });
  });

  describe('full DTO validation', () => {
    it('should pass validation for a fully valid DTO', () => {
      const dto = validDto();
      const errors = validateSync(dto);
      expect(errors.length).toBe(0);
    });
  });
});

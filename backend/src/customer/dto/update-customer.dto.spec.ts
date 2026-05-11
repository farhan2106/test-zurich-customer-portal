import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateCustomerDto } from './update-customer.dto';

describe('UpdateCustomerDto', () => {
  describe('validation', () => {
    it('should allow empty object (all fields optional)', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow partial update with just firstName', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        firstName: 'Jane',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid enum for location: West Malaysia', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        location: 'West Malaysia',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid enum for location: East Malaysia', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        location: 'East Malaysia',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid location enum', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        location: 'Invalid Location',
      });
      const errors = await validate(dto);
      const locationErrors = errors.filter((e) => e.property === 'location');
      expect(locationErrors.length).toBeGreaterThan(0);
    });

    it('should accept valid number for premiumPaid', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        premiumPaid: 1500.5,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept zero for premiumPaid', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        premiumPaid: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative premiumPaid', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        premiumPaid: -100,
      });
      const errors = await validate(dto);
      const premiumErrors = errors.filter((e) => e.property === 'premiumPaid');
      expect(premiumErrors.length).toBeGreaterThan(0);
    });

    it('should reject non-number premiumPaid (string)', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        premiumPaid: 'not-a-number',
      });
      const errors = await validate(dto);
      const premiumErrors = errors.filter((e) => e.property === 'premiumPaid');
      expect(premiumErrors.length).toBeGreaterThan(0);
    });

    it('should NOT accept email field (immutable - no email property on DTO)', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        email: 'newemail@example.com',
      });
      const errors = await validate(dto);
      // email should not be a recognized property, so it should produce a validation error
      const emailErrors = errors.filter((e) => e.property === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it('should accept all valid fields together', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        firstName: 'Jane',
        lastName: 'Smith',
        photoUrl: 'https://example.com/new-photo.jpg',
        location: 'East Malaysia',
        premiumPaid: 2500.0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid string for firstName', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        firstName: 'John',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid string for lastName', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        lastName: 'Doe',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid string for photoUrl', async () => {
      const dto = plainToInstance(UpdateCustomerDto, {
        photoUrl: 'https://example.com/photo.jpg',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

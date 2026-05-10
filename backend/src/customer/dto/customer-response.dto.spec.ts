import { CustomerResponseDto } from './customer-response.dto';
import { Customer } from '../../entities/customer.entity';
import { CustomerLocation, CustomerRole } from '../../entities/enums';

describe('CustomerResponseDto', () => {
  const mockCustomer: Customer = {
    id: 'usr_abc123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    photoUrl: 'https://example.com/photo.jpg',
    location: CustomerLocation.WEST_MALAYSIA,
    premiumPaid: 1500.50,
    role: CustomerRole.CUSTOMER,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-06-15'),
    policies: [],
    claims: [],
  };

  describe('fromEntity()', () => {
    it('should map id from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.id).toBe('usr_abc123');
    });

    it('should map email from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.email).toBe('john@example.com');
    });

    it('should map firstName from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.firstName).toBe('John');
    });

    it('should map lastName from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.lastName).toBe('Doe');
    });

    it('should map photoUrl from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.photoUrl).toBe('https://example.com/photo.jpg');
    });

    it('should handle null photoUrl', () => {
      const customerWithNullPhoto: Customer = {
        ...mockCustomer,
        photoUrl: null,
      };

      const dto = CustomerResponseDto.fromEntity(customerWithNullPhoto);
      expect(dto.photoUrl).toBeNull();
    });

    it('should map location from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.location).toBe(CustomerLocation.WEST_MALAYSIA);
    });

    it('should map premiumPaid from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.premiumPaid).toBe(1500.50);
    });

    it('should handle zero premiumPaid', () => {
      const customerWithZeroPremium: Customer = {
        ...mockCustomer,
        premiumPaid: 0,
      };

      const dto = CustomerResponseDto.fromEntity(customerWithZeroPremium);
      expect(dto.premiumPaid).toBe(0);
    });

    it('should map role from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.role).toBe(CustomerRole.CUSTOMER);
    });

    it('should map createdAt from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.createdAt).toEqual(new Date('2025-01-01'));
    });

    it('should map updatedAt from entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);
      expect(dto.updatedAt).toEqual(new Date('2025-06-15'));
    });

    it('should map all fields at once for a complete entity', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);

      expect(dto).toEqual({
        id: 'usr_abc123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        photoUrl: 'https://example.com/photo.jpg',
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 1500.50,
        role: CustomerRole.CUSTOMER,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-06-15'),
      });
    });

    it('should NOT include policies or claims arrays (response DTO is customer-only)', () => {
      const dto = CustomerResponseDto.fromEntity(mockCustomer);

      expect('policies' in dto).toBe(false);
      expect('claims' in dto).toBe(false);
    });
  });

  describe('decorators', () => {
    it('should have id property defined', () => {
      const dto = new CustomerResponseDto();
      expect('id' in dto).toBe(true);
    });

    it('should have email property defined', () => {
      const dto = new CustomerResponseDto();
      expect('email' in dto).toBe(true);
    });

    it('should have firstName property defined', () => {
      const dto = new CustomerResponseDto();
      expect('firstName' in dto).toBe(true);
    });

    it('should have lastName property defined', () => {
      const dto = new CustomerResponseDto();
      expect('lastName' in dto).toBe(true);
    });

    it('should have photoUrl property defined', () => {
      const dto = new CustomerResponseDto();
      expect('photoUrl' in dto).toBe(true);
    });

    it('should have location property defined', () => {
      const dto = new CustomerResponseDto();
      expect('location' in dto).toBe(true);
    });

    it('should have premiumPaid property defined', () => {
      const dto = new CustomerResponseDto();
      expect('premiumPaid' in dto).toBe(true);
    });

    it('should have role property defined', () => {
      const dto = new CustomerResponseDto();
      expect('role' in dto).toBe(true);
    });

    it('should have createdAt property defined', () => {
      const dto = new CustomerResponseDto();
      expect('createdAt' in dto).toBe(true);
    });

    it('should have updatedAt property defined', () => {
      const dto = new CustomerResponseDto();
      expect('updatedAt' in dto).toBe(true);
    });
  });
});

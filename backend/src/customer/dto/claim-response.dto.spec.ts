import { ClaimResponseDto } from './claim-response.dto';
import { Claim } from '../../entities/claim.entity';
import { Policy } from '../../entities/policy.entity';
import { Customer } from '../../entities/customer.entity';
import { ClaimType, ClaimStatus, PolicyStatus, CustomerLocation } from '../../entities/enums';

describe('ClaimResponseDto', () => {
  const createMockClaim = (overrides: Partial<Claim> = {}): Claim => ({
    id: 'clm_abc123',
    claimNumber: 'CLM-20260101-0001',
    policyId: 'pol_abc123',
    customerId: 'usr_abc123',
    type: ClaimType.ACCIDENT,
    description: 'Vehicle collision at intersection',
    incidentDate: new Date('2025-12-15'),
    incidentLocation: 'Kuala Lumpur, Malaysia',
    status: ClaimStatus.SUBMITTED,
    createdAt: new Date('2025-12-16'),
    updatedAt: new Date('2025-12-16'),
    policy: {} as Policy,
    customer: {} as Customer,
    ...overrides,
  });

  describe('fromEntity()', () => {
    it('should map all fields from claim entity to DTO', () => {
      const claim = createMockClaim();
      const dto = ClaimResponseDto.fromEntity(claim);

      expect(dto.id).toBe('clm_abc123');
      expect(dto.claimNumber).toBe('CLM-20260101-0001');
      expect(dto.policyId).toBe('pol_abc123');
      expect(dto.customerId).toBe('usr_abc123');
      expect(dto.type).toBe(ClaimType.ACCIDENT);
      expect(dto.description).toBe('Vehicle collision at intersection');
      expect(dto.incidentDate).toEqual(new Date('2025-12-15'));
      expect(dto.incidentLocation).toBe('Kuala Lumpur, Malaysia');
      expect(dto.status).toBe(ClaimStatus.SUBMITTED);
    });

    it('should denormalize policyNumber from claim.policy when eager loaded', () => {
      const claim = createMockClaim({
        policy: {
          id: 'pol_abc123',
          policyNumber: 'POL-20260101-1234',
        } as Policy,
      });

      const dto = ClaimResponseDto.fromEntity(claim);

      expect(dto.policyNumber).toBe('POL-20260101-1234');
    });

    it('should have null/undefined policyNumber when policy not loaded', () => {
      const claim = createMockClaim({
        policy: undefined as any,
      });

      const dto = ClaimResponseDto.fromEntity(claim);

      expect(dto.policyNumber).toBeUndefined();
    });

    it('should map incidentLocation as undefined when null on entity', () => {
      const claim = createMockClaim({
        incidentLocation: null as any,
      });

      const dto = ClaimResponseDto.fromEntity(claim);

      expect(dto.incidentLocation).toBeUndefined();
    });
  });

  describe('ApiProperty decorators', () => {
    it('should have @ApiProperty decorator on id', () => {
      expect('id' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on claimNumber', () => {
      expect('claimNumber' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on policyId', () => {
      expect('policyId' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on customerId', () => {
      expect('customerId' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on type', () => {
      expect('type' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on description', () => {
      expect('description' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on incidentDate', () => {
      expect('incidentDate' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on incidentLocation', () => {
      expect('incidentLocation' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on status', () => {
      expect('status' in new ClaimResponseDto()).toBe(true);
    });

    it('should have @ApiProperty decorator on policyNumber', () => {
      expect('policyNumber' in new ClaimResponseDto()).toBe(true);
    });
  });
});

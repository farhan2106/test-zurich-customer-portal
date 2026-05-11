import { Claim } from './claim.entity';
import { Policy } from './policy.entity';
import { Customer } from './customer.entity';
import { ClaimType, ClaimStatus } from './enums';

describe('Claim Entity', () => {
  describe('field types and constraints', () => {
    it('should create a claim with all required fields', () => {
      const claim = new Claim();
      claim.claimNumber = 'CLM-20260101-0001';
      claim.policyId = '550e8400-e29b-41d4-a716-446655440000';
      claim.customerId = '660e8400-e29b-41d4-a716-446655440000';
      claim.type = ClaimType.ACCIDENT;
      claim.description = 'Car accident on highway';
      claim.incidentDate = new Date('2026-01-01');
      claim.status = ClaimStatus.SUBMITTED;

      expect(claim.claimNumber).toBe('CLM-20260101-0001');
      expect(claim.policyId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(claim.customerId).toBe('660e8400-e29b-41d4-a716-446655440000');
      expect(claim.type).toBe('accident');
      expect(claim.description).toBe('Car accident on highway');
      expect(claim.incidentDate).toBeInstanceOf(Date);
      expect(claim.status).toBe('submitted');
    });

    it('should have UUID primary key field', () => {
      const claim = new Claim();
      claim.id = '550e8400-e29b-41d4-a716-446655440000';
      expect(typeof claim.id).toBe('string');
      expect(claim.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should accept unique claimNumber', () => {
      const claim = new Claim();
      claim.claimNumber = 'CLM-20260509-0001';
      expect(claim.claimNumber).toBe('CLM-20260509-0001');
    });
  });

  describe('type enum', () => {
    it('should accept type "accident"', () => {
      const claim = new Claim();
      claim.type = ClaimType.ACCIDENT;
      expect(claim.type).toBe('accident');
    });

    it('should accept type "theft"', () => {
      const claim = new Claim();
      claim.type = ClaimType.THEFT;
      expect(claim.type).toBe('theft');
    });

    it('should accept type "damage"', () => {
      const claim = new Claim();
      claim.type = ClaimType.DAMAGE;
      expect(claim.type).toBe('damage');
    });

    it('should accept type "other"', () => {
      const claim = new Claim();
      claim.type = ClaimType.OTHER;
      expect(claim.type).toBe('other');
    });

    it('should have ClaimType enum with correct values', () => {
      expect(ClaimType.ACCIDENT).toBe('accident');
      expect(ClaimType.THEFT).toBe('theft');
      expect(ClaimType.DAMAGE).toBe('damage');
      expect(ClaimType.OTHER).toBe('other');
      expect(Object.keys(ClaimType)).toHaveLength(4);
    });
  });

  describe('status enum', () => {
    it('should accept status "submitted"', () => {
      const claim = new Claim();
      claim.status = ClaimStatus.SUBMITTED;
      expect(claim.status).toBe('submitted');
    });

    it('should accept status "under_review"', () => {
      const claim = new Claim();
      claim.status = ClaimStatus.UNDER_REVIEW;
      expect(claim.status).toBe('under_review');
    });

    it('should accept status "approved"', () => {
      const claim = new Claim();
      claim.status = ClaimStatus.APPROVED;
      expect(claim.status).toBe('approved');
    });

    it('should accept status "rejected"', () => {
      const claim = new Claim();
      claim.status = ClaimStatus.REJECTED;
      expect(claim.status).toBe('rejected');
    });

    it('should have ClaimStatus enum with correct values', () => {
      expect(ClaimStatus.SUBMITTED).toBe('submitted');
      expect(ClaimStatus.UNDER_REVIEW).toBe('under_review');
      expect(ClaimStatus.APPROVED).toBe('approved');
      expect(ClaimStatus.REJECTED).toBe('rejected');
      expect(Object.keys(ClaimStatus)).toHaveLength(4);
    });
  });

  describe('incidentDate not-null constraint', () => {
    it('should accept valid incidentDate', () => {
      const incidentDate = new Date('2026-01-15');
      const claim = new Claim();
      claim.incidentDate = incidentDate;
      expect(claim.incidentDate).toBeInstanceOf(Date);
      expect(claim.incidentDate).toBe(incidentDate);
    });
  });

  describe('optional fields', () => {
    it('should allow incidentLocation to be undefined', () => {
      const claim = new Claim();
      expect(claim.incidentLocation).toBeUndefined();
    });

    it('should accept incidentLocation up to 500 characters', () => {
      const claim = new Claim();
      claim.incidentLocation = 'Highway 101, Mile 45, Northbound Lane';
      expect(claim.incidentLocation).toBe('Highway 101, Mile 45, Northbound Lane');
    });
  });

  describe('relationships', () => {
    it('should have ManyToOne relation to Policy', () => {
      const claim = new Claim();
      const policy = new Policy();
      policy.id = '550e8400-e29b-41d4-a716-446655440000';
      claim.policy = policy;
      expect(claim.policy).toBe(policy);
    });

    it('should have ManyToOne relation to Customer', () => {
      const claim = new Claim();
      const customer = new Customer();
      customer.id = '660e8400-e29b-41d4-a716-446655440000';
      claim.customer = customer;
      expect(claim.customer).toBe(customer);
    });

    it('should store policyId as UUID foreign key', () => {
      const claim = new Claim();
      claim.policyId = '550e8400-e29b-41d4-a716-446655440000';
      expect(claim.policyId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should store customerId as UUID foreign key', () => {
      const claim = new Claim();
      claim.customerId = '660e8400-e29b-41d4-a716-446655440000';
      expect(claim.customerId).toBe('660e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('CreateDateColumn and UpdateDateColumn', () => {
    it('should have createdAt property', () => {
      const claim = new Claim();
      claim.createdAt = new Date();
      expect(claim.createdAt).toBeInstanceOf(Date);
    });

    it('should have updatedAt property', () => {
      const claim = new Claim();
      claim.updatedAt = new Date();
      expect(claim.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('entity metadata', () => {
    it('should have entity name "claims"', () => {
      const claim = new Claim();
      expect(claim).toHaveProperty('claimNumber');
      expect(claim).toHaveProperty('policyId');
      expect(claim).toHaveProperty('customerId');
      expect(claim).toHaveProperty('type');
      expect(claim).toHaveProperty('description');
      expect(claim).toHaveProperty('incidentDate');
      expect(claim).toHaveProperty('incidentLocation');
      expect(claim).toHaveProperty('status');
      expect(claim).toHaveProperty('policy');
      expect(claim).toHaveProperty('customer');
    });
  });
});

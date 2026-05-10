import apiClient from '@/services/api-client';
import {
  getClaims,
  getClaimById,
  submitClaim,
} from '@/services/claim.service';

jest.mock('@/services/api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('claim.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaims', () => {
    it('calls apiClient.get("/claims") and returns data', async () => {
      const mockClaims = [
        {
          id: 'clm_1',
          claimNumber: 'CLM-2024-001',
          type: 'auto',
          policyId: 'pol_1',
          policyNumber: 'POL-001',
          status: 'submitted',
          incidentDate: '2024-06-15',
          description: 'Car accident',
        },
        {
          id: 'clm_2',
          claimNumber: 'CLM-2024-002',
          type: 'property',
          policyId: 'pol_2',
          policyNumber: 'POL-002',
          status: 'under_review',
          incidentDate: '2024-07-20',
          description: 'Water damage',
        },
      ];
      mockedApiClient.get.mockResolvedValue({ data: mockClaims });

      const result = await getClaims();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/claims');
      expect(result).toEqual(mockClaims);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Network error');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getClaims()).rejects.toThrow('Network error');
    });
  });

  describe('getClaimById', () => {
    it('calls apiClient.get("/claims/clm_1") and returns data', async () => {
      const mockClaim = {
        id: 'clm_1',
        claimNumber: 'CLM-2024-001',
        type: 'auto',
        policyId: 'pol_1',
        policyNumber: 'POL-001',
        status: 'submitted',
        incidentDate: '2024-06-15',
        description: 'Car accident',
      };
      mockedApiClient.get.mockResolvedValue({ data: mockClaim });

      const result = await getClaimById('clm_1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/claims/clm_1');
      expect(result).toEqual(mockClaim);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Not found');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getClaimById('clm_1')).rejects.toThrow('Not found');
    });
  });

  describe('submitClaim', () => {
    it('calls apiClient.post("/claims", data) and returns data', async () => {
      const createClaimDto = {
        type: 'auto',
        policyId: 'pol_1',
        incidentDate: '2024-06-15',
        description: 'Car accident',
        incidentLocation: 'Kuala Lumpur',
      };
      const mockNewClaim = {
        id: 'clm_new',
        claimNumber: 'CLM-2024-003',
        ...createClaimDto,
        status: 'submitted',
      };
      mockedApiClient.post.mockResolvedValue({ data: mockNewClaim });

      const result = await submitClaim(createClaimDto);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/claims', createClaimDto);
      expect(result).toEqual(mockNewClaim);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Submission failed');
      const createClaimDto = {
        type: 'auto',
        policyId: 'pol_1',
        incidentDate: '2024-06-15',
        description: 'Car accident',
        incidentLocation: 'Kuala Lumpur',
      };
      mockedApiClient.post.mockRejectedValue(error);

      await expect(submitClaim(createClaimDto)).rejects.toThrow('Submission failed');
    });
  });
});

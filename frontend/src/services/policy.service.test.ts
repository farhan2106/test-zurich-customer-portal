import apiClient from '@/services/api-client';
import {
  getPolicies,
  getPolicyById,
  purchasePolicy,
  renewPolicy,
} from '@/services/policy.service';

jest.mock('@/services/api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('policy.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPolicies', () => {
    it('calls apiClient.get("/policies") and returns data', async () => {
      const mockPolicies = [
        { id: 'pol_1', policyNumber: 'POL-001', status: 'active' },
        { id: 'pol_2', policyNumber: 'POL-002', status: 'expired' },
      ];
      mockedApiClient.get.mockResolvedValue({ data: mockPolicies });

      const result = await getPolicies();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/policies');
      expect(result).toEqual(mockPolicies);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Network error');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getPolicies()).rejects.toThrow('Network error');
    });
  });

  describe('getPolicyById', () => {
    it('calls apiClient.get("/policies/123") and returns data', async () => {
      const mockPolicy = {
        id: '123',
        policyNumber: 'POL-001',
        status: 'active',
      };
      mockedApiClient.get.mockResolvedValue({ data: mockPolicy });

      const result = await getPolicyById('123');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/policies/123');
      expect(result).toEqual(mockPolicy);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Not found');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getPolicyById('123')).rejects.toThrow('Not found');
    });
  });

  describe('purchasePolicy', () => {
    it('calls apiClient.post("/policies", { productId }) and returns data', async () => {
      const mockNewPolicy = {
        id: 'pol_new',
        policyNumber: 'POL-NEW',
        status: 'active',
        productId: 'prod_1',
      };
      mockedApiClient.post.mockResolvedValue({ data: mockNewPolicy });

      const result = await purchasePolicy('prod_1');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/policies', {
        productId: 'prod_1',
      });
      expect(result).toEqual(mockNewPolicy);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Purchase failed');
      mockedApiClient.post.mockRejectedValue(error);

      await expect(purchasePolicy('prod_1')).rejects.toThrow('Purchase failed');
    });
  });

  describe('renewPolicy', () => {
    it('calls apiClient.post("/policies/123/renew") and returns data', async () => {
      const mockRenewedPolicy = {
        id: 'pol_123',
        policyNumber: 'POL-001-R1',
        status: 'active',
      };
      mockedApiClient.post.mockResolvedValue({ data: mockRenewedPolicy });

      const result = await renewPolicy('123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/policies/123/renew');
      expect(result).toEqual(mockRenewedPolicy);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Renewal failed');
      mockedApiClient.post.mockRejectedValue(error);

      await expect(renewPolicy('123')).rejects.toThrow('Renewal failed');
    });
  });
});

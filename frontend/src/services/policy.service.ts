import apiClient from './api-client';

export interface Policy {
  id: string;
  policyNumber: string;
  customerId: string;
  productId: string;
  status: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  location: string;
  product?: {
    id: string;
    productCode: number;
    name: string;
    description: string;
    coverageDetails: Record<string, string>;
    basePremium: number;
    status: string;
  };
  claims?: Array<{
    id: string;
    claimNumber: string;
    type: string;
    description: string;
    status: string;
    incidentDate: string;
    incidentLocation?: string;
  }>;
}

export async function getPolicies(): Promise<Policy[]> {
  const response = await apiClient.get('/policies');
  return response.data;
}

export async function getPolicyById(id: string): Promise<Policy> {
  const response = await apiClient.get(`/policies/${id}`);
  return response.data;
}

export async function purchasePolicy(productId: string): Promise<Policy> {
  const response = await apiClient.post('/policies', { productId });
  return response.data;
}

export async function renewPolicy(policyId: string): Promise<Policy> {
  const response = await apiClient.post(`/policies/${policyId}/renew`);
  return response.data;
}

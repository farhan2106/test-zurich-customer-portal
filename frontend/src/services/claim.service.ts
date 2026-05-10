import apiClient from './api-client';

export interface Claim {
  id: string;
  claimNumber: string;
  type: string;
  policyNumber: string;
  status: string;
  incidentDate: string;
  description: string;
  incidentLocation?: string;
  submittedAt?: string;
}

export interface CreateClaimDto {
  type: string;
  policyNumber: string;
  incidentDate: string;
  description: string;
  incidentLocation: string;
}

export async function getClaims(): Promise<Claim[]> {
  const response = await apiClient.get('/claims');
  return response.data;
}

export async function getClaimById(id: string): Promise<Claim> {
  const response = await apiClient.get(`/claims/${id}`);
  return response.data;
}

export async function submitClaim(data: CreateClaimDto): Promise<Claim> {
  const response = await apiClient.post('/claims', data);
  return response.data;
}

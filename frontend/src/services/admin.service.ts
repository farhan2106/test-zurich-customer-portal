import apiClient from './api-client';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  location: string;
  premiumPaid: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  customerId: string;
  type: string;
  description: string;
  incidentDate: string;
  status: string;
}

export interface AdminCustomerDetail extends Customer {
  policies: Policy[];
  claims: Claim[];
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  location?: string;
  premiumPaid?: number;
}

export async function getCustomers(search?: string): Promise<Customer[]> {
  const response = await apiClient.get('/customers', {
    params: search ? { search } : {},
  });
  return response.data;
}

export async function getCustomerById(id: string): Promise<AdminCustomerDetail> {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
}

export async function updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
  const response = await apiClient.patch(`/customers/${id}`, data);
  return response.data;
}

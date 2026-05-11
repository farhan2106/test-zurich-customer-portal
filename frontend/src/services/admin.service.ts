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

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedCustomersResponse {
  data: Customer[];
  meta: PaginationMeta;
}

export interface CustomerFilters {
  search?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  role?: string;
  premiumMin?: number;
  premiumMax?: number;
  page?: number;
  limit?: number;
}

export async function getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomersResponse> {
  const params: Record<string, string | number> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.firstName) params.firstName = filters.firstName;
  if (filters?.lastName) params.lastName = filters.lastName;
  if (filters?.email) params.email = filters.email;
  if (filters?.location) params.location = filters.location;
  if (filters?.role) params.role = filters.role;
  if (filters?.premiumMin !== undefined) params.premiumMin = filters.premiumMin;
  if (filters?.premiumMax !== undefined) params.premiumMax = filters.premiumMax;
  if (filters?.page) params.page = filters.page;
  if (filters?.limit) params.limit = filters.limit;

  const response = await apiClient.get('/customers', { params });
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

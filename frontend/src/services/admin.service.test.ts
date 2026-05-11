import apiClient from '@/services/api-client';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
} from '@/services/admin.service';

jest.mock('@/services/api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('admin.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomers', () => {
    it('calls apiClient.get("/customers") with no params by default', async () => {
      const mockResponse = {
        data: [
          { id: 'usr_1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
          { id: 'usr_2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
        ],
        meta: { page: 1, limit: 20, totalItems: 2, totalPages: 1 },
      };
      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await getCustomers();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/customers', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('calls apiClient.get("/customers") with search, page, and limit params when provided', async () => {
      const mockResponse = {
        data: [
          { id: 'usr_1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
        ],
        meta: { page: 1, limit: 20, totalItems: 1, totalPages: 1 },
      };
      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await getCustomers({ search: 'John', page: 1, limit: 20 });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/customers', {
        params: { search: 'John', page: 1, limit: 20 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('calls apiClient.get("/customers") with all filter params when provided', async () => {
      const mockResponse = {
        data: [
          { id: 'usr_1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
        ],
        meta: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };
      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      const result = await getCustomers({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example',
        location: 'West Malaysia',
        role: 'customer',
        premiumMin: 1000,
        premiumMax: 5000,
        page: 2,
        limit: 10,
      });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/customers', {
        params: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example',
          location: 'West Malaysia',
          role: 'customer',
          premiumMin: 1000,
          premiumMax: 5000,
          page: 2,
          limit: 10,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('omits undefined filter params from request', async () => {
      const mockResponse = {
        data: [],
        meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
      };
      mockedApiClient.get.mockResolvedValue({ data: mockResponse });

      await getCustomers({ firstName: 'John', page: 1 });

      expect(mockedApiClient.get).toHaveBeenCalledWith('/customers', {
        params: { firstName: 'John', page: 1 },
      });
    });

    it('propagates error on failure', async () => {
      const error = new Error('Network error');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getCustomers()).rejects.toThrow('Network error');
    });
  });

  describe('getCustomerById', () => {
    it('calls apiClient.get("/customers/usr_001") and returns data', async () => {
      const mockCustomer = {
        id: 'usr_001',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        photoUrl: null,
        location: 'Kuala Lumpur, Malaysia',
        premiumPaid: 3500.0,
        role: 'customer',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
        policies: [],
        claims: [],
      };
      mockedApiClient.get.mockResolvedValue({ data: mockCustomer });

      const result = await getCustomerById('usr_001');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/customers/usr_001');
      expect(result).toEqual(mockCustomer);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Customer not found');
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getCustomerById('usr_001')).rejects.toThrow('Customer not found');
    });
  });

  describe('updateCustomer', () => {
    it('calls apiClient.patch("/customers/usr_001") with body and returns data', async () => {
      const updatedCustomer = {
        id: 'usr_001',
        email: 'john@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        photoUrl: null,
        location: 'Kuala Lumpur, Malaysia',
        premiumPaid: 3500.0,
        role: 'customer',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-08-01T00:00:00Z',
      };
      mockedApiClient.patch.mockResolvedValue({ data: updatedCustomer });

      const result = await updateCustomer('usr_001', { firstName: 'Jane' });

      expect(mockedApiClient.patch).toHaveBeenCalledWith(
        '/customers/usr_001',
        { firstName: 'Jane' }
      );
      expect(result).toEqual(updatedCustomer);
    });

    it('propagates error on failure', async () => {
      const error = new Error('Update failed');
      mockedApiClient.patch.mockRejectedValue(error);

      await expect(
        updateCustomer('usr_001', { firstName: 'Jane' })
      ).rejects.toThrow('Update failed');
    });
  });
});

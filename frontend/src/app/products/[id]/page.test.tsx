import { render, screen, waitFor } from '@/test-utils';
import apiClient from '@/services/api-client';

const mockRedirect = jest.fn();
const mockUseParams = jest.fn(() => ({ id: '1' }));

jest.mock('@/services/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/products/1'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: mockUseParams,
  redirect: mockRedirect,
}));

import ProductDetailPage from '@/app/products/[id]/page';

const mockProduct = {
  id: '1',
  productCode: 4000,
  name: 'Auto Insurance',
  description: 'Comprehensive auto coverage for all vehicle types including third-party liability, own damage, and personal accident protection.',
  basePremium: 500.0,
  coverageDetails: [
    { name: 'Third-Party Liability', limit: 'RM 3,000,000' },
    { name: 'Own Damage', limit: 'Market Value' },
    { name: 'Personal Accident', limit: 'RM 10,000 per person' },
    { name: 'Windscreen', limit: 'RM 1,500' },
  ],
  premiumByLocation: [
    { location: 'West Malaysia', premium: 500.0 },
    { location: 'East Malaysia', premium: 450.0 },
  ],
};

const authenticatedState = {
  auth: {
    user: {
      id: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
    },
    token: 'test-token',
    isLoading: false,
    error: null,
  },
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
  });

  describe('data fetching', () => {
    it('fetches product by ID via apiClient.get', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/products/1');
      });
    });
  });

  describe('rendering', () => {
    it('renders product name', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      });
    });

    it('renders product description', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText(/Comprehensive auto coverage for all vehicle types/)
        ).toBeInTheDocument();
      });
    });

    it('renders coverage table', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText('Third-Party Liability')).toBeInTheDocument();
        expect(screen.getByText('Own Damage')).toBeInTheDocument();
        expect(screen.getByText('Personal Accident')).toBeInTheDocument();
        expect(screen.getByText('Windscreen')).toBeInTheDocument();
      });
    });

    it('renders premium info', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        const premiumHeadings = screen.getAllByText(/Premium/i);
        expect(premiumHeadings.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/RM 500/i)).toBeInTheDocument();
        expect(screen.getByText(/RM 450/i)).toBeInTheDocument();
      });
    });

    it('has "Purchase This Product" button linking to /purchase?productId=1', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText('Purchase This Product')
        ).toBeInTheDocument();
      });
      const purchaseButton = screen.getByText('Purchase This Product');
      expect(purchaseButton.closest('a')).toHaveAttribute(
        'href',
        '/purchase?productId=1'
      );
    });

    it('has "Back to Products" link', async () => {
      apiClient.get.mockResolvedValue({ data: mockProduct });
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText(/Back to Products/i)
        ).toBeInTheDocument();
      });
      const backLink = screen.getByText(/Back to Products/i);
      expect(backLink.closest('a')).toHaveAttribute('href', '/products');
    });
  });

  describe('loading state', () => {
    it('shows skeleton loading state', () => {
      apiClient.get.mockReturnValue(new Promise(() => {}));
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('shows "Product not found" error on 404', async () => {
      const notFoundError = new Error('Not found') as any;
      notFoundError.response = { status: 404 };
      apiClient.get.mockRejectedValue(notFoundError);
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText(/Product not found/i)
        ).toBeInTheDocument();
      });
    });

    it('shows retry on other errors', async () => {
      apiClient.get.mockRejectedValue(new Error('Network error'));
      render(<ProductDetailPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText(/Unable to load/i)).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });
});

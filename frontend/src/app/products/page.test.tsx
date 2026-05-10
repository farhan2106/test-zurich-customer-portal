import { render, screen, waitFor } from '@/test-utils';
import apiClient from '@/services/api-client';

const mockRedirect = jest.fn();
const mockUseParams = jest.fn(() => ({}));

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
  usePathname: jest.fn(() => '/products'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: mockUseParams,
  redirect: mockRedirect,
}));

import ProductsPage from '@/app/products/page';

const mockProducts = [
  {
    id: '1',
    code: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage for all vehicle types',
    basePremium: 500.0,
  },
  {
    id: '2',
    code: 5000,
    name: 'Property Insurance',
    description: 'Protect your home and property against damage and theft',
    basePremium: 1200.0,
  },
];

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

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('heading', () => {
    it('renders "Insurance Products" heading', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Insurance Products/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('shows skeleton cards while loading', () => {
      apiClient.get.mockReturnValue(new Promise(() => {}));
      render(<ProductsPage />, { preloadedState: authenticatedState });
      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('data loaded', () => {
    it('renders product cards when data loaded', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText('Property Insurance')).toBeInTheDocument();
      });
    });

    it('each card shows product name', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
        expect(screen.getByText('Property Insurance')).toBeInTheDocument();
      });
    });

    it('each card shows product code', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText(/4000/)).toBeInTheDocument();
        expect(screen.getByText(/5000/)).toBeInTheDocument();
      });
    });

    it('each card shows product description', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText(/Comprehensive auto coverage/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Protect your home and property/)
        ).toBeInTheDocument();
      });
    });

    it('each card shows premium', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getByText(/From MYR 500/)).toBeInTheDocument();
        expect(screen.getByText(/1,200/)).toBeInTheDocument();
      });
    });

    it('has "Learn More" button linking to /products/[id]', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getAllByText('Learn More')).toHaveLength(2);
      });
      const learnMoreButtons = screen.getAllByText('Learn More');
      expect(learnMoreButtons.length).toBe(2);
      expect(learnMoreButtons[0].closest('a')).toHaveAttribute(
        'href',
        '/products/1'
      );
      expect(learnMoreButtons[1].closest('a')).toHaveAttribute(
        'href',
        '/products/2'
      );
    });

    it('has "Purchase Now" button linking to /purchase?productId=[id]', async () => {
      apiClient.get.mockResolvedValue({ data: mockProducts });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(screen.getAllByText('Purchase Now')).toHaveLength(2);
      });
      const purchaseButtons = screen.getAllByText('Purchase Now');
      expect(purchaseButtons.length).toBe(2);
      expect(purchaseButtons[0].closest('a')).toHaveAttribute(
        'href',
        '/purchase?productId=1'
      );
      expect(purchaseButtons[1].closest('a')).toHaveAttribute(
        'href',
        '/purchase?productId=2'
      );
    });
  });

  describe('error state', () => {
    it('shows error message with retry button on API failure', async () => {
      apiClient.get.mockRejectedValue(new Error('Network error'));
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText(/Unable to load products/i)
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when empty array returned', async () => {
      apiClient.get.mockResolvedValue({ data: [] });
      render(<ProductsPage />, { preloadedState: authenticatedState });
      await waitFor(() => {
        expect(
          screen.getByText(/No products available at this time/i)
        ).toBeInTheDocument();
      });
    });
  });
});

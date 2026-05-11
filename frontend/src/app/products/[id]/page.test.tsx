import { render, screen, act } from '@/test-utils';
import productReducer from '@/store/slices/productSlice';

const mockRedirect = jest.fn();
const mockUseParams = jest.fn(() => ({ id: '1' }));

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
  status: 'active',
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
  product: {
    items: [mockProduct],
    selectedProduct: mockProduct,
    isLoading: false,
    error: null,
    notFound: false,
    hasLoaded: true,
  },
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
  });

  describe('rendering', () => {
    it('renders product name', async () => {
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
    });

    it('renders product description', async () => {
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText(/Comprehensive auto coverage for all vehicle types/)
      ).toBeInTheDocument();
    });

    it('renders coverage table', async () => {
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText('Third-Party Liability')).toBeInTheDocument();
      expect(screen.getByText('Own Damage')).toBeInTheDocument();
      expect(screen.getByText('Personal Accident')).toBeInTheDocument();
      expect(screen.getByText('Windscreen')).toBeInTheDocument();
    });

    it('renders premium info', async () => {
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      const premiumHeadings = screen.getAllByText(/Premium/i);
      expect(premiumHeadings.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/RM 500/i)).toBeInTheDocument();
      expect(screen.getByText(/RM 450/i)).toBeInTheDocument();
    });

    it('has "Purchase This Product" button linking to /purchase?productId=1', async () => {
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText('Purchase This Product')
      ).toBeInTheDocument();
      const purchaseButton = screen.getByText('Purchase This Product');
      expect(purchaseButton.closest('a')).toHaveAttribute(
        'href',
        '/purchase?productId=1'
      );
    });

    it('has "Back to Products" link', async () => {
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText(/Back to Products/i)
      ).toBeInTheDocument();
      const backLink = screen.getByText(/Back to Products/i);
      expect(backLink.closest('a')).toHaveAttribute('href', '/products');
    });
  });

  describe('loading state', () => {
    it('shows skeleton loading state', () => {
      const loadingState = {
        ...authenticatedState,
        product: {
          items: [],
          selectedProduct: null,
          isLoading: true,
          error: null,
          notFound: false,
          hasLoaded: false,
        },
      };
      render(<ProductDetailPage />, {
        preloadedState: loadingState,
        additionalReducers: { product: productReducer },
      });
      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('shows "Product not found" error on 404', async () => {
      const notFoundState = {
        ...authenticatedState,
        product: {
          items: [],
          selectedProduct: null,
          isLoading: false,
          error: null,
          notFound: true,
          hasLoaded: true,
        },
      };
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: notFoundState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText(/Product not found/i)
      ).toBeInTheDocument();
    });

    it('shows retry on other errors', async () => {
      const errorState = {
        ...authenticatedState,
        product: {
          items: [],
          selectedProduct: null,
          isLoading: false,
          error: 'Unable to load product details.',
          notFound: false,
          hasLoaded: true,
        },
      };
      await act(async () => {
        render(<ProductDetailPage />, {
          preloadedState: errorState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText(/Unable to load/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });
});

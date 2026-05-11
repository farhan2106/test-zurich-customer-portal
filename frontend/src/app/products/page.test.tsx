import { render, screen, act } from '@/test-utils';
import productReducer from '@/store/slices/productSlice';

const mockRedirect = jest.fn();
const mockUseParams = jest.fn(() => ({}));

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
    productCode: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage for all vehicle types',
    basePremium: 500.0,
    coverageDetails: {},
    status: 'active',
  },
  {
    id: '2',
    productCode: 5000,
    name: 'Property Insurance',
    description: 'Protect your home and property against damage and theft',
    basePremium: 1200.0,
    coverageDetails: {},
    status: 'active',
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
  product: {
    items: mockProducts,
    selectedProduct: null,
    isLoading: false,
    error: null,
    notFound: false,
    hasLoaded: true,
  },
};

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('heading', () => {
    it('renders "Insurance Products" heading', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByRole('heading', { name: /Insurance Products/i })
      ).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows skeleton cards while loading', () => {
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
      render(<ProductsPage />, {
        preloadedState: loadingState,
        additionalReducers: { product: productReducer },
      });
      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('data loaded', () => {
    it('renders product cards when data loaded', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      expect(screen.getByText('Property Insurance')).toBeInTheDocument();
    });

    it('each card shows product name', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
      expect(screen.getByText('Property Insurance')).toBeInTheDocument();
    });

    it('each card shows product code', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText(/4000/)).toBeInTheDocument();
      expect(screen.getByText(/5000/)).toBeInTheDocument();
    });

    it('each card shows product description', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText(/Comprehensive auto coverage/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Protect your home and property/)
      ).toBeInTheDocument();
    });

    it('each card shows premium', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(screen.getByText(/From MYR 500/)).toBeInTheDocument();
      expect(screen.getByText(/1,200/)).toBeInTheDocument();
    });

    it('has "Learn More" button linking to /products/[id]', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
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
      expect(learnMoreButtons[0].closest('a')).toHaveClass('btn-outline');
    });

    it('has "Purchase Now" button linking to /purchase?productId=[id]', async () => {
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: authenticatedState,
          additionalReducers: { product: productReducer },
        });
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
      expect(purchaseButtons[0].closest('a')).toHaveClass('btn-primary');
    });
  });

  describe('error state', () => {
    it('shows error message with retry button on API failure', async () => {
      const errorState = {
        ...authenticatedState,
        product: {
          items: [],
          selectedProduct: null,
          isLoading: false,
          error: 'Unable to load products.',
          notFound: false,
          hasLoaded: true,
        },
      };
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: errorState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText(/Unable to load products/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when empty array returned', async () => {
      const emptyState = {
        ...authenticatedState,
        product: {
          items: [],
          selectedProduct: null,
          isLoading: false,
          error: null,
          notFound: false,
          hasLoaded: true,
        },
      };
      await act(async () => {
        render(<ProductsPage />, {
          preloadedState: emptyState,
          additionalReducers: { product: productReducer },
        });
      });
      expect(
        screen.getByText(/No products available/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/npm run seed/i)
      ).toBeInTheDocument();
    });
  });
});

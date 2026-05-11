'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, selectAllProducts, selectProductLoadingState } from '@/store/slices/productSlice';
import { ProtectedRoute } from '@/components/layout';
import { Badge, Skeleton, Button } from '@/components/ui';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const { isLoading, error, hasLoaded } = useAppSelector(selectProductLoadingState);

  useEffect(() => {
    if (!hasLoaded) {
      dispatch(fetchProducts());
    }
  }, [dispatch, hasLoaded]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Insurance Products</h1>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="card" lines={3} />
            <Skeleton variant="card" lines={3} />
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={() => dispatch(fetchProducts())}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg mb-2">No products available.</p>
            <p className="text-base-content/50 text-sm">
              The database may not be seeded yet. Run{' '}
              <code className="bg-base-200 px-1.5 py-0.5 rounded text-xs font-mono">
                npm run seed
              </code>{' '}
              in the backend project to populate product data.
            </p>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card bg-base-100 shadow-sm">
                <div className="card-body space-y-3">
                  <Badge className="px-4" variant="info">Code: {product.productCode}</Badge>
                  <h2 className="card-title">{product.name}</h2>
                  <p className="text-sm text-base-content/70">
                    {product.description?.substring(0, 120)}...
                  </p>
                  <div className="text-lg font-semibold text-primary">
                    From MYR {product.basePremium?.toLocaleString()}
                  </div>
                  <div className="card-actions justify-end gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Learn More
                    </Link>
                    <Link
                      href={`/purchase?productId=${product.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Purchase Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

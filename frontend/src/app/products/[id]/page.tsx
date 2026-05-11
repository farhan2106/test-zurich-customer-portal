'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById, selectSelectedProduct, selectProductLoadingState } from '@/store/slices/productSlice';
import { ProtectedRoute } from '@/components/layout';
import { Badge, Skeleton, Button } from '@/components/ui';

interface CoverageDetail {
  name: string;
  limit: string;
}

interface PremiumByLocation {
  location: string;
  premium: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectSelectedProduct);
  const { isLoading, error, notFound, hasLoaded } = useAppSelector(selectProductLoadingState);

  useEffect(() => {
    if (id && !hasLoaded) {
      dispatch(fetchProductById(id));
    }
  }, [id, dispatch, hasLoaded]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <Skeleton variant="card" lines={5} />
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <p className="text-error text-lg">Product not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchProductById(id))}>Retry</Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return null;
  }

  const coverageDetails = product.coverageDetails as CoverageDetail[] | undefined;
  const premiumByLocation = product.premiumByLocation as PremiumByLocation[] | undefined;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Link href="/products" className="btn btn-ghost mb-6">
          ← Back to Products
        </Link>

        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <Badge variant="info" className="px-4">Product Code: {product.productCode}</Badge>

        <p className="mt-4 text-base-content/80">{product.description}</p>

        {/* Coverage Table */}
        {coverageDetails && coverageDetails.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Coverage Details</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Coverage</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {coverageDetails.map((coverage) => (
                    <tr key={coverage.name}>
                      <td className="font-medium">{coverage.name}</td>
                      <td>{coverage.limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Premium by Location */}
        {premiumByLocation && premiumByLocation.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Premium</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumByLocation.map((item) => (
                    <tr key={item.location}>
                      <td className="font-medium">{item.location}</td>
                      <td>RM {item.premium.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchase CTA */}
        <div className="mt-8">
          <Link href={`/purchase?productId=${product.id}`} className="btn btn-primary">
            Purchase This Product
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}

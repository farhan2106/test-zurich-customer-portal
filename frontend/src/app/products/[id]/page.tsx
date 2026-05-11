'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import apiClient from '@/services/api-client';
import { ProtectedRoute } from '@/components/layout';
import { Card, Badge, Skeleton, Button } from '@/components/ui';

interface CoverageDetail {
  name: string;
  limit: string;
}

interface PremiumByLocation {
  location: string;
  premium: number;
}

interface Product {
  id: string;
  productCode: number;
  name: string;
  description: string;
  coverageDetails: CoverageDetail[];
  basePremium: number;
  premiumByLocation: PremiumByLocation[];
  status: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const response = await apiClient.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError('Unable to load product details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
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
          <Button onClick={fetchProduct}>Retry</Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return null;
  }

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
        {product.coverageDetails && product.coverageDetails.length > 0 && (
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
                  {product.coverageDetails.map((coverage) => (
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
        {product.premiumByLocation && product.premiumByLocation.length > 0 && (
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
                  {product.premiumByLocation.map((item) => (
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/services/api-client';
import { ProtectedRoute } from '@/components/layout';
import { Card, Badge, Skeleton, Button } from '@/components/ui';

interface Product {
  id: string;
  productCode: number;
  name: string;
  description: string;
  coverageDetails: Record<string, string>;
  basePremium: number;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch {
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Insurance Products</h1>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="card" lines={3} />
            <Skeleton variant="card" lines={3} />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchProducts}>Retry</Button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-base-content/70">No products available at this time.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <div className="space-y-3">
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/services/api-client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { purchasePolicy } from '@/store/slices/policySlice';
import { ProtectedRoute } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';

interface Product {
  id: string;
  productCode: number;
  name: string;
  description: string;
  coverageDetails: Record<string, string>;
  basePremium: number;
  status: string;
}

function PurchaseContent({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [step, setStep] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [purchasedPolicyNumber, setPurchasedPolicyNumber] = useState('');

  // Fetch product data — key prop handles state reset on productId change
  useEffect(() => {
    if (!productId) return;

    apiClient.get(`/products/${productId}`)
      .then(res => setProduct(res.data))
      .catch(() => setError('Failed to load product'));
  }, [productId]);

  // Loading is derived: true when we have a productId but no result yet
  const loading = !!productId && product === null && error === null;

  const handlePurchase = async () => {
    setPurchasing(true);
    setError(null);
    try {
      const result = await dispatch(purchasePolicy(productId)).unwrap();
      setPurchasedPolicyNumber(result.policyNumber);
      setStep(3);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error?.status === 409) {
        setError('You already have an active policy for this product');
      } else {
        setError(error?.message || 'Purchase failed');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    if (step === 3) setStep(1);
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Purchase Insurance</h1>

        {/* Progress Steps */}
        <ul className="steps steps-horizontal w-full mb-8">
          <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Step 1</li>
          <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Step 2</li>
          <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Step 3</li>
        </ul>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleTryAgain}>
                Try Again
              </Button>
              <Link href="/products" className="btn btn-ghost btn-sm">Back to Products</Link>
            </div>
          </div>
        )}

        {/* Step 1: Confirm */}
        {step === 1 && product && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p className="text-sm text-base-content/70">{product.description}</p>
              <div className="divider">Customer Details</div>
              {user && (
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> <span>{user.firstName} {user.lastName}</span></p>
                  <p><span className="font-medium">Email:</span> <span>{user.email}</span></p>
                </div>
              )}
              <div className="divider">Premium</div>
              <p className="text-2xl font-bold text-primary">
                RM {product.basePremium?.toLocaleString()}
              </p>
              <p className="text-sm text-base-content/60">Annual premium</p>
              <div className="card-actions justify-end mt-4">
                <Button variant="primary" onClick={() => setStep(2)}>
                  Continue to Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && product && (
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Order Summary</h2>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <tbody>
                      <tr><td className="font-medium">Product</td><td>{product.name}</td></tr>
                      <tr><td className="font-medium">Coverage Period</td><td>12 months</td></tr>
                      <tr><td className="font-medium">Location</td><td>{user?.firstName ? 'West Malaysia' : ''}</td></tr>
                      <tr><td className="font-medium">Annual Premium</td><td className="font-bold">RM {product.basePremium?.toLocaleString()}</td></tr>
                      <tr className="bg-base-200"><td className="font-bold">Total</td><td className="font-bold text-primary">RM {product.basePremium?.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <label className="cursor-pointer label justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                  />
                  <span className="label-text">I agree to the terms and conditions of this insurance policy</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="primary"
                onClick={handlePurchase}
                disabled={!termsAccepted || purchasing}
                loading={purchasing}
              >
                Confirm Purchase
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="card bg-base-100 shadow-xl text-center">
            <div className="card-body py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-success">Purchase Successful!</h2>
              <p className="text-lg mt-2">
                Your policy number is <span className="font-bold text-primary">{purchasedPolicyNumber}</span>
              </p>
              <div className="card-actions justify-center gap-4 mt-6">
                <Link href="/dashboard" className="btn btn-primary">View My Portfolio</Link>
                <Link href="/products" className="btn btn-outline">Browse More Products</Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

function PurchasePageInner() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || '';

  return <PurchaseContent key={productId} productId={productId} />;
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
      <PurchasePageInner />
    </Suspense>
  );
}

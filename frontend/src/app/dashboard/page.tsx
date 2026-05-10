'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPolicies, selectAllPolicies, selectPolicyLoadingState } from '@/store/slices/policySlice';
import { ProtectedRoute } from '@/components/layout';
import { Badge, Skeleton, Button } from '@/components/ui';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const policies = useAppSelector(selectAllPolicies);
  const { isLoading, error } = useAppSelector(selectPolicyLoadingState);

  useEffect(() => {
    dispatch(fetchPolicies());
  }, [dispatch]);

  const activePolicies = policies.filter(p => p.status === 'active');
  const totalPremium = policies.reduce((sum, p) => sum + (p.premiumAmount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'expired': return <Badge variant="neutral">Expired</Badge>;
      case 'cancelled': return <Badge variant="warning">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Policies</h1>

        {/* Loading */}
        {isLoading && (
          <div role="status" aria-label="Loading policies" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} variant="card" lines={3} />)}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="alert alert-error mb-6">
            <span>Unable to load your portfolio</span>
            <Button variant="ghost" onClick={() => dispatch(fetchPolicies())}>Retry</Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && policies.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">You don&apos;t have any policies yet</h2>
            <Link href="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        )}

        {/* Policies */}
        {!isLoading && !error && policies.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="stats shadow mb-8 w-full">
              <div className="stat">
                <div className="stat-title">Total Policies</div>
                <div className="stat-value text-primary">{policies.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Active Policies</div>
                <div className="stat-value text-success">{activePolicies.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Annual Premium</div>
                <div className="stat-value">RM {totalPremium.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map(policy => (
                <div key={policy.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <h2 className="card-title text-lg">{policy.product?.name || 'Policy'}</h2>
                      {getStatusBadge(policy.status)}
                    </div>
                    <p className="text-sm text-base-content/60">{policy.policyNumber}</p>
                    <div className="text-sm space-y-1">
                      <p>Start: <span>{policy.startDate}</span></p>
                      <p>End: <span>{policy.endDate}</span></p>
                      <p>Location: {policy.location}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      RM {policy.premiumAmount?.toLocaleString()}
                    </p>
                    <div className="card-actions justify-end gap-2 mt-2">
                      <Link href={`/policies/${policy.id}`} className="btn btn-outline btn-sm">View Details</Link>
                      {policy.status === 'active' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => router.push(`/claims/new?policyId=${policy.id}`)}
                        >
                          Submit Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/products" className="btn btn-outline">Browse More Products</Link>
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}

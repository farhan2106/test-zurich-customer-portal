'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchClaims, selectAllClaims, selectClaimLoadingState } from '@/store/slices/claimSlice';
import { ProtectedRoute } from '@/components/layout';
import { Badge, Skeleton, Button } from '@/components/ui';

export default function ClaimsPage() {
  const dispatch = useAppDispatch();
  const claims = useAppSelector(selectAllClaims);
  const { isLoading, error } = useAppSelector(selectClaimLoadingState);

  useEffect(() => {
    dispatch(fetchClaims());
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <Badge variant="info">Submitted</Badge>;
      case 'under_review': return <Badge variant="warning">Under Review</Badge>;
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      case 'paid': return <Badge variant="neutral">Paid</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatClaimType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Claims</h1>
          <Link href="/claims/new" className="btn btn-primary">
            Submit New Claim
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div role="status" aria-label="Loading claims" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => <Skeleton key={i} variant="card" lines={3} />)}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="alert alert-error mb-6">
            <span>Unable to load claims</span>
            <Button variant="ghost" onClick={() => dispatch(fetchClaims())}>Retry</Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && claims.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">You haven&apos;t submitted any claims yet</h2>
            <Link href="/claims/new" className="btn btn-primary">Submit a Claim</Link>
          </div>
        )}

        {/* Claims */}
        {!isLoading && !error && claims.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {claims.map(claim => (
              <div key={claim.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title text-lg">{claim.claimNumber}</h2>
                    {getStatusBadge(claim.status)}
                  </div>
                  <p className="text-sm text-base-content/60">{formatClaimType(claim.type)}</p>
                  <div className="text-sm space-y-1">
                    <p>Policy: <span>{claim.policyNumber}</span></p>
                    <p>Incident Date: <span>{claim.incidentDate}</span></p>
                    <p>{claim.description}</p>
                  </div>
                  <div className="card-actions justify-end gap-2 mt-2">
                    <Link href={`/claims/${claim.id}`} className="btn btn-outline btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

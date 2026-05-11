'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPolicyById,
  renewPolicy,
  selectPolicyById,
  selectPolicyLoadingState,
} from '@/store/slices/policySlice';
import { ProtectedRoute } from '@/components/layout';
import { Badge, Skeleton } from '@/components/ui';

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const policy = useAppSelector(selectPolicyById(id));
  const { isLoading, error } = useAppSelector(selectPolicyLoadingState);

  useEffect(() => {
    if (id) {
      dispatch(fetchPolicyById(id));
    }
  }, [id, dispatch]);

  // Determine if within renewal window (endDate within 30 days)
  const isWithinRenewalWindow = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysRemaining = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysRemaining > 0 && daysRemaining <= 30;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard" className="btn btn-ghost mb-6">
          &larr; Back to Dashboard
        </Link>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton variant="text" lines={1} width="60%" height="32px" />
            <Skeleton variant="card" lines={4} />
          </div>
        )}

        {error && !isLoading && !policy && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Policy not found</h2>
            <p className="text-base-content/60 mb-6">{error}</p>
            <Link href="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        )}

        {policy && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold">
                {policy.product?.name || 'Policy'}
              </h1>
              <Badge className="px-4" variant={getStatusVariant(policy.status)}>
                {policy.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Policy Details</h2>
                  <p>
                    <span className="font-medium">Policy Number:</span>{' '}
                    {policy.policyNumber}
                  </p>
                  <p>
                    <span className="font-medium">Start Date:</span>{' '}
                    {new Date(policy.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">End Date:</span>{' '}
                    {new Date(policy.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{' '}
                    {policy.location}
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Premium</h2>
                  <p className="text-2xl font-bold text-primary">
                    MYR {policy.premiumAmount?.toLocaleString()}
                  </p>
                  <p className="text-sm text-base-content/60">Annual Premium</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Link
                href={`/claims/new?policyId=${policy.id}`}
                className="btn btn-primary"
              >
                Submit Claim
              </Link>
              {policy.status === 'active' &&
                isWithinRenewalWindow(policy.endDate) && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => dispatch(renewPolicy(policy.id))}
                  >
                    Renew Policy
                  </button>
                )}
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Claims</h2>
                {policy.claims && policy.claims.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {policy.claims.map((claim) => (
                      <Link
                        key={claim.id}
                        href={`/claims/${claim.id}`}
                      >
                        <div key={claim.id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {claim.claimNumber}
                            </span>
                            <Badge className="px-4" variant="neutral">{claim.status}</Badge>
                          </div>
                          <p className="text-sm mt-1">
                            {claim.type} &mdash; {claim.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base-content/60 mb-4">
                      No claims submitted yet
                    </p>
                    <Link
                      href={`/claims/new?policyId=${policy.id}`}
                      className="btn btn-outline btn-sm"
                    >
                      Submit a Claim
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

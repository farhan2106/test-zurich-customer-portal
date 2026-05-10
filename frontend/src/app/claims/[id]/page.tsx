'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchClaimById,
  selectClaimById,
  selectClaimLoadingState,
} from '@/store/slices/claimSlice';
import { ProtectedRoute } from '@/components/layout';
import { Badge, Skeleton, Button } from '@/components/ui';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'submitted':
      return <Badge variant="info">Submitted</Badge>;
    case 'under_review':
      return <Badge variant="warning">Under Review</Badge>;
    case 'approved':
      return <Badge variant="success">Approved</Badge>;
    case 'rejected':
      return <Badge variant="error">Rejected</Badge>;
    case 'paid':
      return <Badge variant="neutral">Paid</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

function formatClaimType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
}

function ClaimDetailContent() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const claimId = params.id as string;

  const claim = useAppSelector((state) => selectClaimById(state, claimId));
  const { isLoading, error } = useAppSelector(selectClaimLoadingState);

  useEffect(() => {
    dispatch(fetchClaimById(claimId));
  }, [dispatch, claimId]);

  // Loading state
  if (isLoading && !claim) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton variant="card" lines={5} />
        </main>
      </ProtectedRoute>
    );
  }

  // Error / Not found state
  if (error && !claim) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="alert alert-error mb-6" role="alert">
            <span>Claim not found</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => dispatch(fetchClaimById(claimId))}>
              Retry
            </Button>
            <Link href="/claims" className="btn btn-ghost">
              Back to Claims
            </Link>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  // Not found (no error but no claim)
  if (!claim && !isLoading) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="alert alert-warning mb-6" role="alert">
            <span>Claim not found</span>
          </div>
          <Link href="/claims" className="btn btn-ghost">
            Back to Claims
          </Link>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{claim!.claimNumber}</h1>
          <Link href="/claims" className="btn btn-ghost">
            Back to Claims
          </Link>
        </div>

        {/* Claim Details Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            {/* Type and Status */}
            <div className="flex items-center gap-3 mb-4">
              {getStatusBadge(claim!.status)}
              <span className="text-lg font-medium">
                {formatClaimType(claim!.type)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {/* Policy Number */}
              <div>
                <span className="text-sm text-base-content/60">Policy</span>
                <p>
                  <Link
                    href={`/policies/${claim!.policyId}`}
                    className="link link-primary"
                  >
                    {claim!.policyNumber}
                  </Link>
                </p>
              </div>

              {/* Description */}
              <div>
                <span className="text-sm text-base-content/60">
                  Description
                </span>
                <p className="mt-1">{claim!.description}</p>
              </div>

              {/* Incident Date */}
              <div>
                <span className="text-sm text-base-content/60">
                  Incident Date
                </span>
                <p className="mt-1">{formatDate(claim!.incidentDate)}</p>
              </div>

              {/* Incident Location */}
              {claim!.incidentLocation && (
                <div>
                  <span className="text-sm text-base-content/60">
                    Incident Location
                  </span>
                  <p className="mt-1">{claim!.incidentLocation}</p>
                </div>
              )}

              {/* Submission Date */}
              {claim!.submittedAt && (
                <div>
                  <span className="text-sm text-base-content/60">
                    Submitted On
                  </span>
                  <p className="mt-1">{formatDate(claim!.submittedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Status History</h2>
            <ul className="timeline timeline-vertical">
              <li>
                <div className="timeline-start text-sm text-base-content/60">
                  {claim!.submittedAt
                    ? formatDate(claim!.submittedAt)
                    : formatDate(claim!.incidentDate)}
                </div>
                <div className="timeline-middle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-primary"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="timeline-end timeline-box">
                  <span className="font-medium">Claim Submitted</span>
                  <p className="text-sm text-base-content/60">
                    Claim was submitted and is awaiting review
                  </p>
                </div>
                <hr />
              </li>
              {claim!.status !== 'submitted' && (
                <li>
                  <hr />
                  <div className="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-base-content/30"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="timeline-end timeline-box">
                    <span className="font-medium">
                      {formatClaimType(claim!.status)}
                    </span>
                    <p className="text-sm text-base-content/60">
                      Current status
                    </p>
                  </div>
                  <hr />
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default ClaimDetailContent;

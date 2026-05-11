'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  submitClaim,
  selectClaimLoadingState,
} from '@/store/slices/claimSlice';
import {
  fetchPolicies,
  selectAllPolicies,
} from '@/store/slices/policySlice';
import { ProtectedRoute } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';

const CLAIM_TYPES = ['accident', 'theft', 'damage', 'other'];

interface FormErrors {
  policyId?: string;
  type?: string;
  description?: string;
  incidentDate?: string;
}

function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function SubmitClaimFormContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const policies = useAppSelector(selectAllPolicies);
  const { isLoading, error } = useAppSelector(selectClaimLoadingState);

  const policyIdParam = searchParams.get('policyId');

  // Track whether user has manually selected a policy (to not override with URL param)
  const [userSelected, setUserSelected] = useState(false);

  const [claimType, setClaimType] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch policies on mount
  useEffect(() => {
    dispatch(fetchPolicies());
  }, [dispatch]);

  // Separate state for the actual select value
  const [policyIdState, setPolicyIdState] = useState('');

  // Derive effective policyId: user selection takes priority, otherwise use URL param if valid
  const activePolicies = policies.filter((p) => p.status === 'active');
  const urlParamValid = policyIdParam && activePolicies.some((p) => p.id === policyIdParam);
  const effectivePolicyId = userSelected ? policyIdState : (urlParamValid ? policyIdParam : '');

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!effectivePolicyId) {
      newErrors.policyId = 'Please select a policy';
    }
    if (!claimType) {
      newErrors.type = 'Please select a claim type';
    }
    if (!description || description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }
    if (!incidentDate) {
      newErrors.incidentDate = 'Please select an incident date';
    } else if (incidentDate > getTodayString()) {
      newErrors.incidentDate = 'Incident date cannot be in the future';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      policyId: true,
      type: true,
      description: true,
      incidentDate: true,
    });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const result = await dispatch(
      submitClaim({
        type: claimType,
        policyId: effectivePolicyId,
        incidentDate,
        description,
        incidentLocation: incidentLocation || '',
      }),
    );

    if (submitClaim.fulfilled.match(result)) {
      router.push(`/claims/${result.payload.id}`);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Submit a Claim</h1>
          <p className="text-base-content/60 mt-1">
            Fill in the details below to submit a new insurance claim.
          </p>
        </div>

        {/* API Error */}
        {error && (
          <div className="alert alert-error mb-6" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Policy Selector */}
          <div className="form-control">
            <label className="label" htmlFor="policy">
              <span className="label-text font-medium">
                Policy <span className="text-error">*</span>
              </span>
            </label>
            <select
              id="policy"
              className={`select select-bordered w-full ${
                touched.policyId && errors.policyId ? 'select-error' : ''
              }`}
              value={effectivePolicyId}
              onChange={(e) => {
                setUserSelected(true);
                setPolicyIdState(e.target.value);
              }}
              onBlur={() => handleBlur('policyId')}
              disabled={isLoading}
              aria-invalid={!!(touched.policyId && errors.policyId)}
              aria-describedby={
                touched.policyId && errors.policyId
                  ? 'policy-error'
                  : undefined
              }
            >
              <option value="" disabled>
                Select a policy
              </option>
              {activePolicies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policyNumber}
                  {policy.product ? ` — ${policy.product.name}` : ''}
                </option>
              ))}
            </select>
            {touched.policyId && errors.policyId && (
              <label id="policy-error" className="label">
                <span className="label-text-alt text-error">
                  {errors.policyId}
                </span>
              </label>
            )}
          </div>

          {/* Claim Type */}
          <div className="form-control">
            <label className="label" htmlFor="claimType">
              <span className="label-text font-medium">
                Claim Type <span className="text-error">*</span>
              </span>
            </label>
            <select
              id="claimType"
              className={`select select-bordered w-full ${
                touched.type && errors.type ? 'select-error' : ''
              }`}
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              onBlur={() => handleBlur('type')}
              disabled={isLoading}
              aria-invalid={!!(touched.type && errors.type)}
              aria-describedby={touched.type && errors.type ? 'type-error' : undefined}
            >
              <option value="" disabled>
                Select claim type
              </option>
              {CLAIM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {touched.type && errors.type && (
              <label id="type-error" className="label">
                <span className="label-text-alt text-error">{errors.type}</span>
              </label>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label" htmlFor="description">
              <span className="label-text font-medium">
                Description <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              id="description"
              className={`textarea textarea-bordered w-full ${
                touched.description && errors.description ? 'textarea-error' : ''
              }`}
              rows={4}
              minLength={10}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlur('description')}
              disabled={isLoading}
              placeholder="Describe what happened..."
              aria-invalid={!!(touched.description && errors.description)}
              aria-describedby={
                touched.description && errors.description
                  ? 'description-error'
                  : 'description-counter'
              }
            />
            <div className="flex justify-between mt-1">
              {touched.description && errors.description ? (
                <label id="description-error" className="label">
                  <span className="label-text-alt text-error">
                    {errors.description}
                  </span>
                </label>
              ) : (
                <span />
              )}
              <span
                id="description-counter"
                className="text-sm text-base-content/50"
              >
                {description.length}/2000
              </span>
            </div>
          </div>

          {/* Incident Date */}
          <div className="form-control">
            <label className="label" htmlFor="incidentDate">
              <span className="label-text font-medium">
                Incident Date <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="incidentDate"
              type="date"
              className={`input input-bordered w-full ${
                touched.incidentDate && errors.incidentDate ? 'input-error' : ''
              }`}
              max={getTodayString()}
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              onBlur={() => handleBlur('incidentDate')}
              disabled={isLoading}
              aria-invalid={!!(touched.incidentDate && errors.incidentDate)}
              aria-describedby={
                touched.incidentDate && errors.incidentDate
                  ? 'date-error'
                  : undefined
              }
            />
            {touched.incidentDate && errors.incidentDate && (
              <label id="date-error" className="label">
                <span className="label-text-alt text-error">
                  {errors.incidentDate}
                </span>
              </label>
            )}
          </div>

          {/* Incident Location (Optional) */}
          <div className="form-control">
            <label className="label" htmlFor="incidentLocation">
              <span className="label-text font-medium">
                Incident Location <span className="text-base-content/40">(optional)</span>
              </span>
            </label>
            <input
              id="incidentLocation"
              type="text"
              className="input input-bordered w-full"
              value={incidentLocation}
              onChange={(e) => setIncidentLocation(e.target.value)}
              disabled={isLoading}
              placeholder="Where did the incident occur?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              Submit Claim
            </Button>
            <Link href="/claims" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </main>
  );
}

function SubmitClaimForm() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <main className="container mx-auto px-4 py-8 max-w-2xl">
            <Spinner size="lg" label="Loading form" />
          </main>
        }
      >
        <SubmitClaimFormContent />
      </Suspense>
    </ProtectedRoute>
  );
}

export default SubmitClaimForm;

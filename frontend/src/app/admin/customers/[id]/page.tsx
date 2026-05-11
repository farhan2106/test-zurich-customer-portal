'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCustomerById,
  updateCustomer,
  selectCustomerById,
  selectAdminLoadingState,
} from '@/store/slices/adminSlice';
import type { UpdateCustomerDto } from '@/services/admin.service';
import { Skeleton, Button, Badge } from '@/components/ui';

type TabType = 'profile' | 'policies' | 'claims';

export default function AdminCustomerDetailPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const id = params.id as string;

  const customer = useAppSelector((state) => selectCustomerById(state, id));
  const { isLoading, error } = useAppSelector(selectAdminLoadingState);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateCustomerDto>({});

  useEffect(() => {
    dispatch(fetchCustomerById(id));
  }, [dispatch, id]);

  const handleEdit = () => {
    if (customer) {
      setEditData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        location: customer.location,
        premiumPaid: customer.premiumPaid,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = () => {
    if (!editData.firstName?.trim() || !editData.lastName?.trim()) {
      return;
    }
    if ((editData.premiumPaid ?? 0) < 0) {
      return;
    }
    dispatch(updateCustomer({ id, data: editData as UpdateCustomerDto }));
    setIsEditing(false);
  };

  // Loading state
  if (isLoading && !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" lines={1} width="200px" height="32px" />
          <Skeleton variant="text" lines={1} width="150px" />
        </div>
        <Skeleton variant="card" lines={5} />
      </div>
    );
  }

  // Error state
  if (error && !customer) {
    return (
      <div className="space-y-4">
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
        <Link href="/admin/customers" className="btn btn-ghost">
          Back to Customers
        </Link>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <div className="alert alert-warning" role="alert">
          <span>Customer not found</span>
        </div>
        <Link href="/admin/customers" className="btn btn-ghost">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {customer.firstName} {customer.lastName}
        </h1>
        <Link href="/admin/customers" className="btn btn-ghost">
          Back to Customers
        </Link>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-bordered">
        <button
          role="tab"
          className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'policies' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          Policies
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'claims' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Claims
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {!isEditing ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-lg">Profile Information</h2>
                  <Button onClick={handleEdit}>Edit</Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-base-content/60">First Name</span>
                    <p className="mt-1">{customer.firstName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Last Name</span>
                    <p className="mt-1">{customer.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Email</span>
                    <p className="mt-1">{customer.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Location</span>
                    <p className="mt-1">{customer.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Premium Paid</span>
                    <p className="mt-1">{customer.premiumPaid}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Role</span>
                    <p className="mt-1">{customer.role}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Created At</span>
                    <p className="mt-1">{customer.createdAt}</p>
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Updated At</span>
                    <p className="mt-1">{customer.updatedAt}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-lg">Edit Profile</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">First Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={editData.firstName || ''}
                      onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Last Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={editData.lastName || ''}
                      onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <span className="text-sm text-base-content/60">Email</span>
                    <p className="mt-1">{customer.email}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Location</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      disabled={isLoading}
                    >
                      <option value="West Malaysia">West Malaysia</option>
                      <option value="East Malaysia">East Malaysia</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Premium Paid</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={editData.premiumPaid ?? 0}
                      min="0"
                      onChange={(e) =>
                        setEditData({ ...editData, premiumPaid: Number(e.target.value) })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="card-actions justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} loading={isLoading}>
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Policies</h2>
            {customer.policies && customer.policies.length > 0 ? (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Policy Number</th>
                    <th>Status</th>
                    <th>Premium</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.policies.map((policy) => (
                    <tr key={policy.id}>
                      <td>{policy.policyNumber}</td>
                      <td>
                        <Badge className="px-4" variant={policy.status === 'active' ? 'success' : 'neutral'}>
                          {policy.status}
                        </Badge>
                      </td>
                      <td>{policy.premiumAmount}</td>
                      <td>{policy.startDate}</td>
                      <td>{policy.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-base-content/70">No policies found.</p>
            )}
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Claims</h2>
            {customer.claims && customer.claims.length > 0 ? (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Claim Number</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.claims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.claimNumber}</td>
                      <td>{claim.type}</td>
                      <td>
                        <Badge className="px-4" variant={claim.status === 'submitted' ? 'info' : 'neutral'}>
                          {claim.status}
                        </Badge>
                      </td>
                      <td>{claim.incidentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-base-content/70">No claims found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

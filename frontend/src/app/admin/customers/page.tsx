'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomers, selectAllCustomers, selectAdminLoadingState, selectCustomersPagination } from '@/store/slices/adminSlice';
import { Skeleton, Button } from '@/components/ui';
import type { CustomerFilters } from '@/services/admin.service';

export default function AdminCustomersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const customers = useAppSelector(selectAllCustomers);
  const pagination = useAppSelector(selectCustomersPagination);
  const { isLoading, error } = useAppSelector(selectAdminLoadingState);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    dispatch(fetchCustomers({ ...filters, page, limit }));
  }, [dispatch, page, filters]);

  const handleFilterChange = (key: keyof CustomerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  return (
    <main className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <input
          type="text"
          placeholder="First name..."
          className="input input-bordered input-sm w-full"
          value={filters.firstName || ''}
          onChange={e => handleFilterChange('firstName', e.target.value)}
          aria-label="Filter by first name"
        />
        <input
          type="text"
          placeholder="Last name..."
          className="input input-bordered input-sm w-full"
          value={filters.lastName || ''}
          onChange={e => handleFilterChange('lastName', e.target.value)}
          aria-label="Filter by last name"
        />
        <input
          type="text"
          placeholder="Email..."
          className="input input-bordered input-sm w-full"
          value={filters.email || ''}
          onChange={e => handleFilterChange('email', e.target.value)}
          aria-label="Filter by email"
        />
        <select
          className="select select-bordered select-sm w-full"
          value={filters.location || ''}
          onChange={e => handleFilterChange('location', e.target.value)}
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          <option value="West Malaysia">West Malaysia</option>
          <option value="East Malaysia">East Malaysia</option>
        </select>
        <select
          className="select select-bordered select-sm w-full"
          value={filters.role || ''}
          onChange={e => handleFilterChange('role', e.target.value)}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="number"
          placeholder="Min premium (MYR)"
          className="input input-bordered input-sm w-full"
          value={filters.premiumMin ?? ''}
          min={0}
          onChange={e => handleFilterChange('premiumMin', e.target.value)}
          aria-label="Minimum premium paid"
        />
        <input
          type="number"
          placeholder="Max premium (MYR)"
          className="input input-bordered input-sm w-full"
          value={filters.premiumMax ?? ''}
          min={0}
          onChange={e => handleFilterChange('premiumMax', e.target.value)}
          aria-label="Maximum premium paid"
        />
        <input
          type="text"
          placeholder="Search all..."
          className="input input-bordered input-sm w-full"
          value={filters.search || ''}
          onChange={e => handleFilterChange('search', e.target.value)}
          aria-label="Search across name and email"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div role="status" aria-label="Loading customers">
          <table className="hidden md:table table table-zebra w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton h-4 w-32" /></td>
                  <td><div className="skeleton h-4 w-40" /></td>
                  <td><div className="skeleton h-4 w-24" /></td>
                  <td><div className="skeleton h-4 w-20" /></td>
                  <td><div className="skeleton h-8 w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="md:hidden space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-sm p-4">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-4 w-40 mb-2" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="alert alert-error mb-6" role="alert">
          <span>{error}</span>
          <Button variant="ghost" onClick={() => dispatch(fetchCustomers())}>Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && (!customers || customers.length === 0) && (
        <div className="text-center py-16">
          <p className="text-base-content/70">No customers found</p>
        </div>
      )}

      {/* Data */}
      {!isLoading && !error && customers && customers.length > 0 && (
        <>
          {/* Table view (desktop) */}
          <table className="hidden md:table table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Premium Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.location}</td>
                  <td>{customer.premiumPaid}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="md:hidden space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-sm">{customer.email}</p>
                  <p className="text-sm">{customer.location}</p>
                  <p className="text-sm">{customer.premiumPaid}</p>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-sm px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

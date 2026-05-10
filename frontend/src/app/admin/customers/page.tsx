'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomers, selectAllCustomers, selectAdminLoadingState } from '@/store/slices/adminSlice';
import { Skeleton, Button } from '@/components/ui';

export default function AdminCustomersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const customers = useAppSelector(selectAllCustomers);
  const { isLoading, error } = useAppSelector(selectAdminLoadingState);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearch(value);
    dispatch(fetchCustomers(value || undefined));
  };

  return (
    <main className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          className="input input-bordered w-full max-w-md"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
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
          <p className="text-base-content/70">No customers match your search</p>
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
        </>
      )}
    </main>
  );
}

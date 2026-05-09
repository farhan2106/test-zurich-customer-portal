'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useState } from 'react';

interface NavLink {
  label: string;
  href: string;
  adminOnly?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Products', href: '/products' },
  { label: 'Claims', href: '/claims' },
  { label: 'Customers', href: '/admin/customers', adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.adminOnly || user?.role === 'admin',
  );

  const isActive = (href: string) => pathname === href;

  const handleSignOut = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <nav
      className="navbar bg-base-100 fixed top-0 z-50 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* navbar-start: Logo/brand + mobile hamburger */}
      <div className="navbar-start gap-2">
        {/* Mobile hamburger */}
        <div className="dropdown lg:hidden">
          <button
            type="button"
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {mobileOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              {visibleLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={isActive(link.href) ? 'btn-active' : ''}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Brand */}
        <Link href="/dashboard" className="btn btn-ghost text-xl font-bold text-primary">
          Zurich
        </Link>
      </div>

      {/* navbar-center: Desktop nav links (hidden on mobile) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`btn btn-ghost ${isActive(link.href) ? 'btn-active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* navbar-end: User dropdown */}
      <div className="navbar-end">
        {user && (
          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              role="button"
              className="btn btn-ghost gap-1 normal-case"
              aria-label={`User menu for ${user.firstName}`}
            >
              {user.firstName}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-40 p-2 shadow"
            >
              <li>
                <button type="button" onClick={handleSignOut}>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

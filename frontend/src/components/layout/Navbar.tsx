'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useState } from 'react';
import apiClient from '@/services/api-client';

interface NavLink {
  label: string;
  href: string;
  icon: string;
  description: string;
  adminOnly?: boolean;
}

const NAV_LINKS: NavLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    description: 'Policy overview',
  },
  {
    label: 'Products',
    href: '/products',
    icon: 'products',
    description: 'Browse insurance',
  },
  {
    label: 'Claims',
    href: '/claims',
    icon: 'claims',
    description: 'Submit & track',
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: 'customers',
    adminOnly: true,
    description: 'Manage customers',
  },
];

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  products: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  claims: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  customers: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

function ZurichLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.adminOnly || user?.role === 'admin',
  );

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue with logout even if backend call fails
    }
    dispatch(logout());
    router.push('/');
  };

  return (
    <nav
      className="navbar bg-base-100/95 backdrop-blur fixed top-0 z-50 border-b border-base-300"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* navbar-start: Logo/brand + mobile hamburger */}
      <div className="navbar-start gap-2">
        {/* Mobile hamburger - uses DaisyUI v5 Popover API for mobile compatibility */}
        <button
          type="button"
          className="btn btn-ghost btn-sm lg:hidden"
          aria-label="Open menu"
          popoverTarget="mobile-menu"
          style={{ anchorName: '--anchor-mobile-menu' } as React.CSSProperties}
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
        <ul
          id="mobile-menu"
          className="dropdown menu menu-sm bg-base-100 rounded-box mt-3 w-64 p-2 shadow"
          popover="auto"
          style={{ positionAnchor: '--anchor-mobile-menu' } as React.CSSProperties}
        >
          {visibleLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActive(link.href) ? 'btn-active' : ''}
                onClick={() => {
                  const el = document.getElementById('mobile-menu');
                  if (el && 'hidePopover' in el) {
                    (el as HTMLElement).hidePopover();
                  }
                }}
              >
                {ICONS[link.icon]}
                <span>
                  <span className="font-medium">{link.label}</span>
                  <span className="block text-xs opacity-60">{link.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Brand */}
        <Link href="/dashboard" className="btn btn-ghost text-xl font-bold text-primary gap-1">
          <ZurichLogo />
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
                className={`btn btn-ghost gap-2 ${isActive(link.href) ? 'btn-active' : ''}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {ICONS[link.icon]}
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
              className="btn btn-ghost gap-2 normal-case"
              aria-label={`User menu for ${user.firstName}`}
            >
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                    <span className="text-sm font-semibold">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                </div>
              )}
              <span className="hidden sm:inline">{user.firstName}</span>
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
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow"
            >
              <li className="menu-title px-4 py-2">
                <span className="text-xs opacity-60">Signed in as</span>
                <span className="font-medium text-sm">{user.email}</span>
              </li>
              <li className="border-t border-base-200 my-1" />
              <li>
                <button type="button" onClick={handleSignOut} data-testid="sign-out-btn">
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

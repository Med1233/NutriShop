'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <LanguageSelector />
      <span className="h-5 w-px shrink-0 bg-gray-200" />
      {(!user || user.role === 'customer') && (
        <Link
          href="/cart"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-semibold text-green-600 no-underline transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {t('nav.cart')}
          {itemCount > 0 && (
            <span className="min-w-[18px] rounded-full bg-green-600 px-[7px] py-[2px] text-center text-[0.65rem] font-bold leading-tight text-white">
              {itemCount}
            </span>
          )}
        </Link>
      )}
      {loading ? null : user ? (
        <>
          <Link
            href="/profile"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-gray-700 no-underline transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {t('nav.profile')}
          </Link>
          {user.role === 'manager' && (
            <Link
              href="/manager"
              className="rounded-md bg-blue-500/[0.08] px-1.5 py-1 text-sm font-semibold text-blue-500 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.manager')}
            </Link>
          )}
          {user.role === 'stockist' && (
            <Link
              href="/stockist"
              className="rounded-md bg-violet-500/[0.08] px-1.5 py-1 text-sm font-semibold text-violet-500 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.stockist')}
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="rounded-md bg-red-600/[0.08] px-1.5 py-1 text-sm font-semibold text-red-600 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.admin')}
            </Link>
          )}
          <span className="h-5 w-px shrink-0 bg-gray-200" />
          <span className="text-sm font-medium text-gray-500">
            {t('nav.greeting', { name: user.name })}
          </span>
          <button
            onClick={() => {
              logout();
              setMobileOpen(false);
            }}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors"
          >
            {t('nav.signOut')}
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-medium text-gray-700 no-underline transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.signIn')}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-br from-green-600 to-green-700 px-4 py-2 text-sm font-semibold text-white no-underline shadow-[0_1px_2px_rgba(22,163,74,0.3)] transition-shadow"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.register')}
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-[100] mb-8 border-b border-gray-200 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-green-600 no-underline"
        >
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4L8 14v16c0 14 10.7 24.4 24 28 13.3-3.6 24-14 24-28V14L32 4z"
              fill="url(#shield-grad)"
              opacity="0.12"
            />
            <path
              d="M32 4L8 14v16c0 14 10.7 24.4 24 28 13.3-3.6 24-14 24-28V14L32 4z"
              stroke="url(#shield-grad)"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M32 20c-6 0-12 5-12 14 4-2 8-3 12-3s8 1 12 3c0-9-6-14-12-14z"
              fill="url(#leaf-grad)"
            />
            <line
              x1="32"
              y1="31"
              x2="32"
              y2="46"
              stroke="#15803d"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M32 38c3-2 6-2 8-1"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M32 42c-3-2-5.5-2-7.5-1"
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="shield-grad" x1="8" y1="4" x2="56" y2="58">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="leaf-grad" x1="20" y1="20" x2="44" y2="34">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </svg>
          <span className="bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            {t('app.name')}
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-4 md:flex">{navLinks}</div>

        {/* Mobile hamburger */}
        <button
          className="flex cursor-pointer rounded-md border-none bg-transparent p-1 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="flex flex-col gap-3.5 border-t border-gray-100 bg-white px-6 py-4">
          {navLinks}
        </div>
      )}
    </nav>
  );
}

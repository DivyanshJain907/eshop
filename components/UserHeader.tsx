'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function UserHeader({ children }: { children?: React.ReactNode }) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAdminUser = isAuthenticated && user && (user.role === 'admin' || user.role === 'employee');

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const navGroups = [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/products', label: 'Products', icon: '📦' },
        { href: '/products/add', label: 'Add Product', icon: '➕' },
      ],
    },
    {
      label: 'Sales',
      items: [
        { href: '/sales', label: 'Direct Sales', icon: '🏪' },
        { href: '/sales/history', label: 'Sales History', icon: '📜' },
        { href: '/bookings', label: 'Bookings', icon: '📋' },
        { href: '/discounts', label: 'Discounts', icon: '🎯' },
      ],
    },
    {
      label: 'Tools',
      items: [
        { href: '/compare', label: 'Compare', icon: '🔍' },
        ...(user?.role === 'admin'
          ? [
              { href: '/admin/competitors', label: 'Competitors', icon: '⚙️' },
              { href: '/users', label: 'Users', icon: '👥' },
            ]
          : []),
      ],
    },
  ].filter((g) => g.items.length > 0);

  const isActive = (href: string) => pathname === href;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  /* ── Sidebar inner content (shared desktop + mobile) ── */
  const SidebarNav = () => (
    <>
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-slate-700/50 shrink-0">
        <img src="/jsclogo.png" alt="JSC" className="w-8 h-8 object-contain" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-slate-700/50 p-3 shrink-0">
          <button
            onClick={() => { setSidebarOpen(false); logout(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-[13px] font-medium transition-all"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* ── Desktop Sidebar ── */}
      {isAdminUser && (
        <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-slate-900 z-40">
          <SidebarNav />
        </aside>
      )}

      {/* ── Mobile Sidebar Overlay ── */}
      {isAdminUser && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900 flex flex-col shadow-2xl">
            <SidebarNav />
          </aside>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className={`flex-1 flex flex-col min-w-0 ${isAdminUser ? 'lg:ml-56' : ''}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shrink-0">
          <div className="flex items-center justify-between px-3 sm:px-6 h-14">
            <div className="flex items-center gap-2 min-w-0">
              {isAdminUser && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 -ml-1 rounded-md text-gray-500 hover:bg-gray-100 transition"
                  aria-label="Open menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <Link href="/" className="flex items-center gap-1.5 min-w-0">
                <img src="/jsclogo.png" alt="JSC" className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 object-contain" />
              </Link>
            </div>

            <div className="flex items-center shrink-0">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 hover:bg-gray-50 pl-2 pr-1 sm:pr-2 py-1.5 rounded-lg transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(user.name)}
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-medium text-gray-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${showProfileMenu ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-4 bg-linear-to-br from-indigo-50 to-white border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phone</span>
                            <span className="text-gray-800 font-medium">{user.phone}</span>
                          </div>
                          {user.shopName && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Shop</span>
                              <span className="text-gray-800 font-medium truncate ml-4">{user.shopName}</span>
                            </div>
                          )}
                          {user.city && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Location</span>
                              <span className="text-gray-800 font-medium">{user.city}, {user.state}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-3 border-t border-gray-100 space-y-1.5">
                          <Link
                            href="/profile/edit"
                            onClick={() => setShowProfileMenu(false)}
                            className="block w-full px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition text-center"
                          >
                            ✏️ Edit Profile
                          </Link>
                          <button
                            onClick={() => { setShowProfileMenu(false); logout(); }}
                            className="w-full px-3 py-2 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Link href="/login" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition">
                    Sign In
                  </Link>
                  <Link href="/register" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
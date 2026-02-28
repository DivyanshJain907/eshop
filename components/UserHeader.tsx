'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useState } from 'react';

export default function UserHeader() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <img src="/jsclogo.png" alt="JSC" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
          <span className="text-xl sm:text-2xl font-bold text-indigo-600">Jain Sales Corporation</span>
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4 relative">
            {/* Profile Avatar and Name */}
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            >
              {/* Avatar Circle */}
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                {getInitials(user.name)}
              </div>
              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-700 transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-16 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Profile Information</h3>

                  {/* Profile Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="text-gray-900">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-900 truncate">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                    {user.shopName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">Shop:</span>
                        <span className="text-gray-900">{user.shopName}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{user.street}</p>
                      <p>
                        {user.city}, {user.state} {user.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-2">
                  <Link
                    href="/profile/edit"
                    onClick={() => setShowProfileMenu(false)}
                    className="block w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors text-center"
                  >
                    ✏️ Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Navigation Bar for Admin/Employee */}
      {isAuthenticated && user && (user.role === 'admin' || user.role === 'employee') && (
        <nav className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex gap-1">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              📦 Products
            </Link>
            <Link
              href="/products/add"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              ➕ Add Product
            </Link>
            <Link
              href="/bookings"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              📋 Bookings
            </Link>
            <Link
              href="/sales"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              🏪 Direct Sales
            </Link>
            <Link
              href="/sales/history"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              📜 Sales History
            </Link>
            <Link
              href="/discounts"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              🎯 Discounts
            </Link>
            <Link
              href="/compare"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
            >
              🔍 Compare Products
            </Link>
            {user.role === 'admin' && (
              <>
                <Link
                  href="/admin/competitors"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
                >
                  ⚙️ Manage Competitors
                </Link>
                <Link
                  href="/users"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition"
                >
                  👥 Users
                </Link>
              </>
            )}
          </div>
        </nav>
      )}

      {/* Click outside to close menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}

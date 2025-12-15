'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check if user is Employee or Admin
  useEffect(() => {
    if (!isLoading && user && user.role !== 'employee' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your shop efficiently</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Products Card */}
          <Link href="/products" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Products</h3>
            <p className="text-gray-600 mb-4">Manage your product catalog</p>
            <button className="text-indigo-600 font-medium hover:text-indigo-700">View Products →</button>
          </Link>

          {/* Bookings Card */}
          <Link href="/bookings" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bookings</h3>
            <p className="text-gray-600 mb-4">View all customer bookings</p>
            <button className="text-indigo-600 font-medium hover:text-indigo-700">View Bookings →</button>
          </Link>

          {/* Sales Card */}
          <Link href="/sales" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sales</h3>
            <p className="text-gray-600 mb-4">Track your sales history</p>
            <button className="text-indigo-600 font-medium hover:text-indigo-700">View Sales →</button>
          </Link>
        </div>

        {/* Admin Only Card */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 gap-6">
            <Link href="/users" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600 mb-4">Manage system users and permissions</p>
              <button className="text-indigo-600 font-medium hover:text-indigo-700">Manage Users →</button>
            </Link>
          </div>
        )}

        {/* Quick Action Button */}
        <div className="mt-12 flex gap-4">
          <Link
            href="/products/add"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg transition shadow-lg"
          >
            ➕ Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}

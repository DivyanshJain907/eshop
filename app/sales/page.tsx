'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import SaleHistory from '@/components/SaleHistory';

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch sales data
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchSales = async () => {
        try {
          const response = await fetch('/api/sales');
          if (!response.ok) throw new Error('Failed to fetch sales');
          const salesData = await response.json();
          setSales(salesData);
        } catch (error) {
          console.error('Error fetching sales:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSales();
    }
  }, [isAuthenticated, user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💰 Sales History</h1>
          <p className="text-gray-600 mt-2">Track all sales transactions</p>
        </div>

        {/* Sales Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {sales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
            ) : (
              <SaleHistory sales={sales} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import SaleHistory from '@/components/SaleHistory';

export default function SalesHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');

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
      fetchSalesData();
    }
  }, [isAuthenticated, user]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales');

      if (response.ok) {
        const salesData = await response.json();
        setSales(Array.isArray(salesData) ? salesData : []);
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesDate = !filterDate || 
      new Date(sale.createdAt).toLocaleDateString() === new Date(filterDate).toLocaleDateString();
    
    const matchesCustomer = !filterCustomer || 
      (sale.customerName?.toLowerCase().includes(filterCustomer.toLowerCase()) ||
       sale.customerMobile?.includes(filterCustomer));
    
    return matchesDate && matchesCustomer;
  });

  if (isLoading) {
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">💰</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
              <p className="text-gray-600">Track all direct sales transactions</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Customer Name or Mobile
              </label>
              <input
                type="text"
                placeholder="Search customer..."
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {(filterDate || filterCustomer) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterCustomer('');
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                ✕ Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Sales Summary */}
        {filteredSales.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold text-indigo-600">{filteredSales.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Average Sale</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{(filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / filteredSales.length).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Sales History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            {filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  {sales.length === 0 ? '📭 No sales recorded yet' : '🔍 No sales match your filters'}
                </p>
              </div>
            ) : (
              <SaleHistory sales={filteredSales} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

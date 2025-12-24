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
      // Fetch both direct sales and online sales
      const [directSalesRes, onlineSalesRes] = await Promise.all([
        fetch('/api/direct-sales'),
        fetch('/api/sales')
      ]);

      const directSales = directSalesRes.ok ? await directSalesRes.json() : [];
      const onlineSales = onlineSalesRes.ok ? await onlineSalesRes.json() : [];

      // Transform direct sales - group all items in one row per sale
      const directSalesGrouped = (Array.isArray(directSales) ? directSales : directSales.sales || []).map((sale: any) => ({
        _id: sale._id || sale.id,
        productNames: (sale.items || []).map((item: any) => item.productName).join(', ') || 'N/A',
        totalQuantity: (sale.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
        totalAmount: sale.totalAmount || 0,
        amountPaid: sale.amountPaid || sale.totalAmount || 0,
        remainingAmount: sale.remainingAmount || 0,
        paymentStatus: sale.paymentStatus || 'fully-paid',
        createdAt: sale.createdAt,
        saleType: 'Direct Sale',
        customerName: sale.customerName || 'Direct Customer',
        customerMobile: sale.customerMobile || '',
        employeeName: sale.employeeName || 'N/A',
        items: sale.items || []
      }));

      // Transform online sales - group all items in one row per sale
      const onlineSalesGrouped = (Array.isArray(onlineSales) ? onlineSales : onlineSales.sales || []).map((sale: any) => ({
        _id: sale._id || sale.id,
        productNames: (sale.items || [sale]).map((item: any) => item.productName || sale.productName).join(', ') || 'N/A',
        totalQuantity: (sale.items || [sale]).reduce((sum: number, item: any) => sum + (item.quantity || sale.quantity || 0), 0),
        totalAmount: sale.totalAmount || 0,
        createdAt: sale.createdAt || sale.timestamp,
        saleType: 'Online Sale',
        customerName: sale.customerName || sale.userId?.name || 'Online Customer',
        customerMobile: sale.customerMobile || sale.userId?.phone || '',
        employeeName: sale.employeeName || 'N/A',
        items: sale.items || [sale]
      }));

      // Combine both sales arrays
      const combinedSales = [...directSalesGrouped, ...onlineSalesGrouped];

      // Sort by date descending
      combinedSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSales(combinedSales);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <UserHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">💰</div>
              <div>
                <h1 className="text-4xl font-bold">Sales History</h1>
                <p className="text-indigo-100 text-lg mt-2">Track all direct and online sales transactions</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <p className="text-sm text-white">Total Sales</p>
                <p className="text-3xl font-bold text-white">{sales.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 shadow">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-indigo-600">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔍</span> Filter Sales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Filter by Customer Name or Mobile
              </label>
              <input
                type="text"
                placeholder="Search customer..."
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
              >
                ✕ Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Sales Summary */}
        {filteredSales.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md p-6 border-l-4 border-indigo-600 hover:shadow-lg transition">
              <p className="text-gray-600 text-sm font-semibold mb-2">📊 Total Transactions</p>
              <p className="text-4xl font-bold text-indigo-600">{filteredSales.length}</p>
              <p className="text-xs text-gray-500 mt-2">showing filtered results</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-l-4 border-green-600 hover:shadow-lg transition">
              <p className="text-gray-600 text-sm font-semibold mb-2">💵 Total Revenue</p>
              <p className="text-4xl font-bold text-green-600">
                ₹{filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">from selected sales</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition">
              <p className="text-gray-600 text-sm font-semibold mb-2">📈 Average Sale</p>
              <p className="text-4xl font-bold text-blue-600">
                ₹{(filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0) / filteredSales.length).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">per transaction</p>
            </div>
          </div>
        )}

        {/* Sales History Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-indigo-600">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span> Sales Details
            </h2>
          </div>
          <div className="p-6">
            {filteredSales.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">
                  {sales.length === 0 ? '📭' : '🔍'}
                </div>
                <p className="text-gray-600 text-xl font-semibold">
                  {sales.length === 0 ? 'No sales recorded yet' : 'No sales match your filters'}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {sales.length === 0 
                    ? 'Start recording sales to see them here' 
                    : 'Try adjusting your filter criteria'}
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

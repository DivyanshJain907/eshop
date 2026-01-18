'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CompetitorStats from '@/components/CompetitorStats';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({
    revenue: [],
    paymentStatus: [],
    productTiers: []
  });

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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      const [productsRes, usersRes, salesRes, directSalesRes] = await Promise.all([
        fetch('/api/products?limit=10000'),
        fetch('/api/users?limit=1000'),
        fetch('/api/sales'),
        fetch('/api/direct-sales')
      ]);

      const productsData = await productsRes.json();
      const usersData = await usersRes.json();
      const salesData = await salesRes.json();
      const directSalesData = await directSalesRes.json();

      // Calculate metrics - Handle both array and object responses
      let products = Array.isArray(productsData) ? productsData : (productsData.products || []);
      let users = Array.isArray(usersData) ? usersData : (usersData.users || []);
      let sales = Array.isArray(salesData) ? salesData : (salesData.sales || []);
      let directSales = Array.isArray(directSalesData) ? directSalesData : (directSalesData.directSales || []);

      // Get total product count from pagination data (accurate count of ALL products in database)
      const totalProductsInDB = (productsData.pagination?.total) || products.length;

      // Ensure we have arrays
      products = products.filter((p: unknown) => (p as any) && (p as any)._id);
      users = users.filter((u: unknown) => (u as any) && (u as any)._id);
      sales = sales.filter((s: unknown) => (s as any) && (s as any)._id);
      directSales = directSales.filter((d: unknown) => (d as any) && (d as any)._id);

      // Count customers from both user list and direct sales
      const regularCustomers = users.filter((u: any) => u.role === 'customer').length;
      const directSalesCustomers = new Set(directSales.map((d: any) => d.customerName || d.customerPhone)).size;
      const customerCount = regularCustomers + directSalesCustomers;

      // Include both sales and direct sales in metrics
      const totalRevenue =
        sales.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0) +
        directSales.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
      const totalPaid =
        sales.reduce((sum: number, sale: any) => sum + (sale.amountPaid || 0), 0) +
        directSales.reduce((sum: number, sale: any) => sum + (sale.amountPaid || 0), 0);
      const totalDue =
        sales.reduce((sum: number, sale: any) => sum + (sale.remainingAmount || 0), 0) +
        directSales.reduce((sum: number, sale: any) => sum + (sale.remainingAmount || 0), 0);
      const totalInventoryValue = products.reduce((sum: number, product: any) => {
        const price = product.price || 0;
        const qty = product.quantity || 0;
        return sum + (price * qty);
      }, 0);

      // Chart Data: Payment Status Pie Chart
      const fullyPaid = sales.filter((s: any) => s.paymentStatus === 'fully-paid' || s.paymentStatus === 'paid').length;
      const partiallyPaid = sales.filter((s: any) => s.paymentStatus === 'partially-paid' || s.paymentStatus === 'partial').length;
      const pending = sales.filter((s: any) => s.paymentStatus === 'pending').length;

      const paymentStatusData = [
        { name: 'Fully Paid', value: fullyPaid, color: '#10b981' },
        { name: 'Partially Paid', value: partiallyPaid, color: '#f59e0b' },
        { name: 'Pending', value: pending, color: '#ef4444' }
      ].filter(d => d.value > 0);

      // Ensure at least one data point for pie chart
      if (paymentStatusData.length === 0) {
        paymentStatusData.push({ name: 'No Sales', value: 1, color: '#d1d5db' });
      }

      // Chart Data: Revenue Trend (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        
        const daySales = sales.filter((s: any) => {
          const saleDate = new Date(s.createdAt || s.date || 0);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === date.getTime();
        });
        
        last7Days.push({
          date: dateStr,
          revenue: daySales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0)
        });
      }

      // Chart Data: Products by Tier
      const retailCount = products.filter((p: any) => !p.minQty || p.minQty <= 9).length;
      const wholesaleCount = products.filter((p: any) => p.minQty && p.minQty >= 10 && p.minQty <= 49).length;
      const superWholesaleCount = products.filter((p: any) => p.minQty && p.minQty >= 50).length;

      const tierData = [
        { name: 'Retail', count: retailCount },
        { name: 'Wholesale', count: wholesaleCount },
        { name: 'Super Wholesale', count: superWholesaleCount }
      ];

      setChartData({
        revenue: last7Days,
        paymentStatus: paymentStatusData,
        productTiers: tierData
      });

      setDashboardData({
        totalRevenue,
        totalPaid,
        totalDue,
        totalInventoryValue,
        customerCount,
        totalProducts: totalProductsInDB,
        totalSales: sales.length,
        lowStockProducts: products.filter((p: any) => (p.quantity || 0) <= (p.stockThreshold || 5)).length,
        fullyPaidSales: fullyPaid,
        partiallyPaidSales: partiallyPaid,
        pendingSales: pending,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [isLoading, isAuthenticated]);

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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <UserHeader />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                📊 Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back, {user?.name}! Here's your business overview</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="ml-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition text-base flex items-center gap-2"
              disabled={dataLoading}
              title="Refresh dashboard data"
            >
              <span className="text-lg">🔄</span> Refresh
            </button>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Financial Metrics - ADMIN ONLY */}
          {user?.role === 'admin' && (
            <>
              {/* Total Revenue Card */}
              <div className="bg-linear-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-green-700 text-sm font-semibold mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-green-900">
                      Rs. {dataLoading ? '...' : (dashboardData?.totalRevenue || 0).toFixed(2)}
                    </h3>
                  </div>
                  <span className="text-4xl">💵</span>
                </div>
                <p className="text-xs text-green-700">From all sales transactions</p>
              </div>

              {/* Total Paid Card */}
              <div className="bg-linear-to-br from-blue-50 to-cyan-100 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-blue-700 text-sm font-semibold mb-1">Amount Received</p>
                    <h3 className="text-3xl font-bold text-blue-900">
                      Rs. {dataLoading ? '...' : (dashboardData?.totalPaid || 0).toFixed(2)}
                    </h3>
                  </div>
                  <span className="text-4xl">✅</span>
                </div>
                <p className="text-xs text-blue-700">Fully & partially paid</p>
              </div>

              {/* Total Due Card */}
              <div className="bg-linear-to-br from-orange-50 to-amber-100 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-orange-700 text-sm font-semibold mb-1">Outstanding Due</p>
                    <h3 className="text-3xl font-bold text-orange-900">
                      Rs. {dataLoading ? '...' : (dashboardData?.totalDue || 0).toFixed(2)}
                    </h3>
                  </div>
                  <span className="text-4xl">⏳</span>
                </div>
                <p className="text-xs text-orange-700">Pending payments</p>
              </div>

              {/* Inventory Value Card */}
              <div className="bg-linear-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-purple-700 text-sm font-semibold mb-1">Inventory Value</p>
                <h3 className="text-3xl font-bold text-purple-900">
                  Rs. {dataLoading ? '...' : (dashboardData?.totalInventoryValue || 0).toFixed(2)}
                </h3>
              </div>
              <span className="text-4xl">📦</span>
            </div>
            <p className="text-xs text-purple-700">Total stock value</p>
          </div>
            </>
          )}
        </div>

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Customers Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-2 border-indigo-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-700 font-semibold">Total Customers</h4>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600 mb-2">
              {dataLoading ? '...' : dashboardData?.customerCount || 0}
            </p>
            <p className="text-xs text-gray-500">Active & Direct Sales Customers</p>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-2 border-green-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-700 font-semibold">Total Products</h4>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {dataLoading ? '...' : dashboardData?.totalProducts || 0}
            </p>
            <p className="text-xs text-gray-500">In your catalog</p>
          </div>

          {/* Low Stock Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-2 border-red-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-700 font-semibold">Low Stock Items</h4>
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {dataLoading ? '...' : dashboardData?.lowStockProducts || 0}
            </p>
            <p className="text-xs text-gray-500">Need attention</p>
          </div>

          {/* Total Sales Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-2 border-blue-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-700 font-semibold">Total Sales</h4>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {dataLoading ? '...' : dashboardData?.totalSales || 0}
            </p>
            <p className="text-xs text-gray-500">Transactions completed</p>
          </div>

          {/* Competitor Stats Card - Admin Only */}
          {user?.role === 'admin' && <CompetitorStats />}
        </div>

        {/* Payment Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Fully Paid */}
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✅</span>
              <h4 className="text-lg font-bold text-green-900">Fully Paid</h4>
            </div>
            <p className="text-4xl font-bold text-green-700 mb-1">
              {dataLoading ? '...' : dashboardData?.fullyPaidSales || 0}
            </p>
            <p className="text-sm text-green-700">Orders received in full</p>
          </div>

          {/* Partially Paid */}
          <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl shadow-md p-6 border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⏳</span>
              <h4 className="text-lg font-bold text-amber-900">Partially Paid</h4>
            </div>
            <p className="text-4xl font-bold text-amber-700 mb-1">
              {dataLoading ? '...' : dashboardData?.partiallyPaidSales || 0}
            </p>
            <p className="text-sm text-amber-700">Awaiting remaining payment</p>
          </div>

          {/* Pending */}
          <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔔</span>
              <h4 className="text-lg font-bold text-red-900">Pending Payment</h4>
            </div>
            <p className="text-4xl font-bold text-red-700 mb-1">
              {dataLoading ? '...' : dashboardData?.pendingSales || 0}
            </p>
            <p className="text-sm text-red-700">Awaiting payment</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Analytics & Insights</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
              {chartData.revenue && chartData.revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs. ${Number(value).toFixed(0)}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-75 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                  <p>No revenue data available</p>
                </div>
              )}
            </div>

            {/* Payment Status Pie Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Distribution</h3>
              {chartData.paymentStatus && chartData.paymentStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.paymentStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.paymentStatus.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-75 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                  <p>No payment data available</p>
                </div>
              )}
            </div>

            {/* Product Tiers Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Products by Pricing Tier</h3>
              {chartData.productTiers && chartData.productTiers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.productTiers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-75 flex items-center justify-center text-gray-500 bg-gray-50 rounded">
                  <p>No product data available</p>
                </div>
              )}
            </div>

            {/* Sales Summary Bar Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Summary</h3>
              {dashboardData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Sales',
                        'Total Sales': dashboardData.totalSales,
                        'Fully Paid': dashboardData.fullyPaidSales,
                        'Partially Paid': dashboardData.partiallyPaidSales,
                        'Pending': dashboardData.pendingSales
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Fully Paid" fill="#10b981" />
                    <Bar dataKey="Partially Paid" fill="#f59e0b" />
                    <Bar dataKey="Pending" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-75 flex items-center justify-center text-gray-500">
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

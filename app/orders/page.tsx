'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface DirectSaleOrder {
  _id: string;
  employeeName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [orders, setOrders] = useState<DirectSaleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.phone) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/direct-sales/by-phone?phone=${user.phone}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.phone) {
      fetchOrders();
    }
  }, [user?.phone]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        isAuthenticated={true}
        userName={user?.name}
        userRole={user?.role}
        onLogout={handleLogout}
      />

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">📦 My Orders</h1>
          <p className="text-lg text-gray-600">View your previous direct sales orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-cyan-50 border-2 border-indigo-200 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You don't have any previous orders. Start shopping or place a new order!</p>
            <a
              href="/products-browse"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-linear-to-r from-indigo-50 to-cyan-50 border-b border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Order ID</p>
                      <p className="text-lg font-bold text-gray-900">{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Employee</p>
                      <p className="text-lg font-bold text-gray-900">{order.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus === 'pending' ? '⏳ Pending' : '✕ Failed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-semibold text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">@ ₹{item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-6 border-t-2 border-indigo-200 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-3xl font-extrabold text-indigo-600">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

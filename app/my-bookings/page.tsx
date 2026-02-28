'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BookingItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check if user is customer
  useEffect(() => {
    if (!isLoading && user && user.role !== 'customer') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Fetch customer bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching bookings from /api/bookings...');
        const response = await fetch(`/api/bookings?page=1&limit=50`, {
          method: 'GET',
          credentials: 'include', // Include cookies for JWT
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
          // API returns { bookings: [...], pagination: {...} }
          const bookingsList = data.bookings || [];
          console.log('Bookings list:', bookingsList);
          
          // Transform bookings to match our interface
          const transformedBookings = bookingsList.map((booking: any) => ({
            _id: booking._id,
            customerName: booking.userId?.name || 'N/A',
            customerEmail: booking.userId?.email || 'N/A',
            customerPhone: booking.userId?.phone || 'N/A',
            items: booking.items || [],
            totalAmount: booking.totalAmount || 0,
            status: booking.status || 'pending',
            createdAt: booking.createdAt,
            expiresAt: booking.expiresAt,
          }));
          
          console.log('Transformed bookings:', transformedBookings);
          setBookings(transformedBookings);
        } else if (response.status === 401) {
          console.log('Unauthorized - redirecting to login');
          setError('Please login to view your bookings');
          router.push('/login');
        } else {
          console.log('Error response:', data);
          setError(data.message || 'Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('An error occurred while loading bookings');
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && user?.role === 'customer') {
      fetchBookings();
    }
  }, [isLoading, user?.role, router]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-300 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-20">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-5xl font-bold text-gray-900 mb-3">My Bookings</h1>
          <p className="text-gray-600 text-base sm:text-lg">Track and manage your product bookings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-300 border-t-indigo-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6">You haven't made any product bookings yet</p>
            <button
              onClick={() => router.push('/products-browse')}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-wider"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-indigo-300 transition-all"
              >
                {/* Booking Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Booking #{booking._id.slice(-8).toUpperCase()}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Booked on {formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-indigo-600">₹{booking.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Booking Items */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Products</h4>
                  <div className="space-y-3">
                    {booking.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                          <p className="text-gray-900 font-semibold">{item.productName}</p>
                          <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-600 font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-gray-600 text-sm">₹{item.price.toLocaleString()} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 tracking-wider">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="text-gray-900 font-semibold">{booking.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="text-gray-900 font-semibold">{booking.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="text-gray-900 font-semibold">{booking.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 tracking-wider">Booking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Booked At</p>
                        <p className="text-gray-900 font-semibold">{formatDate(booking.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Expires At</p>
                        <p className="text-gray-900 font-semibold">{formatDate(booking.expiresAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className={`font-semibold capitalize ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'pending' ? 'text-yellow-600' : booking.status === 'completed' ? 'text-blue-600' : 'text-red-600'}`}>
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => router.push(`/products-browse`)}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all uppercase text-sm tracking-wider"
                    >
                      Continue Shopping
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => router.push(`/sales/checkout`)}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all uppercase text-sm tracking-wider"
                    >
                      Proceed to Checkout
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/products-browse')}
                    className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all uppercase text-sm tracking-wider"
                  >
                    Browse More
                  </button>
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

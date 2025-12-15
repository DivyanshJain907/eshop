'use client';

import { useEffect, useState } from 'react';
import { fetchBookings, cancelBooking } from '@/lib/api';

interface BookingItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Booking {
  _id: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  userId?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const data = await fetchBookings();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancelling(bookingId);
    const success = await cancelBooking(bookingId);

    if (success) {
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    }
    setCancelling(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'confirmed':
        return '📦';
      case 'cancelled':
        return '✕';
      default:
        return '⏳';
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bookings Yet</h2>
          <p className="text-gray-600">You haven't made any bookings yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Booking Header */}
            <div
              className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() =>
                setExpandedId(expandedId === booking._id ? null : booking._id)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">
                      Booking #{booking._id.toString().slice(-8).toUpperCase()}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)} {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.items.length} item{booking.items.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">
                    ₹{booking.totalAmount.toFixed(2)}
                  </p>
                  {booking.status === 'pending' && (
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      ⏰ {getTimeRemaining(booking.expiresAt)}
                    </p>
                  )}
                </div>

                <span className="ml-4 text-gray-400">
                  {expandedId === booking._id ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Booking Details */}
            {expandedId === booking._id && (
              <div className="border-t border-gray-200 p-4 bg-white space-y-4">
                {/* Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Items</h4>
                  <div className="space-y-2">
                    {booking.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-medium">
                      {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                      {new Date(booking.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires At:</span>
                      <span className="font-medium text-orange-600">
                        {new Date(booking.expiresAt).toLocaleDateString()} at{' '}
                        {new Date(booking.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Timeline */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Status Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Booking Created</span>
                    </div>
                    {['confirmed', 'completed'].includes(booking.status) && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Confirmed by Store</span>
                      </div>
                    )}
                    {booking.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Purchase Completed</span>
                      </div>
                    )}
                    {booking.status === 'cancelled' && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">✕</span>
                        <span>Booking Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancelling === booking._id}
                      className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {cancelling === booking._id ? 'Cancelling...' : '✕ Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

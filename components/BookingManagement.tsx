'use client';

import { useEffect, useState } from 'react';
import { fetchBookings, updateBookingStatus } from '@/lib/api';

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
  userId: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const data = await fetchBookings();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId);
    const updated = await updateBookingStatus(bookingId, newStatus);

    if (updated) {
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus as any } : b
        )
      );
    }
    setUpdating(null);
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

  const filteredBookings =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt).getTime() < new Date().getTime();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Booking Management</h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Booking Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className={`border-2 rounded-lg overflow-hidden ${
                isExpired(booking.expiresAt) && booking.status === 'pending'
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
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
                        #{booking._id.toString().slice(-8).toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      {isExpired(booking.expiresAt) && booking.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          ⚠ Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {booking.userId.name} | {booking.userId.email}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      ₹{booking.totalAmount.toFixed(2)}
                    </p>
                    {booking.status === 'pending' && (
                      <p className={`text-xs font-medium mt-1 ${isExpired(booking.expiresAt) ? 'text-red-600' : 'text-orange-600'}`}>
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
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">👤 Customer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                      <p><span className="font-medium">Name:</span> {booking.userId.name}</p>
                      <p><span className="font-medium">Email:</span> {booking.userId.email}</p>
                      <p><span className="font-medium">Phone:</span> {booking.userId.phone}</p>
                      <p><span className="font-medium">Address:</span> {booking.userId.street}, {booking.userId.city}, {booking.userId.state} {booking.userId.pincode}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">📦 Items ({booking.items.length})</h4>
                    <div className="space-y-2">
                      {booking.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-gray-600 text-xs">₹{item.price}/unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Timeline */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">📅 Timeline</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                      <p><span className="font-medium">Booked:</span> {new Date(booking.createdAt).toLocaleString()}</p>
                      {booking.status === 'pending' && (
                        <p><span className="font-medium">Expires:</span> {new Date(booking.expiresAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">🎯 Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(booking._id, status)}
                          disabled={updating === booking._id || booking.status === status}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            booking.status === status
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                          }`}
                        >
                          {updating === booking._id ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No bookings found with status: {filter}</p>
        </div>
      )}
    </div>
  );
}

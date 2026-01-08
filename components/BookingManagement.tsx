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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Title Section */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text mb-2">
          ✨ Active Bookings
        </h2>
        <p className="text-amber-100/70">Manage and track your premium reservations</p>
      </div>

      {/* Filter Buttons - Luxury Style */}
      <div className="mb-8 flex flex-wrap gap-3">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
              filter === status
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-lg shadow-amber-400/50 scale-105'
                : 'bg-slate-700/50 text-amber-100 hover:bg-slate-700 border border-amber-500/20 hover:border-amber-500/50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Booking Count */}
      <div className="mb-6 text-sm text-amber-200/80">
        Showing <span className="font-bold text-amber-300">{filteredBookings.length}</span> of <span className="font-bold text-amber-300">{bookings.length}</span> bookings
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                isExpired(booking.expiresAt) && booking.status === 'pending'
                  ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
                  : 'border-amber-500/30 bg-slate-700/30 hover:bg-slate-700/50'
              } backdrop-blur-sm hover:shadow-xl hover:shadow-amber-500/20`}
            >
              {/* Booking Header */}
              <div
                className="p-6 cursor-pointer transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === booking._id ? null : booking._id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="font-black text-lg text-amber-300">
                        #{booking._id.toString().slice(-8).toUpperCase()}
                      </h3>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        booking.status === 'completed' ? 'bg-green-500/30 text-green-300 border border-green-500/50' :
                        booking.status === 'confirmed' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' :
                        booking.status === 'cancelled' ? 'bg-red-500/30 text-red-300 border border-red-500/50' :
                        'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      {isExpired(booking.expiresAt) && booking.status === 'pending' && (
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-500/40 text-red-200 border border-red-500/60">
                          ⚠ EXPIRED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-amber-100/70 mt-2">
                      <span className="font-semibold text-amber-200">👤 {booking.userId.name}</span> • {booking.userId.email}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
                      ₹{booking.totalAmount.toFixed(2)}
                    </p>
                    {booking.status === 'pending' && (
                      <p className={`text-xs font-bold mt-2 ${isExpired(booking.expiresAt) ? 'text-red-400' : 'text-amber-400'}`}>
                        ⏰ {getTimeRemaining(booking.expiresAt)}
                      </p>
                    )}
                  </div>

                  <span className="ml-6 text-amber-400 text-xl">
                    {expandedId === booking._id ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              {expandedId === booking._id && (
                <div className="border-t border-amber-500/20 p-6 bg-slate-800/50 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-bold text-amber-300 mb-4 text-lg flex items-center gap-2">
                      <span>👤</span> Customer Information
                    </h4>
                    <div className="bg-slate-700/50 rounded-xl p-4 text-sm space-y-2 border border-amber-500/10">
                      <p className="text-amber-100"><span className="font-semibold text-amber-300">Name:</span> {booking.userId.name}</p>
                      <p className="text-amber-100"><span className="font-semibold text-amber-300">Email:</span> {booking.userId.email}</p>
                      <p className="text-amber-100"><span className="font-semibold text-amber-300">Phone:</span> {booking.userId.phone}</p>
                      <p className="text-amber-100"><span className="font-semibold text-amber-300">Address:</span> {booking.userId.street}, {booking.userId.city}, {booking.userId.state} {booking.userId.pincode}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="font-bold text-amber-300 mb-4 text-lg flex items-center gap-2">
                      <span>📦</span> Items ({booking.items.length})
                    </h4>
                    <div className="space-y-3">
                      {booking.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-700/50 p-4 rounded-xl text-sm border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                          <div>
                            <p className="font-semibold text-amber-200">{item.productName}</p>
                            <p className="text-amber-100/60">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-300">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-amber-100/60 text-xs">₹{item.price}/unit</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Timeline */}
                  <div>
                    <h4 className="font-bold text-amber-300 mb-4 text-lg flex items-center gap-2">
                      <span>📅</span> Timeline
                    </h4>
                    <div className="bg-slate-700/50 rounded-xl p-4 text-sm space-y-2 border border-amber-500/10">
                      <p className="text-amber-100"><span className="font-semibold text-amber-300">Booked:</span> {new Date(booking.createdAt).toLocaleString()}</p>
                      {booking.status === 'pending' && (
                        <p className="text-amber-100"><span className="font-semibold text-amber-300">Expires:</span> {new Date(booking.expiresAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div>
                    <h4 className="font-bold text-amber-300 mb-4 text-lg flex items-center gap-2">
                      <span>🎯</span> Update Status
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(booking._id, status)}
                          disabled={updating === booking._id || booking.status === status}
                          className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                            booking.status === status
                              ? 'bg-slate-600 text-amber-100/50 cursor-not-allowed border border-amber-500/20'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:shadow-lg hover:shadow-amber-500/50 hover:scale-105 disabled:opacity-50'
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
        <div className="text-center py-16 bg-slate-700/30 rounded-2xl border border-amber-500/10">
          <p className="text-xl text-amber-100/70">No bookings found with status: <span className="font-bold text-amber-300">{filter}</span></p>
        </div>
      )}
    </div>
  );
}

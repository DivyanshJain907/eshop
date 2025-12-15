'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { createBooking } from '@/lib/api';

interface BookingModalProps {
  cartItems: (Product & { cartQuantity: number })[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({
  cartItems,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  const handleBooking = async () => {
    if (cartItems.length === 0) {
      setMessage('Cart is empty');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const items = cartItems.map((item) => ({
        productId: item._id || item.id,
        productName: item.name,
        quantity: item.cartQuantity,
        price: item.price,
      }));

      console.log('📋 Preparing booking...');
      console.log('Cart items count:', cartItems.length);
      console.log('Items to book:', items);

      const booking = await createBooking(items, totalAmount);

      if (booking) {
        setMessage('✓ Booking confirmed! Please visit the shop within 24 hours.');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 2000);
      } else {
        setMessage('Failed to create booking. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Error creating booking';
      console.error('❌ Booking failed:', errorMessage);
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Book Your Order</h2>
          <p className="text-indigo-100 mt-1">24-hour booking reservation</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Items Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × {item.cartQuantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ₹{(item.price * item.cartQuantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3 pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-indigo-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">📋 Booking Details:</h4>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>✓ Booking valid for 24 hours</li>
              <li>✓ Visit our shop to complete purchase</li>
              <li>✓ Items will be reserved for you</li>
              <li>✓ No payment required at booking</li>
            </ul>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.includes('✓')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBooking}
            disabled={loading || cartItems.length === 0}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

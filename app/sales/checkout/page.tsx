'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const [customerDetails, setCustomerDetails] = useState({ name: '', mobileNumber: '', shopName: '' });
  const [amountPaid, setAmountPaid] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'employee' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Get cart data from localStorage
    const savedCart = localStorage.getItem('directSalesCart');
    const savedTotal = localStorage.getItem('directSalesTotal');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    if (savedTotal) {
      setCartTotal(parseFloat(savedTotal));
    }
  }, []);

  const handleCompleteSale = async () => {
    if (!customerDetails.name.trim() || !customerDetails.mobileNumber.trim()) {
      setError('Please enter customer name and mobile number');
      return;
    }

    if (customerDetails.mobileNumber.length !== 10 || !/^\d{10}$/.test(customerDetails.mobileNumber)) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    const paid = amountPaid ? parseFloat(amountPaid.toString()) : 0;
    if (isNaN(paid) || paid < 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (paid > cartTotal) {
      setError('Amount paid cannot be more than total amount');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/direct-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id || item.id,
            productName: item.name,
            quantity: item.cartQuantity,
            price: item.price,
            customDiscount: item.customDiscount || 0,
          })),
          totalAmount: cartTotal,
          amountPaid: paid,
          paymentMethod,
          customerName: customerDetails.name,
          customerMobile: customerDetails.mobileNumber,
          shopName: customerDetails.shopName,
          employeeName: user?.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process sale');
      }

      const saleData = await response.json();

      // Save bill data and redirect
      localStorage.setItem('billData', JSON.stringify({
        saleId: saleData._id,
        customerName: customerDetails.name,
        customerMobile: customerDetails.mobileNumber,
        shopName: customerDetails.shopName,
        items: cartItems,
        totalAmount: cartTotal,
        amountPaid: paid,
        remainingAmount: cartTotal - paid,
        paymentStatus: paid === 0 ? 'pending' : paid === cartTotal ? 'fully-paid' : 'partially-paid',
        paymentMethod,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        employeeName: user?.name,
      }));

      // Clear cart
      localStorage.removeItem('directSalesCart');
      localStorage.removeItem('directSalesTotal');

      router.push('/sales/bill');
    } catch (err: any) {
      setError(err.message || 'Failed to process sale');
    } finally {
      setIsProcessing(false);
    }
  };

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
        >
          ← Back to Sales
        </button>

        {/* Header */}
        <div className="bg-indigo-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold">👤 Customer Details</h1>
          <p className="text-indigo-100 mt-2">Complete the checkout process</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-indigo-600">
              <div className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, name: e.target.value })
                    }
                    placeholder="Enter customer name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-600">*</span>
                    <span className="text-xs text-gray-500 ml-1">(10 digits only)</span>
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setCustomerDetails({ ...customerDetails, mobileNumber: value });
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    minLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {customerDetails.mobileNumber.length > 0 && customerDetails.mobileNumber.length < 10 && (
                    <p className="text-xs text-red-600 mt-2">Mobile number must be exactly 10 digits</p>
                  )}
                </div>

                {/* Shop Name (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Name <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.shopName}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, shopName: e.target.value })
                    }
                    placeholder="Enter shop name (optional)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="upi">📱 UPI</option>
                    <option value="bank-transfer">🏦 Bank Transfer</option>
                    <option value="cheque">📄 Cheque</option>
                  </select>
                </div>

                {/* Amount Paid */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount Paid <span className="text-gray-500 text-xs">(Leave empty for full payment)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-700 font-semibold">₹</span>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0"
                      min="0"
                      max={cartTotal}
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {amountPaid && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Total Amount:</span> ₹{cartTotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Amount Paid:</span> ₹{parseFloat(amountPaid.toString()).toFixed(2)}
                      </p>
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Remaining Amount:</span> ₹{(cartTotal - parseFloat(amountPaid.toString())).toFixed(2)}
                      </p>
                      {parseFloat(amountPaid.toString()) > 0 && parseFloat(amountPaid.toString()) < cartTotal && (
                        <p className="text-xs text-green-700 mt-2">✓ Partial payment recorded</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => router.back()}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-900 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteSale}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors"
                  >
                    {isProcessing ? '⏳ Processing...' : '✓ Complete Sale'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Order Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={item._id || item.id} className="text-sm bg-gray-50 p-2 rounded">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-600">Qty: {item.cartQuantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between font-bold text-lg text-green-600">
                  <span>Total:</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

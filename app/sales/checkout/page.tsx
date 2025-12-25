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
      // Check if phone number already exists in database
      const checkResponse = await fetch(`/api/customers/check-mobile?mobileNumber=${customerDetails.mobileNumber}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (checkResponse.ok) {
        const data = await checkResponse.json();
        console.log('Mobile check response:', data);
        
        // Check if any customer with this phone number exists
        if (data.exists === true && data.customer) {
          console.log('Customer exists:', data.customer);
          // Check if the name matches
          if (data.customer.name.toLowerCase().trim() !== customerDetails.name.toLowerCase().trim()) {
            const errorMsg = `This mobile number is already registered with name "${data.customer.name}". Please use a different number or use the registered name.`;
            console.log('Name mismatch error:', errorMsg);
            setError(errorMsg);
            setIsProcessing(false);
            return;
          }
        }
      } else {
        console.error('Mobile check failed:', checkResponse.status);
        throw new Error('Failed to verify mobile number');
      }

      // Proceed with the sale
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 px-5 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold transition-colors text-base shadow-md"
        >
          ← Back to Sales
        </button>

        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-emerald-700 rounded-2xl shadow-2xl p-8 text-white mb-8 border-b-4 border-emerald-800">
          <h1 className="text-4xl font-bold drop-shadow-lg">👤 Customer Details</h1>
          <p className="text-green-50 mt-3 text-lg drop-shadow">Complete the checkout and finalize your sale</p>
        </div>

        {error && (
          <div className="mb-6 p-5 bg-red-100 border-l-4 border-red-600 rounded-lg text-red-800 shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="font-bold">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-600">
              <div className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    👤 Customer Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, name: e.target.value })
                    }
                    placeholder="Enter customer name"
                    className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base text-black"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    📱 Mobile Number <span className="text-red-600">*</span>
                    <span className="text-xs text-gray-600 ml-2 font-normal">(10 digits)</span>
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
                    className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base text-black"
                  />
                  {customerDetails.mobileNumber.length > 0 && customerDetails.mobileNumber.length < 10 && (
                    <p className="text-sm text-red-600 mt-2 font-semibold">⚠️ Must be exactly 10 digits</p>
                  )}
                </div>

                {/* Shop Name (Optional) */}
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    🏪 Shop Name <span className="text-gray-600 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerDetails.shopName}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, shopName: e.target.value })
                    }
                    placeholder="Enter shop name (optional)"
                    className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base text-black"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    💳 Payment Method <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base font-medium text-black"
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
                  <label className="block text-base font-bold text-gray-800 mb-3">
                    💰 Amount Paid
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-4 text-black font-bold text-lg">₹</span>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0"
                      min="0"
                      max={cartTotal}
                      step="0.01"
                      className="w-full pl-10 pr-32 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base font-semibold text-black"
                    />
                    <button
                      type="button"
                      onClick={() => setAmountPaid(cartTotal)}
                      className="absolute right-3 top-2.5 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded-lg text-sm shadow transition"
                    >
                      Full Payment
                    </button>
                  </div>
                  {amountPaid && (
                    <div className="mt-4 p-4 bg-linear-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
                      <p className="text-base text-blue-900 font-bold mb-2">
                        💵 Total Amount: <span className="text-blue-700">₹{cartTotal.toFixed(2)}</span>
                      </p>
                      <p className="text-base text-green-900 font-bold mb-2">
                        ✓ Amount Paid: <span className="text-green-700">₹{parseFloat(amountPaid.toString()).toFixed(2)}</span>
                      </p>
                      <p className="text-base text-orange-900 font-bold">
                        ⏳ Remaining Amount: <span className="text-orange-700">₹{(cartTotal - parseFloat(amountPaid.toString())).toFixed(2)}</span>
                      </p>
                      {parseFloat(amountPaid.toString()) > 0 && parseFloat(amountPaid.toString()) < cartTotal && (
                        <p className="text-sm text-green-700 mt-3 font-bold">✓ Partial payment recorded</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => router.back()}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-4 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-900 rounded-lg font-bold transition-colors text-base shadow-md"
                  >
                    ← Cancel
                  </button>
                  <button
                    onClick={handleCompleteSale}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-4 bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors text-base shadow-lg"
                  >
                    {isProcessing ? '⏳ Processing...' : '✓ Complete Sale'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-5">📦 Order Summary</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto mb-6 bg-linear-to-b from-gray-50 to-gray-100 p-4 rounded-lg">
                {cartItems.map((item) => {
                  const basePrice = item.price * item.cartQuantity;
                  const discountPercentage = item.customDiscount || 0;
                  const discountAmount = basePrice * (discountPercentage / 100);
                  const finalPrice = basePrice - discountAmount;
                  
                  return (
                    <div key={item._id || item.id} className="text-sm bg-white p-3 rounded-lg border-l-4 border-green-500 shadow-sm">
                      <p className="font-bold text-gray-900 text-base">{item.name}</p>
                      <p className="text-gray-700 font-semibold text-sm">📦 Qty: <span className="text-green-600">{item.cartQuantity}</span></p>
                      <p className="text-gray-700 font-semibold text-sm">💰 Price: <span className="text-blue-600">₹{basePrice.toFixed(2)}</span></p>
                      {discountPercentage > 0 && (
                        <>
                          <p className="text-gray-700 font-semibold text-sm">🏷️ Discount: <span className="text-red-600">{discountPercentage.toFixed(1)}% (-₹{discountAmount.toFixed(2)})</span></p>
                          <p className="text-gray-900 font-bold text-sm border-t border-gray-300 pt-2 mt-2">💚 Final: <span className="text-emerald-600">₹{finalPrice.toFixed(2)}</span></p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="border-t-4 border-gray-300 pt-5 bg-linear-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex justify-between font-bold text-2xl text-green-700">
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

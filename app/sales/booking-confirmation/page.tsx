'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface CartItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  cartQuantity: number;
  image?: string;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [deliveryTime, setDeliveryTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 24, minutes: 0, seconds: 0 });

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          setCartItems(items);
          const totalAmount = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.cartQuantity), 0);
          setTotal(totalAmount);
        } catch (error) {
          console.error('Error loading cart:', error);
          router.push('/products-browse');
        }
      } else {
        router.push('/products-browse');
      }
    }
  }, [router]);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Timer countdown effect
  useEffect(() => {
    if (!orderPlaced || !deliveryTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = deliveryTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderPlaced, deliveryTime]);

  const handlePlaceOrder = async () => {
    if (!user?.phone) {
      setError('Phone number not found in your profile');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError('Cart is empty. Please add items before placing an order.');
      return;
    }

    if (total <= 0) {
      setError('Invalid order total');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create a Sale record for the customer
      const requestBody = {
        items: cartItems.map((item) => ({
          productId: item._id || item.id,
          productName: item.name,
          quantity: item.cartQuantity,
          price: item.price,
        })),
        totalAmount: total,
        customerName: user.name,
        customerPhone: user.phone,
      };

      console.log('� Cart Items:', cartItems);
      console.log('💰 Total:', total);
      console.log('📤 Sending order request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to place order');
      }

      const saleData = responseData;
      setOrderId(saleData._id || saleData.id);
      
      // Set delivery time to 24 hours from now
      const deliveryDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setDeliveryTime(deliveryDateTime);
      setOrderPlaced(true);

      // Create booking record for customer
      console.log('📅 Creating booking for customer...');
      const bookingData = {
        items: cartItems.map((item) => ({
          productId: item._id || item.id,
          productName: item.name,
          quantity: item.cartQuantity,
          price: item.price,
        })),
        totalAmount: total,
      };

      try {
        const bookingResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(bookingData),
        });

        const bookingResponseData = await bookingResponse.json();
        console.log('📅 Booking response:', bookingResponseData);

        if (!bookingResponse.ok) {
          console.warn('⚠️ Booking creation failed, but sale was created:', bookingResponseData);
        } else {
          console.log('✅ Booking created successfully:', bookingResponseData.booking?.id);
        }
      } catch (bookingError) {
        console.warn('⚠️ Error creating booking:', bookingError);
        // Don't throw - the sale was already created successfully
      }

      // Save order confirmation data
      localStorage.setItem('orderConfirmation', JSON.stringify({
        orderId: saleData._id,
        customerName: user.name,
        customerPhone: user.phone,
        items: cartItems,
        totalAmount: total,
        deliveryTime: deliveryDateTime.toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      }));

      // Clear cart
      localStorage.removeItem('cart');

      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/orders');
      }, 3000);
    } catch (err: any) {
      console.error('❌ Order placement error:', err);
      setError(err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-indigo-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Success state
  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Navbar isAuthenticated={isAuthenticated} userName={user?.name} userRole={user?.role} cartCount={cartItems.length} />
        
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border-t-4 border-green-500">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-2">Your order has been successfully placed</p>
            <p className="text-sm text-indigo-600 font-semibold mb-6">Order ID: {orderId}</p>
            
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm mb-2">
                <span className="font-bold">Total Amount:</span> <span className="text-indigo-600 font-bold text-lg">₹{total.toFixed(2)}</span>
              </p>
              <p className="text-gray-600 text-xs">
                Items: {cartItems.reduce((sum, item) => sum + item.cartQuantity, 0)}
              </p>
            </div>

            {/* 24 Hour Delivery Timer */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-3 border-orange-300 rounded-xl p-6 mb-6">
              <p className="text-orange-900 font-bold text-sm mb-3">⏰ Order will be ready for collection in:</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <div className="text-3xl font-extrabold text-orange-600">{String(timeRemaining.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 font-semibold mt-1">Hours</div>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <div className="text-3xl font-extrabold text-orange-600">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 font-semibold mt-1">Minutes</div>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <div className="text-3xl font-extrabold text-orange-600">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600 font-semibold mt-1">Seconds</div>
                </div>
              </div>
              <p className="text-orange-900 text-xs">
                📅 {deliveryTime?.toLocaleDateString()} at {deliveryTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-blue-900 font-semibold text-sm mb-2">📱 Contact Details</p>
              <p className="text-blue-800 text-xs">
                Please contact the shop or visit at: <span className="font-bold">{user?.phone}</span>
              </p>
            </div>

            <p className="text-gray-600 mb-6 text-xs font-medium">
              Redirecting to your orders page...
            </p>

            <button
              onClick={() => router.push('/orders')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Checkout form
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} userRole={user?.role} cartCount={cartItems.length} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center mb-2">
            <span className="text-4xl mr-3">🛒</span>
            <h1 className="text-4xl font-extrabold">Order Confirmation</h1>
          </div>
          <p className="text-indigo-100 text-lg mt-2">Review and confirm your order</p>
        </div>

        {error && (
          <div className="mb-6 p-5 bg-red-100 border-l-4 border-red-600 rounded-lg text-red-800 shadow-md">
            <div className="flex items-start">
              <span className="text-3xl mr-3">⚠️</span>
              <div>
                <p className="font-bold text-lg">{error}</p>
                <p className="text-sm text-red-700 mt-2 font-semibold">
                  🔧 Troubleshooting:
                </p>
                <ul className="text-xs text-red-700 mt-1 ml-4 list-disc">
                  <li>Check browser console (Press F12 → Console tab)</li>
                  <li>Ensure you've added items to your cart</li>
                  <li>Check your internet connection</li>
                  <li>Try refreshing and adding items again</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-indigo-600 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-2">📦</span>
                Order Items
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="flex items-center justify-between border-b border-gray-200 pb-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {item.cartQuantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600 text-lg">
                        ₹{(item.price * item.cartQuantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-2">⏰</span>
                Delivery Information
              </h2>

              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <p className="text-green-900 font-bold text-sm mb-2">📦 Collection Ready In</p>
                  <p className="text-green-800 font-semibold text-lg">24 Hours</p>
                  <p className="text-green-700 text-xs mt-2">Your order will be ready for pickup within 24 hours from confirmation</p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <p className="text-blue-900 font-bold text-sm mb-2">📱 Contact Shop</p>
                  <p className="text-blue-800 font-semibold">{user?.phone}</p>
                  <p className="text-blue-700 text-xs mt-2">Call or visit the shop to collect your order within 24 hours</p>
                </div>

                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <p className="text-orange-900 font-bold text-sm mb-2">⚠️ Important</p>
                  <p className="text-orange-800 text-xs">Please collect your order within 24 hours. Uncollected orders may be subject to store policies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Total & Customer Info */}
          <div>
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-cyan-600 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">👤</span>
                Customer Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Name</p>
                  <p className="text-gray-900 font-bold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Phone</p>
                  <p className="text-gray-900 font-bold">{user?.phone}</p>
                </div>
                {user?.shopName && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Shop Name</p>
                    <p className="text-gray-900 font-bold">{user.shopName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-linear-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-cyan-400">
              <h3 className="text-lg font-bold mb-4">Order Total</h3>
              <div className="space-y-2 mb-4 pb-4 border-b border-indigo-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold">Free</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-3xl font-extrabold">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    ✓ Place Order
                  </>
                )}
              </button>
              {error && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all"
                >
                  🔄 Retry Order
                </button>
              )}
              <button
                onClick={() => router.push('/products-browse')}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl font-bold text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 transition-all"
              >
                ← Back to Shopping
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

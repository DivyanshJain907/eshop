'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductBrowser from '@/components/ProductBrowser';
import CartManager from '@/components/CartManager';
import BookingModal from '@/components/BookingModal';
import BookingHistory from '@/components/BookingHistory';
import Footer from '@/components/Footer';
import { Product } from '@/lib/types';

export default function CustomerHome() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [cartItems, setCartItems] = useState<(Product & { cartQuantity: number })[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'bookings'>('browse');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRefresh, setBookingRefresh] = useState(0);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => (item._id || item.id) === (product._id || product.id)
      );

      if (existingItem) {
        return prevItems.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [...prevItems, { ...product, cartQuantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => (item._id || item.id) !== productId)
    );
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        (item._id || item.id) === productId
          ? { ...item, cartQuantity: quantity }
          : item
      )
    );
  };

  const handleBookingSuccess = () => {
    setCartItems([]);
    setBookingRefresh((prev) => prev + 1);
    setActiveTab('bookings');
  };

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

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar isAuthenticated={true} userName={user?.name} userRole={user?.role} />

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'browse'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🛍️ Browse Products
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors relative ${
                activeTab === 'cart'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🛒 Shopping Cart
              {cartItems.length > 0 && (
                <span className="absolute top-2 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === 'bookings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 My Bookings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <div id="browse">
            <ProductBrowser onAddToCart={handleAddToCart} />
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="space-y-4">
            <CartManager
              cartItems={cartItems}
              onRemove={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateCartQuantity}
            />
            {cartItems.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                >
                  📋 Book This Order (24hr Lock)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <BookingHistory key={bookingRefresh} />
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        cartItems={cartItems}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Footer */}
      <Footer onTabChange={setActiveTab} />
    </div>
  );
}

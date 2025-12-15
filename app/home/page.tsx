'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';
import ProductBrowser from '@/components/ProductBrowser';
import CartManager from '@/components/CartManager';
import BookingModal from '@/components/BookingModal';
import BookingHistory from '@/components/BookingHistory';
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
      <UserHeader />

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
      <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Jain Sales Corporation</h3>
              <p className="text-sm text-gray-400">
                Your trusted online shopping destination for quality products and excellent customer service.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/home" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><a href="#" onClick={() => setActiveTab('browse')} className="text-gray-400 hover:text-white transition-colors">Shop</a></li>
                <li><a href="#" onClick={() => setActiveTab('bookings')} className="text-gray-400 hover:text-white transition-colors">My Orders</a></li>
                <li><a href="#" onClick={() => setActiveTab('cart')} className="text-gray-400 hover:text-white transition-colors">Cart</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/support/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/support/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/support/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/support/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 jainsalescorporationrudrapur@google.com</li>
                <li>📞 774-483-5784</li>
                <li>📍 Preet-Vihar colony, Rudrapur, Uttarakhand</li>
                <li>🕐 24/7 Customer Support</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                © 2026 Jain Sales Corporation. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

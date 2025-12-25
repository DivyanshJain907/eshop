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
        // Item already exists, increase quantity
        const updatedCart = prevItems.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
        // Switch to cart tab after a brief delay to show the update
        setTimeout(() => setActiveTab('cart'), 300);
        return updatedCart;
      }

      // New item added
      setTimeout(() => setActiveTab('cart'), 300);
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

      {/* Main Content */}
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <ProductBrowser onAddToCart={handleAddToCart} />
      </main>

      {/* Footer */}
      <Footer onTabChange={setActiveTab} />
    </div>
  );
}

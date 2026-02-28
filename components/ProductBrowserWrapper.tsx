'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProductBrowser from '@/components/ProductBrowser';
import CartManager from '@/components/CartManager';
import Footer from '@/components/Footer';
import { Product } from '@/lib/types';

export default function ProductBrowserWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [cartItems, setCartItems] = useState<(Product & { cartQuantity: number })[]>([]);
  const [activeView, setActiveView] = useState<'browse' | 'cart'>('browse');

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only show cart view if explicitly requested via URL param
      const view = searchParams.get('view');
      if (view === 'cart') {
        setActiveView('cart');
      } else {
        // Always default to browse view
        setActiveView('browse');
      }

      // Load cart with 24-hour expiration
      const cartData = localStorage.getItem('cart');
      const items = cartData ? JSON.parse(cartData) : [];
      setCartItems(items);
    }
  }, [searchParams]);

  // Save cart to localStorage with timestamp
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // No longer persisting activeView to localStorage to prevent sticky cart issue

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
        return updatedCart;
      } else {
        // New item, add to cart
        return [...prevItems, { ...product, cartQuantity: 1 }];
      }
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
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, cartQuantity: quantity }
            : item
        )
      );
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCheckout = () => {
    console.log('🛒 Current cart items:', cartItems);
    console.log('💰 Cart size:', cartItems.length);
    
    // Check if cart has items
    if (!cartItems || cartItems.length === 0) {
      alert('⚠️ Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }
    
    // Make sure cart is saved to localStorage before redirect
    localStorage.setItem('cart', JSON.stringify(cartItems));
    console.log('✅ Cart saved to localStorage');
    
    // Redirect to booking confirmation page
    router.push('/sales/booking-confirmation');
  };

  const handleContinueShopping = () => {
    // Switch back to browse view
    setActiveView('browse');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-cyan-50">
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
      <Navbar
        isAuthenticated={true}
        userName={user?.name}
        userRole={user?.role}
        cartCount={cartItems.length}
        onLogout={handleLogout}
      />

      {/* View Navigation */}
      <main className="grow w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">

        {/* View Content */}
        <div className="bg-white min-h-96">
          {activeView === 'browse' && (
            <ProductBrowser onAddToCart={handleAddToCart} />
          )}
          {activeView === 'cart' && (
            <CartManager
              cartItems={cartItems}
              onRemoveFromCart={handleRemoveFromCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onCheckout={handleCheckout}
              onContinueShopping={handleContinueShopping}
            />
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setActiveView('cart')}
          className="fixed z-40 bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center px-5 py-3 gap-2 text-lg font-semibold transition-all duration-200 hover:shadow-xl"
          aria-label="View Cart"
        >
          <span className="text-2xl">🛒</span>
          <span>Cart</span>
          <span className="ml-2 bg-white text-indigo-700 rounded-full px-2 py-0.5 text-sm font-bold shadow">
            {cartItems.length > 9 ? '9+' : cartItems.length}
          </span>
        </button>
      )}

    </div>
  );
}

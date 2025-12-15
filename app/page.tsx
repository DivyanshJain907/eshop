'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';
import InventoryStats from '@/components/InventoryStats';
import ProductTable from '@/components/ProductTable';
import SaleHistory from '@/components/SaleHistory';
import ProductBrowser from '@/components/ProductBrowser';
import CartManager from '@/components/CartManager';
import BookingModal from '@/components/BookingModal';
import BookingHistory from '@/components/BookingHistory';
import BookingManagement from '@/components/BookingManagement';
import UserManagement from '@/components/UserManagement';
import { Product } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [cartItems, setCartItems] = useState<(Product & { cartQuantity: number })[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'bookings'>('browse');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingRefresh, setBookingRefresh] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsRefresh, setProductsRefresh] = useState(0);
  const [sales, setSales] = useState<Array<{ _id?: string; productName: string; quantity: number; totalAmount: number; createdAt?: string | Date; timestamp?: string | Date }>>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect admin/employee users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && (user.role === 'admin' || user.role === 'employee')) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  // Fetch products for dashboard
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : (data.products || []));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [productsRefresh]);

  // Fetch sales for dashboard
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/sales');
        if (response.ok) {
          const data = await response.json();
          setSales(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };
    fetchSales();
  }, []);

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

  const handleProductQuantityChange = async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        // Refresh products list
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setProducts(data.products || []);
        }
      }
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
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

  if (!isAuthenticated) {
    return null;
  }

  // Check if user is Employee or Admin
  const isEmployeeOrAdmin = user?.role === 'employee' || user?.role === 'admin';

  // Show Dashboard for Employees and Admins
  if (isEmployeeOrAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your shop efficiently</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Products Card */}
            <Link href="/products" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Products</h3>
              <p className="text-gray-600 mb-4">Manage your product catalog</p>
              <button className="text-indigo-600 font-medium hover:text-indigo-700">View Products →</button>
            </Link>

            {/* Bookings Card */}
            <Link href="/bookings" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bookings</h3>
              <p className="text-gray-600 mb-4">View all customer bookings</p>
              <button className="text-indigo-600 font-medium hover:text-indigo-700">View Bookings →</button>
            </Link>

            {/* Sales Card */}
            <Link href="/sales" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sales</h3>
              <p className="text-gray-600 mb-4">Track your sales history</p>
              <button className="text-indigo-600 font-medium hover:text-indigo-700">View Sales →</button>
            </Link>
          </div>

          {/* Admin Only Card */}
          {user?.role === 'admin' && (
            <div className="grid grid-cols-1 gap-6">
              <Link href="/users" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600 mb-4">Manage system users and permissions</p>
                <button className="text-indigo-600 font-medium hover:text-indigo-700">Manage Users →</button>
              </Link>
            </div>
          )}

          {/* Quick Action Button */}
          <div className="mt-12 flex gap-4">
            <Link
              href="/products/add"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg transition shadow-lg"
            >
              ➕ Add New Product
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show Landing Page for Customers
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
              <h3 className="text-white font-bold text-lg mb-4">About eShop</h3>
              <p className="text-sm text-gray-400">
                Your trusted online shopping destination for quality products and excellent customer service.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shop</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">My Orders</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cart</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 support@eshop.com</li>
                <li>📞 1-800-ESHOP-01</li>
                <li>📍 123 Shopping St, Commerce City</li>
                <li>🕐 24/7 Customer Support</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                © 2025 eShop. All rights reserved.
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

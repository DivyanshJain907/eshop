'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Product } from '@/lib/types';

interface TrendingProduct extends Product {
  soldQuantity?: number;
  revenue?: number;
}

export default function CustomerHome() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [trendingByCategory, setTrendingByCategory] = useState<{ [key: string]: TrendingProduct[] }>({});
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'customer')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Fetch trending products
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoadingTrending(true);
        const response = await fetch('/api/trending');
        if (response.ok) {
          const data = await response.json();
          setTrendingByCategory(data.trendingByCategory || {});
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // Fetch random products
  useEffect(() => {
    const fetchRandom = async () => {
      try {
        setLoadingRandom(true);
        const response = await fetch('/api/products?limit=12');
        if (response.ok) {
          const data = await response.json();
          const products = Array.isArray(data) ? data : (data.products || []);
          // Shuffle and get random products
          const shuffled = products.sort(() => Math.random() - 0.5).slice(0, 8);
          setRandomProducts(shuffled);
        }
      } catch (error) {
        console.error('Error fetching random products:', error);
      } finally {
        setLoadingRandom(false);
      }
    };
    fetchRandom();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartData = localStorage.getItem('cart');
      const items = cartData ? JSON.parse(cartData) : [];
      setCartItems(items);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar
        isAuthenticated={true}
        userName={user?.name}
        userRole={user?.role}
        cartCount={cartItems.length}
        onLogout={handleLogout}
      />

      {/* Trending Section - Always visible at top */}
      {!loadingTrending && Object.keys(trendingByCategory).length > 0 && (
        <section className="w-full bg-linear-to-r from-indigo-50 to-cyan-50 border-b border-indigo-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                <span className="text-5xl">🔥</span> Trending Now
              </h2>
              <p className="text-lg text-gray-600">Top selling products in each category</p>
            </div>

          {/* Category Sections */}
          <div className="space-y-12">
            {Object.entries(trendingByCategory).map(([category, products]) => (
              <div key={category}>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-3 border-indigo-600">
                  {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-400 group"
                    >
                      {/* Badge */}
                      <div className="relative h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:from-indigo-100 group-hover:to-cyan-100 transition-colors">
                        <div className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {product.image || '📦'}
                        </div>
                        {product.soldQuantity && product.soldQuantity > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg">
                            ⭐ Sold {product.soldQuantity}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-700 transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-extrabold text-indigo-600">₹{product.price.toFixed(0)}</span>
                          <span className="text-xs text-gray-500">per unit</span>
                        </div>

                        {/* Stock Info */}
                        <div className="mb-3 text-xs">
                          {product.quantity > 10 ? (
                            <span className="text-green-700 font-semibold">✓ In Stock</span>
                          ) : product.quantity > 0 ? (
                            <span className="text-orange-700 font-semibold">⚠ Only {product.quantity} left</span>
                          ) : (
                            <span className="text-red-700 font-semibold">✕ Out of Stock</span>
                          )}
                        </div>

                        {/* Discounts */}
                        {(product.retailDiscount || product.discount || product.superDiscount) && (
                          <div className="mb-3 text-xs space-y-1">
                            {product.retailDiscount && (
                              <div className="text-blue-700 font-semibold">Retail: {product.retailDiscount}% off</div>
                            )}
                            {product.discount && (
                              <div className="text-green-700 font-semibold">Wholesale: {product.discount}% off</div>
                            )}
                            {product.superDiscount && (
                              <div className="text-purple-700 font-semibold">Super WS: {product.superDiscount}% off</div>
                            )}
                          </div>
                        )}

                        {/* View Product Button */}
                        <button
                          onClick={() => router.push('/products-browse')}
                          className="w-full py-2 rounded-lg font-semibold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                        >
                          👁️ View Products
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>
      )}

      {/* Random Products Section */}
      {!loadingRandom && randomProducts.length > 0 && (
        <section className="w-full bg-linear-to-r from-purple-50 to-pink-50 border-t border-purple-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
                <span className="text-5xl">✨</span> Explore More
              </h2>
              <p className="text-lg text-gray-600">Discover our latest collection of products</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {randomProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-purple-400 group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group-hover:from-purple-100 group-hover:to-pink-100 transition-colors">
                    <div className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {product.image || '📦'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-extrabold text-purple-600">₹{product.price.toFixed(0)}</span>
                      <span className="text-xs text-gray-500">per unit</span>
                    </div>

                    {/* Stock Info */}
                    <div className="mb-3 text-xs">
                      {product.quantity > 10 ? (
                        <span className="text-green-700 font-semibold">✓ In Stock</span>
                      ) : product.quantity > 0 ? (
                        <span className="text-orange-700 font-semibold">⚠ Only {product.quantity} left</span>
                      ) : (
                        <span className="text-red-700 font-semibold">✕ Out of Stock</span>
                      )}
                    </div>

                    {/* View Product Button */}
                    <button
                      onClick={() => router.push('/products-browse')}
                      className="w-full py-2 rounded-lg font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
                    >
                      👁️ View Products
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

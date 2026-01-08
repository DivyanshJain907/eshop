'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

export default function CategoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map(p => p.category || 'Uncategorized').filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);

      // Auto-select first category
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartData = localStorage.getItem('cart');
      const items = cartData ? JSON.parse(cartData) : [];
      setCartItems(items);
    }
  }, []);

  // Filter products by category and search
  useEffect(() => {
    let filtered = products.filter(p => (p.retailPrice || p.price || 0) > 0); // Exclude 0 price products

    if (selectedCategory) {
      filtered = filtered.filter(
        p => (p.category || 'Uncategorized') === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  const handleViewProduct = (productId: string) => {
    router.push(`/products/details/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-indigo-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} userRole={user?.role} cartCount={cartItems.length} />
      
      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-black">📂 Browse by Category</h1>
          <p className="text-indigo-100 text-lg mt-3">Discover our products organized by category</p>
          <div className="mt-4 flex items-center text-indigo-100 text-sm font-semibold">
            <span>📦 {products.length} total products</span>
            <span className="mx-3">•</span>
            <span>📂 {categories.length} categories</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-8">All Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const categoryCount = products.filter(
                p => (p.category || 'Uncategorized') === category
              ).length;
              const isSelected = selectedCategory === category;
              
              // Color schemes for different categories
              const colors = [
                { bg: 'from-blue-500 to-blue-600', light: 'from-blue-50 to-blue-100', icon: '👕' },
                { bg: 'from-purple-500 to-purple-600', light: 'from-purple-50 to-purple-100', icon: '👞' },
                { bg: 'from-pink-500 to-pink-600', light: 'from-pink-50 to-pink-100', icon: '🎒' },
                { bg: 'from-amber-500 to-amber-600', light: 'from-amber-50 to-amber-100', icon: '⌚' },
                { bg: 'from-green-500 to-green-600', light: 'from-green-50 to-green-100', icon: '🧢' },
                { bg: 'from-red-500 to-red-600', light: 'from-red-50 to-red-100', icon: '🎩' },
              ];
              
              const color = colors[index % colors.length];

              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchQuery('');
                  }}
                  className={`text-left rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                    isSelected ? 'ring-4 ring-indigo-500' : ''
                  }`}
                >
                  <div className={`bg-linear-to-br ${color.bg} text-white p-8 relative overflow-hidden`}>
                    {/* Decorative Background */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-2 line-clamp-2">{category}</h3>
                      <p className="text-white/80 text-sm font-semibold">{categoryCount} products</p>
                    </div>

                    {/* Badge */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-white text-indigo-600 rounded-full px-3 py-1 text-xs font-bold">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Section */}
        {selectedCategory && (
          <div>
            {/* Category Header with Search */}
            <div className="mb-8">
              <div className="mb-6">
                <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedCategory}</h2>
                <p className="text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                  {searchQuery && <span className="ml-2 text-indigo-600 font-semibold">• Filtered by "{searchQuery}"</span>}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Search in this category..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white font-medium shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product._id || product.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 cursor-pointer group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideUp 0.5s ease-out forwards',
                    }}
                    onClick={() => {
                      const id = product._id || product.id;
                      if (id) handleViewProduct(id);
                    }}
                  >
                    {/* Product Image */}
                    <div className="w-full h-56 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-6xl group-hover:scale-125 transition-transform duration-300">📦</span>
                      )}
                      
                      {/* Stock Badge */}
                      {product.quantity > 0 && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          In Stock
                        </div>
                      )}
                      {product.quantity === 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-2xl font-extrabold text-indigo-600">
                          ₹{product.price.toFixed(0)}
                        </p>
                      </div>

                      {/* Stock Info */}
                      <div className="mb-4">
                        {product.quantity > 0 ? (
                          <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold border border-green-200">
                            {product.quantity} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold border border-red-200">
                            Out of stock
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const id = product._id || product.id;
                          if (id) handleViewProduct(id);
                        }}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center ${
                          product.quantity > 0
                            ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:from-indigo-700 hover:to-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={product.quantity === 0}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No products found
                </p>
                <p className="text-gray-400 text-sm">
                  {searchQuery 
                    ? `Try adjusting your search for "${searchQuery}"`
                    : 'No products in this category yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

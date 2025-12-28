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

  // Filter products by category and search
  useEffect(() => {
    let filtered = products;

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
    <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} userRole={user?.role} />
      
      {/* Hero Section */}
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white py-16 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-2">
            <span className="text-4xl mr-3">🏷️</span>
            <h1 className="text-5xl font-extrabold">Browse by Category</h1>
          </div>
          <p className="text-indigo-100 text-lg mt-3">Discover our products organized by category</p>
          <div className="mt-4 flex items-center text-indigo-100">
            <span className="text-sm">📦 {products.length} total products</span>
            <span className="mx-3">•</span>
            <span className="text-sm">📂 {categories.length} categories</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 overflow-hidden">
                {/* Category Header */}
                <div className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-5">
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="text-2xl mr-2">📂</span>
                    Categories
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">{categories.length} available</p>
                </div>

                {/* Category List */}
                <div className="p-3 max-h-96 overflow-y-auto">
                  {categories.map((category, index) => {
                    const categoryCount = products.filter(
                      p => (p.category || 'Uncategorized') === category
                    ).length;
                    const isSelected = selectedCategory === category;
                    
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium mb-2 flex items-center justify-between group ${
                          isSelected
                            ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105 origin-left'
                            : 'bg-gray-50 text-gray-900 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className={`text-xl mr-2 transition-transform ${isSelected ? 'scale-110' : ''}`}>
                            {index % 5 === 0 ? '👕' : index % 5 === 1 ? '👞' : index % 5 === 2 ? '🎒' : index % 5 === 3 ? '⌚' : '🧢'}
                          </span>
                          {category}
                        </span>
                        <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                          isSelected 
                            ? 'bg-white/30' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {categoryCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-4">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">🔍</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white font-medium shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Category Header */}
            {selectedCategory && (
              <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                      ✨ {selectedCategory}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
                      {searchQuery && <span className="ml-2 text-indigo-600 font-medium">• Filtered by "{searchQuery}"</span>}
                    </p>
                  </div>
                  {filteredProducts.length > 0 && (
                    <div className="text-right">
                      <div className="text-4xl font-bold text-indigo-600">{filteredProducts.length}</div>
                      <div className="text-gray-600 text-sm">Items</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product._id || product.id}
                    className="bg-white rounded-2xl shadow-md border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideUp 0.5s ease-out forwards',
                    }}
                  >
                    {/* Product Image Container */}
                    <div className="w-full h-56 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative"
                      onClick={() => {
                        const id = product._id || product.id;
                        if (id) handleViewProduct(id);
                      }}>
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
                          ✓ In Stock
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
                      <h3 className="font-bold text-gray-900 truncate text-lg mb-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-2xl font-extrabold text-indigo-600">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Stock Info */}
                      <div className="mb-4 flex items-center">
                        {product.quantity > 0 ? (
                          <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold border border-green-200">
                            <span className="mr-1">📦</span>
                            {product.quantity} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold border border-red-200">
                            <span className="mr-1">❌</span>
                            Out of stock
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          const id = product._id || product.id;
                          if (id) handleViewProduct(id);
                        }}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center group ${
                          product.quantity > 0
                            ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:from-indigo-700 hover:to-purple-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={product.quantity === 0}
                      >
                        <span className="mr-2">👁️</span>
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
                    : 'Try selecting a different category'}
                </p>
              </div>
            )}
          </div>
        </div>
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

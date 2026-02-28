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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} userRole={user?.role} cartCount={cartItems.length} />
      
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Browse by Category</h1>
          <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">
            {products.length} products across {categories.length} categories
          </p>
        </div>
      </div>

      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Categories - Horizontal scroll on mobile, grid on desktop */}
        <div className="mb-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide sm:flex-wrap">
            {categories.map((category) => {
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
                  className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {category} <span className={`ml-1 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>({categoryCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        {selectedCategory && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={`Search in ${selectedCategory}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {selectedCategory && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      const id = product._id || product.id;
                      if (id) handleViewProduct(id);
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-36 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : product.image && !product.image.match(/^[\u{1F000}-\u{1FFFF}]/u) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl opacity-30">📦</span>
                      )}
                      {product.quantity === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>

                      {/* Price */}
                      <div className="mb-2">
                        {product.price > 0 && product.price > (product.retailPrice || product.price) && (
                          <div className="text-[10px] sm:text-xs text-gray-400 line-through">₹{Number(product.price).toFixed(0)}</div>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-base sm:text-lg font-bold text-gray-900">₹{Number(product.retailPrice || product.price).toFixed(0)}</span>
                          {product.price > 0 && product.price > (product.retailPrice || product.price) && (
                            <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                              {Math.round(((product.price - (product.retailPrice || product.price)) / product.price) * 100)}% off
                            </span>
                          )}
                        </div>
                        {/* Wholesale hint */}
                        {product.wholesalePrice && product.wholesalePrice > 0 && product.wholesalePrice < product.price && (
                          <div className="mt-1 text-[10px] sm:text-xs text-blue-600 font-medium">
                            Wholesale: ₹{Number(product.wholesalePrice).toFixed(0)} <span className="text-green-600">({Math.round(((product.price - product.wholesalePrice) / product.price) * 100)}% off)</span>
                          </div>
                        )}
                      </div>

                      {/* Stock - desktop only */}
                      <div className="mb-3 hidden sm:block">
                        {product.quantity > 0 ? (
                          <span className="text-xs text-green-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const id = product._id || product.id;
                          if (id) handleViewProduct(id);
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-1">No products found</p>
                <p className="text-gray-300 text-sm">
                  {searchQuery ? `Try adjusting your search` : 'No products in this category yet'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

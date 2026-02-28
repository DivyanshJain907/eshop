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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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

  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) return;
    const existing = cartItems.find((item: any) => (item._id || item.id) === (product._id || product.id));
    let updated;
    if (existing) {
      updated = cartItems.map((item: any) =>
        (item._id || item.id) === (product._id || product.id)
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      );
    } else {
      updated = [...cartItems, { ...product, cartQuantity: 1 }];
    }
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
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
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-32 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
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
                    <div className="p-2 sm:p-4">
                      <h3 className="font-semibold text-gray-900 text-[11px] sm:text-sm leading-tight line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>

                      {/* Price */}
                      <div className="mb-1.5 sm:mb-2">
                        {product.price > 0 && product.price > (product.retailPrice || product.price) && (
                          <div className="text-[10px] sm:text-xs text-gray-400 line-through">₹{Number(product.price).toFixed(0)}</div>
                        )}
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-lg font-bold text-gray-900">₹{Number(product.retailPrice || product.price).toFixed(0)}</span>
                          {product.price > 0 && product.price > (product.retailPrice || product.price) && (
                            <span className="text-[9px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1 sm:px-1.5 py-0.5 rounded">
                              {Math.round(((product.price - (product.retailPrice || product.price)) / product.price) * 100)}%
                            </span>
                          )}
                        </div>
                        {/* Wholesale hint — desktop only */}
                        {product.wholesalePrice && product.wholesalePrice > 0 && product.wholesalePrice < product.price && (
                          <div className="mt-0.5 text-[10px] sm:text-xs text-blue-600 font-medium hidden sm:block">
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

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.quantity === 0}
                        className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-sm font-semibold transition-all duration-200 ${
                          product.quantity > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {product.quantity > 0 ? 'Add to Cart' : 'Sold Out'}
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

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — product image */}
            <div className="relative shrink-0">
              <div className="w-full h-52 sm:h-64 bg-gray-100">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImageIndex(0)}
                  />
                ) : selectedProduct.image && !selectedProduct.image.match(/^[\u{1F000}-\u{1FFFF}]/u) ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImageIndex(0)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">📦</div>
                )}
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 transition-colors backdrop-blur-sm"
              >
                ✕
              </button>

              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white/80 cursor-pointer shrink-0 hover:border-white transition-colors shadow-sm"
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}

              {selectedProduct.quantity === 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 mt-1 mb-3">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedProduct.category}</span>
                {selectedProduct.modelName && (
                  <span className="text-xs text-gray-500">{selectedProduct.modelName}</span>
                )}
                {selectedProduct.quantity > 0 ? (
                  <span className="text-xs text-green-600 font-medium">In Stock</span>
                ) : (
                  <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{Number(selectedProduct.retailPrice || selectedProduct.price).toFixed(0)}
                  </span>
                  {selectedProduct.price > (selectedProduct.retailPrice || selectedProduct.price) && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{Number(selectedProduct.price).toFixed(0)}</span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        {Math.round(((selectedProduct.price - (selectedProduct.retailPrice || selectedProduct.price)) / selectedProduct.price) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {selectedProduct.description && selectedProduct.description.trim() && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{selectedProduct.description}</p>
              )}

              {/* Pricing Tiers */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pricing Tiers</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-blue-500 font-medium">Retail</p>
                    <p className="text-sm font-bold text-blue-700">₹{Number(selectedProduct.retailPrice || (selectedProduct.price * (1 - (selectedProduct.retailDiscount || 0) / 100))).toFixed(0)}</p>
                    {selectedProduct.minRetailQuantity && (
                      <p className="text-[10px] text-blue-400">{selectedProduct.minRetailQuantity}+ units</p>
                    )}
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-green-500 font-medium">Wholesale</p>
                    <p className="text-sm font-bold text-green-700">₹{Number(selectedProduct.wholesalePrice || (selectedProduct.price * (1 - (selectedProduct.discount || 0) / 100))).toFixed(0)}</p>
                    {selectedProduct.minWholesaleQuantity && (
                      <p className="text-[10px] text-green-400">{selectedProduct.minWholesaleQuantity}+ units</p>
                    )}
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-amber-500 font-medium">Super W.</p>
                    <p className="text-sm font-bold text-amber-700">₹{Number(selectedProduct.superWholesalePrice || (selectedProduct.price * (1 - (selectedProduct.superDiscount || 0) / 100))).toFixed(0)}</p>
                    {selectedProduct.minSuperWholesaleQuantity && (
                      <p className="text-[10px] text-amber-400">{selectedProduct.minSuperWholesaleQuantity}+ units</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="shrink-0 px-4 py-3 sm:px-5 border-t border-gray-100 bg-white flex gap-2">
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.quantity <= 0}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selectedProduct.quantity > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedProduct.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Fullscreen Image Popup */}
            {selectedImageIndex !== null && (
              <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-60 p-2 sm:p-4">
                <div className="relative w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30 transition-colors z-61 backdrop-blur-sm"
                  >
                    ✕
                  </button>
                  <img
                    src={selectedProduct.images?.[selectedImageIndex] || selectedProduct.image}
                    alt={`${selectedProduct.name} - Full size`}
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev === 0 ? selectedProduct.images!.length - 1 : prev! - 1));
                        }}
                        className="absolute left-2 sm:left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl transition-colors backdrop-blur-sm"
                      >
                        ❮
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev === selectedProduct.images!.length - 1 ? 0 : prev! + 1));
                        }}
                        className="absolute right-2 sm:right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-xl transition-colors backdrop-blur-sm"
                      >
                        ❯
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                        {selectedImageIndex! + 1} / {selectedProduct.images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

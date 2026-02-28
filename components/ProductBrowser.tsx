'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';

interface ProductBrowserProps {
  onAddToCart?: (product: Product) => void;
}

export default function ProductBrowser({ onAddToCart }: ProductBrowserProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const itemsPerPage = 50;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setFilteredProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (product.retailPrice || product.price || 0) > 0  // Exclude 0 price products
    );

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchQuery, products, sortBy]);

  // Update displayed products based on current page
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  const handleAddToCart = (product: Product) => {
    if (onAddToCart && product.quantity > 0) {
      onAddToCart(product);
      
      // Show success feedback
      const productId = product._id || product.id;
      setAddedProduct(productId || '');
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setAddedProduct(null);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Sort Bar — single row on all screens */}
      <div className="mb-4 flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high')}
            className="appearance-none pl-3 pr-7 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all cursor-pointer"
          >
            <option value="name">A–Z</option>
            <option value="price-low">Price ↑</option>
            <option value="price-high">Price ↓</option>
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Product count — desktop only */}
        <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline shrink-0">
          {filteredProducts.length} items
        </span>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-8">
            {displayedProducts.map((product) => (
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
                ) : product.image ? (
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
                  {/* Wholesale price hint — desktop only */}
                  {product.wholesalePrice && product.wholesalePrice > 0 && product.wholesalePrice < product.price && (
                    <div className="mt-0.5 text-[10px] sm:text-xs text-blue-600 font-medium hidden sm:block">
                      Wholesale: ₹{Number(product.wholesalePrice).toFixed(0)} <span className="text-green-600">({Math.round(((product.price - product.wholesalePrice) / product.price) * 100)}% off)</span>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-3 hidden sm:block">
                  {product.quantity > 0 ? (
                    <span className="text-xs text-green-600 font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.quantity === 0}
                  className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-sm font-semibold transition-all duration-200 ${
                    addedProduct === (product._id || product.id)
                      ? 'bg-green-500 text-white scale-[1.02]'
                      : product.quantity > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addedProduct === (product._id || product.id)
                    ? '✓ Added!'
                    : product.quantity > 0
                    ? 'Add to Cart'
                    : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>

          {/* Load More Button */}
          {displayedProducts.length < filteredProducts.length && (
            <div className="flex justify-center mt-8 pb-4">
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow transition-all hover:shadow-md active:scale-95 flex items-center gap-2"
              >
                Load More
                <span className="text-xs text-gray-400">({displayedProducts.length}/{filteredProducts.length})</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </p>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — product image with overlay info */}
            <div className="relative shrink-0">
              {/* Main Image */}
              <div className="w-full h-52 sm:h-64 bg-gray-100">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImageIndex(0)}
                  />
                ) : selectedProduct.image ? (
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

              {/* Close button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm hover:bg-black/60 transition-colors backdrop-blur-sm"
              >
                ✕
              </button>

              {/* Image thumbnails (if multiple) */}
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

              {/* Out of stock badge */}
              {selectedProduct.quantity === 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Out of Stock
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
              {/* Name + Category */}
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

              {/* Description */}
              {selectedProduct.description && selectedProduct.description.trim() && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{selectedProduct.description}</p>
              )}

              {/* Pricing Tiers — compact */}
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

            {/* Bottom Action Bar — sticky */}
            <div className="shrink-0 px-4 py-3 sm:px-5 border-t border-gray-100 bg-white flex gap-2">
              <button
                onClick={() => {
                  onAddToCart?.(selectedProduct);
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

                  {/* Main Image */}
                  <img
                    src={selectedProduct.images?.[selectedImageIndex] || selectedProduct.image}
                    alt={`${selectedProduct.name} - Full size`}
                    className="max-w-full max-h-[85vh] object-contain"
                  />

                  {/* Navigation Arrows */}
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

                      {/* Image Counter */}
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

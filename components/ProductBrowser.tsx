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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Products</h2>

      {/* Search and Filter Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Product Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {displayedProducts.length} of {filteredProducts.length} products
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {displayedProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product Image */}
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>

                {/* Price */}
                <p className="text-lg font-bold text-indigo-600 my-2">
                  ₹{product.price.toFixed(2)}
                </p>

                {/* Stock Status */}
                <div className="mb-4">
                  {product.quantity > 0 ? (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ In Stock ({product.quantity} available)
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>

                {/* Action Buttons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.quantity === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    addedProduct === (product._id || product.id)
                      ? 'bg-green-500 text-white scale-105'
                      : product.quantity > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {addedProduct === (product._id || product.id)
                    ? '✅ Added to Cart!'
                    : product.quantity > 0
                    ? '🛒 Add to Cart'
                    : 'Out of Stock'}
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
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 transform flex items-center gap-2"
              >
                📥 Load More Products ({displayedProducts.length}/{filteredProducts.length})
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-2xl text-gray-500 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Images Gallery */}
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-3 uppercase">Product Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedProduct.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image}
                          alt={`${selectedProduct.name} - Image ${index + 1}`}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedProduct.image ? (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-3 uppercase">Product Image</p>
                  <div 
                    className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImageIndex(0)}
                  >
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-gray-200 rounded-lg p-16 flex items-center justify-center text-6xl">
                  📦
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4 mb-6">
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Category</p>
                  <p className="text-lg text-gray-700">{selectedProduct.category}</p>
                </div>

                {selectedProduct.modelName && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Model</p>
                    <p className="text-lg text-gray-700 font-semibold">{selectedProduct.modelName}</p>
                  </div>
                )}

                {selectedProduct.description && selectedProduct.description.trim() ? (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Description</p>
                    <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                  </div>
                ) : null}

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Base Price</p>
                  <p className="text-3xl font-bold text-indigo-600">₹{selectedProduct.price.toFixed(2)}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Stock Status</p>
                  <p className={`text-lg font-bold ${selectedProduct.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProduct.quantity > 0 ? `✓ In Stock (${selectedProduct.quantity} available)` : '✕ Out of Stock'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-3">Discount Tiers</p>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-blue-900 font-semibold">🛍️ Retail: {selectedProduct.retailDiscount || 0}%</p>
                      {selectedProduct.minRetailQuantity && <p className="text-sm text-blue-700">Minimum: {selectedProduct.minRetailQuantity} units</p>}
                      <p className="text-sm text-blue-700 font-bold">Price: ₹{(selectedProduct.price * (1 - (selectedProduct.retailDiscount || 0) / 100)).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-green-900 font-semibold">🏪 Wholesale: {selectedProduct.discount || 0}%</p>
                      {selectedProduct.minWholesaleQuantity && <p className="text-sm text-green-700">Minimum: {selectedProduct.minWholesaleQuantity} units</p>}
                      <p className="text-sm text-green-700 font-bold">Price: ₹{(selectedProduct.price * (1 - (selectedProduct.discount || 0) / 100)).toFixed(2)}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="text-amber-900 font-semibold">⭐ Super Wholesale: {selectedProduct.superDiscount || 0}%</p>
                      {selectedProduct.minSuperWholesaleQuantity && <p className="text-sm text-amber-700">Minimum: {selectedProduct.minSuperWholesaleQuantity} units</p>}
                      <p className="text-sm text-amber-700 font-bold">Price: ₹{(selectedProduct.price * (1 - (selectedProduct.superDiscount || 0) / 100)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close and Add to Cart Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onAddToCart?.(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.quantity <= 0}
                  className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                    selectedProduct.quantity > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  🛒 Add to Cart
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Fullscreen Image Popup */}
            {selectedImageIndex !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
                <div className="relative w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-[61]"
                  >
                    ✕
                  </button>

                  {/* Main Image */}
                  <img
                    src={selectedProduct.images?.[selectedImageIndex] || selectedProduct.image}
                    alt={`${selectedProduct.name} - Full size`}
                    className="max-w-4xl max-h-[90vh] object-contain"
                  />

                  {/* Navigation Arrows */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev === 0 ? selectedProduct.images!.length - 1 : prev! - 1));
                        }}
                        className="absolute left-4 bg-white/20 hover:bg-white/40 text-white text-3xl p-3 rounded-full transition-colors"
                      >
                        ❮
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev === selectedProduct.images!.length - 1 ? 0 : prev! + 1));
                        }}
                        className="absolute right-4 bg-white/20 hover:bg-white/40 text-white text-3xl p-3 rounded-full transition-colors"
                      >
                        ❯
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
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

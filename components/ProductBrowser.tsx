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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

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
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [searchQuery, products, sortBy]);

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
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id || product.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/products/details/${product._id || product.id}`)}
            >
              {/* Product Image */}
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                {product.image ? (
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
                  onClick={() => onAddToCart && product.quantity > 0 && onAddToCart(product)}
                  disabled={product.quantity === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    product.quantity > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {product.quantity > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </p>
        </div>
      )}
    </div>
  );
}

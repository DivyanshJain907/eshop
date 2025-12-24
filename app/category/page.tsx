'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';

export default function CategoryPage() {
  const router = useRouter();
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse by Category</h1>
          <p className="text-gray-600 mt-2">Find products organized by category</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex justify-between items-center">
                      <span>{category}</span>
                      <span className="text-sm">
                        {products.filter(
                          p => (p.category || 'Uncategorized') === category
                        ).length}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products in this category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Selected Category Info */}
            {selectedCategory && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product._id || product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => {
                        const id = product._id || product.id;
                        if (id) handleViewProduct(id);
                      }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
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
                            ✓ In Stock ({product.quantity})
                          </span>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          const id = product._id || product.id;
                          if (id) handleViewProduct(id);
                        }}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">
                  No products found in this category
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

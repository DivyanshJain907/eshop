'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';
import ProductTable from '@/components/ProductTable';
import { Product } from '@/lib/types';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 50;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check if user is Employee or Admin
  useEffect(() => {
    if (!isLoading && user && user.role !== 'employee' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with server-side filtering
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        params.append('limit', itemsPerPage.toString());
        params.append('page', page.toString());
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        
        const response = await fetch(`/api/products?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const productList = Array.isArray(data) ? data : (data.products || []);
          
          if (page === 1) {
            setProducts(productList);
          } else {
            setProducts((prev) => [...prev, ...productList]);
          }
          
          // Get total count and categories only on first load
          if (page === 1) {
            setTotalProducts(data.pagination?.total || productList.length);
            if (!categories.length) {
              const response2 = await fetch('/api/products?limit=10000');
              if (response2.ok) {
                const data2 = await response2.json();
                const allProds = Array.isArray(data2) ? data2 : (data2.products || []);
                const uniqueCategories = [...new Set(allProds.map((p: any) => p.category).filter(Boolean))];
                setCategories(uniqueCategories as string[]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [refresh, debouncedSearchTerm, selectedCategory, page]);

  // Filter products by price (client-side only)
  useEffect(() => {
    let filtered = products;

    // Price filter
    if (minPrice) {
      filtered = filtered.filter((product: any) => (product.price || 0) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((product: any) => (product.price || 0) <= parseFloat(maxPrice));
    }

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice]);

  const handleProductQuantityChange = async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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

  if (!isAuthenticated || (user && user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  return (
    <UserHeader>
      <div className="flex-1 bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">View and manage all products</p>
          </div>
          <Link
            href="/products/add"
            className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm sm:text-base text-center shrink-0"
          >
            ➕ Add Product
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">🔍 Search Products</label>
              <input
                type="text"
                placeholder="Name, barcode, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">📂 Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">💰 Min Price</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium"
              />
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">💰 Max Price</label>
              <input
                type="number"
                placeholder="999999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 px-4 py-3 bg-blue-100 rounded-lg border-l-4 border-blue-600">
            <p className="text-sm font-bold text-gray-900">
              📊 Showing: <span className="font-bold text-lg text-blue-700">{filteredProducts.length}</span> / <span className="text-lg text-gray-700">{totalProducts}</span> total products
              {debouncedSearchTerm && ` (Search: "${debouncedSearchTerm}")`}
              {selectedCategory && ` (Category: "${selectedCategory}")`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {debouncedSearchTerm || selectedCategory ? 'No products match your filters' : 'No products yet'}
              </p>
              {!(debouncedSearchTerm || selectedCategory) && (
                <Link
                  href="/products/add"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Create First Product
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <ProductTable 
                  products={filteredProducts} 
                  onQuantityChange={handleProductQuantityChange}
                  onDeleteProduct={handleDeleteProduct}
                />
              </div>
              
              {/* Load More Button */}
              {filteredProducts.length < totalProducts && (
                <div className="flex justify-center p-6 border-t">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading}
                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {loading ? '⏳ Loading...' : '⬇️ Load More Products'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </UserHeader>
  );
}

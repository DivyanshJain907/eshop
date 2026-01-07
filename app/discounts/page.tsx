'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import UserHeader from '@/components/UserHeader';
import { Product } from '@/lib/types';

interface CategoryDiscount {
  category: string;
  retailDiscount: number;
  wholesaleDiscount: number;
  superWholesaleDiscount: number;
  productCount: number;
  productsWithOverrides: ProductOverride[];
}

interface ProductOverride {
  productId: string;
  productName: string;
  retailDiscount: number;
  wholesaleDiscount: number;
  superWholesaleDiscount: number;
}

export default function DiscountsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [categories, setCategories] = useState<CategoryDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    retailDiscount: 0,
    wholesaleDiscount: 0,
    superWholesaleDiscount: 0,
  });

  // Redirect if not authenticated or not admin/employee
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'employee'))) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Fetch products and extract category discount data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCategoryDiscounts();
    }
  }, [isAuthenticated, user]);

  const fetchCategoryDiscounts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/products?limit=10000', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        
        // Group products by category
        const categoryMap = new Map<string, {
          retailDiscount: number;
          wholesaleDiscount: number;
          superWholesaleDiscount: number;
          productCount: number;
          productsWithOverrides: ProductOverride[];
        }>();
        
        products.forEach((p: Product) => {
          const cat = p.category || 'Uncategorized';
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              retailDiscount: p.retailDiscount || 0,
              wholesaleDiscount: p.discount || 0,
              superWholesaleDiscount: p.superDiscount || 0,
              productCount: 0,
              productsWithOverrides: [],
            });
          }
          const existing = categoryMap.get(cat)!;
          existing.productCount++;
          
          // Check if this product has different discounts than the category default
          const catDefault = categoryMap.get(cat)!;
          if (
            (p.retailDiscount || 0) !== catDefault.retailDiscount ||
            (p.discount || 0) !== catDefault.wholesaleDiscount ||
            (p.superDiscount || 0) !== catDefault.superWholesaleDiscount
          ) {
            existing.productsWithOverrides.push({
              productId: (p._id || p.id || '').toString(),
              productName: p.name,
              retailDiscount: p.retailDiscount || 0,
              wholesaleDiscount: p.discount || 0,
              superWholesaleDiscount: p.superDiscount || 0,
            });
          }
        });
        
        const sortedCategories = Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            ...data,
          }))
          .sort((a, b) => a.category.localeCompare(b.category));
        
        setCategories(sortedCategories);
      }
    } catch (err) {
      console.error('Error fetching category discounts:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category: CategoryDiscount) => {
    setEditingCategory(category.category);
    setFormData({
      retailDiscount: category.retailDiscount,
      wholesaleDiscount: category.wholesaleDiscount,
      superWholesaleDiscount: category.superWholesaleDiscount,
    });
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    setSaving(true);
    try {
      const response = await fetch('/api/category-discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          category: editingCategory,
          retailDiscount: parseFloat(formData.retailDiscount.toString()),
          wholesaleDiscount: parseFloat(formData.wholesaleDiscount.toString()),
          superWholesaleDiscount: parseFloat(formData.superWholesaleDiscount.toString()),
        }),
      });

      if (response.ok) {
        setEditingCategory(null);
        await fetchCategoryDiscounts();
      } else {
        setError('Failed to save discounts');
      }
    } catch (err) {
      console.error('Error saving discounts:', err);
      setError('Failed to save discounts');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin">⏳</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <UserHeader />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-gray-900">💰 Discount Dashboard</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage category-wide discount strategies</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 font-semibold">
              {error}
            </div>
          )}

          {/* Summary Stats */}
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Categories</p>
                <p className="text-4xl font-black text-purple-600 mt-2">{categories.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Avg Retail Discount</p>
                <p className="text-4xl font-black text-blue-600 mt-2">
                  {(categories.reduce((sum, c) => sum + c.retailDiscount, 0) / categories.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Avg Wholesale Discount</p>
                <p className="text-4xl font-black text-green-600 mt-2">
                  {(categories.reduce((sum, c) => sum + c.wholesaleDiscount, 0) / categories.length).toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500 hover:shadow-lg transition-shadow">
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Avg Super WS Discount</p>
                <p className="text-4xl font-black text-amber-600 mt-2">
                  {(categories.reduce((sum, c) => sum + c.superWholesaleDiscount, 0) / categories.length).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin text-4xl">⏳</div>
                <p className="text-gray-600 text-lg font-semibold">Loading categories...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-xl font-semibold">No categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.category}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {editingCategory === cat.category ? (
                    // Edit Mode
                    <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 min-h-[500px]">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        ✏️ Edit: {cat.category}
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                            🛍️ Retail Discount
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.retailDiscount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  retailDiscount: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold text-blue-600 bg-white"
                            />
                            <span className="absolute right-4 top-3 text-lg font-bold text-blue-600">%</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                            🏪 Wholesale Discount
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.wholesaleDiscount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  wholesaleDiscount: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-semibold text-green-600 bg-white"
                            />
                            <span className="absolute right-4 top-3 text-lg font-bold text-green-600">%</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                            ⭐ Super Wholesale Discount
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={formData.superWholesaleDiscount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  superWholesaleDiscount: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-semibold text-amber-600 bg-white"
                            />
                            <span className="absolute right-4 top-3 text-lg font-bold text-amber-600">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-8">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors transform hover:scale-105"
                        >
                          {saving ? '⏳ Saving...' : '✅ Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg transition-colors"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <h3 className="text-2xl font-black">{cat.category}</h3>
                        <p className="text-indigo-100 mt-2 font-semibold">
                          {cat.productCount} products
                          {cat.productsWithOverrides.length > 0 && (
                            <span className="ml-2 bg-orange-500 px-3 py-1 rounded-full text-sm font-bold inline-block mt-2">
                              {cat.productsWithOverrides.length} custom
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="p-6">
                        {/* Discount Tiers with Progress Bars */}
                        <div className="space-y-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-700">🛍️ Retail</span>
                              <span className="text-2xl font-black text-blue-600">{cat.retailDiscount}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(cat.retailDiscount, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-700">🏪 Wholesale</span>
                              <span className="text-2xl font-black text-green-600">{cat.wholesaleDiscount}%</span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(cat.wholesaleDiscount, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-700">⭐ Super Wholesale</span>
                              <span className="text-2xl font-black text-amber-600">{cat.superWholesaleDiscount}%</span>
                            </div>
                            <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(cat.superWholesaleDiscount, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(cat);
                            }}
                            className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors transform hover:scale-105"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() =>
                              setExpandedCategory(expandedCategory === cat.category ? null : cat.category)
                            }
                            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
                          >
                            {expandedCategory === cat.category ? '▼ Hide' : '▶ Show'} Details
                          </button>
                        </div>
                      </div>

                      {/* Expanded Products with Overrides */}
                      {expandedCategory === cat.category && cat.productsWithOverrides.length > 0 && (
                        <div className="border-t-2 border-gray-200 bg-gray-50 p-6">
                          <h4 className="text-lg font-black text-gray-900 mb-4">
                            📌 {cat.productsWithOverrides.length} Products with Custom Discounts
                          </h4>
                          <div className="space-y-3">
                            {cat.productsWithOverrides.map((product) => (
                              <div
                                key={product.productId}
                                className="bg-white p-4 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow"
                              >
                                <p className="font-bold text-gray-900">{product.productName}</p>
                                <p className="text-sm text-gray-600 mt-1 font-semibold">
                                  {product.retailDiscount}% • {product.wholesaleDiscount}% • {product.superWholesaleDiscount}%
                                </p>
                                <a
                                  href={`/products/edit/${product.productId}`}
                                  className="inline-block mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors"
                                >
                                  Edit Product →
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


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
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">📂</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Category Discounts</h1>
              <p className="text-gray-600 mt-1">Manage discount tiers by product category</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg shadow">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">No categories found</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.category}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500 overflow-hidden"
              >
                {editingCategory === cat.category ? (
                  // Edit Mode
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        ✏️ Edit Discounts for: {cat.category}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Retail Discount (%)
                        </label>
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
                          className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Wholesale Discount (%)
                        </label>
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
                          className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Super Wholesale Discount (%)
                        </label>
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
                          className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold transition-colors"
                      >
                        {saving ? 'Saving...' : '✅ Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedCategory(expandedCategory === cat.category ? null : cat.category)
                      }
                    >
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{cat.category}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {cat.productCount} products
                          {cat.productsWithOverrides.length > 0 && (
                            <span className="ml-2 text-orange-600 font-semibold">
                              ({cat.productsWithOverrides.length} with custom discounts)
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-8 mr-8">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Retail</p>
                          <p className="text-2xl font-bold text-blue-600">{cat.retailDiscount}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Wholesale</p>
                          <p className="text-2xl font-bold text-green-600">{cat.wholesaleDiscount}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Super WS</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {cat.superWholesaleDiscount}%
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(cat);
                        }}
                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold transition-colors whitespace-nowrap ml-4"
                      >
                        ✏️ Edit
                      </button>

                      <div className="ml-4 text-gray-400">
                        {expandedCategory === cat.category ? '▼' : '▶'}
                      </div>
                    </div>

                    {/* Expanded Products with Overrides */}
                    {expandedCategory === cat.category && cat.productsWithOverrides.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">
                          📌 Products with Custom Discounts
                        </h4>
                        <div className="space-y-3">
                          {cat.productsWithOverrides.map((product) => (
                            <div
                              key={product.productId}
                              className="bg-white p-4 rounded-lg border border-orange-200 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{product.productName}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Custom: {product.retailDiscount}% / {product.wholesaleDiscount}% /
                                  {product.superWholesaleDiscount}%
                                </p>
                              </div>
                              <a
                                href={`/products/edit/${product.productId}`}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors whitespace-nowrap"
                              >
                                Edit Product
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


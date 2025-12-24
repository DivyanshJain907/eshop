'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import UserHeader from '@/components/UserHeader';
import { Product } from '@/lib/types';

interface ProductDiscount {
  productId: string;
  productName: string;
  category?: string;
  retailDiscount: number;
  wholesaleDiscount: number;
  superWholesaleDiscount: number;
}

export default function DiscountsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated or not admin/employee
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'employee'))) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Fetch products and extract discount data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProductDiscounts();
    }
  }, [isAuthenticated, user]);

  const fetchProductDiscounts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/products', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        
        // Extract discount information from products
        const productDiscounts: ProductDiscount[] = products
          .filter((p: Product) => p.retailDiscount || p.discount || p.superDiscount)
          .map((p: Product) => ({
            productId: p._id || p.id,
            productName: p.name,
            category: p.category,
            retailDiscount: p.retailDiscount || 0,
            wholesaleDiscount: p.discount || 0,
            superWholesaleDiscount: p.superDiscount || 0,
          }));
        
        setDiscounts(productDiscounts);
      }
    } catch (err) {
      console.error('Error fetching product discounts:', err);
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🎯</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Product Discounts</h1>
              <p className="text-gray-600 mt-1">View all product tier discounts</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Discounts List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading discounts...</div>
          ) : discounts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">No products with discounts yet</p>
              <p className="text-gray-500 mb-4">Add discounts when creating or editing products</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Retail Discount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Wholesale Discount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Super Wholesale Discount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {discounts.map((discount) => (
                    <tr key={discount.productId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{discount.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{discount.category || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        {discount.retailDiscount > 0 ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                            {discount.retailDiscount}%
                          </span>
                        ) : (
                          <span className="text-gray-400">No discount</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {discount.wholesaleDiscount > 0 ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                            {discount.wholesaleDiscount}%
                          </span>
                        ) : (
                          <span className="text-gray-400">No discount</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {discount.superWholesaleDiscount > 0 ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold">
                            {discount.superWholesaleDiscount}%
                          </span>
                        ) : (
                          <span className="text-gray-400">No discount</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={`/products/edit/${discount.productId}`}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium inline-block"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

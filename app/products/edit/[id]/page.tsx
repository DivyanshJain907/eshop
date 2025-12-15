'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (isLoading || loading) {
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-red-600 font-bold">Product not found</p>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <UserHeader />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">✏️</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product details and pricing</p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Image</h3>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg border border-gray-300"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <p className="text-lg text-gray-900 font-medium">{product.name}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <p className="text-gray-600">{product.description || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <p className="text-gray-900">{product.category || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price</label>
                  <p className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <p className="text-xl font-bold text-gray-900">{product.quantity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Pricing Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Retail Tier */}
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <h4 className="font-bold text-green-900 mb-3">🛍️ Retail Tier</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Min Quantity:</span> {product.minRetailQuantity}</p>
                  <p><span className="font-semibold">Discount:</span> {product.retailDiscount}%</p>
                  <p><span className="font-bold text-lg">Price: ${product.retailPrice.toFixed(2)}</span></p>
                </div>
              </div>

              {/* Wholesale Tier */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-3">🏪 Wholesale Tier</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Min Quantity:</span> {product.minWholesaleQuantity}</p>
                  <p><span className="font-semibold">Discount:</span> {product.discount}%</p>
                  <p><span className="font-bold text-lg">Price: ${product.wholesalePrice.toFixed(2)}</span></p>
                </div>
              </div>

              {/* Super Wholesale Tier */}
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-3">🏭 Super Wholesale</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Min Quantity:</span> {product.minSuperWholesaleQuantity}</p>
                  <p><span className="font-semibold">Discount:</span> {product.superDiscount}%</p>
                  <p><span className="font-bold text-lg">Price: ${product.superWholesalePrice.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => router.push(`/products`)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
            >
              ✏️ Edit Details
            </button>
            <Link
              href="/products"
              className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition inline-block"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

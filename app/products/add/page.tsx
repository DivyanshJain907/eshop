'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';
import AddProductForm from '@/components/AddProductForm';

export default function AddProductPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const handleProductSuccess = () => {
    router.push('/products');
  };

  return (
    <UserHeader>
      <div className="flex-1 bg-linear-to-br from-indigo-50 via-white to-blue-50">
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Form Header */}
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-4 sm:px-8 py-4 sm:py-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>✨</span> Create Your Product
            </h2>
            <p className="text-indigo-100 mt-2">Fill in all the details below to add your product to the inventory</p>
          </div>

          {/* Form Content */}
          <AddProductForm onSuccess={handleProductSuccess} />
        </div>

        {/* Help Section */}
        <div className="mt-6 sm:mt-12 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-xl sm:text-3xl">💡</div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 mb-2">Quick Tips for Better Results</h3>
              <ul className="space-y-2 text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Base Price:</strong> Set your base/retail price. Tier prices are auto-calculated based on discounts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Quantity Tiers:</strong> Retail (1-9), Wholesale (10-49), Super Wholesale (50+)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Stock Threshold:</strong> Set a minimum stock level for low inventory alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span><strong>Product Images:</strong> Upload clear, high-quality product photos for better customer engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
          >
            <span>←</span> Back to Products
          </Link>
        </div>
      </div>
    </div>
    </UserHeader>
  );
}

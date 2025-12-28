'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState, Suspense } from 'react';

interface DirectSaleCustomer {
  customerNames: string[];
  hasOrders: boolean;
}

export default function ValidateNamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [directSaleInfo, setDirectSaleInfo] = useState<DirectSaleCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const checkDirectSaleInfo = async () => {
      if (!user?.phone) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/customers/check-name?phone=${user.phone}`);
        if (response.ok) {
          const data = await response.json();
          setDirectSaleInfo(data);
          if (data.customerNames.length === 1) {
            setSelectedName(data.customerNames[0]);
          }
        } else {
          // No direct sales found, allow user to proceed to home
          router.push('/home');
        }
      } catch (error) {
        console.error('Error checking direct sales info:', error);
        router.push('/home');
      } finally {
        setLoading(false);
      }
    };

    if (user?.phone) {
      checkDirectSaleInfo();
    }
  }, [user?.phone, router]);

  const handleConfirm = () => {
    if (!selectedName) {
      alert('Please select your correct name from the list');
      return;
    }

    // Name confirmed - redirect to orders page to show previous orders
    router.push('/orders');
  };

  return (
    <Suspense>
      {/* ...existing code... */}
      {isLoading || loading ? (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-cyan-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Verifying your information...</p>
          </div>
        </div>
      ) : !isAuthenticated || !user ? null
        : !directSaleInfo?.hasOrders ? null
        : directSaleInfo.customerNames.length === 1 ? (router.push('/orders'), null)
        : (
          <div className="min-h-screen bg-linear-to-br from-indigo-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Name</h1>
                <p className="text-gray-600">
                  We found previous orders under a different name. Please confirm your correct name.
                </p>
              </div>
              {/* Warning Box */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-semibold text-sm">
                  ⚠️ You logged in as <span className="font-bold">"{user.name}"</span> but our records show:
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  {directSaleInfo.customerNames.map(name => `"${name}"`).join(', ')}
                </p>
              </div>
              {/* Name Selection */}
              {directSaleInfo.customerNames.length > 1 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select your correct name:
                  </label>
                  <div className="space-y-2">
                    {directSaleInfo.customerNames.map((name) => (
                      <label key={name} className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-all">
                        <input
                          type="radio"
                          name="name"
                          value={name}
                          checked={selectedName === name}
                          onChange={(e) => setSelectedName(e.target.value)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="ml-3 font-semibold text-gray-900">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mb-6">
                  <p className="text-indigo-900 font-semibold">
                    Your correct name is: <span className="text-xl">"{directSaleInfo.customerNames[0]}"</span>
                  </p>
                </div>
              )}
              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                >
                  ✓ Confirm & Continue
                </button>
                <button
                  onClick={() => {
                    // Logout
                    fetch('/api/auth/logout', { method: 'POST' });
                    router.push('/login');
                  }}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
                >
                  🔄 Login Again with Different Name
                </button>
              </div>
              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Why?</span> To access your previous orders, please ensure you use the exact name from your direct sale records.
                </p>
              </div>
            </div>
          </div>
        )}
    </Suspense>
  );
}

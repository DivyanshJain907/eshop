'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';

interface ProductTableProps {
  products?: Product[];
  onQuantityChange?: (productId: string, quantity: number) => void;
}

export default function ProductTable({ products = [], onQuantityChange }: ProductTableProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [saleQuantity, setSaleQuantity] = useState<string>('1');

  const handleSaleClick = useCallback((product: Product) => {
    setSelectedProduct(product._id || product.id || '');
    setSaleQuantity('1');
  }, []);

  const handleEditClick = useCallback((productId: string) => {
    router.push(`/products/edit/${productId}`);
  }, [router]);

  const processSale = useCallback(
    (productId: string) => {
      const quantity = parseInt(saleQuantity, 10);
      if (quantity > 0 && onQuantityChange) {
        onQuantityChange(productId, quantity);
        setSelectedProduct(null);
        setSaleQuantity('1');
      }
    },
    [saleQuantity, onQuantityChange]
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-4 py-3 text-left">Image</th>
              <th className="border border-gray-300 px-4 py-3 text-left">Product Name</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Price</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Quantity</th>
              <th className="border border-gray-300 px-4 py-3 text-right">Total Value</th>
              <th className="border border-gray-300 px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id || product.id} className="hover:bg-gray-50 border-b border-gray-300">
                <td className="border border-gray-300 px-4 py-3">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded border border-gray-200"
                    />
                  ) : (product.images && product.images.length > 0) ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right text-gray-900 font-medium">
                  ${product.price.toFixed(2)}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-3 text-right font-semibold ${
                    product.quantity < 10 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  <div>
                    {product.quantity}
                    {product.stockThreshold && product.quantity <= product.stockThreshold && (
                      <div className="text-xs text-red-600 font-bold mt-1 bg-red-50 px-2 py-1 rounded">
                        ⚠️ Low Stock
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right text-gray-900 font-medium">
                  ${(product.price * product.quantity).toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <button
                    onClick={() => handleEditClick(product._id || product.id || '')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sale Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Process Sale</h2>
            <p className="text-gray-700 mb-4">
              Product: <strong>{products.find((p) => (p._id || p.id) === selectedProduct)?.name}</strong>
            </p>
            <p className="text-gray-700 mb-6">
              Available Quantity:{' '}
              <strong>{products.find((p) => (p._id || p.id) === selectedProduct)?.quantity}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Sell:
              </label>
              <input
                type="number"
                min="1"
                max={products.find((p) => (p._id || p.id) === selectedProduct)?.quantity || 0}
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => processSale(selectedProduct)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded font-medium transition"
              >
                Confirm Sale
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

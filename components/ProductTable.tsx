'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';



interface ProductTableProps {
  products?: Product[];
  onQuantityChange?: (productId: string, quantity: number) => void;
  onDeleteProduct?: (productId: string) => void;
}

export default function ProductTable({ products = [], onQuantityChange, onDeleteProduct }: ProductTableProps) {
  const { user } = useAuth();
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
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-blue-100 text-gray-900 font-bold">
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Image</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Product Name</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Barcode</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Product Code</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Model Name</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">Category</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-gray-900">MRP</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-gray-900">UOM</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-gray-900">Price</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-gray-900">Qty</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-gray-900">Stock Threshold</th>
              <th className="border border-gray-300 px-3 py-2 text-right text-gray-900">Total Value</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-gray-900 bg-blue-50">Retail %</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-gray-900 bg-green-50">Wholesale %</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-gray-900 bg-purple-50">Super WS %</th>
              <th className="border border-gray-300 px-3 py-2 text-center text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id || product.id} className="hover:bg-gray-100 border-b border-gray-300">
                <td className="border border-gray-300 px-3 py-2">
                  {product.images && product.images.length > 0 ? (
                    <div className="relative inline-block">
                      <img
                        src={product.images[0] as string}
                        alt={product.name + ' 1'}
                        className="h-12 w-12 object-cover rounded border border-gray-200"
                      />
                      {product.images.length > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs rounded px-1 py-0.5 mr-0.5 mb-0.5 select-none">
                          +{product.images.length - 1}
                        </span>
                      )}
                    </div>
                  ) : product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded border border-gray-200"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      No Img
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900 max-w-xs truncate">{product.name}</td>
                <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">{product.barcode || ''}</td>
                <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">{product.productCode || ''}</td>
                <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">{product.modelName || ''}</td>
                <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">{product.brandName || ''}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900">{typeof product.mrp === 'number' && !isNaN(product.mrp) ? product.mrp.toFixed(2) : ''}</td>
                <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">{product.uom || ''}</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900 font-medium">
                  Rs. {typeof product.price === 'number' && !isNaN(product.price) ? product.price.toFixed(2) : 'N/A'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                  {typeof product.quantity === 'number' && !isNaN(product.quantity) ? product.quantity : 'N/A'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                  {typeof product.stockThreshold === 'number' && !isNaN(product.stockThreshold) ? product.stockThreshold : ''}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-gray-900 font-medium">
                  Rs. {typeof product.price === 'number' && typeof product.quantity === 'number' && !isNaN(product.price) && !isNaN(product.quantity)
                    ? (product.price * product.quantity).toFixed(2)
                    : 'N/A'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center bg-blue-50 text-gray-900">
                  {product.retailDiscount ? (
                    <div className="text-blue-700 font-semibold">{product.retailDiscount}%</div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  {product.retailDiscount && product.retailPrice && (
                    <div className="text-xs text-gray-600">Rs. {product.retailPrice.toFixed(0)}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center bg-green-50 text-gray-900">
                  {product.discount ? (
                    <div className="text-green-700 font-semibold">{product.discount}%</div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  {product.discount && product.wholesalePrice && (
                    <div className="text-xs text-gray-600">Rs. {product.wholesalePrice.toFixed(0)}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center bg-purple-50 text-gray-900">
                  {product.superDiscount ? (
                    <div className="text-purple-700 font-semibold">{product.superDiscount}%</div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  {product.superDiscount && product.superWholesalePrice && (
                    <div className="text-xs text-gray-600">Rs. {product.superWholesalePrice.toFixed(0)}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEditClick(product._id || product.id || '')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                  >
                    Edit
                  </button>
                  {(user?.role === 'admin' || user?.role === 'employee') && onDeleteProduct && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          onDeleteProduct(product._id || product.id || '');
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  )}
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

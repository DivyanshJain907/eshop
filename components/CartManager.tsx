'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';

interface CartItem extends Product {
  cartQuantity: number;
}

interface CartManagerProps {
  cartItems?: CartItem[];
  onRemove?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
}

export default function CartManager({
  cartItems = [],
  onRemove,
  onUpdateQuantity,
}: CartManagerProps) {
  const [items, setItems] = useState<CartItem[]>(cartItems);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setItems(cartItems);
    calculateTotal();
  }, [cartItems]);

  const calculateTotal = () => {
    const sum = items.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
    setTotal(sum);
  };

  const handleRemove = (productId: string) => {
    setItems(items.filter(item => (item._id || item.id) !== productId));
    onRemove?.(productId);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(productId);
      return;
    }

    const updated = items.map(item =>
      (item._id || item.id) === productId ? { ...item, cartQuantity: quantity } : item
    );
    setItems(updated);
    onUpdateQuantity?.(productId, quantity);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <a
            href="#browse"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={item._id || item.id}
            className="flex items-center justify-between border-b border-gray-200 pb-4"
          >
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">Price: ₹{item.price.toFixed(2)}</p>
            </div>

            {/* Quantity Control */}
            <div className="flex items-center gap-2 mx-4">
              <button
                onClick={() =>
                  handleUpdateQuantity(item._id || item.id || '', item.cartQuantity - 1)
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={item.cartQuantity}
                onChange={(e) =>
                  handleUpdateQuantity(item._id || item.id || '', parseInt(e.target.value) || 1)
                }
                className="w-12 text-center border border-gray-300 rounded"
              />
              <button
                onClick={() =>
                  handleUpdateQuantity(item._id || item.id || '', item.cartQuantity + 1)
                }
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                +
              </button>
            </div>

            {/* Item Total */}
            <div className="min-w-max mr-4">
              <p className="font-bold text-gray-900">₹{(item.price * item.cartQuantity).toFixed(2)}</p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemove(item._id || item.id || '')}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 font-medium">Subtotal:</span>
          <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-300">
          <span className="text-gray-700 font-medium">Shipping:</span>
          <span className="text-gray-900 font-medium">Free</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-indigo-600">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
          Continue Shopping
        </button>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

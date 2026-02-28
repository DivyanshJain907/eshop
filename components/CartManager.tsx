'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';

interface CartItem extends Product {
  cartQuantity: number;
}

interface CartManagerProps {
  cartItems?: CartItem[];
  onRemove?: (productId: string) => void;
  onRemoveFromCart?: (productId: string) => void; // alternate prop name used elsewhere
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void; // alternate prop name
  onCheckout?: () => void; // optional checkout callback
  onContinueShopping?: () => void; // callback for continue shopping
}

export default function CartManager({
  cartItems = [],
  onRemove,
  onRemoveFromCart,
  onUpdateQuantity,
  onUpdateCartQuantity,
  onCheckout,
  onContinueShopping,
}: CartManagerProps) {
  const [items, setItems] = useState<CartItem[]>(cartItems);
  const [total, setTotal] = useState(0);

  // Get the effective price per unit based on quantity tier
  const getEffectivePrice = (item: CartItem): number => {
    const qty = item.cartQuantity;
    if (item.minSuperWholesaleQuantity && item.superWholesalePrice && qty >= item.minSuperWholesaleQuantity) {
      return item.superWholesalePrice;
    }
    if (item.minWholesaleQuantity && item.wholesalePrice && qty >= item.minWholesaleQuantity) {
      return item.wholesalePrice;
    }
    if (item.retailPrice && item.retailPrice > 0) {
      return item.retailPrice;
    }
    return item.price;
  };

  // Get the active discount tier label
  const getActiveTier = (item: CartItem): string | null => {
    const qty = item.cartQuantity;
    if (item.minSuperWholesaleQuantity && item.superWholesalePrice && qty >= item.minSuperWholesaleQuantity) {
      return 'Super Wholesale';
    }
    if (item.minWholesaleQuantity && item.wholesalePrice && qty >= item.minWholesaleQuantity) {
      return 'Wholesale';
    }
    if (item.retailPrice && item.retailPrice > 0 && item.retailPrice < item.price) {
      return 'Retail';
    }
    return null;
  };

  useEffect(() => {
    setItems(cartItems);
  }, [cartItems]);

  // Recalculate total whenever items change
  useEffect(() => {
    const sum = items.reduce((acc, item) => acc + getEffectivePrice(item) * item.cartQuantity, 0);
    setTotal(sum);
  }, [items]);

  const handleRemove = (productId: string) => {
    setItems(items.filter(item => (item._id || item.id) !== productId));
    // Support both prop names
    (onRemove || onRemoveFromCart)?.(productId);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(productId);
      return;
    }

    // Find the product to check available stock
    const product = items.find(item => (item._id || item.id) === productId);
    if (!product) return;

    // Validate against available quantity
    if (quantity > product.quantity) {
      alert(`⚠️ Only ${product.quantity} item(s) available for "${product.name}"`);
      return;
    }

    const updated = items.map(item =>
      (item._id || item.id) === productId ? { ...item, cartQuantity: quantity } : item
    );
    setItems(updated);
    // Support both prop names
    (onUpdateQuantity || onUpdateCartQuantity)?.(productId, quantity);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <button
            onClick={() => onContinueShopping?.()}
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
          >
            🛍️ Continue Shopping
          </button>
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
            className="border border-gray-200 rounded-xl p-4 mb-3"
          >
            {/* Top row: Name + Remove */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight flex-1 mr-2">{item.name}</h3>
              <button
                onClick={() => handleRemove(item._id || item.id || '')}
                className="text-gray-400 hover:text-red-500 text-lg font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Price with discount */}
            <div className="text-sm mb-2">
              {getEffectivePrice(item) < item.price ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 line-through text-xs">₹{item.price.toFixed(2)}</span>
                  <span className="text-gray-900 font-semibold">₹{getEffectivePrice(item).toFixed(2)}</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {Math.round(((item.price - getEffectivePrice(item)) / item.price) * 100)}% off
                  </span>
                </div>
              ) : (
                <span className="text-gray-900 font-semibold">₹{item.price.toFixed(2)}</span>
              )}
            </div>

            {/* Active tier badge */}
            {getActiveTier(item) && (
              <span className="inline-block mb-2 text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                {getActiveTier(item)} Price
              </span>
            )}

            {/* Tier hints */}
            {item.minWholesaleQuantity && item.wholesalePrice && item.cartQuantity < item.minWholesaleQuantity && (
              <div className="text-xs text-green-700 mb-1">Add {item.minWholesaleQuantity - item.cartQuantity} more for wholesale price (₹{item.wholesalePrice.toFixed(2)}/unit — <span className="font-semibold">{Math.round(((item.price - item.wholesalePrice) / item.price) * 100)}% off</span>)</div>
            )}
            {item.minSuperWholesaleQuantity && item.superWholesalePrice && item.cartQuantity < item.minSuperWholesaleQuantity && (
              <div className="text-xs text-purple-700 mb-1">Add {item.minSuperWholesaleQuantity - item.cartQuantity} more for super wholesale price (₹{item.superWholesalePrice.toFixed(2)}/unit — <span className="font-semibold">{Math.round(((item.price - item.superWholesalePrice) / item.price) * 100)}% off</span>)</div>
            )}

            {/* Bottom row: Quantity + Total */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              {/* Quantity Control */}
              <div className="flex items-center gap-0 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item._id || item.id || '', item.cartQuantity - 1)
                  }
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg"
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
                  className="w-12 h-9 text-center border-x border-gray-300 text-sm font-semibold text-gray-900 bg-white"
                />
                <button
                  onClick={() =>
                    handleUpdateQuantity(item._id || item.id || '', item.cartQuantity + 1)
                  }
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg"
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right">
                {getEffectivePrice(item) < item.price && (
                  <p className="text-xs text-gray-400 line-through">₹{(item.price * item.cartQuantity).toFixed(2)}</p>
                )}
                <p className="font-bold text-gray-900 text-base">₹{(getEffectivePrice(item) * item.cartQuantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        {(() => {
          const originalTotal = items.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
          const savings = originalTotal - total;
          return (
            <>
              {savings > 0 && (
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-gray-500 font-medium">Original Price:</span>
                  <span className="text-gray-400 line-through">₹{originalTotal.toFixed(2)}</span>
                </div>
              )}
              {savings > 0 && (
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <span className="text-green-600 font-medium">You Save:</span>
                  <span className="text-green-600 font-bold">− ₹{savings.toFixed(2)}</span>
                </div>
              )}
            </>
          );
        })()}
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
          <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => onContinueShopping?.()}
          className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
        >
          🛍️ Continue Shopping
        </button>
        <button
          onClick={() => onCheckout?.()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          ✓ Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

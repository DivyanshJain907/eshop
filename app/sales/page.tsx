'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import { Product } from '@/lib/types';

interface CartItem extends Product {
  cartQuantity: number;
  customDiscount?: number; // Custom discount percentage
}

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<string | null>(null);

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

  // Fetch products
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');

      if (response.ok) {
        const productsData = await response.json();
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Get applicable discount based on quantity thresholds
  const getApplicableDiscount = (product: Product, quantity: number) => {
    if (product.minSuperWholesaleQuantity && quantity >= product.minSuperWholesaleQuantity) {
      return product.superDiscount || 0;
    }
    if (product.minWholesaleQuantity && quantity >= product.minWholesaleQuantity) {
      return product.discount || 0;
    }
    if (product.minRetailQuantity && quantity >= product.minRetailQuantity) {
      return product.retailDiscount || 0;
    }
    return 0;
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => (item._id || item.id) === (product._id || product.id));
    let newQuantity = 1;

    if (existingItem) {
      if (existingItem.cartQuantity >= product.quantity) {
        setError(`Only ${product.quantity} item(s) available for "${product.name}"`);
        return;
      }
      newQuantity = existingItem.cartQuantity + 1;
      const applicableDiscount = getApplicableDiscount(product, newQuantity);
      setCartItems(
        cartItems.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, cartQuantity: newQuantity, customDiscount: applicableDiscount }
            : item
        )
      );
    } else {
      if (product.quantity <= 0) {
        setError(`"${product.name}" is out of stock`);
        return;
      }
      const applicableDiscount = getApplicableDiscount(product, 1);
      setCartItems([...cartItems, { ...product, cartQuantity: 1, customDiscount: applicableDiscount }]);
    }
    setError('');
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => (item._id || item.id) !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => (p._id || p.id) === productId);
    if (product && quantity > product.quantity) {
      setError(`Only ${product.quantity} item(s) available`);
      return;
    }

    // Recalculate discount based on new quantity
    const applicableDiscount = product ? getApplicableDiscount(product, quantity) : 0;
    setCartItems(
      cartItems.map((item) =>
        (item._id || item.id) === productId ? { ...item, cartQuantity: quantity, customDiscount: applicableDiscount } : item
      )
    );
  };

  const processSale = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    // Save cart data to localStorage and navigate to checkout
    localStorage.setItem('directSalesCart', JSON.stringify(cartItems));
    localStorage.setItem('directSalesTotal', cartTotal.toString());
    router.push('/sales/checkout');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const cartTotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.cartQuantity;
    const customDiscount = item.customDiscount || 0;
    return sum + (itemTotal * (1 - customDiscount / 100));
  }, 0);

  const calculateItemTotal = (item: CartItem) => {
    const itemTotal = item.price * item.cartQuantity;
    const customDiscount = item.customDiscount || 0;
    return itemTotal * (1 - customDiscount / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Direct Sales Portal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Products Section */}
          <div className="lg:col-span-2 lg:order-1 order-2">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🏪</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Direct Sales Portal</h1>
                  <p className="text-gray-600">Sell items directly to customers</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg shadow p-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                          📦
                        </div>
                      )}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        product.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-lg font-bold text-indigo-600 mb-2">₹{product.price.toFixed(2)}</p>
                    
                    {/* Discount Tier Info */}
                    <div className="bg-gray-50 p-3 rounded mb-3 text-xs space-y-1">
                      <p className="font-semibold text-gray-700 mb-2">📊 Discount Tiers by Quantity:</p>
                      <div>
                        <p className="text-blue-700 font-semibold">
                          🛍️ Retail: {product.retailDiscount || 0}% {product.minRetailQuantity ? `(Min: ${product.minRetailQuantity} qty)` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-700 font-semibold">
                          🏪 Wholesale: {product.discount || 0}% {product.minWholesaleQuantity ? `(Min: ${product.minWholesaleQuantity} qty)` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-700 font-semibold">
                          ⭐ Super: {product.superDiscount || 0}% {product.minSuperWholesaleQuantity ? `(Min: ${product.minSuperWholesaleQuantity} qty)` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.quantity <= 0}
                      className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                        product.quantity > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Section - Show on right desktop, below on mobile */}
          <div className="lg:col-span-1 lg:order-2 order-1">
            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                🛒 Cart ({cartItems.length})
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Cart is empty</div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item._id || item.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item._id || item.id || '')}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => updateQuantity(item._id || item.id || '', item.cartQuantity - 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.cartQuantity}
                            onChange={(e) =>
                              updateQuantity(item._id || item.id || '', parseInt(e.target.value) || 1)
                            }
                            className="w-12 text-center border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => updateQuantity(item._id || item.id || '', item.cartQuantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                          <span className="text-xs text-gray-600 ml-auto">Qty: {item.cartQuantity}</span>
                        </div>

                        {/* Discount Section */}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-700">💰 Discount Applied</span>
                            <button
                              onClick={() =>
                                setSelectedItemForDiscount(
                                  selectedItemForDiscount === (item._id || item.id)
                                    ? null
                                    : (item._id || item.id || '')
                                )
                              }
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                            >
                              {selectedItemForDiscount === (item._id || item.id) ? '✕ Close' : '✎ Edit'}
                            </button>
                          </div>

                          {selectedItemForDiscount === (item._id || item.id) ? (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200 mb-2">
                              <label className="text-xs font-semibold text-gray-700 block mb-2">
                                Adjust Discount Percentage
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={item.customDiscount || 0}
                                  onChange={(e) => {
                                    const discount = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                    setCartItems(
                                      cartItems.map((ci) =>
                                        (ci._id || ci.id) === (item._id || item.id)
                                          ? { ...ci, customDiscount: discount }
                                          : ci
                                      )
                                    );
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm font-bold"
                                  placeholder="0"
                                />
                                <span className="text-sm font-semibold text-gray-700">%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <p className="text-sm font-bold text-green-700">
                                ✓ {item.customDiscount && item.customDiscount > 0 ? `${item.customDiscount}%` : '0%'} off
                              </p>
                              <p className="text-xs text-green-600">Auto-applied tier discount</p>
                            </div>
                          )}
                        </div>

                        {/* Price Calculation */}
                        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                          <p className="text-xs text-gray-600">
                            Base: ₹{(item.price * item.cartQuantity).toFixed(2)}
                          </p>
                          {item.customDiscount && item.customDiscount > 0 && (
                            <>
                              <p className="text-xs text-red-600">
                                Discount: -₹{((item.price * item.cartQuantity * item.customDiscount) / 100).toFixed(2)}
                              </p>
                              <p className="text-sm font-semibold text-indigo-600">
                                Total: ₹{calculateItemTotal(item).toFixed(2)}
                              </p>
                            </>
                          )}
                          {(!item.customDiscount || item.customDiscount === 0) && (
                            <p className="text-sm font-semibold text-indigo-600">
                              Total: ₹{(item.price * item.cartQuantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">
                        ₹{cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0).toFixed(2)}
                      </span>
                    </div>
                    {cartItems.some((item) => item.customDiscount && item.customDiscount > 0) && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Total Discount:</span>
                        <span className="font-semibold">
                          -₹
                          {cartItems
                            .reduce((sum, item) => {
                              const itemTotal = item.price * item.cartQuantity;
                              const discount = item.customDiscount || 0;
                              return sum + (itemTotal * discount) / 100;
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded p-3 mt-3">
                      <p className="text-sm text-gray-600 mb-1">Final Total</p>
                      <p className="text-2xl font-bold text-indigo-600">₹{cartTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={processSale}
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-bold transition-colors"
                  >
                    {isProcessing ? '⏳ Processing...' : '✓ Complete Sale'}
                  </button>
                  <button
                    onClick={() => setCartItems([])}
                    className="w-full mt-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Clear Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

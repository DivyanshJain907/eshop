'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import SaleHistory from '@/components/SaleHistory';
import { Product } from '@/lib/types';

interface CartItem extends Product {
  cartQuantity: number;
}

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Fetch sales data and products
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSalesAndProducts();
    }
  }, [isAuthenticated, user]);

  const fetchSalesAndProducts = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/products'),
      ]);

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setSales(salesData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => (item._id || item.id) === (product._id || product.id));

    if (existingItem) {
      if (existingItem.cartQuantity >= product.quantity) {
        setError(`Only ${product.quantity} item(s) available for "${product.name}"`);
        return;
      }
      setCartItems(
        cartItems.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        )
      );
    } else {
      if (product.quantity <= 0) {
        setError(`"${product.name}" is out of stock`);
        return;
      }
      setCartItems([...cartItems, { ...product, cartQuantity: 1 }]);
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

    setCartItems(
      cartItems.map((item) =>
        (item._id || item.id) === productId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const processSale = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

      const response = await fetch('/api/direct-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id || item.id,
            productName: item.name,
            quantity: item.cartQuantity,
            price: item.price,
          })),
          totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process sale');
      }

      // Clear cart and refresh data
      setCartItems([]);
      fetchSalesAndProducts();
      alert('✅ Sale processed successfully!');
    } catch (err: any) {
      setError(err.message || 'Error processing sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

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
          <div className="lg:col-span-2">
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
                      <div className="text-2xl">{product.image || '📦'}</div>
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
                    <p className="text-lg font-bold text-indigo-600 mb-3">₹{product.price.toFixed(2)}</p>
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

          {/* Cart Section */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🛒 Cart ({cartItems.length})
            </h2>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Cart is empty</div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="border border-gray-200 rounded p-3">
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
                      </div>
                      <p className="text-sm font-semibold text-indigo-600">
                        ₹{(item.price * item.cartQuantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded p-3 mt-3">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
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

        {/* Sales History */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">💰 Sales History</h2>
            <p className="text-gray-600 mt-1">Track all sales transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {sales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
              ) : (
                <SaleHistory sales={sales} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

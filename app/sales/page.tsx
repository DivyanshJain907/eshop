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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const itemsPerPage = 50;

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

  // Prevent body scroll when cart or modal is open
  useEffect(() => {
    if (isCartOpen || selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, selectedProduct]);

  // Fetch products
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  const fetchProducts = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`/api/products?page=${page}&limit=${itemsPerPage}`);

      if (response.ok) {
        const data = await response.json();
        const newProducts = Array.isArray(data) ? data : (data.products || []);
        // Filter out 0 price products
        const validProducts = newProducts.filter((p: Product) => (p.retailPrice || p.price || 0) > 0);
        const totalCount = data.pagination?.total || validProducts.length;

        if (page === 1) {
          setProducts(validProducts);
          setAllProducts(validProducts);
        } else {
          setProducts([...products, ...validProducts]);
          setAllProducts([...allProducts, ...validProducts]);
        }
        setTotalProducts(totalCount);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      if (page === 1) setLoading(false);
      else setLoadingMore(false);
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

  const filteredProducts = products.filter((p) => {
    // Text search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = !categoryFilter || (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());

    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'in-stock') {
      matchesStock = (p.quantity || 0) > 0;
    } else if (stockFilter === 'low-stock') {
      matchesStock = (p.quantity || 0) > 0 && (p.quantity || 0) <= 5;
    } else if (stockFilter === 'out-stock') {
      matchesStock = (p.quantity || 0) === 0;
    }

    // Price filter
    let matchesPrice = true;
    if (priceFilter) {
      const price = p.price || 0;
      if (priceFilter === '0-100') matchesPrice = price <= 100;
      else if (priceFilter === '100-500') matchesPrice = price > 100 && price <= 500;
      else if (priceFilter === '500-1000') matchesPrice = price > 500 && price <= 1000;
      else if (priceFilter === '1000+') matchesPrice = price > 1000;
    }

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

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

  const calculateDiscount = (item: CartItem) => {
    const itemTotal = item.price * item.cartQuantity;
    const customDiscount = item.customDiscount || 0;
    return (itemTotal * customDiscount) / 100;
  };

  // Update discount for a specific item
  const updateDiscount = (productId: string, discount: number) => {
    // Ensure discount is between 0 and 100
    const validDiscount = Math.max(0, Math.min(100, discount));
    setCartItems(
      cartItems.map((item) =>
        (item._id || item.id) === productId 
          ? { ...item, customDiscount: validDiscount }
          : item
      )
    );
  };

  // Get all unique categories from products
  const uniqueCategories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  ).sort();

  // Helper function to get cart quantity of a product
  const getCartQuantity = (productId: string) => {
    const cartItem = cartItems.find(item => item._id === productId || item.id === productId);
    return cartItem ? cartItem.cartQuantity : 0;
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
    <UserHeader>
      <div className="flex-1 bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Direct Sales Portal */}
        <div className="w-full">
          {/* Products Section */}
          <div className="w-full">
            {/* Header Section with Enhanced Design */}
            <div className="mb-4 sm:mb-8 bg-linear-to-br from-indigo-600 via-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl border border-indigo-400 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-6">
                  <div className="text-3xl sm:text-6xl drop-shadow-lg">🏪</div>
                  <div>
                    <h1 className="text-xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                      Direct Sales Portal
                    </h1>
                    <p className="text-indigo-100 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">💼 Sell directly with custom pricing</p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-6">
                  <div className="bg-white bg-opacity-95 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg">
                    <p className="text-gray-600 text-[9px] sm:text-xs font-bold uppercase tracking-wide">Products</p>
                    <p className="text-lg sm:text-3xl font-bold text-indigo-600 mt-1">{products.length}</p>
                  </div>
                  <div className="bg-white bg-opacity-95 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg">
                    <p className="text-gray-600 text-[9px] sm:text-xs font-bold uppercase tracking-wide">In Cart</p>
                    <p className="text-lg sm:text-3xl font-bold text-blue-600 mt-1">{cartItems.length}</p>
                  </div>
                  <div className="bg-white bg-opacity-95 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center shadow-lg">
                    <p className="text-gray-600 text-[9px] sm:text-xs font-bold uppercase tracking-wide">Cart Value</p>
                    <p className="text-lg sm:text-3xl font-bold text-green-600 mt-1">₹{cartTotal.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter Section */}
            <div className="mb-8 space-y-4 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              {/* Main Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-2xl">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-base text-gray-900 placeholder-gray-500 bg-white transition-all"
                />
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">📂 Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white font-medium transition-all hover:border-indigo-300"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">📦 Stock Status</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white font-medium transition-all hover:border-indigo-300"
                  >
                    <option value="">All Items</option>
                    <option value="in-stock">In Stock Only</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-stock">Out of Stock</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">💰 Price Range</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white font-medium transition-all hover:border-indigo-300"
                  >
                    <option value="">All Prices</option>
                    <option value="0-100">Rs. 0 - 100</option>
                    <option value="100-500">Rs. 100 - 500</option>
                    <option value="500-1000">Rs. 500 - 1000</option>
                    <option value="1000+">Rs. 1000+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 text-lg font-medium">No products found</p>
                  <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const productId = (product._id || product.id) ?? '';
                  const cartQuantity = getCartQuantity(productId);
                  const isInCart = cartQuantity > 0;
                  return (
                  <div
                    key={product._id || product.id}
                    className={`bg-white border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer ${
                      isInCart 
                        ? 'border-green-400 bg-gradient-to-br from-white to-green-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                        />
                      ) : product.image ? (
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
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          product.quantity > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity > 0 ? `${product.quantity} left` : 'Out of stock'}
                        </span>
                        {isInCart && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            ✅ {cartQuantity} in cart
                          </span>
                        )}
                      </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
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
                );
                })
              )}
            </div>

            {/* Load More Button */}
            {products.length < totalProducts && (
              <div className="flex justify-center mt-8 pb-12">
                <button
                  onClick={() => fetchProducts(currentPage + 1)}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 transform flex items-center gap-2"
                >
                  {loadingMore ? '⏳ Loading...' : `📥 Load More (${products.length}/${totalProducts})`}
                </button>
              </div>
            )}
          </div>

          {/* Small Floating Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full p-6 shadow-2xl transform hover:scale-125 transition-all z-40 flex flex-col items-center justify-center border-4 border-white"
          >
            <span className="text-4xl">🛒</span>
            <div className="mt-2 text-center">
              <p className="text-xs font-bold">{cartItems.length}</p>
              <p className="text-xs">Items</p>
              {cartTotal > 0 && <p className="text-xs font-bold">₹{cartTotal.toFixed(0)}</p>}
            </div>
          </button>

          {/* Cart Modal - Full Page Clean UI */}
          {isCartOpen && (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="bg-linear-to-r from-green-600 to-emerald-700 text-white p-5 flex justify-between items-center shrink-0 shadow-lg border-b-4 border-emerald-800">
                <div className="flex items-center gap-3">
                  <span className="text-5xl drop-shadow-xl">🛒</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white drop-shadow">Shopping Cart</h2>
                    <p className="text-sm text-green-50 font-semibold mt-0.5 drop-shadow">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-30 p-2 rounded-full transition text-4xl hover:scale-110 transform"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-96">
                    <p className="text-7xl mb-4">🛒</p>
                    <p className="text-gray-600 text-2xl font-bold">Cart is Empty</p>
                    <p className="text-gray-500 text-base mt-3">Add products to start selling</p>
                  </div>
                ) : (
                  <div className="max-w-7xl mx-auto space-y-3">
                    {cartItems.map((item) => (
                      <div key={item._id || item.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg hover:border-green-300 transition-all">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="shrink-0">
                            {item.image && item.image !== '📦' ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg bg-gray-100 border border-gray-200"
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-4xl border border-gray-200">
                                📦
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            {/* Item Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 mb-1">{item.name}</h3>
                                <div className="flex flex-wrap gap-2 items-center mb-1">
                                  <p className="text-sm text-gray-600 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block">📦 {item.category || 'Uncategorized'}</p>
                                  <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-full border border-gray-200 ml-1">Stock: {item.quantity}</span>
                                </div>
                                {/* Discount Info - Improved UI */}
                                {(item.retailDiscount || item.discount || item.superDiscount) && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {item.retailDiscount && (
                                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full text-xs shadow-sm border border-blue-200">
                                        <span className="text-base">🛍️</span> Retail: {item.retailDiscount}%
                                      </span>
                                    )}
                                    {item.discount && (
                                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full text-xs shadow-sm border border-green-200">
                                        <span className="text-base">🏪</span> Wholesale: {item.discount}%
                                      </span>
                                    )}
                                    {item.superDiscount && (
                                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full text-xs shadow-sm border border-purple-200">
                                        <span className="text-base">⭐</span> Super WS: {item.superDiscount}%
                                      </span>
                                    )}
                                  </div>
                                )}
                                {/* How many more for next discount - Improved UI */}
                                {item.minWholesaleQuantity && item.discount && item.cartQuantity < item.minWholesaleQuantity && (
                                  <div className="flex items-center gap-1 text-xs text-green-800 mt-2 bg-green-50 border border-green-200 rounded px-2 py-1 w-fit font-semibold">
                                    <span className="text-base">⬆️</span> Add <span className="font-bold">{item.minWholesaleQuantity - item.cartQuantity}</span> more for <span className="text-green-700">wholesale</span> discount
                                  </div>
                                )}
                                {item.minSuperWholesaleQuantity && item.superDiscount && item.cartQuantity < item.minSuperWholesaleQuantity && (
                                  <div className="flex items-center gap-1 text-xs text-purple-800 mt-2 bg-purple-50 border border-purple-200 rounded px-2 py-1 w-fit font-semibold">
                                    <span className="text-base">⬆️</span> Add <span className="font-bold">{item.minSuperWholesaleQuantity - item.cartQuantity}</span> more for <span className="text-purple-700">super wholesale</span> discount
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg mb-2">₹{item.price.toFixed(2)}</p>
                                <button
                                  onClick={() => removeFromCart(item._id || item.id || '')}
                                  className="text-red-500 hover:text-red-700 font-bold text-2xl mt-1 hover:bg-red-100 px-2 py-1 rounded transition"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* Quantity Controls and Breakdown */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-3 w-fit border-2 border-gray-300">
                                <button
                                  onClick={() => updateQuantity(item._id || item.id || '', item.cartQuantity - 1)}
                                  className="px-4 py-2 bg-white border border-gray-400 rounded hover:bg-gray-50 font-bold text-base text-black transition"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={item.cartQuantity}
                                  onChange={(e) =>
                                    updateQuantity(item._id || item.id || '', parseInt(e.target.value) || 1)
                                  }
                                  className="w-16 text-center border-2 border-gray-400 rounded px-2 py-2 font-bold text-base bg-white text-black"
                                />
                                <button
                                  onClick={() => updateQuantity(item._id || item.id || '', item.cartQuantity + 1)}
                                  className="px-4 py-2 bg-white border border-gray-400 rounded hover:bg-gray-50 font-bold text-base text-black transition"
                                >
                                  +
                                </button>
                              </div>

                              {/* Price Breakdown */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2 text-sm flex-1 border-2 border-blue-300">
                                <div className="flex justify-between font-bold text-gray-800">
                                  <span>Subtotal:</span>
                                  <span className="text-indigo-600">₹{(item.price * item.cartQuantity).toFixed(2)}</span>
                                </div>
                                
                                {/* Discount Editor */}
                                <div className="flex justify-between items-center bg-white rounded-lg p-2.5 border-2 border-green-300">
                                  <label className="text-gray-800 flex items-center gap-2 font-semibold">
                                    💰 Discount
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={item.customDiscount || 0}
                                      onChange={(e) =>
                                        updateDiscount(item._id || item.id || '', parseFloat(e.target.value) || 0)
                                      }
                                      className="w-14 text-center border-2 border-green-400 rounded px-2 py-1 font-bold text-base bg-white text-black"
                                    />
                                    <span className="text-gray-800 font-bold text-base">%</span>
                                  </div>
                                </div>

                                {(item.customDiscount || 0) > 0 && (
                                  <div className="flex justify-between text-red-700 font-bold bg-red-100 px-3 py-2 rounded-lg">
                                    <span>Discount:</span>
                                    <span>-₹{calculateDiscount(item).toFixed(2)}</span>
                                  </div>
                                )}
                                
                                <div className="border-t-2 border-blue-300 pt-2 flex justify-between font-bold text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                                  <span>Total:</span>
                                  <span>₹{calculateItemTotal(item).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer - Summary */}
              {cartItems.length > 0 && (
                <div className="border-t-4 border-gray-400 bg-white p-4 shrink-0 shadow-lg">
                  <div className="max-w-7xl mx-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-3.5 border-2 border-gray-400">
                        <p className="text-sm text-gray-700 font-bold mb-2">Subtotal</p>
                        <p className="text-2xl font-bold text-gray-900">₹{cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3.5 border-2 border-red-400">
                        <p className="text-sm text-red-700 font-bold mb-2">Total Discount</p>
                        <p className="text-2xl font-bold text-red-700">-₹{(cartItems.reduce((sum, item) => sum + calculateDiscount(item), 0)).toFixed(2)}</p>
                      </div>
                      <div className="bg-linear-to-br from-green-500 to-emerald-700 rounded-lg p-3.5 text-white shadow-lg border-2 border-emerald-800">
                        <p className="text-sm font-bold mb-2 text-white drop-shadow">Final Amount</p>
                        <p className="text-2xl font-bold drop-shadow">₹{cartTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={processSale}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 bg-linear-to-r from-green-600 to-emerald-700 text-white rounded-lg font-bold text-base hover:from-green-700 hover:to-emerald-800 transition disabled:opacity-50 shadow-md"
                      >
                        {isProcessing ? '⏳ Processing...' : '✅ Complete Sale'}
                      </button>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="flex-1 py-3 px-4 bg-blue-100 text-blue-800 rounded-lg font-bold text-base hover:bg-blue-200 transition border-2 border-blue-400"
                      >
                        ← Continue Shopping
                      </button>
                      <button
                        onClick={() => setCartItems([])}
                        className="flex-1 py-3 px-4 bg-red-100 text-red-800 rounded-lg font-bold text-base hover:bg-red-200 transition border-2 border-red-400"
                      >
                        🗑️ Clear Cart
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Details Modal */}
          {selectedProduct && (
            (() => {
              console.log('📦 Selected Product:', selectedProduct);
              return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Close Button */}
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-2xl text-gray-500 hover:text-gray-700 font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Images Gallery */}
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-600 mb-3 uppercase">Product Images</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedProduct.images.map((image, index) => (
                          <div 
                            key={index} 
                            className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <img
                              src={image}
                              alt={`${selectedProduct.name} - Image ${index + 1}`}
                              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedProduct.image ? (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-600 mb-3 uppercase">Product Image</p>
                      <div 
                        className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImageIndex(0)}
                      >
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-gray-200 rounded-lg p-16 flex items-center justify-center text-6xl">
                      📦
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500 uppercase font-semibold">Supplier</p>
                        <p className="text-lg font-bold text-gray-900">
                          {typeof selectedProduct.createdBy === 'object' && selectedProduct.createdBy 
                            ? (selectedProduct.createdBy.shopName || selectedProduct.createdBy.name || 'Unknown')
                            : 'Unknown Supplier'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
                          selectedProduct.quantity > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedProduct.quantity > 0 ? `${selectedProduct.quantity} in Stock` : 'Out of Stock'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Category</p>
                      <p className="text-lg text-gray-700">{selectedProduct.category}</p>
                    </div>

                    {selectedProduct.modelName && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Model</p>
                        <p className="text-lg text-gray-700 font-semibold">{selectedProduct.modelName}</p>
                      </div>
                    )}

                    {selectedProduct.description && selectedProduct.description.trim() ? (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Description</p>
                        <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                      </div>
                    ) : null}

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Base Price</p>
                      <p className="text-3xl font-bold text-indigo-600">₹{selectedProduct.price.toFixed(2)}</p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 uppercase font-semibold mb-3">Discount Tiers</p>
                      <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-blue-900 font-semibold">🛍️ Retail: {selectedProduct.retailDiscount || 0}%</p>
                          {selectedProduct.minRetailQuantity && <p className="text-sm text-blue-700">Minimum: {selectedProduct.minRetailQuantity} units</p>}
                          <p className="text-sm text-blue-700 font-bold">Price: ₹{(selectedProduct.price * (1 - (selectedProduct.retailDiscount || 0) / 100)).toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <p className="text-green-900 font-semibold">🏪 Wholesale: {selectedProduct.discount || 0}%</p>
                          {selectedProduct.minWholesaleQuantity && <p className="text-sm text-green-700">Minimum: {selectedProduct.minWholesaleQuantity} units</p>}
                          <p className="text-sm text-green-700 font-bold">Price: ₹{(selectedProduct.price * (1 - (selectedProduct.discount || 0) / 100)).toFixed(2)}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded border border-amber-200">
                          <p className="text-amber-900 font-semibold">⭐ Super Wholesale: {selectedProduct.superDiscount || 0}%</p>
                          {selectedProduct.minSuperWholesaleQuantity && <p className="text-sm text-amber-700">Minimum: {selectedProduct.minSuperWholesaleQuantity} units</p>}
                          <p className="text-sm text-amber-700 font-bold">Price: ₹{(selectedProduct.price * (1 - (selectedProduct.superDiscount || 0) / 100)).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Close and Add to Cart Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={selectedProduct.quantity <= 0}
                      className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                        selectedProduct.quantity > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              </div>

              {/* Fullscreen Image Popup */}
              {selectedImageIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <button
                      onClick={() => setSelectedImageIndex(null)}
                      className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-[61]"
                    >
                      ✕
                    </button>

                    {/* Main Image */}
                    <img
                      src={selectedProduct.images?.[selectedImageIndex] || selectedProduct.image}
                      alt={`${selectedProduct.name} - Full size`}
                      className="max-w-4xl max-h-[90vh] object-contain"
                    />

                    {/* Navigation Arrows */}
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === 0 ? selectedProduct.images!.length - 1 : prev! - 1));
                          }}
                          className="absolute left-4 bg-white/20 hover:bg-white/40 text-white text-3xl p-3 rounded-full transition-colors"
                        >
                          ❮
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev === selectedProduct.images!.length - 1 ? 0 : prev! + 1));
                          }}
                          className="absolute right-4 bg-white/20 hover:bg-white/40 text-white text-3xl p-3 rounded-full transition-colors"
                        >
                          ❯
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {selectedImageIndex! + 1} / {selectedProduct.images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
    </UserHeader>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Product } from '@/lib/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Get existing cart from localStorage
    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];

    // Check if product already in cart
    const existingItem = cart.find((item: Product) => item._id === product._id);
    if (existingItem) {
      existingItem.cartQuantity = (existingItem.cartQuantity || 1) + quantity;
    } else {
      cart.push({ ...product, cartQuantity: quantity });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Show confirmation
    alert(`${product.name} added to cart!`);
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">📦</span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-4xl font-bold text-indigo-600">
                    ₹{product.price.toFixed(2)}
                  </p>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.quantity > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-green-600">✓</span>
                      <span className="text-lg text-green-600 font-medium">
                        In Stock ({product.quantity} available)
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg text-red-600 font-medium">Out of Stock</span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {product.category && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Category</h2>
                    <p className="text-gray-600">{product.category}</p>
                  </div>
                )}
              </div>

              {/* Action Section */}
              {product.quantity > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product.quantity, quantity + 1))
                        }
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

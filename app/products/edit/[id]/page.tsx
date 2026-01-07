'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
        setFormData({
          ...data,
          images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
        });
        setImagePreviews(Array.isArray(data.images) ? data.images : data.image ? [data.image] : []);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedData: any = {
      ...formData,
      [name]: name.includes('quantity') || name.includes('price') || name.includes('discount') || name.includes('threshold') ? 
        (value === '' ? '' : isNaN(Number(value)) ? value : Number(value)) : value,
    };

    // Auto-calculate prices based on discount percentage
    const basePrice = updatedData.price || 0;

    // Retail Tier auto-calculation
    if (name === 'retailDiscount') {
      const retailDiscount = Number(value) || 0;
      updatedData.retailPrice = basePrice * (1 - retailDiscount / 100);
    }

    // Wholesale Tier auto-calculation
    if (name === 'discount') {
      const wholesaleDiscount = Number(value) || 0;
      updatedData.wholesalePrice = basePrice * (1 - wholesaleDiscount / 100);
    }

    // Super Wholesale Tier auto-calculation
    if (name === 'superDiscount') {
      const superDiscount = Number(value) || 0;
      updatedData.superWholesalePrice = basePrice * (1 - superDiscount / 100);
    }

    // If base price changes, recalculate all tiered prices
    if (name === 'price') {
      const newBasePrice = Number(value) || 0;
      updatedData.retailPrice = newBasePrice * (1 - (updatedData.retailDiscount || 0) / 100);
      updatedData.wholesalePrice = newBasePrice * (1 - (updatedData.discount || 0) / 100);
      updatedData.superWholesalePrice = newBasePrice * (1 - (updatedData.superDiscount || 0) / 100);
    }

    setFormData(updatedData);
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // Only allow up to 5 images
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      setError('You can upload up to 5 images.');
      return;
    }
    setError('');
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((base64Images) => {
      const newImages = [...imagePreviews, ...base64Images].slice(0, 5);
      setImagePreviews(newImages);
      setFormData((prev: any) => ({
        ...prev,
        images: newImages,
        image: newImages[0] || '', // for backward compatibility
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const handleRemoveImage = (idx: number) => {
    const newImages = imagePreviews.filter((_, i) => i !== idx);
    setImagePreviews(newImages);
    setFormData((prev: any) => ({
      ...prev,
      images: newImages,
      image: newImages[0] || '',
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    if (imagePreviews.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, images: imagePreviews, image: imagePreviews[0] }),
      });

      if (!response.ok) throw new Error('Failed to update product');

      setProduct({ ...formData, images: imagePreviews, image: imagePreviews[0] });
      alert('Product updated successfully!');
      router.push('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || loading) {
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

  if (!product || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-red-600 font-bold">Product not found</p>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">✏️</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product details and pricing</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-indigo-200 p-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">📝 Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    list="categoryList"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                  <datalist id="categoryList">
                    <option value="Borosil" />
                    <option value="Jaypee Plus" />
                    <option value="Laopala" />
                    <option value="Pearlpet" />
                    <option value="Yera Glassware" />
                    <option value="Dreamz" />
                    <option value="Bergner" />
                    <option value="Borosil Lara" />
                  </datalist>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>

              {/* Image Upload (Multiple) */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">📸 Product Images (up to 5)</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    disabled={imagePreviews.length >= 5}
                  />
                  <p className="text-xs text-gray-600 mt-1">Upload up to 5 images. Drag to reorder (coming soon).</p>
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-3 flex-wrap mt-2">
                      {imagePreviews.map((img, idx) => (
                        <div key={idx} className="relative group w-24 h-24">
                          <img
                            src={img}
                            alt={`Product preview ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg border-2 border-blue-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-80 group-hover:opacity-100 transition"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4">📦 Inventory Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Quantity (Available) *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Stock Threshold</label>
                  <input
                    type="number"
                    name="stockThreshold"
                    value={formData.stockThreshold || 0}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-linear-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-4">💵 Base Price</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Base Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Retail Tier */}
            <div className="bg-linear-to-r from-blue-50 to-sky-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">🛍️ Retail Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Min Quantity</label>
                  <input
                    type="number"
                    name="minRetailQuantity"
                    value={formData.minRetailQuantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="retailDiscount"
                    value={formData.retailDiscount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    name="retailPrice"
                    value={formData.retailPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Wholesale Tier */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4">🏪 Wholesale Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                  <label className="block text-sm font-semibold text-green-900 mb-2">Min Quantity</label>
                  <input
                    type="number"
                    name="minWholesaleQuantity"
                    value={formData.minWholesaleQuantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                  <label className="block text-sm font-semibold text-green-900 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-green-100 p-4 rounded-lg border border-green-300">
                  <label className="block text-sm font-semibold text-green-900 mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    name="wholesalePrice"
                    value={formData.wholesalePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Super Wholesale Tier */}
            <div className="bg-linear-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-4">🏭 Super Wholesale Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <label className="block text-sm font-semibold text-amber-900 mb-2">Min Quantity</label>
                  <input
                    type="number"
                    name="minSuperWholesaleQuantity"
                    value={formData.minSuperWholesaleQuantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <label className="block text-sm font-semibold text-amber-900 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    name="superDiscount"
                    value={formData.superDiscount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <label className="block text-sm font-semibold text-amber-900 mb-2">Price (Rs.)</label>
                  <input
                    type="number"
                    name="superWholesalePrice"
                    value={formData.superWholesalePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent bg-white text-gray-900 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-8 border-t-2 border-gray-300">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <Link
                href="/products"
                className="px-8 py-3 bg-linear-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl inline-block"
              >
                ← Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

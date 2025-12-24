'use client';

import { useState, useCallback } from 'react';
import { Product } from '@/lib/types';

interface AddProductProps {
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
  onSuccess?: () => void;
}

export default function AddProductForm({ onAddProduct, onSuccess }: AddProductProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    stockThreshold: '',
    image: '',
    images: '',
    category: '',
    // Retail
    minRetailQuantity: '1',
    retailDiscount: '0',
    retailPrice: '',
    // Wholesale
    minWholesaleQuantity: '10',
    discount: '0',
    wholesalePrice: '',
    // Super Wholesale
    minSuperWholesaleQuantity: '50',
    superDiscount: '0',
    superWholesalePrice: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatePrices = useCallback(() => {
    const basePrice = parseFloat(formData.price) || 0;
    
    // Calculate retail price
    const retailDiscount = parseFloat(formData.retailDiscount) || 0;
    const calculatedRetailPrice = basePrice * (1 - retailDiscount / 100);
    
    // Calculate wholesale price
    const wholesaleDiscount = parseFloat(formData.discount) || 0;
    const calculatedWholesalePrice = basePrice * (1 - wholesaleDiscount / 100);
    
    // Calculate super wholesale price
    const superDiscount = parseFloat(formData.superDiscount) || 0;
    const calculatedSuperWholesalePrice = basePrice * (1 - superDiscount / 100);

    return {
      retailPrice: calculatedRetailPrice.toFixed(2),
      wholesalePrice: calculatedWholesalePrice.toFixed(2),
      superWholesalePrice: calculatedSuperWholesalePrice.toFixed(2),
    };
  }, [formData.price, formData.retailDiscount, formData.discount, formData.superDiscount]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const { name, price, quantity } = formData;

      if (!name.trim() || !price || !quantity) {
        setError('Please fill in all required fields (Name, Price, Quantity)');
        return;
      }

      setError('');
      setIsLoading(true);

      try {
        const calculatedPrices = calculatePrices();
        
        // Convert uploaded files to base64
        const imageArray: string[] = [];
        for (const file of uploadedImages) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          imageArray.push(base64);
        }

        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            description: formData.description.trim(),
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            stockThreshold: formData.stockThreshold ? parseInt(formData.stockThreshold, 10) : 0,
            image: formData.image || '📦',
            images: imageArray,
            category: formData.category.trim(),
            // Retail
            minRetailQuantity: parseInt(formData.minRetailQuantity, 10),
            retailDiscount: parseFloat(formData.retailDiscount),
            retailPrice: parseFloat(calculatedPrices.retailPrice),
            // Wholesale
            minWholesaleQuantity: parseInt(formData.minWholesaleQuantity, 10),
            discount: parseFloat(formData.discount),
            wholesalePrice: parseFloat(calculatedPrices.wholesalePrice),
            // Super Wholesale
            minSuperWholesaleQuantity: parseInt(formData.minSuperWholesaleQuantity, 10),
            superDiscount: parseFloat(formData.superDiscount),
            superWholesalePrice: parseFloat(calculatedPrices.superWholesalePrice),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add product');
        }

        await response.json();
        setFormData({
          name: '',
          description: '',
          price: '',
          quantity: '',
          stockThreshold: '',
          image: '',
          images: '',
          category: '',
          minRetailQuantity: '1',
          retailDiscount: '0',
          retailPrice: '',
          minWholesaleQuantity: '10',
          discount: '0',
          wholesalePrice: '',
          minSuperWholesaleQuantity: '50',
          superDiscount: '0',
          superWholesalePrice: '',
        });
        setIsOpen(false);
        setUploadedImages([]);

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add product');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSuccess, calculatePrices, uploadedImages]
  );

  const prices = calculatePrices();

  return (
    <form onSubmit={handleSubmit} className="divide-y">
      {/* Form Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Details</h2>
        <p className="text-gray-600 text-sm">Fill in all the required fields marked with *</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="p-6 space-y-8 max-h-[calc(90vh-200px)] overflow-y-auto">
        {/* Basic Information Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Wireless Mouse Pro"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product features and benefits..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Type category or select from suggestions"
                list="categoryList"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
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
              <p className="text-xs text-gray-500 mt-1">Type custom category or use suggestions</p>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🖼️</span>
            <h3 className="text-lg font-bold text-gray-900">Product Images</h3>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="text-center">
                <div className="text-4xl mb-2">📤</div>
                <p className="text-gray-700 font-medium">Click to upload images or drag & drop</p>
                <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB each</p>
              </div>
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                📸 Uploaded Images ({uploadedImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform scale-0 group-hover:scale-100"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📦</span>
            <h3 className="text-lg font-bold text-gray-900">Inventory</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Threshold
              </label>
              <input
                type="number"
                name="stockThreshold"
                value={formData.stockThreshold || ''}
                onChange={handleChange}
                placeholder="Alert when stock falls below this"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">Admin & Employee will be alerted when stock reaches this level</p>
            </div>
          </div>
        </div>

        {/* Base Price Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💵</span>
            <h3 className="text-lg font-bold text-gray-900">Base Price</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">This is the original price before discounts</p>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🎯</span>
            <h3 className="text-lg font-bold text-gray-900">Pricing Tiers</h3>
          </div>

          {/* Retail Tier */}
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <h4 className="text-md font-bold text-green-900 mb-4 flex items-center gap-2">
              🛍️ Retail Tier
              <span className="text-sm font-normal text-green-800">(1-9 units)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  Min Quantity
                </label>
                <input
                  type="number"
                  name="minRetailQuantity"
                  value={formData.minRetailQuantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="retailDiscount"
                  value={formData.retailDiscount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">
                  Final Price
                </label>
                <div className="w-full px-3 py-2 border-2 border-green-500 rounded-lg bg-green-100 text-green-900 font-bold text-lg">
                  ${prices.retailPrice}
                </div>
              </div>
            </div>
          </div>

          {/* Wholesale Tier */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <h4 className="text-md font-bold text-blue-900 mb-4 flex items-center gap-2">
              🏪 Wholesale Tier
              <span className="text-sm font-normal text-blue-800">(10-49 units)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Min Quantity
                </label>
                <input
                  type="number"
                  name="minWholesaleQuantity"
                  value={formData.minWholesaleQuantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Final Price
                </label>
                <div className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg bg-blue-100 text-blue-900 font-bold text-lg">
                  ${prices.wholesalePrice}
                </div>
              </div>
            </div>
          </div>

          {/* Super Wholesale Tier */}
          <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
            <h4 className="text-md font-bold text-purple-900 mb-4 flex items-center gap-2">
              🏭 Super Wholesale Tier
              <span className="text-sm font-normal text-purple-800">(50+ units)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  Min Quantity
                </label>
                <input
                  type="number"
                  name="minSuperWholesaleQuantity"
                  value={formData.minSuperWholesaleQuantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="superDiscount"
                  value={formData.superDiscount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">
                  Final Price
                </label>
                <div className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg bg-purple-100 text-purple-900 font-bold text-lg">
                  ${prices.superWholesalePrice}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Footer */}
      <div className="p-6 bg-gray-50 flex gap-3 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Adding Product...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ✓ Add Product
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              price: '',
              quantity: '',
              stock: '',
              image: '',
              images: '',
              category: '',
              minRetailQuantity: '1',
              retailDiscount: '0',
              retailPrice: '',
              minWholesaleQuantity: '10',
              discount: '0',
              wholesalePrice: '',
              minSuperWholesaleQuantity: '50',
              superDiscount: '0',
              superWholesalePrice: '',
            });
            setUploadedImages([]);
            setError('');
          }}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition"
        >
          ↻ Clear Form
        </button>
      </div>
    </form>
  );
}


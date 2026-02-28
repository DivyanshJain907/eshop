'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    role: 'customer' as 'customer' | 'employee' | 'admin',
    registrationKey: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Allow only numbers for phone field
    if (name === 'phone' && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Validate phone number (exactly 10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    if (!formData.street.trim()) {
      setError('Please enter your street address');
      return;
    }
    
    if (!formData.city.trim()) {
      setError('Please enter your city');
      return;
    }
    
    if (!formData.state.trim()) {
      setError('Please enter your state');
      return;
    }
    
    if (!formData.pincode.trim()) {
      setError('Please enter your pincode');
      return;
    }

    // Validate pincode (exactly 6 digits)
    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Pincode must be exactly 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          shopName: formData.shopName || undefined,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          registrationKey: formData.registrationKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Registration successful - redirect to dashboard
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        role: 'customer',
        registrationKey: '',
      });

      // Refresh auth context and redirect
      await refreshAuth();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 flex items-start sm:items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4 sm:p-8">
        <div className="text-center mb-5 sm:mb-8">
          <img src="/jsclogo.png" alt="JSC" className="w-12 h-12 sm:w-16 sm:h-16 object-contain mx-auto mb-2 sm:mb-3" />
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Jain Sales Corporation</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">
                  Phone Number * <span className="text-gray-400">(10 digits)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  pattern="\d{10}"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label htmlFor="shopName" className="block text-xs font-medium text-gray-600 mb-1">
                  Shop Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="My Shop"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Security</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Address</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="street" className="block text-xs font-medium text-gray-600 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label htmlFor="city" className="block text-xs font-medium text-gray-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-gray-600 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-xs font-medium text-gray-600 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    pattern="\d{6}"
                    inputMode="numeric"
                    required
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                    placeholder="263153"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

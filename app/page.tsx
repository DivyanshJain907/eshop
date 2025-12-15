'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect authenticated users to their respective dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'employee') {
        router.push('/dashboard');
      } else {
        router.push('/home');
      }
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect (handled in useEffect above)
  if (isAuthenticated) {
    return null;
  }

  // Landing Page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900">eShop</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-6 py-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="grow flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                  Your Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">eShop</span>
                </h2>
                <p className="text-xl text-gray-600">
                  Discover amazing products, manage your inventory efficiently, and grow your business with eShop's powerful tools.
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full">✓</span>
                  <span className="text-gray-700">Browse thousands of products</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full">✓</span>
                  <span className="text-gray-700">24-hour booking and reservation system</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full">✓</span>
                  <span className="text-gray-700">Track your orders in real-time</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-full">✓</span>
                  <span className="text-gray-700">Secure and reliable transactions</span>
                </li>
              </ul>

              {/* CTA Buttons */}
              <div className="flex gap-4 pt-4">
                <Link href="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">
                  Get Started
                </Link>
                <Link href="/login" className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="hidden md:block">
              <div className="relative w-full h-96 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-8xl mb-4">📦</div>
                  <p className="text-2xl font-bold text-indigo-900">Ready to Shop?</p>
                </div>
                <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-30"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose eShop?</h3>
            <p className="text-xl text-gray-600">Everything you need for a seamless shopping experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🛍️</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Wide Selection</h4>
              <p className="text-gray-600">
                Browse through our extensive catalog of quality products from trusted sellers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">⏰</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">24-Hour Lock System</h4>
              <p className="text-gray-600">
                Book your products with our innovative 24-hour reservation system for guaranteed availability.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Secure & Safe</h4>
              <p className="text-gray-600">
                Your transactions are protected with industry-leading security standards and encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <p className="text-indigo-100">Products Available</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <p className="text-indigo-100">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100K+</div>
              <p className="text-indigo-100">Orders Completed</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-indigo-100">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">Ready to Start Shopping?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers and discover amazing products today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl text-lg">
              Create Your Account
            </Link>
            <Link href="/login" className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-colors text-lg">
              Already Have an Account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🛒</span> eShop
              </h3>
              <p className="text-sm text-gray-400">
                Your trusted online shopping destination for quality products and excellent customer service.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Browse Products</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/support/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/support/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/support/shipping" className="text-gray-400 hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/support/returns" className="text-gray-400 hover:text-white transition-colors">Returns</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 jainsalescorporationrudrapur@google.com</li>
                <li>📞 774-483-5784</li>
                <li>📍 Preet-Vihar colony, Rudrapur, Uttarakhand</li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                © 2025 eShop. All rights reserved.
              </p>
              <div className="flex gap-4 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

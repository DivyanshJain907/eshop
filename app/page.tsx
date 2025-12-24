'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
      {/* Navigation */}
      <Navbar isAuthenticated={false} />

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Desktop Grid Layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🛒</span> eShop
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your trusted online shopping destination for quality products and excellent customer service.
              </p>
              <div className="mt-4 flex gap-4">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5-3 9"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="gray"/><circle cx="17.5" cy="6.5" r="1.5" fill="gray"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>→</span> Home
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>→</span> Browse Products
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>→</span> Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/support/contact" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>📧</span> Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/support/faq" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>❓</span> FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support/shipping" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>🚚</span> Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/support/returns" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span>↩️</span> Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:jainsalescorporationrudrapur@gmail.com" className="hover:text-white transition-colors break-all">
                    jainsalescorporationrudrapur@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+917744835784" className="hover:text-white transition-colors">
                    +91 774-483-5784
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">📍</span>
                  <span>Preet-Vihar colony, Rudrapur, Uttarakhand</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Accordion Layout */}
          <div className="md:hidden space-y-4 mb-8">
            {/* About Mobile */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                className="w-full px-4 py-3 bg-gray-800 text-white font-bold flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🛒</span> eShop
                </span>
                <span className={`transform transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'about' && (
                <div className="px-4 py-3 bg-gray-800/50 text-sm text-gray-400">
                  <p className="mb-3">Your trusted online shopping destination for quality products and excellent customer service.</p>
                  <div className="flex gap-4">
                    <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/></svg>
                    </a>
                    <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5-3 9"/></svg>
                    </a>
                    <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="gray"/><circle cx="17.5" cy="6.5" r="1.5" fill="gray"/></svg>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links Mobile */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'quick' ? null : 'quick')}
                className="w-full px-4 py-3 bg-gray-800 text-white font-bold flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                Quick Links
                <span className={`transform transition-transform ${expandedSection === 'quick' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'quick' && (
                <div className="px-4 py-3 bg-gray-800/50 text-sm">
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>→</span> Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>→</span> Browse Products
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>→</span> Sign Up
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Support Mobile */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'support' ? null : 'support')}
                className="w-full px-4 py-3 bg-gray-800 text-white font-bold flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                Support
                <span className={`transform transition-transform ${expandedSection === 'support' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'support' && (
                <div className="px-4 py-3 bg-gray-800/50 text-sm">
                  <ul className="space-y-2">
                    <li>
                      <Link href="/support/contact" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>📧</span> Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/support/faq" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>❓</span> FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/support/shipping" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>🚚</span> Shipping Info
                      </Link>
                    </li>
                    <li>
                      <Link href="/support/returns" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>↩️</span> Returns
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Contact Mobile */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'contact' ? null : 'contact')}
                className="w-full px-4 py-3 bg-gray-800 text-white font-bold flex items-center justify-between hover:bg-gray-700 transition-colors"
              >
                Contact Info
                <span className={`transform transition-transform ${expandedSection === 'contact' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'contact' && (
                <div className="px-4 py-3 bg-gray-800/50 text-sm text-gray-400 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">✉️</span>
                    <a href="mailto:jainsalescorporationrudrapur@gmail.com" className="hover:text-white transition-colors break-all">
                      jainsalescorporationrudrapur@gmail.com
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">📞</span>
                    <a href="tel:+917744835784" className="hover:text-white transition-colors">
                      +91 774-483-5784
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">📍</span>
                    <span>Preet-Vihar colony, Rudrapur, Uttarakhand</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs md:text-sm text-gray-400">
                © 2025 eShop. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-400 justify-center md:justify-end">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="text-gray-700">•</span>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="text-gray-700">•</span>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

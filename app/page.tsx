'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Product } from '@/lib/types';

interface Category {
  name: string;
  productCount: number;
  icon: string;
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect authenticated users to their respective dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'employee') {
        router.push('/dashboard');
      } else {
        router.push('/products-browse');
      }
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  // Fetch featured products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await fetch('/api/products?limit=4');
        if (productsRes.ok) {
          const data = await productsRes.json();
          // Handle both array and nested structure responses
          const productsList = Array.isArray(data) ? data : (data.products || []);
          // Filter out 0 price products and get first 4
          const validProducts = productsList.filter((p: Product) => (p.retailPrice || p.price || 0) > 0).slice(0, 4);
          setProducts(validProducts);
        }

        // Fetch all products to count categories
        const allProductsRes = await fetch('/api/products');
        if (allProductsRes.ok) {
          const allData = await allProductsRes.json();
          const allProducts: Product[] = Array.isArray(allData) ? allData : (allData.products || []);
          
          // Group by category and count
          const categoryMap = new Map<string, number>();
          allProducts.forEach((product) => {
            if (product.category) {
              categoryMap.set(product.category, (categoryMap.get(product.category) || 0) + 1);
            }
          });

          // Get top 4 categories
          const topCategories = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({
              name,
              productCount: count,
              icon: ['📱', '💻', '⌚', '🎧', '📷', '🖨️', '⌨️', '🖱️'][Math.floor(Math.random() * 8)],
            }));

          setCategories(topCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && !isAuthenticated) {
      fetchData();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <Navbar isAuthenticated={false} />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium">
            <span>🛍️</span> Welcome to Jain Sales Corporation
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Shop the Best <span className="text-blue-600">Products</span> Online
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Discover quality products at great prices. Your one-stop shop for all your everyday needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/login')} 
              className="px-8 py-3.5 bg-blue-600 text-white font-semibold text-base rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
            >
              Browse Products
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold text-base rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all bg-white"
            >
              Create Account
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-gray-400">
            <div className="flex items-center gap-2"><span className="text-green-500 text-lg">✓</span> Free Shipping</div>
            <div className="flex items-center gap-2"><span className="text-green-500 text-lg">✓</span> Secure Payments</div>
            <div className="flex items-center gap-2"><span className="text-green-500 text-lg">✓</span> Quality Products</div>
            <div className="flex items-center gap-2"><span className="text-green-500 text-lg">✓</span> 24/7 Support</div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Featured</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">Popular Products</h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">Check out our best-selling products loved by customers</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <button
                  key={product._id || product.id}
                  onClick={() => router.push('/login')}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 text-left"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-4xl opacity-20">📦</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <p className="text-blue-600 text-xs font-semibold tracking-wide uppercase mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
                    
                    {/* Price */}
                    <div className="flex gap-2 items-baseline mb-2">
                      <span className="text-xl font-bold text-gray-900">₹{product.retailPrice}</span>
                      {product.wholesalePrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.wholesalePrice}</span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="text-xs mb-3">
                      <span className={product.quantity > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    {/* CTA */}
                    <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors flex items-center gap-1">
                      View Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
            </>
          )}

          {/* View More */}
          <div className="text-center mt-10">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm"
            >
              View All Products →
            </button>
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Categories</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">Shop by Category</h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">Browse our wide range of product categories</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => router.push('/login')}
                  className="group bg-white border border-gray-200 rounded-xl py-5 px-3 sm:p-6 hover:shadow-lg hover:border-blue-300 active:scale-95 transition-all duration-200 flex flex-col items-center sm:items-start justify-center"
                >
                  <h3 className="text-sm sm:text-lg font-semibold sm:font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-center sm:text-left leading-tight">{category.name}</h3>
                  <p className="hidden sm:block text-gray-500 mb-4 text-sm mt-1">{category.productCount} products</p>
                  <span className="hidden sm:flex text-blue-600 font-semibold text-sm items-center gap-1">
                    Browse <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Shopping?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Create an account today and get access to exclusive deals, easy ordering, and fast delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/login')} 
              className="px-8 py-3.5 bg-white text-blue-600 font-semibold text-base rounded-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="px-8 py-3.5 border-2 border-white text-white font-semibold text-base rounded-lg hover:bg-white/10 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-600 mt-auto border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Desktop Grid Layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🛒</span> Jain Sales Corporation
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your trusted online shopping destination for quality products and excellent customer service.
              </p>
              <div className="mt-4 flex gap-4">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5-3 9"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="gray"/><circle cx="17.5" cy="6.5" r="1.5" fill="gray"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>→</span> Home
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>→</span> Browse Products
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>→</span> Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/support/contact" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>📧</span> Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/support/faq" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>❓</span> FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support/shipping" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>🚚</span> Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/support/returns" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span>↩️</span> Returns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-gray-900 font-bold text-lg mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">✉️</span>
                  <a href="mailto:jainsalescorporationrudrapur@gmail.com" className="hover:text-blue-600 transition-colors break-all">
                    jainsalescorporationrudrapur@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">📞</span>
                  <a href="tel:+917744835784" className="hover:text-blue-600 transition-colors">
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
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'about' ? null : 'about')}
                className="w-full px-4 py-3 bg-white text-gray-900 font-bold flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🛒</span> Jain Sales Corporation
                </span>
                <span className={`transform transition-transform ${expandedSection === 'about' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'about' && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500">
                  <p className="mb-3">Your trusted online shopping destination for quality products and excellent customer service.</p>
                  <div className="flex gap-4">
                    <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/></svg>
                    </a>
                    <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5-3 9"/></svg>
                    </a>
                    <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="gray"/><circle cx="17.5" cy="6.5" r="1.5" fill="gray"/></svg>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links Mobile */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'quick' ? null : 'quick')}
                className="w-full px-4 py-3 bg-white text-gray-900 font-bold flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                Quick Links
                <span className={`transform transition-transform ${expandedSection === 'quick' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'quick' && (
                <div className="px-4 py-3 bg-gray-50 text-sm">
                  <ul className="space-y-2">
                    <li>
                      <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>→</span> Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>→</span> Browse Products
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>→</span> Sign Up
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Support Mobile */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'support' ? null : 'support')}
                className="w-full px-4 py-3 bg-white text-gray-900 font-bold flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                Support
                <span className={`transform transition-transform ${expandedSection === 'support' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'support' && (
                <div className="px-4 py-3 bg-gray-50 text-sm">
                  <ul className="space-y-2">
                    <li>
                      <Link href="/support/contact" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>📧</span> Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/support/faq" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>❓</span> FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/support/shipping" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>🚚</span> Shipping Info
                      </Link>
                    </li>
                    <li>
                      <Link href="/support/returns" className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                        <span>↩️</span> Returns
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Contact Mobile */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'contact' ? null : 'contact')}
                className="w-full px-4 py-3 bg-white text-gray-900 font-bold flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                Contact Info
                <span className={`transform transition-transform ${expandedSection === 'contact' ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSection === 'contact' && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">✉️</span>
                    <a href="mailto:jainsalescorporationrudrapur@gmail.com" className="hover:text-blue-600 transition-colors break-all">
                      jainsalescorporationrudrapur@gmail.com
                    </a>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">📞</span>
                    <a href="tel:+917744835784" className="hover:text-blue-600 transition-colors">
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
          <div className="border-t border-gray-200 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs md:text-sm text-gray-500">
                © 2025 Jain Sales Corporation. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-500 justify-center md:justify-end">
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                <span className="text-gray-300">•</span>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                <span className="text-gray-300">•</span>
                <a href="#" className="hover:text-blue-600 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


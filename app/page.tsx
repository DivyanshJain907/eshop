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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-blue-50">
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navigation */}
      <Navbar isAuthenticated={false} />

      {/* Luxury Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, rgba(212,175,55,0.03) 0%, rgba(212,175,55,0) 100%)`
        }}></div>
        
        {/* Luxury decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Luxury badge */}
          <div className="mb-8 inline-block">
            <span className="text-yellow-500 text-sm font-serif tracking-widest uppercase">✨ Premium Collection</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Experience <span className="text-yellow-500">Luxury</span> Shopping
          </h1>
          <p className="text-2xl text-gray-300 mb-12 font-light max-w-2xl mx-auto">
            Curated selection of premium products. Elevate your lifestyle with Jain Sales Corporation
          </p>

          <div className="flex gap-6 justify-center">
            <button 
              onClick={() => router.push('/login')} 
              className="px-10 py-4 bg-yellow-500 text-black font-serif font-bold text-lg rounded-sm hover:bg-yellow-400 transition-all shadow-2xl hover:shadow-yellow-500/50 uppercase tracking-wider"
            >
              Explore Collection
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="px-10 py-4 border-2 border-yellow-500 text-yellow-500 font-serif font-bold text-lg rounded-sm hover:bg-yellow-500/10 transition-all uppercase tracking-wider"
            >
              Become a Member
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-black border-t border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-sm font-serif tracking-widest uppercase">Curated Selection</span>
            <h2 className="text-5xl font-serif font-bold text-white mt-4 mb-3">Signature Products</h2>
            <p className="text-gray-400 text-lg">Handpicked premium selections</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-500/30 border-t-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <button
                  key={product._id || product.id}
                  onClick={() => router.push('/login')}
                  className="group relative bg-gray-900 border border-yellow-500/20 overflow-hidden hover:border-yellow-500/60 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative w-full h-56 bg-gray-800 flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="text-5xl opacity-30">✨</div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 bg-gradient-to-b from-gray-900 to-black">
                    <p className="text-yellow-500 text-xs font-serif tracking-widest uppercase mb-2">{product.category}</p>
                    <h3 className="font-serif font-bold text-white mb-3 text-lg group-hover:text-yellow-500 transition-colors">{product.name}</h3>
                    
                    {/* Price */}
                    <div className="flex gap-3 items-baseline mb-4 border-t border-yellow-500/20 pt-3">
                      <span className="text-2xl font-serif text-yellow-500 font-bold">₹{product.retailPrice}</span>
                      {product.wholesalePrice && (
                        <span className="text-sm text-gray-500 line-through">₹{product.wholesalePrice}</span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="text-sm text-gray-400 mb-4">
                      <span className={product.quantity > 0 ? 'text-green-400' : 'text-red-400'}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    {/* CTA */}
                    <span className="text-yellow-500 font-serif font-bold text-sm uppercase tracking-wider group-hover:text-white transition-colors">View Details →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black border-t border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-yellow-500 text-sm font-serif tracking-widest uppercase">Shop</span>
            <h2 className="text-5xl font-serif font-bold text-white mt-4 mb-3">Premium Categories</h2>
            <p className="text-gray-400 text-lg">Browse our exclusive collections</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-500/30 border-t-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => router.push('/login')}
                  className="group relative bg-gradient-to-br from-gray-900 to-gray-950 border border-yellow-500/20 p-8 hover:border-yellow-500/60 transition-all duration-300 overflow-hidden"
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative">
                    <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-yellow-500 transition-colors">{category.name}</h3>
                    <p className="text-gray-400 mb-6 text-lg font-light">{category.productCount} <span className="text-yellow-500">items</span></p>
                    <span className="text-yellow-500 font-serif font-bold text-sm uppercase tracking-wider group-hover:text-white transition-colors">Browse Collection →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden border-t border-yellow-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-full blur-3xl transform -translate-x-1/2"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">Join the Elite</h2>
          <p className="text-xl text-gray-300 mb-12 font-light">
            Gain exclusive access to premium products and special member benefits
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => router.push('/login')} 
              className="px-10 py-4 bg-yellow-500 text-black font-serif font-bold text-lg rounded-sm hover:bg-yellow-400 transition-all shadow-2xl hover:shadow-yellow-500/50 uppercase tracking-wider"
            >
              Start Exploring
            </button>
            <button 
              onClick={() => router.push('/register')} 
              className="px-10 py-4 border-2 border-yellow-500 text-yellow-500 font-serif font-bold text-lg rounded-sm hover:bg-yellow-500/10 transition-all uppercase tracking-wider"
            >
              Create Account
            </button>
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
                <span className="text-2xl">🛒</span> Jain Sales Corporation
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
                  <span className="text-lg">🛒</span> Jain Sales Corporation
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
                © 2025 Jain Sales Corporation. All rights reserved.
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


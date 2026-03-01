'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

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
        const productsRes = await fetch('/api/products?limit=6');
        if (productsRes.ok) {
          const data = await productsRes.json();
          // Handle both array and nested structure responses
          const productsList = Array.isArray(data) ? data : (data.products || []);
          // Filter out 0 price products and get first 4
          const validProducts = productsList.filter((p: Product) => (p.retailPrice || p.price || 0) > 0).slice(0, 6);
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
            .slice(0, 6)
            .map(([name, count]) => ({ name, productCount: count, icon: '' }));

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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  const allCategoryLabels = ['ALL', ...categories.map((c) => c.name.toUpperCase())];

  // Keyword → image map for category tiles
  const getCategoryImage = (name: string): string => {
    const n = name.toLowerCase().trim();
    // Brand-specific images from public folder
    if (n.includes('borosil larah') || n.includes('larah borosil')) return '/Larah.png';
    if (n.includes('borosil')) return '/Borosil.png';
    if (n.includes('jaypee plus') || n.includes('jaypee_plus')) return '/Jaypee_plus.png';
    if (n.includes('jaypee')) return '/Jaypee.png';
    if (n.includes('larah')) return '/Larah.png';
    // Generic keyword fallbacks
    if (n.includes('electron') || n.includes('mobile') || n.includes('phone') || n.includes('gadget'))
      return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80';
    if (n.includes('cloth') || n.includes('fashion') || n.includes('wear') || n.includes('shirt') || n.includes('apparel'))
      return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80';
    if (n.includes('kitchen') || n.includes('cook') || n.includes('utensil') || n.includes('vessel'))
      return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80';
    if (n.includes('home') || n.includes('household') || n.includes('furniture') || n.includes('decor'))
      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';
    if (n.includes('beauty') || n.includes('cosmetic') || n.includes('skin') || n.includes('care') || n.includes('personal'))
      return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80';
    if (n.includes('food') || n.includes('grocery') || n.includes('snack') || n.includes('beverage') || n.includes('drink'))
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80';
    if (n.includes('sport') || n.includes('fitness') || n.includes('gym') || n.includes('outdoor'))
      return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80';
    if (n.includes('toy') || n.includes('kid') || n.includes('child') || n.includes('baby'))
      return 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80';
    if (n.includes('stationer') || n.includes('book') || n.includes('office') || n.includes('school'))
      return 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80';
    if (n.includes('bag') || n.includes('luggage') || n.includes('travel') || n.includes('accessory') || n.includes('accessories'))
      return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
    if (n.includes('tool') || n.includes('hardware') || n.includes('electric'))
      return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80';
    if (n.includes('health') || n.includes('medicine') || n.includes('medical') || n.includes('pharma'))
      return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80';
    if (n.includes('water') || n.includes('bottle') || n.includes('container'))
      return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80';
    return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80';
  };

  const isBrandLogo = (name: string): boolean => {
    const n = name.toLowerCase().trim();
    return n.includes('borosil') || n.includes('jaypee') || n.includes('larah');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navigation */}
      <Navbar isAuthenticated={false} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-black overflow-hidden" style={{ minHeight: '88vh' }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center" style={{ minHeight: '88vh' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full py-20">
            <div>
              <p className="text-xs tracking-[0.3em] text-orange-400 uppercase font-semibold mb-4">
                Jain Sales Corporation — Rudrapur
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white uppercase leading-[0.9] mb-8">
                CRAFTING<br />
                BETTER<br />
                <span className="text-orange-400">EXPERIENCE</span><br />
                FOR YOU.
              </h1>
              <p className="text-gray-300 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
                Premium quality products at wholesale prices. Trusted by 1000+ customers in Uttarakhand.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="bg-orange-400 text-black font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-orange-300 transition-colors">
                  Shop Now →
                </Link>
                <Link href="/register" className="border border-white text-white font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-white hover:text-black transition-colors">
                  Create Account
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-end items-center">
              <div className="relative">
                <div className="w-72 h-80 bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                  <img
                    src="/hero-model.png"
                    alt="Products"
                    className="w-full h-full object-cover object-top opacity-90"
                  />
                </div>
                <div className="absolute -bottom-4 -left-6 bg-orange-400 text-black px-5 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider">New Arrivals</p>
                  <p className="text-xs text-black/70">Fresh stock available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/30"></div>
        </div>
      </section>

      {/* ── CATEGORY NAV STRIP ───────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {allCategoryLabels.map((label) => (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={`shrink-0 px-5 py-4 text-xs font-bold tracking-[0.2em] uppercase border-b-2 transition-all whitespace-nowrap ${
                  activeCategory === label
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-black hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS / PRODUCTS ──────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">— Featured Items —</p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-black tracking-tight">New Arrivals</h2>
            <p className="mt-4 text-gray-400 text-sm max-w-md mx-auto">
              View our wide product assortment. We offer everything from home essentials to accessories.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 aspect-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-100 w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-100 w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-100 w-1/4"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => {
                const price = product.retailPrice || product.price || 0;
                const mrp = product.mrp || product.price || 0;
                const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
                return (
                  <Link key={product._id?.toString()} href="/login" className="group block">
                    <div className="relative bg-gray-50 aspect-3/4 overflow-hidden mb-4">
                      {(product.images && product.images.length > 0) || product.image ? (
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-5xl opacity-30">📦</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-orange-400 text-black text-xs font-bold px-2 py-1 uppercase tracking-wider">
                          -{discount}%
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <span className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-2">
                          View Details
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category || 'Product'}</p>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wide leading-tight mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-black">₹{price.toFixed(2)}</span>
                      {discount > 0 && <span className="text-xs text-gray-400 line-through">₹{mrp.toFixed(2)}</span>}
                      {discount > 0 && (
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5">
                          {discount}% off
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-300 text-sm uppercase tracking-widest">
              Sign in to browse products
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/login" className="inline-block border border-black text-black text-xs font-bold tracking-[0.3em] uppercase px-10 py-4 hover:bg-black hover:text-white transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED BRANDS ──────────────────────────────────────────────── */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase text-center mb-8">Featured Brands</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { name: 'Borosil', file: '/Borosil.png' },
              { name: 'Jaypee', file: '/Jaypee.png' },
              { name: 'Jaypee Plus', file: '/Jaypee_plus.png' },
              { name: 'Larah', file: '/Larah.png' },
            ].map((brand) => (
              <Link
                key={brand.name}
                href="/login"
                className="group bg-white border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 p-6 sm:p-8"
              >
                <img
                  src={brand.file}
                  alt={brand.name}
                  className="h-16 sm:h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 group-hover:text-black transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTION BANNER (split) ────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[60vh]">
        <div className="relative overflow-hidden min-h-64 lg:min-h-auto">
          <img
            src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&q=80"
            alt="Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="bg-orange-400 flex flex-col items-start justify-center px-10 sm:px-16 py-16">
          <p className="text-xs tracking-[0.3em] text-black/50 uppercase mb-4">New Season</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase leading-tight mb-6">
            JSC<br />COLLECTION
          </h2>
          <p className="text-black/70 text-sm leading-relaxed mb-10 max-w-sm">
            Essentials that are anything but basic. Discover our curated range of premium products — from home essentials to the latest accessories.
          </p>
          <Link href="/register" className="bg-black text-white text-xs font-bold uppercase tracking-[0.25em] px-8 py-4 hover:bg-gray-900 transition-colors">
            Explore Now →
          </Link>
        </div>
      </section>

      {/* ── CATEGORIES COLLAGE ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">Categories</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-black leading-tight mb-8">
                ADJUST TO<br />
                YOUR EVERYDAY<br />
                <span className="text-orange-400">SHOPPING</span><br />
                NEEDS!
              </h2>
              <Link href="/login" className="inline-block bg-black text-white text-xs font-bold uppercase tracking-[0.25em] px-8 py-4 hover:bg-gray-800 transition-colors">
                Browse All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.length > 0 ? (
                categories.slice(0, 4).map((cat, i) => {
                  const heights = ['aspect-square', 'aspect-[4/5]', 'aspect-[4/5]', 'aspect-square'];
                  const isBrand = isBrandLogo(cat.name);
                  return (
                    <Link
                      key={cat.name}
                      href="/login"
                      className={`group relative ${heights[i]} overflow-hidden flex flex-col justify-end`}
                    >
                      {/* background */}
                      <div className={`absolute inset-0 ${isBrand ? 'bg-gray-50' : ''}`}>
                        <img
                          src={getCategoryImage(cat.name)}
                          alt={cat.name}
                          className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                            isBrand ? 'object-contain p-6' : 'object-cover'
                          }`}
                        />
                      </div>
                      {/* overlay */}
                      <div className={`absolute inset-0 ${isBrand ? 'bg-linear-to-t from-black/80 via-black/10 to-transparent' : 'bg-linear-to-t from-black/75 via-black/20 to-transparent'}`} />
                      {/* text */}
                      <div className="relative z-10 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-1">{cat.productCount} items</p>
                        <h3 className="text-sm sm:text-base font-black uppercase text-white leading-tight">{cat.name}</h3>
                        <span className="text-xs text-white/50 mt-1 group-hover:text-white transition-colors block">Browse →</span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                ['Home Essentials', 'Electronics', 'Accessories', 'Daily Needs'].map((name, i) => {
                  const heights = ['aspect-square', 'aspect-[4/5]', 'aspect-[4/5]', 'aspect-square'];
                  const isBrand = isBrandLogo(name);
                  return (
                    <Link
                      key={name}
                      href="/login"
                      className={`group relative ${heights[i]} overflow-hidden flex flex-col justify-end`}
                    >
                      <div className={`absolute inset-0 ${isBrand ? 'bg-gray-50' : ''}`}>
                        <img
                          src={getCategoryImage(name)}
                          alt={name}
                          className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                            isBrand ? 'object-contain p-6' : 'object-cover'
                          }`}
                        />
                      </div>
                      <div className={`absolute inset-0 ${isBrand ? 'bg-linear-to-t from-black/80 via-black/10 to-transparent' : 'bg-linear-to-t from-black/75 via-black/20 to-transparent'}`} />
                      <div className="relative z-10 p-5">
                        <h3 className="text-sm sm:text-base font-black uppercase text-white leading-tight">{name}</h3>
                        <span className="text-xs text-white/50 mt-1 group-hover:text-white transition-colors block">Browse →</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🚚', label: 'Free Delivery', sub: 'On orders above ₹500' },
              { icon: '🔒', label: 'Secure Payments', sub: 'Safe & encrypted' },
              { icon: '⭐', label: 'Top Quality', sub: 'Verified products' },
              { icon: '💬', label: '24/7 Support', sub: 'Always here for you' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-white text-xs font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-black border-t border-white/10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
            <div className="lg:max-w-xs">
              <div className="flex items-center gap-3 mb-4">
                <img src="/jsclogo.png" alt="JSC" className="w-10 h-10 object-contain invert" />
                <span className="text-white font-black text-lg uppercase tracking-widest">JSC</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Jain Sales Corporation — your trusted wholesale &amp; retail destination in Rudrapur, Uttarakhand.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" aria-label="Facebook" className="text-gray-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://wa.me/917744835784" aria-label="WhatsApp" className="text-gray-600 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-[0.25em] mb-5">Shop</h4>
                <ul className="space-y-3">
                  {[{ label: 'Home', href: '/' }, { label: 'Browse Products', href: '/login' }, { label: 'New Arrivals', href: '/login' }, { label: 'Categories', href: '/login' }].map((l) => (
                    <li key={l.label}><Link href={l.href} className="text-gray-500 hover:text-white text-sm transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-[0.25em] mb-5">Support</h4>
                <ul className="space-y-3">
                  {[{ label: 'Contact Us', href: '/support/contact' }, { label: 'FAQ', href: '/support/faq' }, { label: 'Shipping Info', href: '/support/shipping' }, { label: 'Returns', href: '/support/returns' }].map((l) => (
                    <li key={l.label}><Link href={l.href} className="text-gray-500 hover:text-white text-sm transition-colors">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-[0.25em] mb-5">Contact</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                  <li><a href="tel:+917744835784" className="hover:text-white transition-colors">+91 774-483-5784</a></li>
                  <li><a href="tel:+919412235537" className="hover:text-white transition-colors">+91 941-223-5537</a></li>
                  <li><a href="mailto:jainsalescorporationrudrapur@gmail.com" className="hover:text-white transition-colors break-all">jainsalescorporationrudrapur@gmail.com</a></li>
                  <li className="text-gray-600 leading-snug">Preet-Vihar colony,<br />Rudrapur, Uttarakhand</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs uppercase tracking-widest">© 2025 Jain Sales Corporation. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-600">
              <a href="#" className="hover:text-white transition-colors uppercase tracking-wider">Privacy</a>
              <a href="#" className="hover:text-white transition-colors uppercase tracking-wider">Terms</a>
              <a href="#" className="hover:text-white transition-colors uppercase tracking-wider">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}




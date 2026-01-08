'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
  userRole?: string;
  cartCount?: number;
  onLogout?: () => Promise<void>;
}

export default function Navbar({ isAuthenticated = false, userName, userRole, cartCount = 0, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Check if link is active
  const isActive = (href: string) => {
    if (href === '/products-browse' && pathname === '/products-browse') return true;
    if (href === '/products' && (pathname === '/products' || pathname.startsWith('/products/'))) return true;
    if (href === '/category' && pathname === '/category') return true;
    if (href === '/bookings' && pathname === '/bookings') return true;
    if (href === '/orders' && pathname === '/orders') return true;
    if (href === '/discounts' && pathname === '/discounts') return true;
    return false;
  };

  // Get active link styles
  const getLinkStyles = (href: string) => {
    const baseStyles = 'px-4 py-2 font-semibold transition-all rounded-lg duration-200';
    const activeStyles = 'bg-indigo-600 text-white shadow-md';
    const inactiveStyles = 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50';
    return isActive(href) ? `${baseStyles} ${activeStyles}` : `${baseStyles} ${inactiveStyles}`;
  };

  // Close menu when route changes
  const handleNavClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      if (onLogout) {
        await onLogout();
      } else {
        // Fallback logout
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsUserMenuOpen(false);
    }
  };

  // Avatar initials
  const avatar = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '👤';

  // Cart icon for /home page (optional, can be passed as prop if needed)
  // const cartCount = 0; // You can pass this as a prop if you want live count

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-black border-b border-yellow-500/20 ${isScrolled ? 'shadow-2xl shadow-black/50' : 'shadow-lg shadow-black/30'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-3xl transition-transform group-hover:scale-125 drop-shadow-lg">✨</div>
            <div className="hidden sm:block">
              <span className="text-lg font-serif font-bold text-yellow-500 tracking-wide">JAIN SALES</span>
              <p className="text-xs text-gray-400 font-light tracking-widest uppercase">Premium Collections</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 text-gray-300 font-serif font-medium hover:text-yellow-500 transition-colors rounded-sm hover:bg-yellow-500/5 uppercase tracking-wide text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-yellow-500 text-black rounded-sm font-serif font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/50 uppercase tracking-wide text-sm"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/products-browse"
                  className={getLinkStyles('/products-browse')}
                >
                  Products
                </Link>
                <Link
                  href="/category"
                  className={getLinkStyles('/category')}
                >
                  Categories
                </Link>
                {(userRole === 'admin' || userRole === 'employee') && (
                  <Link
                    href="/discounts"
                    className={getLinkStyles('/discounts')}
                  >
                    💰 Discounts
                  </Link>
                )}
                <Link
                  href="/bookings"
                  className={getLinkStyles('/bookings')}
                >
                  Bookings
                </Link>
                <Link
                  href="/orders"
                  className={getLinkStyles('/orders')}
                >
                  📦 Orders
                </Link>

                {/* Cart Icon for Customers */}
                {userRole === 'customer' && (
                  <Link
                    href="/products-browse?view=cart"
                    className={`relative px-4 py-2 font-semibold transition-all rounded-lg duration-200 flex items-center gap-2 ${
                      isActive('/products-browse')
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    🛒 Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <div className="ml-4 relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                  >
                    <span className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-200 to-cyan-200 flex items-center justify-center text-lg font-bold text-indigo-700 border-2 border-indigo-300 shadow">
                      {avatar}
                    </span>
                    <span className="text-base font-semibold text-gray-900">{userName}</span>
                    <span className={`text-xl transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-sm shadow-xl border border-yellow-500/30 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-yellow-500/20">
                        <p className="text-sm font-serif font-bold text-yellow-500">{userName}</p>
                        <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-serif font-bold disabled:opacity-50 border-t border-yellow-500/20 uppercase tracking-wide"
                      >
                        {isLoggingOut ? '⏳ Logging out...' : '🚪 Logout'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-sm hover:bg-yellow-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`h-0.5 bg-yellow-500 transition-all ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`h-0.5 bg-yellow-500 transition-all ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 bg-yellow-500 transition-all ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-gray-900 rounded-xl shadow-lg mt-2 border border-yellow-500/20">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full text-left px-4 py-2 text-gray-300 font-serif hover:text-yellow-500 hover:bg-yellow-500/5 rounded-sm transition-colors uppercase tracking-wide text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="w-full text-left px-4 py-2 bg-yellow-500 text-black rounded-sm font-serif font-bold hover:bg-yellow-400 transition-all uppercase tracking-wide text-sm"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                {userName && (
                  <div className="px-4 py-2 text-base text-yellow-500 font-serif font-bold bg-gray-800 rounded-sm flex items-center gap-2 border-b border-yellow-500/20">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-lg font-bold text-gray-900 border-2 border-yellow-500 shadow">{avatar}</span>
                    <div className="flex-1">
                      <div>{userName}</div>
                      <div className="text-xs text-gray-400 capitalize">{userRole}</div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleNavClick('/products-browse')}
                  className={`w-full text-left px-4 py-2 rounded-sm transition-colors duration-200 font-serif font-bold uppercase tracking-wide text-sm ${
                    isActive('/products-browse')
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'
                  }`}
                >
                  📦 Products
                </button>
                {(userRole === 'admin' || userRole === 'employee') && (
                  <button
                    onClick={() => handleNavClick('/products')}
                    className={`w-full text-left px-4 py-2 rounded-sm transition-colors duration-200 font-serif font-bold uppercase tracking-wide text-sm ${
                      isActive('/products')
                        ? 'bg-yellow-500 text-black'
                        : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'
                    }`}
                  >
                    ⚙️ Manage Products
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('/category')}
                  className={`w-full text-left px-4 py-2 rounded-sm transition-colors duration-200 font-serif font-bold uppercase tracking-wide text-sm ${
                    isActive('/category')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  🏷️ Categories
                </button>
                {(userRole === 'admin' || userRole === 'employee') && (
                  <button
                    onClick={() => handleNavClick('/discounts')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                      isActive('/discounts')
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    💰 Discounts
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('/bookings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                    isActive('/bookings')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  📅 Bookings
                </button>
                <button
                  onClick={() => handleNavClick('/orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                    isActive('/orders')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  📦 Orders
                </button>

                {/* Cart Button for Customers (Mobile) */}
                {userRole === 'customer' && (
                  <button
                    onClick={() => handleNavClick('/products-browse?view=cart')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold relative ${
                      isActive('/products-browse')
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>🛒 Cart</span>
                      {cartCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ml-2">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                  </button>
                )}

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold border-t border-gray-200 mt-2 disabled:opacity-50"
                >
                  {isLoggingOut ? '⏳ Logging out...' : '🚪 Logout'}
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

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
    if (href === '/home' && pathname === '/home') return true;
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
      className={`sticky top-0 z-50 transition-all duration-300 bg-white border-b border-gray-200 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-4xl transition-transform group-hover:scale-110 drop-shadow-lg">🛒</div>
            <span className="text-2xl font-extrabold bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tight hidden sm:block drop-shadow">Jain Sales Corp.</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/home"
                  className={getLinkStyles('/home')}
                >
                  Home
                </Link>
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 border-t border-gray-100"
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
            className="md:hidden p-2 rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`h-0.5 bg-gray-900 transition-all ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`h-0.5 bg-gray-900 transition-all ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 bg-gray-900 transition-all ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-white/90 rounded-xl shadow-lg mt-2 border border-gray-200">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full text-left px-4 py-2 text-gray-700 font-semibold hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="w-full text-left px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                {userName && (
                  <div className="px-4 py-2 text-base text-gray-900 font-semibold bg-indigo-50 rounded-lg flex items-center gap-2 border-b border-gray-200">
                    <span className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-200 to-cyan-200 flex items-center justify-center text-lg font-bold text-indigo-700 border-2 border-indigo-300 shadow">{avatar}</span>
                    <div className="flex-1">
                      <div>{userName}</div>
                      <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleNavClick('/home')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                    isActive('/home')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => handleNavClick('/products-browse')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                    isActive('/products-browse')
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  📦 Products
                </button>
                {(userRole === 'admin' || userRole === 'employee') && (
                  <button
                    onClick={() => handleNavClick('/products')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
                      isActive('/products')
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    ⚙️ Manage Products
                  </button>
                )}
                <button
                  onClick={() => handleNavClick('/category')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-semibold ${
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

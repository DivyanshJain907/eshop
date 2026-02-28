'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  // Cart icon for /products-browse page (optional, can be passed as prop if needed)
  // const cartCount = 0; // You can pass this as a prop if you want live count

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-white border-b border-gray-200 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center shrink-0 group">
            <Image src="/jsclogo.png" alt="JSC" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:scale-110" />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide mx-2 md:mx-6 flex-1 min-w-0 justify-start md:justify-center">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2 ml-auto">
                <Link
                  href="/login"
                  className="shrink-0 px-4 md:px-5 py-2 text-gray-600 font-medium hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 text-xs md:text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="shrink-0 px-4 md:px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm text-xs md:text-sm"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/products-browse"
                  className={`shrink-0 text-xs md:text-sm whitespace-nowrap ${getLinkStyles('/products-browse')}`}
                >
                  Products
                </Link>
                <Link
                  href="/category"
                  className={`shrink-0 text-xs md:text-sm whitespace-nowrap ${getLinkStyles('/category')}`}
                >
                  Categories
                </Link>
                {(userRole === 'admin' || userRole === 'employee') && (
                  <Link
                    href="/discounts"
                    className={`shrink-0 text-xs md:text-sm whitespace-nowrap ${getLinkStyles('/discounts')}`}
                  >
                    Discounts
                  </Link>
                )}
                {userRole === 'admin' || userRole === 'employee' ? (
                  <Link
                    href="/bookings"
                    className={`shrink-0 text-xs md:text-sm whitespace-nowrap ${getLinkStyles('/bookings')}`}
                  >
                    Bookings
                  </Link>
                ) : (
                  <Link
                    href="/my-bookings"
                    className={`shrink-0 text-xs md:text-sm whitespace-nowrap ${getLinkStyles('/my-bookings')}`}
                  >
                    My Bookings
                  </Link>
                )}
                <Link
                  href="/orders"
                  className={`shrink-0 text-xs md:text-sm whitespace-nowrap ${getLinkStyles('/orders')}`}
                >
                  Orders
                </Link>

                {/* Cart Icon for Customers */}
                {userRole === 'customer' && (
                  <Link
                    href="/products-browse?view=cart"
                    className={`shrink-0 relative px-3 md:px-4 py-2 font-semibold transition-all rounded-lg duration-200 flex items-center gap-1 md:gap-2 text-xs md:text-sm whitespace-nowrap ${
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
              </>
            )}
          </nav>

          {/* User Profile — right side, outside scrolling nav */}
          {isAuthenticated && (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 md:gap-2 pl-3 md:pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
              >
                <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-br from-indigo-200 to-cyan-200 flex items-center justify-center text-sm md:text-base font-bold text-indigo-700 border-2 border-indigo-300 shadow">
                  {avatar}
                </span>
                <span className="hidden md:inline text-sm font-semibold text-gray-900 max-w-[120px] truncate">{userName}</span>
                <span className={`text-xs md:text-sm text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isLoggingOut ? '⏳ Logging out...' : '🚪 Logout'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

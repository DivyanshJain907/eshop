'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export default function Navbar({ isAuthenticated = false, userName }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  const handleNavClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl transition-transform group-hover:scale-110">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">eShop</h1>
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
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/home"
                  className="px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Products
                </Link>
                <Link
                  href="/bookings"
                  className="px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Bookings
                </Link>
                <Link
                  href="/profile/edit"
                  className="px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Profile
                </Link>
                <div className="ml-2 pl-2 border-l border-gray-300">
                  <span className="text-sm text-gray-600 font-medium">👤 {userName}</span>
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <nav className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full text-left px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="w-full text-left px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                {userName && (
                  <div className="px-4 py-2 text-sm text-gray-600 font-medium bg-gray-50 rounded-lg">
                    👤 {userName}
                  </div>
                )}
                <button
                  onClick={() => handleNavClick('/home')}
                  className="w-full text-left px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('/products')}
                  className="w-full text-left px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Products
                </button>
                <button
                  onClick={() => handleNavClick('/bookings')}
                  className="w-full text-left px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Bookings
                </button>
                <button
                  onClick={() => handleNavClick('/profile/edit')}
                  className="w-full text-left px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Profile
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

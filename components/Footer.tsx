'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FooterProps {
  onTabChange?: (tab: 'browse' | 'cart' | 'bookings') => void;
}

export default function Footer({ onTabChange }: FooterProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleQuickLinkClick = (tab: 'browse' | 'cart' | 'bookings') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <footer className="bg-gray-50 text-gray-600 mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Jain Sales Corporation</h3>
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
                <button 
                  onClick={() => handleQuickLinkClick('browse')}
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 w-full"
                >
                  <span>→</span> Shop
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('bookings')}
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 w-full"
                >
                  <span>→</span> My Orders
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleQuickLinkClick('cart')}
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 w-full"
                >
                  <span>→</span> Cart
                </button>
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
              <div className="flex items-start gap-2">
                <span className="mt-0.5">🕐</span>
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Accordion Layout */}
        <div className="md:hidden space-y-4 mb-8">
          {/* About Mobile */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('about')}
              className="w-full px-4 py-3 bg-white text-gray-900 font-bold flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              Jain Sales Corporation
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
              onClick={() => toggleSection('quick')}
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
                    <button 
                      onClick={() => handleQuickLinkClick('browse')}
                      className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 w-full"
                    >
                      <span>→</span> Shop
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleQuickLinkClick('bookings')}
                      className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 w-full"
                    >
                      <span>→</span> My Orders
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleQuickLinkClick('cart')}
                      className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 w-full"
                    >
                      <span>→</span> Cart
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Support Mobile */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('support')}
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
              onClick={() => toggleSection('contact')}
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
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">🕐</span>
                  <span>24/7 Customer Support</span>
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
  );
}

'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Top Row — Brand + Links */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <img src="/jsclogo.png" alt="JSC" className="w-10 h-10 object-contain" />
              <span className="font-bold text-gray-900">Jain Sales Corporation</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your trusted shopping destination for quality products at the best prices.
            </p>
          </div>

          {/* Links — single row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/support/contact" className="text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
            <Link href="/support/faq" className="text-gray-500 hover:text-gray-900 transition-colors">FAQ</Link>
            <Link href="/support/shipping" className="text-gray-500 hover:text-gray-900 transition-colors">Shipping</Link>
            <Link href="/support/returns" className="text-gray-500 hover:text-gray-900 transition-colors">Returns</Link>
          </div>
        </div>

        {/* Contact Info — compact row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-400 mb-6">
          <a href="tel:+917744835784" className="hover:text-gray-600 transition-colors">
            📞 +91 774-483-5784
          </a>
          <a href="mailto:jainsalescorporationrudrapur@gmail.com" className="hover:text-gray-600 transition-colors">
            ✉️ jainsalescorporationrudrapur@gmail.com
          </a>
          <span>📍 Rudrapur, Uttarakhand</span>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Jain Sales Corporation
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

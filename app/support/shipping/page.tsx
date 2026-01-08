'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function ShippingInfoPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Shipping & Collection</h1>
          <p className="text-lg text-gray-600">
            Simple, flexible options for getting your items within 24 hours
          </p>
        </div>

        {/* Two Main Options - Minimalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Self Pickup */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <div className="mb-6">
              <div className="text-4xl mb-3">🏪</div>
              <h2 className="text-2xl font-bold text-gray-900">In-Store Collection</h2>
            </div>

            <div className="space-y-6 text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Hours</h4>
                <p className="text-sm">Mon-Sat: 10 AM - 8 PM</p>
                <p className="text-sm">Sunday: 11 AM - 6 PM</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Location</h4>
                <p className="text-sm">Preet-Vihar colony, Rudrapur, Uttarakhand</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">What to Bring</h4>
                <ul className="text-sm space-y-1">
                  <li>• Booking ID</li>
                  <li>• Valid ID proof</li>
                </ul>
              </div>

              <button
                onClick={() => toggleSection('pickup')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm mt-4"
              >
                {expandedSection === 'pickup' ? '- Hide details' : '+ Show details'}
              </button>

              {expandedSection === 'pickup' && (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-600 mb-3">Visit our store anytime within 24 hours of your booking. Busy hours: 2-5 PM. Best time: 11 AM-2 PM.</p>
                </div>
              )}
            </div>
          </div>

          {/* Home Delivery */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow bg-gray-50">
            <div className="mb-6">
              <div className="text-4xl mb-3">🚚</div>
              <h2 className="text-2xl font-bold text-gray-900">Home Delivery</h2>
            </div>

            <div className="space-y-6 text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Availability</h4>
                <p className="text-sm">Booked before 12 PM → Same day</p>
                <p className="text-sm">Booked after 12 PM → Next day</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Contact</h4>
                <a href="tel:774-483-5784" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                  774-483-5784
                </a>
                <p className="text-sm">Mon-Sat, 9 AM - 6 PM</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Charges</h4>
                <p className="text-sm">₹0-50 (0-5 km)</p>
                <p className="text-sm">₹50-100 (5-10 km)</p>
                <p className="text-sm">₹100+ (10 km+)</p>
              </div>

              <button
                onClick={() => toggleSection('delivery')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm mt-4"
              >
                {expandedSection === 'delivery' ? '- Hide details' : '+ Show details'}
              </button>

              {expandedSection === 'delivery' && (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <p className="text-sm text-gray-600 mb-2">We'll call 30 minutes before arrival. Confirmation call included.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Information - Simple List */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Important to Know</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-4 border-l-4 border-indigo-600 bg-indigo-50">
              <div className="text-lg">⏰</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">24-Hour Window</h3>
                <p className="text-sm text-gray-600">Your booking is valid for exactly 24 hours. Collect or arrange delivery within this time.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border-l-4 border-green-600 bg-green-50">
              <div className="text-lg">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Verify Items</h3>
                <p className="text-sm text-gray-600">Check quantities and condition when collecting. Report issues immediately.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border-l-4 border-blue-600 bg-blue-50">
              <div className="text-lg">💳</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Refunds</h3>
                <p className="text-sm text-gray-600">Cancel within 1 hour = full refund. After 1 hour = 10% fee.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border-l-4 border-purple-600 bg-purple-50">
              <div className="text-lg">✏️</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Modify</h3>
                <p className="text-sm text-gray-600">Edit your booking within the first 2 hours. Contact support for help.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">24</div>
            <p className="text-xs text-gray-600 mt-2">Hours to Collect</p>
          </div>

          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">2</div>
            <p className="text-xs text-gray-600 mt-2">Collection Options</p>
          </div>

          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <div className="text-sm font-bold text-gray-900">Same Day</div>
            <p className="text-xs text-gray-600 mt-2">Delivery Available</p>
          </div>

          <div className="text-center p-6 border border-gray-200 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">∞</div>
            <p className="text-xs text-gray-600 mt-2">Flexible Options</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to get started?</h3>
          <p className="text-gray-600 mb-6">Browse products and place your booking today.</p>
          <Link
            href="/products-browse"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function SupportPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(''); // Fixed router initialization
  const supportOptions = [
    {
      icon: '📞',
      title: 'Contact Us',
      description: 'Get in touch with our support team via phone, email, or contact form.',
      link: '/support/contact',
      color: 'from-indigo-600 to-indigo-700',
    },
    {
      icon: '❓',
      title: 'FAQ',
      description: 'Find answers to frequently asked questions about bookings, delivery, and more.',
      link: '/support/faq',
      color: 'from-blue-600 to-blue-700',
    },
    {
      icon: '🚚',
      title: 'Shipping & Delivery',
      description: 'Learn about our 24-hour booking system and two convenient collection methods.',
      link: '/support/shipping',
      color: 'from-green-600 to-green-700',
    },
    {
      icon: '🔄',
      title: 'Returns & Refunds',
      description: 'Understand our hassle-free return policy and get quick refunds.',
      link: '/support/returns',
      color: 'from-purple-600 to-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          <span>←</span> Back
        </button>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Find answers to your questions about bookings, delivery, returns, and more.
          </p>
        </div>

        {/* Quick Search Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Quick Help Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900"><strong>Urgent Issue?</strong> Call us: 774-483-5784</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900"><strong>Quick Answer?</strong> Check our FAQ section</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-900"><strong>Delivery Question?</strong> See Shipping Info</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-900"><strong>Return Item?</strong> Learn our policy</p>
            </div>
          </div>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {supportOptions.map((option, index) => (
            <Link
              key={index}
              href={option.link}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${option.color} p-6 text-white`}>
                <div className="text-5xl mb-2">{option.icon}</div>
                <h3 className="text-2xl font-bold">{option.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{option.description}</p>
                <div className="text-indigo-600 font-semibold inline-flex items-center gap-2">
                  Learn More <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Direct Contact Info */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Direct Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
              <a href="tel:774-483-5784" className="text-indigo-600 hover:text-indigo-700 font-semibold text-lg">
                774-483-5784
              </a>
              <p className="text-gray-600 text-sm mt-2">Mon-Sat, 9 AM - 6 PM IST</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <a href="mailto:jainsalescorporationrudrapur@google.com" className="text-indigo-600 hover:text-indigo-700 font-semibold text-lg">
                jainsalescorporationrudrapur@google.com
              </a>
              <p className="text-gray-600 text-sm mt-2">Response: Within 24 hours</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm">
                Preet-Vihar colony<br/>
                Rudrapur, Uttarakhand
              </p>
              <p className="text-gray-600 text-sm mt-2">10 AM - 8 PM Daily</p>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-indigo-50 rounded-lg shadow-md p-8 border border-indigo-200 mb-12">
          <h2 className="text-2xl font-bold text-indigo-900 mb-6">🎯 Quick Solutions for Common Issues</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">📋 Booking Issues?</h4>
              <p className="text-gray-600 text-sm mb-3">
                Having trouble placing a booking or need to modify it?
              </p>
              <Link href="/support/faq" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                Check Booking FAQ →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🚚 Delivery Questions?</h4>
              <p className="text-gray-600 text-sm mb-3">
                Want to know about collection or home delivery options?
              </p>
              <Link href="/support/shipping" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                Shipping Info →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">🔄 Want to Return?</h4>
              <p className="text-gray-600 text-sm mb-3">
                Learn about our hassle-free returns and refund process.
              </p>
              <Link href="/support/returns" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                Returns Policy →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-2">💬 Other Questions?</h4>
              <p className="text-gray-600 text-sm mb-3">
                Can't find your answer? Contact our support team directly.
              </p>
              <Link href="/support/contact" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                Contact Us →
              </Link>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">⏰ Our Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="font-semibold text-gray-900">Monday - Friday</p>
              <p className="text-gray-600">9 AM - 6 PM</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Saturday</p>
              <p className="text-gray-600">10 AM - 5 PM</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sunday</p>
              <p className="text-gray-600">By Appointment</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Holidays</p>
              <p className="text-gray-600">Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

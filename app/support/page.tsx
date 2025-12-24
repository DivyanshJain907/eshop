'use client';

import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function SupportPage() {
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
              <div className={`bg-linear-to-r ${option.color} p-6 text-white`}>
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

        {/* Direct Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Direct Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📞 Phone</h3>
              <a href="tel:774-483-5784" className="text-indigo-600 hover:text-indigo-700 font-bold">
                774-483-5784
              </a>
              <p className="text-sm text-gray-600 mt-1">Mon-Sat, 9 AM - 6 PM</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Email</h3>
              <a href="mailto:jainsalescorporationrudrapur@gmail.com" className="text-indigo-600 hover:text-indigo-700 font-bold break-all">
                jainsalescorporationrudrapur@gmail.com
              </a>
              <p className="text-sm text-gray-600 mt-1">Response within 2 hours</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Visit Us</h3>
              <p className="text-gray-600">Preet-Vihar colony, Rudrapur, Uttarakhand</p>
              <p className="text-sm text-gray-600 mt-1">10 AM - 8 PM Daily</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

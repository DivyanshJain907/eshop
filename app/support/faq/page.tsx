'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'booking' | 'delivery' | 'payment' | 'general';
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: 'booking',
    question: 'How does the 24-hour booking system work?',
    answer: 'Our 24-hour booking system allows you to reserve products for 24 hours from the time of booking. Once you place a booking, the products are locked and reserved for you. You can collect your order within this 24-hour window. After 24 hours, if not collected, the booking may be cancelled.',
  },
  {
    id: 2,
    category: 'booking',
    question: 'Can I modify my booking after placing it?',
    answer: 'Yes, you can modify your booking within the first 2 hours after placing it. Go to My Bookings section, find your booking, and click Edit. After 2 hours, you\'ll need to contact our support team for modifications.',
  },
  {
    id: 3,
    category: 'booking',
    question: 'What if I want to cancel my booking?',
    answer: 'You can cancel your booking anytime through the My Bookings section. If cancelled within 1 hour of booking, full refund will be processed. For cancellations after 1 hour, a 10% cancellation fee may apply. Contact support for special cases.',
  },
  {
    id: 4,
    category: 'delivery',
    question: 'Do you provide home delivery?',
    answer: 'Yes! We provide home delivery service for all bookings. During checkout or in your booking details, you can select Home Delivery option. Our team will contact you to confirm delivery details and schedule. Additional charges apply based on location.',
  },
  {
    id: 5,
    category: 'delivery',
    question: 'How do I arrange home delivery?',
    answer: 'To arrange home delivery, either select the delivery option during booking or contact our support team after booking. You can reach us at 774-483-5784 or email jainsalescorporationrudrapur@google.com. Our employees will confirm delivery time and location.',
  },
  {
    id: 6,
    category: 'delivery',
    question: 'What is the delivery timeframe?',
    answer: 'For orders booked before 12 PM, delivery is available the same day. For orders booked after 12 PM, delivery is available the next day. All deliveries are completed within your 24-hour booking window.',
  },
  {
    id: 7,
    category: 'delivery',
    question: 'Where can I collect my order?',
    answer: 'You can collect your order from our office located at Preet-Vihar colony, Rudrapur, Uttarakhand. Collection is available from 10 AM to 8 PM daily. Please bring your booking ID and valid ID proof.',
  },
  {
    id: 8,
    category: 'payment',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major payment methods including Credit Cards, Debit Cards, UPI, Net Banking, and Digital Wallets. Payment must be completed at the time of booking.',
  },
  {
    id: 9,
    category: 'payment',
    question: 'Are there any discounts available?',
    answer: 'Yes! We offer various discounts displayed on product pages. Bulk discounts are available for large orders. Check the product details to see applicable discounts before booking.',
  },
  {
    id: 10,
    category: 'general',
    question: 'How do I track my booking status?',
    answer: 'Visit the "My Bookings" section on your dashboard to see all your bookings with real-time status updates. You can see exactly how much time is remaining to collect your order.',
  },
  {
    id: 11,
    category: 'general',
    question: 'What happens if I dont collect my order within 24 hours?',
    answer: 'If you don\'t collect your order within 24 hours, the booking will expire and your order may be cancelled. The full amount paid will be refunded to your original payment method within 5-7 business days.',
  },
  {
    id: 12,
    category: 'general',
    question: 'How can I contact the support team?',
    answer: 'You can contact us via phone (774-483-5784), email (jainsalescorporationrudrapur@google.com), or through our Contact Us page. For home delivery or special requests, our employees are available to assist you.',
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'booking' | 'delivery' | 'payment' | 'general'>('all');

  const filteredFAQs = selectedCategory === 'all' ? faqData : faqData.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our 24-hour booking system, delivery, and orders.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setSelectedCategory('booking')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'booking'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            📋 Booking
          </button>
          <button
            onClick={() => setSelectedCategory('delivery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'delivery'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            🚚 Delivery
          </button>
          <button
            onClick={() => setSelectedCategory('payment')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'payment'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            💳 Payment
          </button>
          <button
            onClick={() => setSelectedCategory('general')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'general'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            ❓ General
          </button>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-left text-lg font-semibold text-gray-900">
                  {item.question}
                </h3>
                <span
                  className={`text-2xl transition-transform duration-300 flex-shrink-0 ml-4 ${
                    expandedId === item.id ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 p-8 bg-indigo-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-2xl font-bold text-indigo-900 mb-2">Still have questions?</h3>
          <p className="text-indigo-700 mb-4">
            Can't find the answer you're looking for? Contact our support team.
          </p>
          <Link
            href="/support/contact"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}

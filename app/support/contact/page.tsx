'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // For now, just show success message
      setSubmitMessage('Thank you! We have received your message. Our team will get back to you within 24 hours.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitMessage('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Contact Information */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-gray-600 mb-8">
              Have questions about your booking or order? We're here to help! Contact us through any of the methods below.
            </p>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white text-xl">
                    📞
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Phone Support</h3>
                  <p className="text-gray-600 mt-1">Call us for immediate assistance</p>
                  <a href="tel:774-483-5784" className="text-indigo-600 hover:text-indigo-700 font-semibold mt-2 block">
                    774-483-5784
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Available: Mon-Sat, 9 AM - 6 PM IST</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white text-xl">
                    📧
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
                  <p className="text-gray-600 mt-1">Send us an email for detailed inquiries</p>
                  <a href="mailto:jainsalescorporationrudrapur@google.com" className="text-indigo-600 hover:text-indigo-700 font-semibold mt-2 block">
                    jainsalescorporationrudrapur@google.com
                  </a>
                  <p className="text-sm text-gray-500 mt-1">Response time: Within 24 hours</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white text-xl">
                    📍
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Office Address</h3>
                  <p className="text-gray-600 mt-1">Visit our office or collection center</p>
                  <p className="text-gray-700 font-semibold mt-2">Jain Sales Corporation Headquarters</p>
                  <p className="text-gray-600">Preet-Vihar colony, Rudrapur, Uttarakhand</p>
                  <p className="text-gray-600">State - 123456, India</p>
                </div>
              </div>

              {/* Live Chat */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white text-xl">
                    💬
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
                  <p className="text-gray-600 mt-1">Chat with our support team in real-time</p>
                  <p className="text-sm text-gray-500 mt-2">Available during business hours</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>🚀 For Urgent Matters:</strong> Call us directly for immediate support regarding your bookings or deliveries.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${submitMessage.includes('Thank') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={submitMessage.includes('Thank') ? 'text-green-800' : 'text-red-800'}>
                    {submitMessage}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="+91-XXXXX-XXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select a subject</option>
                    <option value="booking">Booking Related</option>
                    <option value="delivery">Delivery Inquiry</option>
                    <option value="refund">Refund/Cancellation</option>
                    <option value="technical">Technical Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                We'll respond to your message within 24 hours during business hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


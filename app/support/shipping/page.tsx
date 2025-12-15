'use client';

import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700">Home</Link>
          <span className="text-gray-500">/</span>
          <Link href="/support" className="text-indigo-600 hover:text-indigo-700">Support</Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-600 font-semibold">Shipping Info</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Collection Information</h1>
          <p className="text-xl text-gray-600">
            Learn about how our 24-hour booking system and delivery options work.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">⏱️ 24-Hour Booking Window</h3>
            <p className="text-gray-600">
              When you place a booking, your items are locked and reserved for exactly 24 hours. You can collect your order or arrange home delivery anytime within this window.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🚚 Two Collection Options</h3>
            <p className="text-gray-600">
              Choose between in-store collection at our location or opt for convenient home delivery service with our team.
            </p>
          </div>
        </div>

        {/* Collection Methods */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Collection Methods</h2>

          <div className="space-y-6">
            {/* Self Pickup */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🏪</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Self Pickup from Store</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Collection Hours:</h4>
                      <ul className="text-gray-600 space-y-1 ml-4">
                        <li>✓ Monday to Saturday: 10 AM - 8 PM</li>
                        <li>✓ Sunday: 11 AM - 6 PM</li>
                        <li>✓ Holidays: 2 PM - 6 PM</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Collection Location:</h4>
                      <p className="text-gray-600">
                        eShop Main Store<br/>
                        Preet-Vihar colony<br/>
                        Rudrapur, Uttarakhand<br/>
                        India
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What You Need:</h4>
                      <ul className="text-gray-600 space-y-1 ml-4">
                        <li>✓ Booking ID (from your booking confirmation)</li>
                        <li>✓ Valid ID Proof (Aadhar, Passport, Driver License)</li>
                        <li>✓ Proof of Payment (if needed)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Process:</h4>
                      <ol className="text-gray-600 space-y-1 ml-4 list-decimal">
                        <li>Visit our store within 24 hours of booking</li>
                        <li>Show your booking ID to our staff</li>
                        <li>Verify your items and quantities</li>
                        <li>Collect your order</li>
                      </ol>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-900">
                        💡 <strong>Tip:</strong> Come during less busy hours (11 AM - 2 PM or 5 PM - 7 PM) for faster collection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Home Delivery */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🚚</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Home Delivery Service</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How to Schedule:</h4>
                      <p className="text-gray-600 mb-2">You can arrange home delivery in two ways:</p>
                      <ul className="text-gray-600 space-y-1 ml-4">
                        <li>✓ Select "Home Delivery" option during checkout</li>
                        <li>✓ Contact our team after booking to arrange delivery</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact for Delivery:</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <p className="text-gray-700 font-semibold mb-2">📞 Phone: 774-483-5784</p>
                        <p className="text-gray-600 text-sm mb-3">Available: Mon-Sat, 9 AM - 6 PM</p>
                        
                        <p className="text-gray-700 font-semibold mb-2">📧 Email: jainsalescorporationrudrapur@google.com</p>
                        <p className="text-gray-600 text-sm">We'll respond within 2 hours during business hours</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Timeline:</h4>
                      <ul className="text-gray-600 space-y-1 ml-4">
                        <li>✓ Booked before 12 PM → Same day delivery</li>
                        <li>✓ Booked after 12 PM → Next day delivery</li>
                        <li>✓ All deliveries within your 24-hour booking window</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Charges:</h4>
                      <p className="text-gray-600 mb-2">Charges vary based on your location:</p>
                      <ul className="text-gray-600 space-y-1 ml-4">
                        <li>✓ Within City (0-5 km): ₹0 - ₹50</li>
                        <li>✓ Near City (5-10 km): ₹50 - ₹100</li>
                        <li>✓ Outskirts (10+ km): ₹100 - ₹200</li>
                      </ul>
                      <p className="text-gray-600 mt-2 text-sm">Our team will confirm charges before delivery</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What We Need:</h4>
                      <ul className="text-gray-600 space-y-1 ml-4">
                        <li>✓ Your complete address</li>
                        <li>✓ Phone number for confirmation</li>
                        <li>✓ Preferred delivery time window</li>
                        <li>✓ Landmark or detailed directions</li>
                      </ul>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-900">
                        ✓ <strong>Benefit:</strong> Our delivery team will call you 30 minutes before arrival. You can also track delivery status.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Policies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Important Policies</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">⏰ Collection Deadline</h3>
              <p className="text-gray-600 mb-2">
                Your 24-hour booking window starts from the time you complete your booking. After 24 hours, your booking will expire.
              </p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• You MUST collect or arrange delivery within 24 hours</li>
                <li>• Extensions are available - contact support before deadline</li>
                <li>• After deadline, items will be restocked and order cancelled</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📦 Items Verification</h3>
              <p className="text-gray-600 mb-2">
                Always verify your items match the booking details:
              </p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Check product names and quantities</li>
                <li>• Verify prices and discounts applied</li>
                <li>• Inspect items for any visible damage</li>
                <li>• Report discrepancies immediately</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🔄 Changes After Booking</h3>
              <p className="text-gray-600 mb-2">
                If you need to make changes:
              </p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Modifications allowed within first 2 hours of booking</li>
                <li>• After 2 hours, contact support for assistance</li>
                <li>• Cannot change collection method after 1 hour</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">💳 Payment & Refunds</h3>
              <p className="text-gray-600 mb-2">
                Understand our payment and refund policy:
              </p>
              <ul className="text-gray-600 space-y-1 ml-4">
                <li>• Full payment required at booking time</li>
                <li>• Cancel within 1 hour: Full refund</li>
                <li>• Cancel after 1 hour: 10% cancellation fee</li>
                <li>• Missed deadline: Full refund in 5-7 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-indigo-50 rounded-lg p-6 text-center border border-indigo-200">
            <div className="text-3xl font-bold text-indigo-600 mb-2">24</div>
            <p className="text-sm text-indigo-900">Hours to Collect</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">2</div>
            <p className="text-sm text-green-900">Collection Methods</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">10 AM - 8 PM</div>
            <p className="text-sm text-blue-900">Store Hours</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 text-center border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">0-2hrs</div>
            <p className="text-sm text-purple-900">Delivery Time*</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Place a Booking?</h3>
          <p className="mb-6 text-indigo-100">
            Browse our products, book within 24 hours, and enjoy flexible collection or home delivery!
          </p>
          <Link
            href="/home"
            className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}

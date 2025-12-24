'use client';

import Link from 'next/link';
import UserHeader from '@/components/UserHeader';

export default function ReturnsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds Policy</h1>
          <p className="text-xl text-gray-600">
            Understand our hassle-free return and refund policy for a worry-free shopping experience.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12 border-l-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Overview</h2>
          <p className="text-gray-600 mb-4">
            At eShop, we stand behind our products. If you're not satisfied with your purchase, we offer flexible return and refund options within our booking window and beyond.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">24</div>
              <p className="text-gray-600">Hour Booking Window</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">7</div>
              <p className="text-gray-600">Days for Returns</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <p className="text-gray-600">Money Back Guarantee</p>
            </div>
          </div>
        </div>

        {/* Return Timeline */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Return Timeline</h2>

          <div className="space-y-4">
            {/* 24 Hour Window */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⏰</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Within 24-Hour Booking Window</h3>
                  <p className="text-gray-600 mb-3">
                    You can cancel or return items at any point within your 24-hour booking window.
                  </p>
                  <ul className="space-y-2">
                    <li className="text-gray-600">
                      <span className="font-semibold text-green-600">✓ Full Refund:</span> Cancel within first hour of booking
                    </li>
                    <li className="text-gray-600">
                      <span className="font-semibold text-orange-600">↳ 90% Refund:</span> Cancel after 1 hour but within 24 hours (10% fee)
                    </li>
                    <li className="text-gray-600">
                      <span className="text-sm text-gray-500 ml-4">Processing time: 1-2 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 7 Days Return */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Within 7 Days of Collection</h3>
                  <p className="text-gray-600 mb-3">
                    If you've collected your order, you can still return items within 7 days for a full refund.
                  </p>
                  <ul className="space-y-2">
                    <li className="text-gray-600">
                      <span className="font-semibold text-green-600">✓ Full Refund:</span> Product in original condition, unused
                    </li>
                    <li className="text-gray-600">
                      <span className="font-semibold text-orange-600">↳ Partial Refund:</span> Item used but within return window (10-30% deduction)
                    </li>
                    <li className="text-gray-600">
                      <span className="text-sm text-gray-500 ml-4">Processing time: 3-5 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* After 7 Days */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-start gap-4">
                <div className="text-3xl">❌</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">After 7 Days of Collection</h3>
                  <p className="text-gray-600 mb-3">
                    Returns are generally not accepted after 7 days of collection. However, we can discuss special cases.
                  </p>
                  <ul className="space-y-2">
                    <li className="text-gray-600">
                      <span className="font-semibold">⚠️ No Refund:</span> Items returned after 7-day window
                    </li>
                    <li className="text-gray-600">
                      <span className="text-sm text-gray-500 ml-4">Contact support for exceptions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Return Items</h2>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Step-by-Step Return Process</h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
                  <p className="text-gray-600">
                    Reach out to our support team with your booking ID and reason for return:
                  </p>
                  <p className="text-indigo-600 font-semibold mt-2">
                    📞 774-483-5784 | 📧 jainsalescorporationrudrapur@google.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Get Return Authorization</h4>
                  <p className="text-gray-600">
                    Our team will verify your claim and provide you with a Return Authorization Number (RAN).
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Usually provided within 2 hours</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pack Items Securely</h4>
                  <p className="text-gray-600">
                    Pack items in original packaging or securely to prevent damage during return.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Include the RAN on the package</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Choose Return Method</h4>
                  <p className="text-gray-600">
                    You can either drop off at our store or schedule a pickup from your location.
                  </p>
                  <ul className="text-gray-600 space-y-1 mt-2 ml-4">
                    <li>• Store Dropoff: Visit within business hours</li>
                    <li>• Pickup Service: We'll arrange it (additional charges may apply)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold">
                    5
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Get Confirmation & Refund</h4>
                  <p className="text-gray-600">
                    Once received and inspected, we'll process your refund to the original payment method.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Refund processing: 3-7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Returnable Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* What Can Be Returned */}
          <div className="bg-green-50 rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <h3 className="text-xl font-bold text-green-900 mb-4">✓ Returnable Items</h3>
            <ul className="space-y-2 text-green-800">
              <li>• Unused items in original packaging</li>
              <li>• Items with original tags and labels intact</li>
              <li>• Items returned within time window</li>
              <li>• Defective or damaged items</li>
              <li>• Wrong items received</li>
              <li>• Items not matching product description</li>
              <li>• Expired products</li>
            </ul>
          </div>

          {/* What Cannot Be Returned */}
          <div className="bg-red-50 rounded-lg shadow-md p-6 border-l-4 border-red-600">
            <h3 className="text-xl font-bold text-red-900 mb-4">✗ Non-Returnable Items</h3>
            <ul className="space-y-2 text-red-800">
              <li>• Used or partially used items</li>
              <li>• Items without original packaging</li>
              <li>• Items beyond return window (7 days)</li>
              <li>• Items damaged by customer</li>
              <li>• Perishable items (if applicable)</li>
              <li>• Items sold as "Final Sale"</li>
              <li>• Missing tags or labels</li>
            </ul>
          </div>
        </div>

        {/* Defective Items */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Defective or Damaged Items</h2>
          
          <p className="text-gray-600 mb-4">
            If you receive a defective or damaged item, we'll provide a replacement or full refund immediately:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <p className="text-gray-600"><strong>Report immediately:</strong> Contact support within 24 hours with photos/videos</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <p className="text-gray-600"><strong>Provide proof:</strong> Send clear photos showing the defect</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <p className="text-gray-600"><strong>Quick resolution:</strong> Replacement or refund within 2-3 business days</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📦</span>
              <p className="text-gray-600"><strong>No return needed:</strong> We'll handle defective item collection</p>
            </div>
          </div>
        </div>

        {/* Refund Methods */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Processing</h2>
          
          <p className="text-gray-600 mb-6">
            Refunds are processed to the same payment method used for the original booking:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-3xl mb-2">💳</div>
              <p className="font-semibold text-gray-900 mb-2">Credit/Debit Card</p>
              <p className="text-sm text-gray-600">3-5 business days</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-semibold text-gray-900 mb-2">UPI/Wallet</p>
              <p className="text-sm text-gray-600">1-2 business days</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-3xl mb-2">🏦</div>
              <p className="font-semibold text-gray-900 mb-2">Bank Transfer</p>
              <p className="text-sm text-gray-600">2-3 business days</p>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-6 text-center">
            Note: Banks may take an additional 1-2 days to process the refund on their end.
          </p>
        </div>

        {/* Support CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">Need Help with Your Return?</h3>
          <p className="mb-6 text-indigo-100">
            Our support team is ready to help you with any questions or issues regarding returns and refunds.
          </p>
          <Link
            href="/support/contact"
            className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}

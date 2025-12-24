'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';
import { QRCodeCanvas } from 'qrcode.react';

// Function to convert amount to words
function amountInWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      if (n % 10 > 0) result += ' ' + ones[n % 10];
    } else if (n >= 10) {
      result += teens[n - 10];
    } else if (n > 0) {
      result += ones[n];
    }
    return result.trim();
  };

  if (num === 0) return 'Zero Rupees Only';

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = Math.floor(num % 1000);

  let result = '';
  if (crores > 0) result += convertHundreds(crores) + ' Crore ';
  if (lakhs > 0) result += convertHundreds(lakhs) + ' Lakh ';
  if (thousands > 0) result += convertHundreds(thousands) + ' Thousand ';
  if (hundreds > 0) result += convertHundreds(hundreds) + ' ';

  return result.trim() + ' Rupees Only';
}

export default function BillPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [billData, setBillData] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'employee' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const billDataStr = localStorage.getItem('billData');
    if (billDataStr) {
      setBillData(JSON.parse(billDataStr));
    } else {
      router.push('/sales');
    }
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    localStorage.removeItem('billData');
    localStorage.removeItem('directSalesCart');
    localStorage.removeItem('directSalesTotal');
    router.push('/sales');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  if (!billData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Print Button */}
        <div className="mb-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            🖨️ Print Bill
          </button>
          <button
            onClick={handleNewSale}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            ➕ New Sale
          </button>
        </div>

        {/* Bill Content - A4 Size */}
        <div id="bill-content" className="bg-white" style={{ width: '210mm', margin: '0 auto' }}>
          {/* Header Section */}
          <div className="mb-6 border-b-4 border-gray-900 pb-4 px-6 pt-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-gray-900">GSTIN : 05AAMHS1989L1ZD</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900">Original Copy</p>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-xs font-bold text-gray-900 mb-1">TAX INVOICE</p>
              <h1 className="text-3xl font-bold text-gray-900">JAIN SALES CORPORATION</h1>
              <p className="text-xs text-gray-900 mt-1">PREET VIHAR COLONY, RUDRAPUR</p>
            </div>
            <div className="text-center text-xs text-gray-900 space-y-0.5">
              <p>MOB.NO.7744835784,9412235537</p>
              <p>PAN : AAMHS1989L</p>
              <p>Tel. : 7744835784,9412235537 email : jainsalesmbd@gmail.com</p>
              <p>MSME REGISTRATION NO.UDHYAM-UK-12-0010414</p>
            </div>
          </div>

          {/* Party Details and Invoice Details */}
          <div className="grid grid-cols-2 gap-6 mb-6 border-t-2 border-b-2 border-gray-300 py-3 px-6">
            {/* Party Details */}
            <div>
              <p className="text-xs font-bold text-gray-900 mb-2">Party Details :</p>
              <div className="text-sm text-gray-900 space-y-1">
                <p className="font-semibold">{billData.customerName}</p>
                {billData.shopName && <p>{billData.shopName}</p>}
                <p>Mobile: {billData.customerMobile}</p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="text-sm text-gray-900">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-bold">Invoice No.</p>
                  <p className="font-semibold">: {billData.saleId?.toString().slice(-8).toUpperCase() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold">Date</p>
                  <p className="font-semibold">: {billData.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold">Time</p>
                  <p className="font-semibold">: {billData.time}</p>
                </div>
                <div>
                  <p className="text-xs font-bold">Employee</p>
                  <p className="font-semibold">: {billData.employeeName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6 px-6">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-200 border border-gray-300">
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-black">S.No.</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-black">Description of Goods</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-black">Qty</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-bold text-black">Unit</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-black">Unit Price</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-black">Discount %</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-black">Discount Amount</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-black">Final Price</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-bold text-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                {billData.items?.map((item: any, idx: number) => {
                  const mrp = item.price || 0;
                  const discount = item.customDiscount || 0;
                  const discountAmount = (mrp * discount) / 100;
                  const finalPrice = mrp - discountAmount;
                  const total = finalPrice * (item.cartQuantity || 0);
                  
                  return (
                    <tr key={idx} className="border border-gray-300">
                      <td className="border border-gray-300 px-2 py-2 text-center text-black">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-2 text-black">{item.name}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-black">{item.cartQuantity}</td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-black">SET</td>
                      <td className="border border-gray-300 px-2 py-2 text-right text-black">₹{mrp.toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right text-black">{discount}%</td>
                      <td className="border border-gray-300 px-2 py-2 text-right text-black">₹{discountAmount.toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right text-black">₹{finalPrice.toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-2 text-right font-semibold text-black">₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mb-6 grid grid-cols-2 gap-6 px-6">
            {/* Left side - empty */}
            <div></div>

            {/* Right side - totals */}
            <div>
              <div className="border-2 border-gray-300">
                <div className="grid grid-cols-2 text-xs">
                  <div className="border-r border-b border-gray-300 px-4 py-2 font-semibold text-black">Total Quantity</div>
                  <div className="border-b border-gray-300 px-4 py-2 text-right font-semibold text-black">
                    {billData.items?.reduce((sum: number, item: any) => sum + (item.cartQuantity || 0), 0) || 0}
                  </div>
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold text-black">Grand Total</div>
                  <div className="px-4 py-2 text-right font-bold text-black">₹{billData.totalAmount?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-4 p-2 bg-gray-50 border border-gray-300 mx-6 text-xs">
            <p className="font-semibold text-gray-900">
              Amount in Words: <span className="font-normal capitalize">{amountInWords(billData.totalAmount || 0)}</span>
            </p>
          </div>

          {/* Payment Status Section */}
          {billData.amountPaid !== undefined && (
            <div className="mb-6 px-6">
              <div className="border-2 border-blue-300 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">💳 Payment Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-semibold">Total Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{billData.totalAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Amount Paid</p>
                    <p className="text-lg font-bold text-green-700">₹{billData.amountPaid?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Remaining Amount</p>
                    <p className="text-lg font-bold text-orange-700">₹{billData.remainingAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Payment Status</p>
                    <p className={`text-lg font-bold ${
                      billData.paymentStatus === 'fully-paid' ? 'text-green-700' :
                      billData.paymentStatus === 'partially-paid' ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      {billData.paymentStatus === 'fully-paid' ? '✓ Fully Paid' :
                       billData.paymentStatus === 'partially-paid' ? '⚠ Partially Paid' :
                       '⏳ Pending'}
                    </p>
                  </div>
                  {billData.paymentMethod && (
                    <div>
                      <p className="text-gray-600 font-semibold">Payment Method</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{billData.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Details Section */}
          <div className="mb-4 border-t-2 border-b-2 border-gray-300 py-2 px-6">
            <p className="text-xs font-bold text-gray-900">
              Bank Details : <span className="font-normal">KOTAK MAHENDRA BANK A/C NO.8211628846 IFSC KKBK0000144</span>
            </p>
            <p className="text-xs font-normal text-gray-900 ml-32">
              PUNJAB NATIONAL BANK A/C NO.08330021000201140 IFSC PUNB0083300
            </p>
          </div>

          {/* Terms, QR Code, and Signature Section */}
          <div className="grid grid-cols-3 gap-2 border border-gray-300 min-h-40 text-xs">
            {/* Left Column - Terms & Conditions */}
            <div className="border-r border-gray-300 p-2">
              <p className="text-xs font-bold text-gray-900 mb-1">Terms & Conditions</p>
              <p className="text-xs text-gray-900 font-bold mb-1">E.& O.E.</p>
              <ul className="text-xs text-gray-900 space-y-0.5">
                <li>1. Goods once sold will not be taken back.</li>
                <li>2. Interest @ 18% p.a. will be charged if the payment is not made with in the stipulated time.</li>
                <li>3. Subject to 'Uttarakhand' Jurisdiction only.</li>
              </ul>
            </div>

            {/* Middle Column - QR Code */}
            <div className="border-r border-gray-300 p-2 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-gray-900 mb-1">E-Invoice QR Code</p>
              <div className="flex items-center justify-center">
                <QRCodeCanvas 
                  value={`Invoice: ${billData.saleId?.toString().slice(-8).toUpperCase() || 'N/A'} | Amount: ₹${billData.totalAmount?.toFixed(2) || '0.00'} | Customer: ${billData.customerName}`}
                  size={100}
                  level="H"
                  includeMargin={true}
                  className="border border-gray-400"
                />
              </div>
            </div>

            {/* Right Column - Signature */}
            <div className="p-2 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 mb-1">Receiver's Signature :</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900 mb-8">for JAIN SALES CORPORATION</p>
                <p className="text-xs font-bold text-gray-900 border-t border-gray-300 pt-1">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @page {
          size: A4;
          margin: 0.5cm;
        }
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
          }
          body * {
            visibility: hidden;
          }
          #bill-content,
          #bill-content * {
            visibility: visible;
          }
          #bill-content {
            position: relative;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 210mm;
            height: auto;
            padding: 10mm;
            margin: 0;
            background: white;
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          tr, td, th {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

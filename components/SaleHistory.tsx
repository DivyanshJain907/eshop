'use client';

import React, { useEffect, useState } from 'react';
interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, paymentMethod: string, notes?: string) => void;
  maxAmount: number;
}

function PaymentModal({ open, onClose, onSubmit, maxAmount }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  useEffect(() => { if (!open) { setAmount(''); setPaymentMethod('cash'); setNotes(''); } }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Update Payment</h3>
        <label className="block mb-2 text-sm font-semibold">Amount Received</label>
        <input type="number" min="1" max={maxAmount} value={amount} onChange={e => setAmount(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" placeholder={`Max: ₹${maxAmount.toFixed(2)}`} />
        <label className="block mb-2 text-sm font-semibold">Payment Method</label>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border px-3 py-2 rounded mb-3">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
          <option value="bank-transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
        </select>
        <label className="block mb-2 text-sm font-semibold">Notes (optional)</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border px-3 py-2 rounded mb-4" />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button onClick={() => { const amt = parseFloat(amount); if (amt > 0 && amt <= maxAmount) onSubmit(amt, paymentMethod, notes); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Update</button>
        </div>
      </div>
    </div>
  );
}

interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  customDiscount?: number;
}

interface SaleHistoryProps {
  sales?: Array<{
    _id?: string;
    productNames: string;
    totalQuantity: number;
    totalAmount: number;
    amountPaid?: number;
    remainingAmount?: number;
    paymentStatus?: string;
    createdAt?: string | Date;
    timestamp?: string | Date;
    saleType?: 'Direct Sale' | 'Online Sale';
    customerName?: string;
    customerMobile?: string;
    employeeName?: string;
    items?: SaleItem[];
  }>;
}


export default function SaleHistory({ sales = [] }: SaleHistoryProps) {
  const [sortedSales, setSortedSales] = useState(sales);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; saleId: string | null; maxAmount: number }>({ open: false, saleId: null, maxAmount: 0 });
  const [loading, setLoading] = useState(false);
  // Update payment handler
  const handleUpdatePayment = async (saleId: string, amount: number, paymentMethod: string, notes?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/direct-sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ saleId, amountPaid: amount, paymentMethod, notes }),
      });
      if (res.ok) {
        // Refresh the page or data
        window.location.reload();
      } else {
        alert('Failed to update payment');
      }
    } catch (e) {
      alert('Error updating payment');
    } finally {
      setLoading(false);
      setPaymentModal({ open: false, saleId: null, maxAmount: 0 });
    }
  };

  useEffect(() => {
    setSortedSales(
      [...sales].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      })
    );
  }, [sales]);

  if (sortedSales.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sales recorded yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mobile</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Payment Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.slice(0, 10).map((sale, index) => (
              <React.Fragment key={`${sale._id}-${index}`}>
                <tr 
                  className="border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => sale._id && setExpandedSaleId(expandedSaleId === sale._id ? null : sale._id)}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.saleType === 'Direct Sale' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {sale.saleType === 'Direct Sale' ? '🏪 Direct' : '🛒 Online'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{sale.productNames}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {sale.customerName || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {sale.customerMobile || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {sale.employeeName || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">{sale.totalQuantity}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    ₹{sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.paymentStatus === 'fully-paid'
                        ? 'bg-green-100 text-green-800'
                        : sale.paymentStatus === 'partially-paid'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sale.paymentStatus === 'fully-paid' 
                        ? '✓ Fully Paid' 
                        : sale.paymentStatus === 'partially-paid'
                        ? '⚠ Partial'
                        : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {new Date(sale.createdAt || sale.timestamp || 0).toLocaleTimeString()}
                  </td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedSaleId === sale._id && (
                  <tr className="bg-blue-50 border-b-2 border-blue-200">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="bg-white rounded-lg p-6 border border-blue-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>📋</span> Sale Details
                        </h3>
                        
                        {/* Sale Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-4 border-b">
                          <div>
                            <p className="text-sm text-gray-600">Sale ID</p>
                            <p className="font-bold text-gray-900">{sale._id?.toString().slice(-8)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-bold text-gray-900">{sale.customerName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Mobile</p>
                            <p className="font-bold text-gray-900">{sale.customerMobile}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Employee</p>
                            <p className="font-bold text-gray-900">{sale.employeeName}</p>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-900 mb-3">📦 Items Sold</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-3 py-2 text-left font-semibold">Product Name</th>
                                  <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                                  <th className="px-3 py-2 text-right font-semibold">MRP</th>
                                  <th className="px-3 py-2 text-right font-semibold">Discount</th>
                                  <th className="px-3 py-2 text-right font-semibold">Final Price</th>
                                  <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items?.map((item, idx) => {
                                  const mrp = item.price || 0;
                                  const discountPercent = item.customDiscount || 0;
                                  const discountAmount = (mrp * discountPercent) / 100;
                                  const finalPrice = mrp - discountAmount;
                                  const subtotal = finalPrice * (item.quantity || 0);

                                  return (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                      <td className="px-3 py-2 text-gray-900">{item.productName}</td>
                                      <td className="px-3 py-2 text-right text-gray-900 font-medium">{item.quantity}</td>
                                      <td className="px-3 py-2 text-right">
                                        <span className="text-gray-900 line-through">₹{mrp.toFixed(2)}</span>
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        {discountPercent > 0 ? (
                                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded font-semibold text-xs">
                                            {discountPercent}% (-₹{discountAmount.toFixed(2)})
                                          </span>
                                        ) : (
                                          <span className="text-gray-500">-</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-green-600">
                                        ₹{finalPrice.toFixed(2)}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-blue-600">
                                        ₹{subtotal.toFixed(2)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                            <span className="text-2xl font-bold text-green-600">₹{sale.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-orange-200">
                                                    {/* Update Payment Button */}
                                                    {typeof sale.remainingAmount === 'number' && sale.remainingAmount > 0 && (
                                                      <button
                                                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold shadow"
                                                        onClick={() => setPaymentModal({ open: true, saleId: sale._id || '', maxAmount: sale.remainingAmount ?? 0 })}
                                                        disabled={loading}
                                                      >
                                                        {loading ? 'Updating...' : 'Update Payment'}
                                                      </button>
                                                    )}
                                {/* Payment Modal */}
                                <PaymentModal
                                  open={paymentModal.open}
                                  onClose={() => setPaymentModal({ open: false, saleId: null, maxAmount: 0 })}
                                  onSubmit={(amount, paymentMethod, notes) => {
                                    if (paymentModal.saleId) handleUpdatePayment(paymentModal.saleId, amount, paymentMethod, notes);
                                  }}
                                  maxAmount={paymentModal.maxAmount}
                                />
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>💳</span> Payment Details
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-600 font-semibold">Total Amount</p>
                              <p className="text-lg font-bold text-green-600">₹{sale.totalAmount.toFixed(2)}</p>
                            </div>
                            <div className={`bg-white rounded-lg p-3 border-2 ${sale.amountPaid ? 'border-green-400' : 'border-gray-300'}`}>
                              <p className="text-xs text-gray-600 font-semibold">Amount Paid</p>
                              <p className={`text-lg font-bold ${sale.amountPaid ? 'text-green-600' : 'text-gray-500'}`}>
                                ₹{(sale.amountPaid || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className={`bg-white rounded-lg p-3 border-2 ${sale.remainingAmount ? 'border-orange-400' : 'border-green-400'}`}>
                              <p className="text-xs text-gray-600 font-semibold">Amount Due</p>
                              <p className={`text-lg font-bold ${sale.remainingAmount ? 'text-orange-600' : 'text-green-600'}`}>
                                ₹{(sale.remainingAmount || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-300">
                              <p className="text-xs text-gray-600 font-semibold">Payment Status</p>
                              <p className={`text-sm font-bold ${
                                sale.paymentStatus === 'fully-paid'
                                  ? 'text-green-600'
                                  : sale.paymentStatus === 'partially-paid'
                                  ? 'text-orange-600'
                                  : 'text-red-600'
                              }`}>
                                {sale.paymentStatus === 'fully-paid' 
                                  ? '✓ Fully Paid' 
                                  : sale.paymentStatus === 'partially-paid'
                                  ? '⚠ Partially Paid'
                                  : '⏳ Pending'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

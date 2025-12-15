'use client';

import { useEffect, useState } from 'react';

interface SaleHistoryProps {
  sales?: Array<{
    _id?: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    createdAt?: string | Date;
    timestamp?: string | Date;
  }>;
}

export default function SaleHistory({ sales = [] }: SaleHistoryProps) {
  const [sortedSales, setSortedSales] = useState(sales);

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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Quantity</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.slice(0, 10).map((sale) => (
              <tr key={sale._id || `${sale.productName}-${sale.createdAt}`} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3">{sale.productName}</td>
                <td className="px-4 py-3 text-right">{sale.quantity}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">
                  ${sale.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-600">
                  {new Date(sale.createdAt || sale.timestamp || 0).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

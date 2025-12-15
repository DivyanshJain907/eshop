'use client';

import { useEffect, useState } from 'react';

interface Order {
  _id?: string;
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered';
}

interface OrderHistoryProps {
  orders?: Order[];
}

export default function OrderHistory({ orders = [] }: OrderHistoryProps) {
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrderList(orders);
  }, [orders]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'delivered':
        return '✓';
      case 'shipped':
        return '📦';
      case 'processing':
        return '⏳';
      default:
        return '⏱';
    }
  };

  if (orderList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <a
            href="#browse"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h2>

      {/* Orders List */}
      <div className="space-y-4">
        {orderList.map((order) => (
          <div
            key={order._id || order.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
          >
            {/* Order Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{order.productName}</h3>
                <p className="text-sm text-gray-600">
                  Order ID: {(order._id || order.id)?.toString().slice(-8)}
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)} {order.status || 'Pending'}
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-bold text-gray-900">{order.quantity}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-bold text-gray-900">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Price/Unit</p>
                <p className="font-bold text-gray-900">
                  ₹{(order.totalAmount / order.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedOrder?.id === order.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Timeline */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Order Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-gray-700">Order Placed</span>
                      </div>
                      {['processing', 'shipped', 'delivered'].includes(order.status || '') && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-700">Processing</span>
                        </div>
                      )}
                      {['shipped', 'delivered'].includes(order.status || '') && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-700">Shipped</span>
                        </div>
                      )}
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-700">Delivered</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm">
                        Track Order
                      </button>
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        View Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

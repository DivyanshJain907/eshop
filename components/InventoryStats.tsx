'use client';

import { Product } from '@/lib/types';

interface InventoryStatsProps {
  products?: Product[];
}

export default function InventoryStats({ products = [] }: InventoryStatsProps) {
  const totalProducts = (products || []).length;
  const totalQuantity = (products || []).reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = (products || []).reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount = (products || []).filter((p) => p.quantity < 10).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <p className="text-gray-600 text-sm font-medium">Total Products</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{totalProducts}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <p className="text-gray-600 text-sm font-medium">Total Quantity</p>
        <p className="text-3xl font-bold text-green-600 mt-2">{totalQuantity}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
        <p className="text-3xl font-bold text-purple-600 mt-2">Rs. {totalValue.toFixed(2)}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
        <p className="text-3xl font-bold text-red-600 mt-2">{lowStockCount}</p>
      </div>
    </div>
  );
}

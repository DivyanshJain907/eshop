'use client';

import { Suspense } from 'react';
import ProductBrowserWrapper from '@/components/ProductBrowserWrapper';

export default function CustomerProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <div className="h-16 bg-gray-100 animate-pulse" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <ProductBrowserWrapper />
    </Suspense>
  );
}

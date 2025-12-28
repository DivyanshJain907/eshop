import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import ProductTable from '@/components/ProductTable';

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=10000');
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : (data.products || []));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}

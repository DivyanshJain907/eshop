'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CompetitorStats {
  total: number;
  active: number;
  inactive: number;
}

export default function CompetitorStats() {
  const [stats, setStats] = useState<CompetitorStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/compare/competitors');
      const data = await response.json();

      if (data.success && data.competitors) {
        const competitors = data.competitors;
        setStats({
          total: competitors.length,
          active: competitors.filter((c: any) => c.isActive).length,
          inactive: competitors.filter((c: any) => !c.isActive).length,
        });
      }
    } catch (err) {
      console.error('Error fetching competitor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border-t-2 border-purple-500 hover:shadow-lg transition">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href="/admin/competitors">
      <div className="bg-white rounded-xl shadow-md p-6 border-t-2 border-purple-500 hover:shadow-lg transition cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-700 font-semibold">Competitors</h4>
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-3xl font-bold text-purple-600 mb-2">{stats.total}</p>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="text-green-600">✓ {stats.active} Active</span>
          <span className="text-red-600">✗ {stats.inactive} Inactive</span>
        </div>
      </div>
    </Link>
  );
}

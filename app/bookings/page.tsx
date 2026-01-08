'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import UserHeader from '@/components/UserHeader';
import BookingManagement from '@/components/BookingManagement';

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check if user is Employee or Admin
  useEffect(() => {
    if (!isLoading && user && user.role !== 'employee' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-100">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== 'employee' && user.role !== 'admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <UserHeader />
      
      {/* Luxury Header Section */}
      <div className="relative py-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full border border-amber-500/50 backdrop-blur-md">
              <span className="text-amber-300 text-sm font-semibold">✨ Premium Booking Management</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-100 bg-clip-text">
              Booking Management
            </h1>
            <p className="text-xl text-amber-100/80 max-w-2xl mx-auto">
              Manage your luxury bookings with elegance and precision
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {/* Booking Management Section */}
        <div className="relative">
          {/* Glass effect background */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-blue-500/5 rounded-3xl blur-2xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-500/20 p-8 md:p-12">
            <BookingManagement />
          </div>
        </div>
      </div>
    </div>
  );
}

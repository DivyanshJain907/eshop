'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import UserHeader from '@/components/UserHeader';
import UserManagement from '@/components/UserManagement';

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check if user is Admin or Employee
  useEffect(() => {
    if (!isLoading && user && (user.role !== 'admin' && user.role !== 'employee')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

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

  if (!isAuthenticated || (user && user.role !== 'admin' && user.role !== 'employee')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />


      <div className="w-full flex flex-col items-stretch px-0 pb-0">
        {/* User Management Section */}
        <div className="w-full bg-white/90 rounded-none shadow-none border-0">
          <div className="p-0">
            <UserManagement isAdmin={user?.role === 'admin'} />
          </div>
        </div>
      </div>
    </div>
  );
}

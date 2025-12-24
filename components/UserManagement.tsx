'use client';

import { useEffect, useState } from 'react';
import { fetchAllUsers, updateUserRole, deleteUser, fetchDirectSalesCustomers } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'employee' | 'admin';
  street: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  isDirectSaleCustomer?: boolean;
  totalPurchases?: number;
  totalAmount?: number;
  lastPurchaseDate?: string;
  totalAmountPaid?: number;
  totalAmountDue?: number;
  pendingPayments?: number;
}

interface UserManagementProps {
  isAdmin?: boolean;
}

export default function UserManagement({ isAdmin = true }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [directSalesCustomers, setDirectSalesCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'registered' | 'directSales'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersData, directSalesData] = await Promise.all([
      fetchAllUsers(),
      fetchDirectSalesCustomers(),
    ]);
    setUsers(Array.isArray(usersData) ? usersData : []);
    setDirectSalesCustomers(Array.isArray(directSalesData) ? directSalesData : []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    console.log('🔵 Handle role change called:', { userId, newRole, userIdType: typeof userId });
    setUpdating(userId);
    const updated = await updateUserRole(userId, newRole);

    if (updated) {
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, role: newRole as any } : u
        )
      );
      console.log('✅ User role updated in state');
    } else {
      console.log('🔴 Failed to update user role');
    }
    setUpdating(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const success = await deleteUser(userId);
    if (success) {
      setUsers(users.filter((u) => u._id !== userId));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = (() => {
    let allUsers: User[] = [];
    
    if (filterType === 'all') {
      allUsers = [...users, ...directSalesCustomers];
    } else if (filterType === 'registered') {
      allUsers = users;
    } else if (filterType === 'directSales') {
      allUsers = directSalesCustomers;
    }
    
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 User Management</h2>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📊 All Users ({users.length + directSalesCustomers.length})
        </button>
        <button
          onClick={() => setFilterType('registered')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'registered'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          👤 Registered Users ({users.length})
        </button>
        <button
          onClick={() => setFilterType('directSales')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterType === 'directSales'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🛒 Direct Sales Customers ({directSalesCustomers.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* User Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length + directSalesCustomers.length} users
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* User Header */}
              <div
                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === user._id ? null : user._id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      {user.isDirectSaleCustomer && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          🛒 Direct Sale
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    {user.isDirectSaleCustomer && (
                      <p className="text-sm text-gray-500 mt-1">💰 {user.totalPurchases} purchase(s) - ₹{user.totalAmount?.toFixed(2)}</p>
                    )}
                  </div>

                  <span className="ml-4 text-gray-400">
                    {expandedId === user._id ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* User Details */}
              {expandedId === user._id && (
                <div className="border-t border-gray-200 p-4 bg-white space-y-4">
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">📞 Contact Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Phone:</span> {user.phone}</p>
                      <p><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Address Info */}
                  {!user.isDirectSaleCustomer && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">📍 Address</h4>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p>{user.street}</p>
                        <p>{user.city}, {user.state} {user.pincode}</p>
                      </div>
                    </div>
                  )}

                  {/* Purchase History for Direct Sales Customers */}
                  {user.isDirectSaleCustomer && (
                    <>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">📦 Purchase Summary</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                          <p><span className="font-medium">Total Purchases:</span> {user.totalPurchases}</p>
                          <p><span className="font-medium">Total Amount:</span> <span className="text-green-600 font-bold">₹{user.totalAmount?.toFixed(2)}</span></p>
                          <p><span className="font-medium">Average Order Value:</span> ₹{(user.totalAmount ? user.totalAmount / (user.totalPurchases || 1) : 0).toFixed(2)}</p>
                          {user.lastPurchaseDate && (
                            <p><span className="font-medium">Last Purchase:</span> {new Date(user.lastPurchaseDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">💳 Payment Information</h4>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-orange-200 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-600 font-semibold">Total Amount</p>
                              <p className="text-lg font-bold text-green-600">₹{user.totalAmount?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className={`bg-white rounded-lg p-3 border-2 ${user.totalAmountPaid ? 'border-green-400' : 'border-gray-300'}`}>
                              <p className="text-xs text-gray-600 font-semibold">Amount Paid</p>
                              <p className={`text-lg font-bold ${user.totalAmountPaid ? 'text-green-600' : 'text-gray-500'}`}>
                                ₹{(user.totalAmountPaid || 0).toFixed(2)}
                              </p>
                            </div>
                            <div className={`bg-white rounded-lg p-3 border-2 ${user.totalAmountDue ? 'border-orange-400' : 'border-green-400'}`}>
                              <p className="text-xs text-gray-600 font-semibold">Amount Due</p>
                              <p className={`text-lg font-bold ${user.totalAmountDue ? 'text-orange-600' : 'text-green-600'}`}>
                                ₹{(user.totalAmountDue || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {user.pendingPayments ? (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                              <p className="text-sm text-red-800"><span className="font-bold">⚠️ Pending:</span> {user.pendingPayments} order(s) awaiting payment</p>
                            </div>
                          ) : (
                            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                              <p className="text-sm text-green-800"><span className="font-bold">✓ Status:</span> All payments up to date</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Role Management */}
                  {isAdmin && !user.isDirectSaleCustomer && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">🎯 Change Role</h4>
                      <div className="flex gap-2 flex-wrap">
                        {['customer', 'employee', 'admin'].map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(user._id, role)}
                            disabled={updating === user._id || user.role === role}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              user.role === role
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                            }`}
                          >
                            {updating === user._id && user.role !== role ? 'Updating...' : role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delete Button */}
                  {isAdmin && !user.isDirectSaleCustomer && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        🗑️ Delete User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No users found</p>
        </div>
      )}
    </div>
  );
}

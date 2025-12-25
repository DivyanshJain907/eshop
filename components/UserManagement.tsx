'use client';

import { useEffect, useState } from 'react';
import { fetchAllUsers, updateUserRole, deleteUser, fetchDirectSalesCustomers } from '@/lib/api';
import { fetchUserSalesRecords, fetchUserBookingRecords } from '@/lib/userRecords';

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
  const [userRecords, setUserRecords] = useState<Record<string, { sales: any[]; bookings: any[] }>>({});
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
    <div className="bg-white/90 rounded-2xl shadow-2xl p-8 border border-blue-100">
      {/* Filter & Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 All Users ({users.length + directSalesCustomers.length})
          </button>
          <button
            onClick={() => setFilterType('registered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              filterType === 'registered'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👤 Registered Users ({users.length})
          </button>
          <button
            onClick={() => setFilterType('directSales')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              filterType === 'directSales'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Direct Sales Customers ({directSalesCustomers.length})
          </button>
        </div>
        <div className="w-full md:w-72 flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
          <span className="text-gray-400 mr-2 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none border-none text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* User Count */}
      <div className="mb-6 text-sm text-gray-600">
        Showing <span className="font-bold text-indigo-700">{filteredUsers.length}</span> of <span className="font-bold text-indigo-700">{users.length + directSalesCustomers.length}</span> users
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="space-y-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-white via-blue-50 to-cyan-50"
            >
              {/* User Header */}
              <div
                className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={async () => {
                  const nextId = expandedId === user._id ? null : user._id;
                  setExpandedId(nextId);
                  if (nextId && !userRecords[nextId]) {
                    let sales: any[] = [];
                    let bookings: any[] = [];
                    if (user.isDirectSaleCustomer) {
                      sales = await fetchUserSalesRecords({ userId: user._id, customerMobile: user.phone, customerName: user.name });
                    } else {
                      bookings = await fetchUserBookingRecords(user._id);
                    }
                    setUserRecords(prev => ({ ...prev, [nextId]: { sales, bookings } }));
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-black text-lg">{user.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm border ${getRoleColor(user.role)} border-indigo-200 bg-gradient-to-r from-white to-indigo-50`}> 
                        {user.role === 'admin' ? '🛡️ Admin' : user.role === 'employee' ? '👔 Employee' : '👤 Customer'}
                      </span>
                      {user.isDirectSaleCustomer && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm">
                          🛒 Direct Sale
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-black mt-1">{user.email}</p>
                    {user.isDirectSaleCustomer && (
                      <p className="text-sm text-black mt-1">💰 {user.totalPurchases} purchase(s) - ₹{user.totalAmount?.toFixed(2)}</p>
                    )}
                  </div>

                  <span className="ml-4 text-black text-xl">
                    {expandedId === user._id ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* User Details */}
              {expandedId === user._id && (
                <div className="border-t border-gray-200 p-6 bg-white/90 space-y-6">
                  {/* Previous Records */}
                  <div>
                    <h4 className="font-bold text-black mb-3">🕑 Previous Records</h4>
                    {user.isDirectSaleCustomer && userRecords[user._id]?.sales?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-black space-y-2">
                        <div className="font-semibold mb-1">Sales History:</div>
                        {userRecords[user._id].sales.map((sale, idx) => (
                          <div key={sale._id || idx} className="border-b border-gray-200 pb-2 mb-2">
                            <div><span className="font-medium">Date:</span> {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : '-'}</div>
                            <div><span className="font-medium">Amount:</span> ₹{sale.totalAmount?.toFixed(2) ?? '-'}</div>
                            <div><span className="font-medium">Status:</span> {sale.paymentStatus || sale.status || '-'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!user.isDirectSaleCustomer && userRecords[user._id]?.bookings?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-black space-y-2">
                        <div className="font-semibold mb-1">Booking History:</div>
                        {userRecords[user._id].bookings.map((booking, idx) => (
                          <div key={booking._id || idx} className="border-b border-gray-200 pb-2 mb-2">
                            <div><span className="font-medium">Date:</span> {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '-'}</div>
                            <div><span className="font-medium">Amount:</span> ₹{booking.totalAmount?.toFixed(2) ?? '-'}</div>
                            <div><span className="font-medium">Status:</span> {booking.status || '-'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {((user.isDirectSaleCustomer && (!userRecords[user._id]?.sales || userRecords[user._id]?.sales.length === 0)) || (!user.isDirectSaleCustomer && (!userRecords[user._id]?.bookings || userRecords[user._id]?.bookings.length === 0))) && (
                      <div className="text-gray-500 text-sm">No previous records found.</div>
                    )}
                  </div>
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-bold text-black mb-3">📞 Contact Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-black">
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Phone:</span> {user.phone}</p>
                      <p><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Address Info */}
                  {!user.isDirectSaleCustomer && (
                    <div>
                      <h4 className="font-bold text-black mb-3">📍 Address</h4>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-black">
                        <p>{user.street}</p>
                        <p>{user.city}, {user.state} {user.pincode}</p>
                      </div>
                    </div>
                  )}

                  {/* Purchase History for Direct Sales Customers */}
                  {user.isDirectSaleCustomer && (
                    <>
                      <div>
                        <h4 className="font-bold text-black mb-3">📦 Purchase Summary</h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-black">
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
                        <h4 className="font-bold text-black mb-3">💳 Payment Information</h4>
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
                        <h4 className="font-bold text-black mb-3">🎯 Change Role</h4>
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

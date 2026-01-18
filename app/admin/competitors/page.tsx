'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import UserHeader from '@/components/UserHeader';

interface Competitor {
  _id: string;
  name: string;
  baseUrl: string;
  searchUrl: string;
  selectors: {
    productContainer: string;
    productName: string;
    productBrand: string;
    productPrice: string;
    productImage: string;
    productUrl: string;
  };
  maxResults: number;
  timeout: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function CompetitorsAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    searchUrl: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      fetchCompetitors();
    }
  }, [isLoading, isAuthenticated, user]);

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compare/competitors');
      const data = await response.json();

      if (data.success) {
        setCompetitors(data.competitors || []);
      } else {
        setError('Failed to load competitors');
      }
    } catch (err: any) {
      setError('Error loading competitors: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/compare/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          baseUrl: formData.baseUrl,
          searchUrl: formData.searchUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingId ? 'Competitor updated successfully!' : 'Competitor added successfully!');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchCompetitors();
      } else {
        setError(data.message || 'Failed to save competitor');
      }
    } catch (err: any) {
      setError('Error saving competitor: ' + err.message);
    }
  };

  const handleEdit = (competitor: Competitor) => {
    setFormData({
      name: competitor.name,
      baseUrl: competitor.baseUrl,
      searchUrl: competitor.searchUrl,
    });
    setEditingId(competitor._id);
    setShowForm(true);
  };

  const handleToggleActive = async (competitor: Competitor) => {
    try {
      const response = await fetch('/api/compare/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: competitor.name,
          baseUrl: competitor.baseUrl,
          searchUrl: competitor.searchUrl,
          selectors: competitor.selectors,
          maxResults: competitor.maxResults,
          timeout: competitor.timeout,
          isActive: !competitor.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${competitor.name} ${!competitor.isActive ? 'enabled' : 'disabled'} successfully!`);
        fetchCompetitors();
      } else {
        setError(data.message || 'Failed to update competitor');
      }
    } catch (err: any) {
      setError('Error updating competitor: ' + err.message);
    }
  };

  const handleDelete = async (competitor: Competitor) => {
    if (!confirm(`Are you sure you want to delete ${competitor.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/compare/competitors?id=${competitor._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${competitor.name} deleted successfully!`);
        fetchCompetitors();
      } else {
        setError(data.message || 'Failed to delete competitor');
      }
    } catch (err: any) {
      setError('Error deleting competitor: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      baseUrl: '',
      searchUrl: '',
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
    setError('');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Management</h1>
            <p className="text-gray-600">Manage competitor websites for price comparison</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ➕ Add New Competitor
            </button>
          )}
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Competitor' : 'Add New Competitor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competitor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Borosil"
                    required
                    disabled={!!editingId}
                  />
                  {editingId && (
                    <p className="text-xs text-gray-500 mt-1">Name cannot be changed when editing</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL *
                  </label>
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search URL Pattern * <span className="text-gray-500">(use {'{query}'} as placeholder)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.searchUrl}
                    onChange={(e) => setFormData({ ...formData, searchUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.example.com/search?q={query}"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingId ? '💾 Update Competitor' : '➕ Add Competitor'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Competitors List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              All Competitors ({competitors.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {competitors.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No competitors configured. Add your first competitor above.
              </div>
            ) : (
              competitors.map((competitor) => (
                <div key={competitor._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{competitor.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            competitor.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {competitor.isActive ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Base URL:</strong>{' '}
                          <a
                            href={competitor.baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {competitor.baseUrl}
                          </a>
                        </p>
                        <p>
                          <strong>Search URL:</strong> {competitor.searchUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(competitor)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(competitor)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          competitor.isActive
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {competitor.isActive ? '⏸️ Disable' : '▶️ Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(competitor)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

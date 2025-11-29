import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';

// Skeleton loader untuk stats cards
const StatsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    isError 
  } = useDashboardStats();

  // Debug data yang diterima
  console.log('📊 Stats data in component:', stats);
  console.log('🔄 Loading state:', statsLoading);
  console.log('❌ Error state:', statsError);

  // Data statistik dengan nilai real dari API dan fallback yang lebih aman
  const dashboardStats = [
    { 
      title: 'Total Rooms', 
      value: stats?.total_rooms?.toString() || '0', 
      icon: '🏨', 
      color: 'bg-blue-500',
      link: '/admin/rooms'
    },
    { 
      title: 'Active Bookings', 
      value: stats?.active_bookings?.toString() || '0', 
      icon: '📅', 
      color: 'bg-green-500',
      link: '/admin/bookings'
    },
    { 
      title: 'User Reviews', 
      value: stats?.user_reviews?.toString() || '0', 
      icon: '⭐', 
      color: 'bg-yellow-500',
      link: '/admin/ratings'
    },
    { 
      title: 'Revenue', 
      value: stats?.revenue ? `Rp ${stats.revenue.toLocaleString()}` : 'Rp 0', 
      icon: '💰', 
      color: 'bg-purple-500',
      link: '/admin/bookings'
    }
  ];

  // Tampilkan error dengan lebih detail
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading dashboard data</p>
            <p>{statsError?.message || 'Unknown error occurred'}</p>
            {statsError?.response && (
              <p className="text-sm mt-2">
                Status: {statsError.response.status} - {statsError.response.statusText}
              </p>
            )}
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your hotel management dashboard
          </p>
          {stats && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Data updated: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            // Loading skeleton
            <>
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            // Real data
            dashboardStats.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105 transform transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click to manage
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Business Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Business Overview
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Occupancy Rate */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
                  <div className="text-blue-600 dark:text-blue-300 text-2xl font-bold mb-2">
                    {stats?.total_rooms > 0 
                      ? `${Math.round((stats.active_bookings / stats.total_rooms) * 100)}%`
                      : '0%'
                    }
                  </div>
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">Occupancy Rate</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                    {stats?.active_bookings || 0} of {stats?.total_rooms || 0} rooms occupied
                  </p>
                </div>

                {/* Average Rating */}
                <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
                  <div className="text-green-600 dark:text-green-300 text-2xl font-bold mb-2">
                    {stats?.user_reviews > 0 ? '4.5★' : 'N/A'}
                  </div>
                  <p className="text-green-800 dark:text-green-200 text-sm font-medium">Avg Rating</p>
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                    Based on {stats?.user_reviews || 0} reviews
                  </p>
                </div>

                {/* Revenue Growth */}
                <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4 text-center">
                  <div className="text-purple-600 dark:text-purple-300 text-2xl font-bold mb-2">
                    +12%
                  </div>
                  <p className="text-purple-800 dark:text-purple-200 text-sm font-medium">Revenue Growth</p>
                  <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">
                    vs last month
                  </p>
                </div>

                {/* Customer Satisfaction */}
                <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 text-center">
                  <div className="text-yellow-600 dark:text-yellow-300 text-2xl font-bold mb-2">
                    94%
                  </div>
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">Satisfaction</p>
                  <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                    Positive feedback
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <p className="text-gray-800 dark:text-gray-200 text-lg font-bold">
                    {stats?.total_rooms || 0}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Total Rooms</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <p className="text-gray-800 dark:text-gray-200 text-lg font-bold">
                    {stats?.active_bookings || 0}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Active Stays</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  <p className="text-gray-800 dark:text-gray-200 text-lg font-bold">
                    {stats?.user_reviews || 0}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Total Reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/rooms"
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors duration-300 hover:scale-105 transform"
              >
                <div className="text-2xl mb-2">🏨</div>
                <p className="font-medium">Manage Rooms</p>
              </Link>
              <Link
                to="/admin/bookings"
                className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors duration-300 hover:scale-105 transform"
              >
                <div className="text-2xl mb-2">📅</div>
                <p className="font-medium">View Bookings</p>
              </Link>
              <Link
                to="/admin/ratings"
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg text-center transition-colors duration-300 hover:scale-105 transform"
              >
                <div className="text-2xl mb-2">⭐</div>
                <p className="font-medium">Ratings</p>
              </Link>
              <Link
                to="/"
                className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center transition-colors duration-300 hover:scale-105 transform"
              >
                <div className="text-2xl mb-2">👀</div>
                <p className="font-medium">View Site</p>
              </Link>
            </div>

{/* Additional Quick Stats */}
<div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
    Quick Stats
  </h3>
  <div className="grid grid-cols-2 gap-3 text-sm">
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">Available Rooms:</span>
      <span className="font-semibold text-gray-800 dark:text-white">
        {stats?.available_rooms || 0}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">Monthly Revenue:</span>
      <span className="font-semibold text-gray-800 dark:text-white">
        {stats?.revenue ? `Rp ${stats.revenue.toLocaleString()}` : 'Rp 0'}
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">Avg Stay Duration:</span>
      <span className="font-semibold text-gray-800 dark:text-white">3.2 days</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400">Repeat Guests:</span>
      <span className="font-semibold text-gray-800 dark:text-white">42%</span>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
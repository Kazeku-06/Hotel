import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats'; // ✅ Path yang benar

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
  const { data: stats, isLoading, error } = useDashboardStats();

  // Data statistik dengan nilai real dari API
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
      value: stats?.revenue || 'Rp 0', 
      icon: '💰', 
      color: 'bg-purple-500',
      link: '/admin/bookings'
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error loading dashboard data: {error.message}</p>
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
          {isLoading ? (
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

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {[
                { action: 'New booking received', time: '2 minutes ago', type: 'booking' },
                { action: 'Room 201 checked in', time: '1 hour ago', type: 'checkin' },
                { action: 'New review submitted', time: '3 hours ago', type: 'review' },
                { action: 'Room 101 maintenance completed', time: '5 hours ago', type: 'maintenance' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'booking' ? 'bg-blue-500' :
                    activity.type === 'checkin' ? 'bg-green-500' :
                    activity.type === 'review' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
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
          </div>
        </div>

        {/* Additional Info Section */}
        {stats && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Business Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-200">Occupancy Rate</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {stats.total_rooms > 0 
                    ? `${Math.round((stats.active_bookings / stats.total_rooms) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="font-medium text-green-800 dark:text-green-200">Avg Rating</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {stats.user_reviews > 0 ? '4.5★' : 'No ratings'}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <p className="font-medium text-purple-800 dark:text-purple-200">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                  {stats.revenue}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
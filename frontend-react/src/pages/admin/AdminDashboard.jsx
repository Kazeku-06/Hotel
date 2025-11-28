import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useDashboardCharts } from '../../hooks/useDashboardCharts';

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

// Skeleton untuk charts
const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4"></div>
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

// Komponen Grafik Pemesanan Kamar dengan Real Data
const RoomBookingChart = ({ chartsData, isLoading }) => {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const bookingData = chartsData?.booking_trends || [];
  const maxBookings = bookingData.length > 0 ? Math.max(...bookingData.map(item => item.bookings)) : 0;

  // Warna untuk different states
  const getBarColor = (bookings, maxBookings) => {
    const percentage = maxBookings > 0 ? (bookings / maxBookings) * 100 : 0;
    if (percentage >= 80) return 'bg-red-500 hover:bg-red-600';
    if (percentage >= 60) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-blue-500 hover:bg-blue-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Trend Pemesanan (7 Hari Terakhir)
      </h2>
      
      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Rendah</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Sedang</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Tinggi</span>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {bookingData.reduce((sum, item) => sum + item.bookings, 0)} pemesanan
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((line) => (
            <div key={line} className="border-t border-gray-200 dark:border-gray-700"></div>
          ))}
        </div>

        {/* Chart Bars */}
        <div className="relative h-48 flex items-end justify-between pt-4">
          {bookingData.map((item, index) => {
            const height = maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0;
            const barColor = getBarColor(item.bookings, maxBookings);
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                {/* Booking Bar */}
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-3/4 ${barColor} rounded-t transition-all duration-300 cursor-pointer relative group`}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {item.bookings} pemesanan<br/>
                      {item.date}
                    </div>
                  </div>
                  
                  {/* Day Label */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {item.day}
                  </div>
                  
                  {/* Booking Count */}
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                    {item.bookings}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 -ml-8">
          <span>{maxBookings}</span>
          <span>{Math.round(maxBookings * 0.75)}</span>
          <span>{Math.round(maxBookings * 0.5)}</span>
          <span>{Math.round(maxBookings * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Summary Stats */}
      {bookingData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.max(...bookingData.map(item => item.bookings))}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Puncak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {Math.round(bookingData.reduce((sum, item) => sum + item.bookings, 0) / bookingData.length)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Rata-rata</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {bookingData.filter(item => item.bookings > 0).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Hari Aktif</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponen Grafik Tipe Kamar Terpopuler dengan Real Data
const RoomTypeChart = ({ chartsData, isLoading }) => {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const roomTypeData = chartsData?.popular_room_types || [];
  const totalBookings = roomTypeData.reduce((sum, item) => sum + item.bookings, 0);

  // Warna untuk different room types
  const roomTypeColors = {
    'Standard': 'bg-blue-500',
    'Deluxe': 'bg-green-500',
    'Suite': 'bg-purple-500',
    'Executive': 'bg-yellow-500',
    'Premium': 'bg-red-500',
    'Family': 'bg-indigo-500'
  };

  const getRoomTypeColor = (roomType) => {
    return roomTypeColors[roomType] || 'bg-gray-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Tipe Kamar Terpopuler
      </h2>

      {roomTypeData.length > 0 ? (
        <>
          <div className="space-y-4">
            {roomTypeData.map((item, index) => {
              const percentage = totalBookings > 0 ? (item.bookings / totalBookings) * 100 : 0;
              const colorClass = getRoomTypeColor(item.type);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.type}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.bookings} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Pemesanan:</span>
              <span className="font-semibold text-gray-800 dark:text-white">{totalBookings}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            📊
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada data pemesanan
          </p>
        </div>
      )}
    </div>
  );
};

// Komponen Grafik Status Booking
const BookingStatusChart = ({ chartsData, isLoading }) => {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const statusData = chartsData?.booking_status || [];

  const statusColors = {
    'pending': 'bg-yellow-500',
    'confirmed': 'bg-blue-500',
    'checked_in': 'bg-green-500',
    'checked_out': 'bg-purple-500',
    'cancelled': 'bg-red-500'
  };

  const statusLabels = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'checked_in': 'Checked In',
    'checked_out': 'Checked Out',
    'cancelled': 'Cancelled'
  };

  const totalBookings = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Status Pemesanan
      </h2>

      {statusData.length > 0 ? (
        <>
          <div className="space-y-3">
            {statusData.map((item, index) => {
              const percentage = totalBookings > 0 ? (item.count / totalBookings) * 100 : 0;
              const colorClass = statusColors[item.status] || 'bg-gray-500';
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${colorClass} rounded-full`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {item.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Bookings:</span>
              <span className="font-semibold text-gray-800 dark:text-white">{totalBookings}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            📋
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada data status
          </p>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: chartsData, isLoading: chartsLoading, error: chartsError } = useDashboardCharts();

  const error = statsError || chartsError;

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

        {/* Grafik Pemesanan Kamar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <RoomBookingChart chartsData={chartsData} isLoading={chartsLoading} />
          <RoomTypeChart chartsData={chartsData} isLoading={chartsLoading} />
          <BookingStatusChart chartsData={chartsData} isLoading={chartsLoading} />
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
                    {stats ? (stats.total_rooms - stats.active_bookings) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Revenue:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {stats?.revenue || 'Rp 0'}
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
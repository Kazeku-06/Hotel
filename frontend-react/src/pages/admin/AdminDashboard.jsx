import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'

// Mock data for dashboard stats
const dashboardStats = [
  { 
    title: 'Total Rooms', 
    value: '24', 
    icon: '🏨', 
    color: 'bg-blue-500',
    link: '/admin/rooms'
  },
  { 
    title: 'Active Bookings', 
    value: '12', 
    icon: '📅', 
    color: 'bg-green-500',
    link: '/admin/bookings'
  },
  { 
    title: 'Pending Reviews', 
    value: '8', 
    icon: '⭐', 
    color: 'bg-yellow-500',
    link: '/admin/ratings'
  },
  { 
    title: 'Revenue', 
    value: 'Rp 15.2M', 
    icon: '💰', 
    color: 'bg-gold-500',
    link: '/admin/bookings'
  }
]

export const AdminDashboard = () => {
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
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
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
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
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
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
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
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center transition-colors duration-300"
              >
                <div className="text-2xl mb-2">🏨</div>
                <p className="font-medium">Manage Rooms</p>
              </Link>
              <Link
                to="/admin/bookings"
                className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg text-center transition-colors duration-300"
              >
                <div className="text-2xl mb-2">📅</div>
                <p className="font-medium">View Bookings</p>
              </Link>
              <Link
                to="/admin/ratings"
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg text-center transition-colors duration-300"
              >
                <div className="text-2xl mb-2">⭐</div>
                <p className="font-medium">Ratings</p>
              </Link>
              <Link
                to="/"
                className="bg-gold-500 hover:bg-gold-600 text-white p-4 rounded-lg text-center transition-colors duration-300"
              >
                <div className="text-2xl mb-2">👀</div>
                <p className="font-medium">View Site</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
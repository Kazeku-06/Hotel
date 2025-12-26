import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Home, 
  Calendar, 
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Clock
} from 'lucide-react'
import Layout3D from '../../components/Layout3D'
import { adminAPI } from '../../api/admin'

const AdminDashboard3D = () => {
  const [timeRange, setTimeRange] = useState('7d')

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard', timeRange],
    queryFn: () => adminAPI.getDashboardStats(timeRange)
  })

  const stats = [
    {
      title: 'Total Bookings',
      value: dashboardData?.totalBookings || 0,
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Rooms',
      value: dashboardData?.activeRooms || 0,
      change: '+3%',
      trend: 'up',
      icon: Home,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Revenue',
      value: `Rp ${(dashboardData?.totalRevenue || 0).toLocaleString()}`,
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Guest Satisfaction',
      value: `${dashboardData?.averageRating || 4.8}/5`,
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50'
    }
  ]

  const quickActions = [
    {
      title: 'Manage Rooms',
      description: 'Add, edit, or remove room listings',
      icon: Home,
      link: '/admin/rooms',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'View Bookings',
      description: 'Monitor and manage reservations',
      icon: Calendar,
      link: '/admin/bookings',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Guest Reviews',
      description: 'Check ratings and feedback',
      icon: Star,
      link: '/admin/ratings',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Analytics',
      description: 'View detailed reports and insights',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const recentBookings = dashboardData?.recentBookings || []
  const recentReviews = dashboardData?.recentReviews || []

  if (isLoading) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout3D>
    )
  }

  return (
    <Layout3D>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Admin <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</span>
                </h1>
                <p className="text-gray-600">Welcome back! Here's what's happening at Grand Imperion</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`${stat.bgColor} rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {stat.title}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Link
                      to={action.link}
                      className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Bookings</h3>
                <Link
                  to="/admin/bookings"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentBookings.length > 0 ? recentBookings.slice(0, 5).map((booking, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {booking.guest_name || 'Guest'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Room {booking.room?.room_number} • {new Date(booking.check_in_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent bookings</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Reviews</h3>
                <Link
                  to="/admin/ratings"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentReviews.length > 0 ? recentReviews.slice(0, 5).map((review, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">
                        {review.guest_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (review.rating || 5) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {review.comment || 'Great stay! Highly recommended.'}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent reviews</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Performance Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Performance Overview</h3>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Live Data</span>
              </div>
            </div>
            
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chart visualization would go here</p>
                <p className="text-sm text-gray-500 mt-1">Revenue, occupancy, and booking trends</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout3D>
  )
}

export default AdminDashboard3D
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Eye,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react'
import Layout3D from '../components/Layout3D'
import { bookingsAPI } from '../api/bookings'

const MemberBookings3D = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Fetch bookings
  const { data: bookingsResponse, isLoading, error } = useQuery({
    queryKey: ['member-bookings'],
    queryFn: bookingsAPI.getMemberBookings
  })

  // Ensure bookings is always an array
  const bookings = Array.isArray(bookingsResponse) 
    ? bookingsResponse 
    : bookingsResponse?.data && Array.isArray(bookingsResponse.data) 
      ? bookingsResponse.data 
      : []

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    const matchesSearch = booking.room?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.room?.room_number?.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  }) : []

  if (isLoading) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </Layout3D>
    )
  }

  return (
    <Layout3D>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">My Bookings</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage and track your hotel reservations</p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by room name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Bookings List */}
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
                <p className="font-semibold">Failed to load bookings</p>
                <p className="text-sm mt-1">Please try again later</p>
              </div>
            </motion.div>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-gray-100 rounded-2xl p-12 max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No bookings match your search criteria' 
                    : "You haven't made any bookings yet"
                  }
                </p>
                <Link
                  to="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Browse Rooms
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Room Image */}
                      <div className="w-full lg:w-48 h-48 lg:h-auto">
                        <img
                          src={booking.room?.image_url || booking.room?.primary_photo ? `http://localhost:5000${booking.room.primary_photo}` : '/hotel1.jpeg'}
                          alt={booking.room?.name || `Room ${booking.room?.room_number}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/hotel1.jpeg'
                          }}
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {booking.room?.name || `Room ${booking.room?.room_number}`}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>Grand Imperion Hotel</span>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {booking.room?.room_type?.name || booking.room?.room_type || 'Standard'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm text-gray-600">4.8 (124 reviews)</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-semibold ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-gray-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">Check-in</span>
                            </div>
                            <div className="font-semibold">
                              {new Date(booking.check_in_date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-gray-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">Check-out</span>
                            </div>
                            <div className="font-semibold">
                              {new Date(booking.check_out_date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-gray-600 mb-1">
                              <Users className="w-4 h-4" />
                              <span className="text-sm font-medium">Guests</span>
                            </div>
                            <div className="font-semibold">
                              {booking.number_of_guests || 1} Guest{(booking.number_of_guests || 1) > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Actions and Price */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedBooking(booking)}
                              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden">View</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 text-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">Download</span>
                              <span className="sm:hidden">PDF</span>
                            </motion.button>

                            {booking.status === 'confirmed' && !booking.rating && (
                              <Link
                                to={`/rate/${booking.id}`}
                                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 md:px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
                              >
                                <Star className="w-4 h-4" />
                                <span className="hidden sm:inline">Rate Stay</span>
                                <span className="sm:hidden">Rate</span>
                              </Link>
                            )}
                          </div>
                          
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <div className="text-xl md:text-2xl font-bold text-gray-800">
                              {formatPrice(booking.total_amount)}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              Booking #{booking.id}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Booking Detail Modal */}
          <AnimatePresence>
            {selectedBooking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedBooking(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Room Info */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Room Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Room:</span>
                            <div className="font-semibold">
                              {selectedBooking.room?.name || `Room ${selectedBooking.room?.room_number}`}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <div className="font-semibold">
                              {selectedBooking.room?.room_type?.name || selectedBooking.room?.room_type || 'Standard'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Info */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Booking Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Booking ID:</span>
                            <div className="font-semibold">#{selectedBooking.id}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                              {getStatusIcon(selectedBooking.status)}
                              <span className="capitalize">{selectedBooking.status}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-in:</span>
                            <div className="font-semibold">
                              {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-out:</span>
                            <div className="font-semibold">
                              {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Guests:</span>
                            <div className="font-semibold">
                              {selectedBooking.number_of_guests || 1}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <div className="font-semibold text-blue-600">
                              {formatPrice(selectedBooking.total_amount)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {selectedBooking.special_requests && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-800 mb-3">Special Requests</h3>
                          <p className="text-gray-600 text-sm">{selectedBooking.special_requests}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setSelectedBooking(null)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          <span>Download Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout3D>
  )
}

export default MemberBookings3D
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Edit,
  X
} from 'lucide-react'
import Layout3D from '../../components/Layout3D'
import { adminAPI } from '../../api/admin'

const AdminBookings3D = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch bookings
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => adminAPI.getBookings()
  })

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }) => adminAPI.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings'])
    }
  })

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
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
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

  const handleStatusUpdate = (bookingId, newStatus) => {
    updateStatusMutation.mutate({ bookingId, status: newStatus })
  }

  const openModal = (booking) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.room?.room_number?.toString().includes(searchTerm) ||
                         booking.id?.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const today = new Date()
      const checkInDate = new Date(booking.check_in_date)
      
      switch (dateFilter) {
        case 'today':
          matchesDate = checkInDate.toDateString() === today.toDateString()
          break
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          matchesDate = checkInDate >= today && checkInDate <= weekFromNow
          break
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          matchesDate = checkInDate >= today && checkInDate <= monthFromNow
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  if (isLoading) {
    return (
      <Layout3D>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </Layout3D>
    )
  }

  return (
    <Layout3D>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Booking <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
            </h1>
            <p className="text-gray-600">Monitor and manage hotel reservations</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 md:mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by guest name, room, or booking ID..."
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
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
            {[
              { label: 'Total Bookings', value: bookings.length, color: 'from-blue-500 to-cyan-500' },
              { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'from-green-500 to-emerald-500' },
              { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'from-yellow-500 to-orange-500' },
              { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: 'from-red-500 to-pink-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-4 md:p-6"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Bookings List */}
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
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
              <div className="bg-gray-100 rounded-2xl p-8 md:p-12 max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'No bookings match your search criteria'
                    : 'No bookings available'
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                      {/* Room Image */}
                      <div className="lg:w-48 h-32 lg:h-auto">
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
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                              Booking #{booking.id}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.room?.name || `Room ${booking.room?.room_number}`}</span>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {booking.room?.room_type?.name || booking.room?.room_type || 'Standard'}
                              </span>
                            </div>
                            <div className="text-gray-600 mb-2">
                              Guest: <span className="font-semibold">{booking.guest_name || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-start md:items-end gap-2">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-semibold ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </div>
                            <div className="text-lg md:text-xl font-bold text-gray-800">
                              {formatPrice(booking.total_amount || 0)}
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
                            <div className="font-semibold text-sm md:text-base">
                              {new Date(booking.check_in_date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-gray-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">Check-out</span>
                            </div>
                            <div className="font-semibold text-sm md:text-base">
                              {new Date(booking.check_out_date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-gray-600 mb-1">
                              <Users className="w-4 h-4" />
                              <span className="text-sm font-medium">Guests</span>
                            </div>
                            <div className="font-semibold text-sm md:text-base">
                              {booking.number_of_guests || 1}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openModal(booking)}
                            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </motion.button>
                          
                          {booking.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                disabled={updateStatusMutation.isLoading}
                                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Confirm</span>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                disabled={updateStatusMutation.isLoading}
                                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </motion.button>
                            </>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </motion.button>
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
            {isModalOpen && selectedBooking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setIsModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Booking Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Booking ID</label>
                          <div className="text-gray-800">#{selectedBooking.id}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                            {getStatusIcon(selectedBooking.status)}
                            <span className="capitalize">{selectedBooking.status}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Name</label>
                          <div className="text-gray-800">{selectedBooking.guest_name || 'N/A'}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount</label>
                          <div className="text-gray-800 font-semibold">{formatPrice(selectedBooking.total_amount || 0)}</div>
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Room Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

                      {/* Stay Details */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">Stay Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
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

export default AdminBookings3D
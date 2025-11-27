import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsAPI } from '../../api/bookings'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import { useState, useMemo } from 'react'

export const AdminBookings = () => {
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const { data: bookingsResponse, isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => bookingsAPI.getAllBookings()
  })

  // FIX: Handle data structure properly
  const bookingsList = useMemo(() => {
    if (!bookingsResponse) return []
    
    console.log('🔍 DEBUG Raw bookings data:', bookingsResponse)
    
    // Coba berbagai kemungkinan struktur data
    if (Array.isArray(bookingsResponse)) {
      return bookingsResponse
    } 
    else if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
      return bookingsResponse.data
    }
    else if (bookingsResponse.success && Array.isArray(bookingsResponse.data)) {
      return bookingsResponse.data
    }
    else if (bookingsResponse.data && bookingsResponse.data.success && Array.isArray(bookingsResponse.data.data)) {
      return bookingsResponse.data.data
    }
    else {
      console.warn('❌ Unknown bookings data structure:', bookingsResponse)
      return []
    }
  }, [bookingsResponse])

  // DEBUG yang lebih baik
  console.log('✅ Final bookingsList:', bookingsList)
  console.log('✅ bookingsList length:', bookingsList.length)

  // Mutation untuk update status booking
  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }) => 
      bookingsAPI.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-bookings'])
      setShowStatusModal(false)
      setSelectedBooking(null)
    },
    onError: (error) => {
      console.error('❌ Update status error:', error)
    }
  })

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      checked_in: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      checked_out: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || colors.pending
  }

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const handleUpdateStatus = (booking) => {
    setSelectedBooking(booking)
    setShowStatusModal(true)
  }

  const handleStatusChange = (newStatus) => {
    console.log('🔘 Status button clicked:', newStatus)
    if (selectedBooking) {
      updateStatusMutation.mutate({
        bookingId: selectedBooking.id,
        status: newStatus
      })
    }
  }

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['checked_in', 'cancelled'],
      checked_in: ['checked_out'],
      checked_out: [],
      cancelled: []
    }
    return statusFlow[currentStatus] || []
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            Manage Bookings
          </h1>
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
            Failed to load bookings: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Manage Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all hotel bookings | Total: {bookingsList.length} bookings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {bookingsList.map((booking, index) => (
                  <tr key={booking.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{booking.id?.slice(-8) || `UNKNOWN-${index}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {booking.guest_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {booking.check_in && booking.check_out ? 
                          `${formatDate(booking.check_in)} - ${formatDate(booking.check_out)}` : 
                          'Date not available'
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.total_guests || 'N/A'} guests
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gold-500">
                        {formatCurrency(booking.total_price || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 transition-colors duration-300"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(booking)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-300"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {bookingsList.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                No bookings found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All bookings will appear here once customers start making reservations.
              </p>
            </div>
          </div>
        )}

        {/* Booking Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Booking Details
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Booking ID</label>
                      <p className="text-sm text-gray-900 dark:text-white">#{selectedBooking.id?.slice(-8)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guest Information</label>
                    <p className="text-sm text-gray-900 dark:text-white">Name: {selectedBooking.guest_name}</p>
                    <p className="text-sm text-gray-900 dark:text-white">Phone: {selectedBooking.phone}</p>
                    <p className="text-sm text-gray-900 dark:text-white">NIK: {selectedBooking.nik}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stay Details</label>
                    <p className="text-sm text-gray-900 dark:text-white">Check-in: {formatDate(selectedBooking.check_in)}</p>
                    <p className="text-sm text-gray-900 dark:text-white">Check-out: {formatDate(selectedBooking.check_out)}</p>
                    <p className="text-sm text-gray-900 dark:text-white">Total Guests: {selectedBooking.total_guests}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment</label>
                    <p className="text-sm text-gray-900 dark:text-white">Method: {selectedBooking.payment_method}</p>
                    <p className="text-sm font-semibold text-gold-500">Total: {formatCurrency(selectedBooking.total_price)}</p>
                  </div>

                  {selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rooms</label>
                      {selectedBooking.booking_rooms.map(room => (
                        <div key={room.id} className="text-sm text-gray-900 dark:text-white border-l-4 border-gold-500 pl-2 mb-2">
                          {room.room_type} ({room.quantity}x) - {room.breakfast_option} breakfast
                          <br />
                          <span className="text-gold-500">{formatCurrency(room.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal - PERBAIKAN */}
        {showStatusModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Update Booking Status
                  </h3>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Booking: #{selectedBooking.id?.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current Status: <span className={`font-semibold ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Status To:
                  </label>
                  {getNextStatusOptions(selectedBooking.status).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updateStatusMutation.isLoading}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
                        updateStatusMutation.isLoading 
                          ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-300 dark:border-gray-600' 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gold-500 hover:bg-gold-50 dark:hover:bg-gold-900/20 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-3 ${getStatusColor(status)}`}>
                          {status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {status === 'confirmed' && 'Confirm the booking'}
                          {status === 'checked_in' && 'Check-in guest'}
                          {status === 'checked_out' && 'Check-out guest (Room will become available)'}
                          {status === 'cancelled' && 'Cancel booking (Room will become available)'}
                        </span>
                      </div>
                      {!updateStatusMutation.isLoading && (
                        <span className="text-gold-500 text-lg">→</span>
                      )}
                    </button>
                  ))}
                  
                  {getNextStatusOptions(selectedBooking.status).length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">✓</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No further status changes available for this booking.
                      </p>
                    </div>
                  )}
                </div>

                {updateStatusMutation.isLoading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Updating status...</p>
                  </div>
                )}

                {updateStatusMutation.isError && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                    Error: {updateStatusMutation.error?.message || 'Failed to update status'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBookings
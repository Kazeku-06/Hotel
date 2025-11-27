import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsAPI } from '../../api/bookings'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateUtils'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export const AdminBookings = () => {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  
  // Get search and pagination from URL params
  const searchTerm = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page')) || 1
  const itemsPerPage = parseInt(searchParams.get('perPage')) || 10

  const { data: bookingsResponse, isLoading, error } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => bookingsAPI.getAllBookings()
  })

  // Update URL ketika search atau page berubah
  useEffect(() => {
    const newSearchParams = new URLSearchParams()
    
    if (searchTerm) {
      newSearchParams.set('search', searchTerm)
    }
    
    if (currentPage > 1) {
      newSearchParams.set('page', currentPage.toString())
    }
    
    if (itemsPerPage !== 10) {
      newSearchParams.set('perPage', itemsPerPage.toString())
    }
    
    setSearchParams(newSearchParams)
  }, [searchTerm, currentPage, itemsPerPage, setSearchParams])

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

  // Filter bookings berdasarkan search term
  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookingsList

    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return bookingsList.filter(booking => {
      return (
        (booking.id && booking.id.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.guest_name && booking.guest_name.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.phone && booking.phone.includes(lowerSearchTerm)) ||
        (booking.nik && booking.nik.includes(lowerSearchTerm)) ||
        (booking.status && booking.status.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.payment_method && booking.payment_method.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.booking_rooms && booking.booking_rooms.some(room => 
          room.room_type && room.room_type.toLowerCase().includes(lowerSearchTerm)
        )) ||
        (booking.check_in && formatDate(booking.check_in).toLowerCase().includes(lowerSearchTerm)) ||
        (booking.check_out && formatDate(booking.check_out).toLowerCase().includes(lowerSearchTerm))
      )
    })
  }, [bookingsList, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookings = filteredBookings.slice(startIndex, endIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const handleSearchChange = (value) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (value) {
      newSearchParams.set('search', value)
    } else {
      newSearchParams.delete('search')
    }
    newSearchParams.delete('page') // Reset to page 1 when searching
    setSearchParams(newSearchParams)
  }

  const handlePageChange = (page) => {
    if (page !== '...' && page >= 1 && page <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('page', page.toString())
      setSearchParams(newSearchParams)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleItemsPerPageChange = (value) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('perPage', value.toString())
    newSearchParams.delete('page') // Reset to page 1 when changing items per page
    setSearchParams(newSearchParams)
  }

  const clearSearch = () => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('search')
    newSearchParams.delete('page')
    setSearchParams(newSearchParams)
  }

  // DEBUG yang lebih baik
  console.log('✅ Final bookingsList:', bookingsList)
  console.log('✅ bookingsList length:', bookingsList.length)
  console.log('✅ Filtered bookings:', filteredBookings.length)
  console.log('✅ Current page:', currentPage)
  console.log('✅ Total pages:', totalPages)

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Manage Bookings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all hotel bookings | Total: {bookingsList.length} bookings
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Items Per Page Selector */}
          {filteredBookings.length > 5 && (
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600 dark:text-gray-400">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
            </div>
          )}

          {/* Search Info */}
          {searchTerm && (
            <div className="flex-1 max-w-md">
              <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Showing {filteredBookings.length} of {bookingsList.length} bookings matching "<strong>{searchTerm}</strong>"
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium transition-colors duration-300 whitespace-nowrap"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            </div>
          )}
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
                {currentBookings.map((booking, index) => (
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

        {filteredBookings.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                No bookings found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No bookings match your search for "<strong>{searchTerm}</strong>"
              </p>
              <button
                onClick={clearSearch}
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 font-semibold"
              >
                Show All Bookings
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Page Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      page === currentPage
                        ? 'bg-gold-500 text-white'
                        : page === '...'
                        ? 'bg-transparent text-gray-500 cursor-default'
                        : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Quick Status Filter Buttons */}
        {bookingsList.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleSearchChange('pending')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300"
            >
              Pending
            </button>
            <button
              onClick={() => handleSearchChange('confirmed')}
              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
            >
              Confirmed
            </button>
            <button
              onClick={() => handleSearchChange('checked_in')}
              className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-300"
            >
              Checked In
            </button>
            <button
              onClick={() => handleSearchChange('checked_out')}
              className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              Checked Out
            </button>
            <button
              onClick={() => handleSearchChange('cancelled')}
              className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300"
            >
              Cancelled
            </button>
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

        {/* Update Status Modal */}
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
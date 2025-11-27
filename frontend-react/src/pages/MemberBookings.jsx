import { useQuery } from '@tanstack/react-query'
import { bookingsAPI } from '../api/bookings'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateUtils'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

export const MemberBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Default 10 items per page
  
  const { 
    data: bookings, 
    isLoading, 
    error,
    isError 
  } = useQuery({
    queryKey: ['my-bookings', searchTerm],
    queryFn: () => bookingsAPI.getMyBookings(),
    retry: 1
  })

  // Update URL ketika search atau page berubah
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newSearchParams = new URLSearchParams(searchParams)
      
      if (searchTerm) {
        newSearchParams.set('search', searchTerm)
      } else {
        newSearchParams.delete('search')
      }
      
      if (currentPage > 1) {
        newSearchParams.set('page', currentPage.toString())
      } else {
        newSearchParams.delete('page')
      }
      
      setSearchParams(newSearchParams)
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, currentPage, searchParams, setSearchParams])

  // Reset ke page 1 ketika search berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // DEBUG
  console.log('🔍 Full axios response:', bookings)
  console.log('🔍 bookings.data:', bookings?.data)
  console.log('🔍 bookings.data.data:', bookings?.data?.data)
  console.log('🔍 Search term:', searchTerm)
  console.log('🔍 Current page:', currentPage)

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

  // Filter bookings berdasarkan search term
  const filterBookings = (bookingsData) => {
    if (!searchTerm) return bookingsData

    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return bookingsData.filter(booking => {
      return (
        (booking.id && booking.id.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.guest_name && booking.guest_name.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.phone && booking.phone.includes(lowerSearchTerm)) ||
        (booking.status && booking.status.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.payment_method && booking.payment_method.toLowerCase().includes(lowerSearchTerm)) ||
        (booking.booking_rooms && booking.booking_rooms.some(room => 
          room.room_type && room.room_type.toLowerCase().includes(lowerSearchTerm)
        )) ||
        (booking.check_in && formatDate(booking.check_in).toLowerCase().includes(lowerSearchTerm)) ||
        (booking.check_out && formatDate(booking.check_out).toLowerCase().includes(lowerSearchTerm))
      )
    })
  }

  const clearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  // PERBAIKAN: Akses data yang benar
  const bookingsData = bookings?.data?.data || []
  const bookingsCount = bookings?.data?.count || 0

  // Filter bookings berdasarkan search
  const filteredBookings = filterBookings(bookingsData)
  const filteredCount = filteredBookings.length

  // Pagination calculations
  const totalPages = Math.ceil(filteredCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookings = filteredBookings.slice(startIndex, endIndex)

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
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

  const handlePageChange = (page) => {
    if (page !== '...' && page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  console.log('✅ Bookings data:', bookingsData)
  console.log('✅ Bookings count:', bookingsCount)
  console.log('✅ Filtered bookings:', filteredBookings)
  console.log('✅ Filtered count:', filteredCount)
  console.log('✅ Pagination - Current page:', currentPage)
  console.log('✅ Pagination - Total pages:', totalPages)
  console.log('✅ Pagination - Showing:', currentBookings.length, 'items')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
            My Bookings
          </h1>
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <strong>Error loading bookings:</strong><br />
            {error?.message || 'Unknown error'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            My Bookings {bookingsCount > 0 && `(${bookingsCount})`}
          </h1>
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          {filteredCount > 5 && (
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
                    Showing {filteredCount} of {bookingsCount} bookings matching "<strong>{searchTerm}</strong>"
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


        {bookingsData.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                No bookings yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start by exploring our available rooms and make your first booking!
              </p>
              <Link
                to="/"
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 font-semibold"
              >
                Browse Rooms
              </Link>
            </div>
          </div>
        ) : filteredBookings.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                No bookings found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No bookings match your search for "<strong>{searchTerm}</strong>"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Try searching with different terms or check the spelling.
              </p>
              <button
                onClick={clearSearch}
                className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 font-semibold"
              >
                Show All Bookings
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Bookings List */}
            <div className="space-y-6 mb-8">
              {currentBookings.map((booking, index) => (
                <div key={booking.id || index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Booking #{booking.id?.slice(-8) || `UNKNOWN-${index}`}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {booking.check_in && booking.check_out ? 
                          `${formatDate(booking.check_in)} - ${formatDate(booking.check_out)}` : 
                          'Date not available'
                        }
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Guest:</strong> {booking.guest_name || 'N/A'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Phone:</strong> {booking.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Total Guests:</strong> {booking.total_guests || 'N/A'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Payment:</strong> {booking.payment_method || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Rooms:</h4>
                    <div className="space-y-2">
                      {booking.booking_rooms?.map(room => (
                        <div key={room.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {room.room_type} ({room.quantity}x) - {room.breakfast_option} breakfast
                          </span>
                          <span className="text-gold-500 font-semibold">
                            {formatCurrency(room.subtotal || 0)}
                          </span>
                        </div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400">No room details available</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-gold-500">
                        {formatCurrency(booking.total_price || 0)}
                      </span>
                    </div>
                  </div>

                  {booking.status === 'checked_out' && !booking.rating && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        to={`/rate/${booking.id}`}
                        className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
                      >
                        Rate Your Stay
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Page Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCount)} of {filteredCount} bookings
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
          </>
        )}

        {/* Quick Status Filter Buttons */}
        {bookingsData.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSearchTerm('pending')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-300"
            >
              Pending
            </button>
            <button
              onClick={() => setSearchTerm('confirmed')}
              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
            >
              Confirmed
            </button>
            <button
              onClick={() => setSearchTerm('checked_in')}
              className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-300"
            >
              Checked In
            </button>
            <button
              onClick={() => setSearchTerm('checked_out')}
              className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              Checked Out
            </button>
            <button
              onClick={() => setSearchTerm('cancelled')}
              className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300"
            >
              Cancelled
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberBookings
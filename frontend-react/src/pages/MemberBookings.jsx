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
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, currentPage, searchParams, setSearchParams])

  // Reset ke page 1 ketika search berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-blue-500 text-white',
      checked_in: 'bg-green-500 text-white',
      checked_out: 'bg-gray-600 text-white',
      cancelled: 'bg-red-500 text-white'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      checked_in: '🏨',
      checked_out: '📤',
      cancelled: '❌'
    }
    return icons[status] || '📋'
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

  // Akses data yang benar
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

  const handlePageChange = (page) => {
    if (page !== '...' && page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-yellow-500/20 rounded w-1/4 mb-8"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-8 rounded-2xl text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Error Loading Bookings</h3>
            <p className="text-red-300 mb-6">{error?.message || 'Unknown error occurred'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-gray-400 text-lg">
            Manage and track your hotel reservations
          </p>
        </div>

        {/* Stats Cards */}
        {bookingsData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-black text-yellow-400">{bookingsCount}</div>
              <div className="text-gray-400 text-sm">Total</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-black text-blue-400">
                {bookingsData.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-gray-400 text-sm">Confirmed</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-black text-green-400">
                {bookingsData.filter(b => b.status === 'checked_in').length}
              </div>
              <div className="text-gray-400 text-sm">Checked In</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-black text-gray-400">
                {bookingsData.filter(b => b.status === 'checked_out').length}
              </div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-gray-700">
              <div className="text-2xl font-black text-red-400">
                {bookingsData.filter(b => b.status === 'cancelled').length}
              </div>
              <div className="text-gray-400 text-sm">Cancelled</div>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by booking ID, guest name, room type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-yellow-400 text-lg">🔍</span>
                </div>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                )}
              </div>
            </div>

            {/* Items Per Page */}
            {filteredCount > 5 && (
              <div className="flex items-center gap-3 bg-gray-700 px-4 py-2 rounded-xl">
                <span className="text-gray-400 text-sm">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-1 text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            )}
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="text-yellow-300 text-sm">
                  Found <strong>{filteredCount}</strong> of <strong>{bookingsCount}</strong> bookings matching "<strong>{searchTerm}</strong>"
                </p>
                <button
                  onClick={clearSearch}
                  className="text-yellow-400 hover:text-yellow-300 text-sm font-bold transition-colors duration-300 whitespace-nowrap flex items-center gap-1"
                >
                  <span>✕</span>
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Status Filters */}
        {bookingsData.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {[
              { key: '', label: 'All', count: bookingsCount },
              { key: 'pending', label: 'Pending', count: bookingsData.filter(b => b.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmed', count: bookingsData.filter(b => b.status === 'confirmed').length },
              { key: 'checked_in', label: 'Checked In', count: bookingsData.filter(b => b.status === 'checked_in').length },
              { key: 'checked_out', label: 'Completed', count: bookingsData.filter(b => b.status === 'checked_out').length },
              { key: 'cancelled', label: 'Cancelled', count: bookingsData.filter(b => b.status === 'cancelled').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSearchTerm(filter.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  searchTerm === filter.key
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        )}

        {/* Bookings List */}
        {bookingsData.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-2xl p-12 max-w-md mx-auto border border-gray-700">
              <div className="text-6xl mb-6">🏨</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No Bookings Yet
              </h3>
              <p className="text-gray-400 mb-8">
                Start your journey with us by making your first reservation!
              </p>
              <Link
                to="/"
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-8 py-4 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 inline-block"
              >
                Explore Rooms
              </Link>
            </div>
          </div>
        ) : filteredBookings.length === 0 && searchTerm ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-2xl p-12 max-w-md mx-auto border border-gray-700">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No Bookings Found
              </h3>
              <p className="text-gray-400 mb-4">
                No bookings match "<strong className="text-yellow-400">{searchTerm}</strong>"
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Try different search terms or check the spelling
              </p>
              <button
                onClick={clearSearch}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-8 py-4 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25"
              >
                Show All Bookings
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Bookings Grid */}
            <div className="grid gap-6 mb-8">
              {currentBookings.map((booking, index) => (
                <div key={booking.id || index} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-500 group hover:shadow-2xl hover:shadow-yellow-500/10">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black p-3 rounded-xl font-black text-sm">
                        #{booking.id?.slice(-8) || `UNK${index}`}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white mb-1">
                          {booking.booking_rooms?.[0]?.room_type || 'Room Booking'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {booking.check_in && booking.check_out ? 
                            `${formatDate(booking.check_in)} - ${formatDate(booking.check_out)}` : 
                            'Dates not available'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black ${getStatusColor(booking.status)}`}>
                        <span>{getStatusIcon(booking.status)}</span>
                        <span>{booking.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">Guest</div>
                      <div className="text-white font-bold text-lg">{booking.guest_name || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">Phone</div>
                      <div className="text-white font-bold">{booking.phone || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">Guests</div>
                      <div className="text-white font-bold">{booking.total_guests || 'N/A'} Persons</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4">
                      <div className="text-gray-400 text-sm mb-1">Payment</div>
                      <div className="text-white font-bold">{booking.payment_method || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Rooms and Total */}
                  <div className="border-t border-gray-700 pt-6">
                    <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                      <span>🛏️</span>
                      Room Details
                    </h4>
                    <div className="space-y-3 mb-6">
                      {booking.booking_rooms?.map(room => (
                        <div key={room.id} className="flex justify-between items-center bg-gray-700/30 rounded-xl p-4">
                          <div>
                            <div className="text-white font-bold">{room.room_type}</div>
                            <div className="text-gray-400 text-sm">
                              {room.quantity} room{room.quantity > 1 ? 's' : ''} • {room.breakfast_option} breakfast
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-400 font-black text-lg">
                              {formatCurrency(room.subtotal || 0)}
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center text-gray-500 py-4">
                          No room details available
                        </div>
                      )}
                    </div>

                    {/* Total and Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-700">
                      <div className="text-right sm:text-left">
                        <div className="text-gray-400 text-sm">Total Amount</div>
                        <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                          {formatCurrency(booking.total_price || 0)}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {booking.status === 'checked_out' && !booking.rating && (
                          <Link
                            to={`/rate/${booking.id}`}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-6 py-3 rounded-xl font-black transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25 flex items-center gap-2"
                          >
                            <span>⭐</span>
                            Rate Stay
                          </Link>
                        )}
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 border border-gray-600 flex items-center gap-2">
                          <span>📋</span>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Page Info */}
                  <div className="text-gray-400 text-sm">
                    Showing <strong className="text-yellow-400">{startIndex + 1}-{Math.min(endIndex, filteredCount)}</strong> of <strong className="text-white">{filteredCount}</strong> bookings
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-white hover:bg-yellow-500 hover:text-black border border-gray-600'
                      }`}
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[44px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/25'
                              : page === '...'
                              ? 'bg-transparent text-gray-500 cursor-default'
                              : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
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
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 text-white hover:bg-yellow-500 hover:text-black border border-gray-600'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MemberBookings
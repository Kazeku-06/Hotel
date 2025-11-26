import { useQuery } from '@tanstack/react-query'
import { bookingsAPI } from '../api/bookings'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dateUtils'
import { Link } from 'react-router-dom'

export const MemberBookings = () => {
  const { 
    data: bookings, 
    isLoading, 
    error,
    isError 
  } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsAPI.getMyBookings(),
    retry: 1
  })

  // DEBUG
  console.log('🔍 Full axios response:', bookings)
  console.log('🔍 bookings.data:', bookings?.data)
  console.log('🔍 bookings.data.data:', bookings?.data?.data)

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

  // PERBAIKAN: Akses data yang benar
  const bookingsData = bookings?.data?.data || []
  const bookingsCount = bookings?.data?.count || 0

  console.log('✅ Bookings data:', bookingsData)
  console.log('✅ Bookings count:', bookingsCount)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          My Bookings {bookingsCount > 0 && `(${bookingsCount})`}
        </h1>

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
        ) : (
          <div className="space-y-6">
            {bookingsData.map((booking, index) => (
              <div key={booking.id || index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
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
        )}
      </div>
    </div>
  )
}

export default MemberBookings
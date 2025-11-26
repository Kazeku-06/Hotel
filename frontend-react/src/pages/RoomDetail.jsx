import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { roomsAPI } from '../api/rooms'
import { formatCurrency } from '../utils/formatCurrency'
import { useAuth } from '../context/AuthContext'

export const RoomDetail = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsAPI.getRoom(id)
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Room not found
          </h1>
          <Link
            to="/"
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/"
            className="text-gold-500 hover:text-gold-600 transition-colors duration-300"
          >
            ← Back to Rooms
          </Link>
        </nav>

        {/* Room Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="h-96 overflow-hidden">
            <img
              src={room.data.photos?.[0]?.photo_url || '/api/placeholder/1200/600'}
              alt={room.data.room_number}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Room Info */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  {room.data.room_type?.name} - {room.data.room_number}
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  {room.data.description || 'Luxurious room with modern amenities and comfortable bedding.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">👤</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Capacity: {room.data.capacity} people
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">🛏</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Type: {room.data.room_type?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">🏷</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Status: <span className={`font-semibold ${room.data.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                        {room.data.status}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Room Facilities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Hair Dryer'].map((facility, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <span>✅</span>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 h-fit">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Pricing
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Without Breakfast</span>
                    <span className="text-lg font-bold text-gold-500">
                      {formatCurrency(room.data.price_no_breakfast)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">With Breakfast</span>
                    <span className="text-lg font-bold text-gold-500">
                      {formatCurrency(room.data.price_with_breakfast)}
                    </span>
                  </div>
                </div>

                {room.data.status === 'available' ? (
                  isAuthenticated ? (
                    <Link
                      to="/checkout"
                      state={{ room: room.data }}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 px-4 rounded-lg text-center font-semibold transition-colors duration-300 block"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/rooms/${id}` } }}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 px-4 rounded-lg text-center font-semibold transition-colors duration-300 block"
                    >
                      Login to Book
                    </Link>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
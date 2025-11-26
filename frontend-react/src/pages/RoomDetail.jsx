import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { roomsAPI } from '../api/rooms'
import { formatCurrency } from '../utils/formatCurrency'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export const RoomDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomsAPI.getRoom(id),
    enabled: !!id,
    retry: 1
  })

  // Debug
  console.log('Room ID:', id)
  console.log('Room data:', room)
  console.log('Error:', error)

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

  if (error) {
    console.error('Error details:', error.response)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {error.response?.status === 404 ? 'Room not found' : 'Error loading room'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.response?.data?.message || 'Please try again later'}
          </p>
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

  if (!room?.data) {
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

  const roomData = room.data
  const primaryPhoto = roomData.photos?.find(p => p.is_primary) || roomData.photos?.[0]
  const photoUrl = primaryPhoto ? `http://localhost:5000${primaryPhoto.photo_path}` : null

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
          <div className="relative h-96 overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`Room ${roomData.room_number}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  // Fallback akan ditampilkan oleh element setelahnya
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${photoUrl ? 'hidden' : ''}`}>
              <span className="text-6xl text-gray-400">🏨</span>
            </div>
            
            {/* Photo Thumbnails */}
            {roomData.photos && roomData.photos.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex space-x-2 overflow-x-auto">
                {roomData.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`w-16 h-16 rounded border-2 ${
                      selectedPhotoIndex === index ? 'border-gold-500' : 'border-white'
                    }`}
                  >
                    <img
                      src={`http://localhost:5000${photo.photo_path}`}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Room Info */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {roomData.room_type?.name} - Room {roomData.room_number}
                  </h1>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    roomData.status === 'available' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {roomData.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  {roomData.description || `Comfortable ${roomData.room_type?.name?.toLowerCase()} room with modern amenities and premium bedding.`}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">👤</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Capacity: {roomData.capacity} {roomData.capacity === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">🛏</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Type: {roomData.room_type?.name}
                    </span>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Room Facilities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Free WiFi', 'Air Conditioning', 'Smart TV', 
                      'Mini Bar', 'Safe Box', 'Hair Dryer',
                      'Coffee Maker', 'Private Bathroom', 'Desk'
                    ].map((facility, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <span className="text-green-500">✓</span>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 h-fit sticky top-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Pricing
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 block">Without Breakfast</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">per night</span>
                    </div>
                    <span className="text-lg font-bold text-gold-500">
                      {formatCurrency(roomData.price_no_breakfast)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300 block">With Breakfast</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">per night</span>
                    </div>
                    <span className="text-lg font-bold text-gold-500">
                      {formatCurrency(roomData.price_with_breakfast)}
                    </span>
                  </div>
                </div>

                {roomData.status === 'available' ? (
                  isAuthenticated ? (
                    <button
                      onClick={() => navigate('/checkout', { state: { room: roomData } })}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 px-4 rounded-lg text-center font-semibold transition-colors duration-300"
                    >
                      Book Now
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login', { state: { from: { pathname: `/rooms/${id}` } } })}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 px-4 rounded-lg text-center font-semibold transition-colors duration-300"
                    >
                      Login to Book
                    </button>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-gray-200 py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Currently Unavailable
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

export default RoomDetail
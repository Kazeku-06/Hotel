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

  // PERBAIKAN: Ambil data room yang benar
  const roomData = room?.data || room

  // PERBAIKAN: Handle photos dengan benar
  const photos = roomData?.photos || []
  const currentPhoto = photos[selectedPhotoIndex]

  console.log('🔍 RoomDetail Debug:')
  console.log('Room ID:', id)
  console.log('Full response:', room)
  console.log('Photos:', photos)
  console.log('Current Photo Index:', selectedPhotoIndex)
  console.log('Current Photo:', currentPhoto)
  console.log('Error:', error)
  console.log('Loading:', isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
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
    console.error('❌ Error details:', error.response)
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-4">
              {error.response?.status === 404 ? 'Room Not Found' : 'Error Loading Room'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error.response?.data?.message || error.message || 'Please try again later'}
            </p>
            <Link
              to="/"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Back to Rooms
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">🔍</div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-4">
              Room Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The room you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Back to Rooms
            </Link>
          </div>
        </div>
      </div>
    )
  }

  console.log('✅ Room data loaded:', roomData)

  // PERBAIKAN: Handle fasilitas dari data real
  const facilities = roomData.facilities || roomData.facility_rooms || []
  console.log('🏨 Room facilities:', facilities)

  // Fungsi untuk render icon berdasarkan nama fasilitas
  const getFacilityIcon = (facilityName, icon) => {
    if (icon) return icon
    
    const iconMap = {
      'wifi': '📶',
      'wi-fi': '📶',
      'ac': '❄️',
      'air conditioning': '❄️',
      'tv': '📺',
      'television': '📺',
      'breakfast': '🍳',
      'swimming pool': '🏊',
      'pool': '🏊',
      'parking': '🅿️',
      'gym': '💪',
      'fitness': '💪',
      'spa': '💆',
      'mini bar': '🍷',
      'minibar': '🍷',
      'safe': '🔒',
      'safe box': '🔒',
      'hair dryer': '💨',
      'hairdryer': '💨',
      'coffee': '☕',
      'coffee maker': '☕',
      'bathroom': '🚿',
      'desk': '💻',
      'balcony': '🌅',
      'view': '🌅',
      'jacuzzi': '🛁',
      'bathtub': '🛁',
      'shower': '🚿'
    }
    
    const lowerName = facilityName.toLowerCase()
    for (const [key, value] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return value
      }
    }
    
    return '✅' // Default icon
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center text-yellow-500 hover:text-yellow-400 transition-all duration-300 font-bold group"
            >
              <span className="text-2xl mr-2 group-hover:-translate-x-1 transition-transform">←</span>
              BACK TO ROOMS
            </Link>
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
              ROOM DETAIL
            </div>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* 🔥 PERBAIKAN: Premium Image Gallery */}
          <div className="relative h-96 lg:h-[500px] overflow-hidden bg-gray-900">
            {/* Main Image */}
            {currentPhoto ? (
              <img
                key={currentPhoto.id}
                src={`http://localhost:5000${currentPhoto.photo_path}`}
                alt={`Room ${roomData.room_number} - View ${selectedPhotoIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  console.error('❌ Error loading image:', currentPhoto.photo_path)
                  e.target.style.display = 'none'
                }}
              />
            ) : photos.length > 0 ? (
              <img
                src={`http://localhost:5000${photos[0].photo_path}`}
                alt={`Room ${roomData.room_number}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl text-yellow-500 mb-2 block">🏨</span>
                  <p className="text-gray-400">No image available</p>
                </div>
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Room Info Overlay */}
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl lg:text-4xl font-black mb-2">
                {roomData.room_type?.name} - Room {roomData.room_number}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  roomData.status === 'available' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {roomData.status === 'available' ? '✅ AVAILABLE' : '❌ UNAVAILABLE'}
                </span>
                <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {roomData.capacity} {roomData.capacity === 1 ? 'PERSON' : 'PEOPLE'}
                </span>
              </div>
            </div>

            {/* 🔥 PERBAIKAN: Premium Photo Thumbnails */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 right-4">
                <div className="flex space-x-2 overflow-x-auto max-w-64">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 transition-all duration-200 transform hover:scale-110 ${
                        selectedPhotoIndex === index 
                          ? 'border-yellow-500 ring-2 ring-yellow-300 scale-110' 
                          : 'border-white hover:border-yellow-400'
                      }`}
                    >
                      <img
                        src={`http://localhost:5000${photo.photo_path}`}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzNkMzNC4yMDkxIDM2IDM2IDM0LjIwOTEgMzYgMzJDMzYgMjkuNzkwOSAzNC4yMDkxIDI4IDMyIDI4QzI5Ljc5MDkgMjggMjggMjkuNzkwOSAyOCAzMkMyOCAzNC4yMDkxIDI5Ljc5MDkgMzYgMzIgMzZaIiBmaWxsPSIjOEE5MEFBIi8+CjxwYXRoIGQ9Ik0zMiAxNkMzNi40MTggMTYgNDAgMTkuNTgyIDQwIDI0VjQwQzQwIDQ0LjQxOCAzNi40MTggNDggMzIgNDhDMTcuNjA0IDQ4IDggNDggOCA0OFYyNEM4IDE5LjU4MiAxMS41ODIgMTYgMTYgMTZIMzJaIiBmaWxsPSIjOEE5MEFBIi8+Cjwvc3ZnPgo='
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔥 PERBAIKAN: Premium Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-yellow-500 p-3 rounded-2xl transition-all duration-300 hover:scale-110 shadow-2xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-yellow-500 p-3 rounded-2xl transition-all duration-300 hover:scale-110 shadow-2xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Photo Counter */}
            {photos.length > 1 && (
              <div className="absolute top-6 left-6 bg-black/70 text-yellow-500 px-3 py-2 rounded-2xl text-sm font-bold">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Room Info */}
              <div className="lg:col-span-2">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <div className="text-yellow-500 text-2xl mb-2">👤</div>
                    <div className="font-black text-gray-900 dark:text-white">{roomData.capacity}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Guests</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <div className="text-yellow-500 text-2xl mb-2">🛏</div>
                    <div className="font-black text-gray-900 dark:text-white">{roomData.room_type?.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <div className="text-yellow-500 text-2xl mb-2">⭐</div>
                    <div className="font-black text-gray-900 dark:text-white">5.0</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                    <div className="text-yellow-500 text-2xl mb-2">📐</div>
                    <div className="font-black text-gray-900 dark:text-white">-</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Size</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-2 h-8 bg-yellow-500 rounded-full mr-4"></div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">ROOM OVERVIEW</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {roomData.description || `Experience luxury in our premium ${roomData.room_type?.name?.toLowerCase()} room. Featuring modern amenities, comfortable bedding, and exceptional service for a memorable stay.`}
                  </p>
                </div>

                {/* Facilities - REAL DATA */}
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-yellow-500 rounded-full mr-4"></div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">ROOM FACILITIES</h3>
                  </div>
                  
                  {facilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {facilities.map((facility, index) => {
                        const facilityName = facility.name || facility.facility?.name
                        const facilityIcon = facility.icon || facility.facility?.icon
                        
                        if (!facilityName) return null
                        
                        return (
                          <div 
                            key={facility.id || facility.facility_id || index} 
                            className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-yellow-500/30 transition-all duration-300 group"
                          >
                            <div className="bg-yellow-500 text-black p-3 rounded-xl text-xl group-hover:scale-110 transition-transform duration-300">
                              {getFacilityIcon(facilityName, facilityIcon)}
                            </div>
                            <span className="text-gray-800 dark:text-white font-bold text-lg">
                              {facilityName}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                      <span className="text-6xl text-yellow-500 mb-4 block">🏨</span>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                        No facilities information available
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Contact us for more details about room amenities
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Room Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-yellow-500 rounded-full mr-4"></div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">DETAILS</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="bg-yellow-500 text-black p-2 rounded-lg">🏷️</div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Room Number</div>
                        <div className="font-bold text-gray-900 dark:text-white">{roomData.room_number}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="bg-yellow-500 text-black p-2 rounded-lg">📋</div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Room Type</div>
                        <div className="font-bold text-gray-900 dark:text-white">{roomData.room_type?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="bg-yellow-500 text-black p-2 rounded-lg">👥</div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Max Capacity</div>
                        <div className="font-bold text-gray-900 dark:text-white">{roomData.capacity} {roomData.capacity === 1 ? 'person' : 'people'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="bg-yellow-500 text-black p-2 rounded-lg">📊</div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                        <div className={`font-bold ${
                          roomData.status === 'available' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {roomData.status?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Card - Traveloka Style */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 h-fit sticky top-4 shadow-2xl border border-yellow-500/20">
                <div className="text-center mb-6">
                  <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold inline-block mb-4">
                    BEST PRICE GUARANTEE
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">BOOK THIS ROOM</h3>
                  <p className="text-gray-400 text-sm">Instant confirmation • Free cancellation</p>
                </div>
                
                {/* Pricing */}
                <div className="space-y-4 mb-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-white font-bold block">Without Breakfast</span>
                        <span className="text-gray-400 text-sm">per night</span>
                      </div>
                      <div className="text-right">
                        <span className="text-yellow-500 text-xl font-black block">
                          {formatCurrency(roomData.price_no_breakfast)}
                        </span>
                        <span className="text-gray-400 text-sm line-through">
                          {formatCurrency(roomData.price_no_breakfast * 1.2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">With Breakfast</span>
                        <span className="text-yellow-400 text-sm">BEST VALUE</span>
                      </div>
                      <div className="text-right">
                        <span className="text-yellow-500 text-2xl font-black block">
                          {formatCurrency(roomData.price_with_breakfast)}
                        </span>
                        <span className="text-yellow-400 text-sm font-bold">SAVE 20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facilities Summary */}
                {facilities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-black text-white mb-3 text-lg">INCLUDED AMENITIES</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {facilities.slice(0, 6).map((facility, index) => {
                        const facilityName = facility.name || facility.facility?.name
                        const facilityIcon = facility.icon || facility.facility?.icon
                        
                        return (
                          <div 
                            key={facility.id || facility.facility_id || index}
                            className="text-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200"
                            title={facilityName}
                          >
                            <div className="text-xl mb-1">{getFacilityIcon(facilityName, facilityIcon)}</div>
                            <div className="text-xs text-gray-300 truncate">{facilityName.split(' ')[0]}</div>
                          </div>
                        )
                      })}
                    </div>
                    {facilities.length > 6 && (
                      <div className="text-center mt-3">
                        <span className="text-yellow-500 text-sm font-bold">
                          +{facilities.length - 6} MORE AMENITIES
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Book Button */}
                {roomData.status === 'available' ? (
                  isAuthenticated ? (
                    <button
                      onClick={() => navigate('/checkout', { state: { room: roomData } })}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-yellow-500/25 mb-3"
                    >
                      BOOK NOW
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login', { state: { from: { pathname: `/rooms/${id}` } } })}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-yellow-500/25 mb-3"
                    >
                      LOGIN TO BOOK
                    </button>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 font-black py-4 px-6 rounded-xl text-lg cursor-not-allowed"
                  >
                    CURRENTLY UNAVAILABLE
                  </button>
                )}

                {/* Trust Badges */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                    <span>🔒</span>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                    <span>⭐</span>
                    <span>4.9/5 Guest Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-black mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-black/80 mb-6 max-w-2xl mx-auto">
              Our concierge team is available 24/7 to help you select the perfect room for your stay
            </p>
            <button className="bg-black hover:bg-gray-900 text-yellow-500 font-black px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
              CONTACT CONCIERGE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail
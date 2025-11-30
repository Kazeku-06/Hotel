import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RoomCard } from '../components/RoomCard'
import { RoomFilter } from '../components/RoomFilter'
import { RoomCardSkeleton } from '../components/LoadingSkeleton'
import { roomsAPI } from '../api/rooms'

export const Home = () => {
  const [filters, setFilters] = useState({
    room_type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    facilities: []
  })
  
  const [showFilters, setShowFilters] = useState(false)

  const { data: roomsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => {
      // Clean the filters object - remove empty values
      const cleanFilters = {
        room_type: filters.room_type || undefined,
        min_price: filters.min_price || undefined,
        max_price: filters.max_price || undefined,
        capacity: filters.capacity || undefined,
        facilities: filters.facilities.length > 0 ? filters.facilities : undefined
      }
      
      return roomsAPI.getRooms(cleanFilters)
    },
    keepPreviousData: true,
    retry: 1
  })

  // Handle different response structures
  const roomsData = Array.isArray(roomsResponse?.data) ? roomsResponse.data : 
                   Array.isArray(roomsResponse) ? roomsResponse : 
                   []

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      room_type: '',
      min_price: '',
      max_price: '',
      capacity: '',
      facilities: []
    }
    setFilters(clearedFilters)
  }

  // Hitung jumlah filter aktif
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }).length

  // Array gambar hotel dari public directory
  const hotelImages = [
    '/hotel1.jpeg',
    '/hotel2.jpeg', 
    '/hotel3.jpeg',
    '/hotel4.jpeg',
  ]

  // State untuk gambar yang sedang aktif
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto slide setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [hotelImages.length])

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? hotelImages.length - 1 : prevIndex - 1
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-gold-500/10 rounded-3xl blur-3xl -z-10"></div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-300">Grand Imperion</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Experience unparalleled comfort and luxury in the heart of the city. 
            Where every stay becomes a cherished memory.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-gradient-to-r from-gold-500 to-yellow-400 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-gold-500/25 hover:shadow-xl hover:shadow-gold-500/30 transition-all duration-300 transform hover:-translate-y-1">
              🏆 Best Service Award 2024
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
              ⭐ 5-Star Luxury Rating
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-green-400 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1">
              📍 Prime City Center Location
            </div>
          </div>
        </div>

        {/* Hotel Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 dark:border-gray-700 hover:border-gold-200 dark:hover:border-gold-800 transform hover:-translate-y-2">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🏊</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Infinity Pool</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Stunning infinity pool with panoramic city views and luxury cabanas</p>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 dark:border-gray-700 hover:border-gold-200 dark:hover:border-gold-800 transform hover:-translate-y-2">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🍽️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Fine Dining</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Award-winning restaurants with world-class chefs and 24/7 room service</p>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 text-center border border-gray-100 dark:border-gray-700 hover:border-gold-200 dark:hover:border-gold-800 transform hover:-translate-y-2">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">💆</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Wellness Spa</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">Full-service luxury spa, state-of-the-art gym, and wellness programs</p>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gold-300 dark:hover:border-gold-700"
          >
            <span className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-gold-500 to-yellow-400 rounded-full"></span>
              Filters {activeFiltersCount > 0 && (
                <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </span>
            <span className={`transform transition-transform duration-300 text-2xl ${showFilters ? 'rotate-180 text-gold-500' : 'text-gray-400'}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Filters and Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <RoomFilter 
              onFilter={handleFilter} 
              filters={filters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Rooms Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 bg-gradient-to-b from-gold-500 to-yellow-400 rounded-full"></div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                      Available Rooms
                    </h2>
                    {activeFiltersCount > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">
                        {activeFiltersCount} filter(s) applied
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                    {roomsData.length} rooms found
                  </span>
                  
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {filters.room_type && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                      Type: {filters.room_type}
                      <button
                        onClick={() => handleFilter({ ...filters, room_type: '' })}
                        className="ml-3 hover:text-blue-200 transition-colors duration-200 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  
                  {filters.capacity && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      Capacity: {filters.capacity}+
                      <button
                        onClick={() => handleFilter({ ...filters, capacity: '' })}
                        className="ml-3 hover:text-green-200 transition-colors duration-200 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  
                  {(filters.min_price || filters.max_price) && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                      Price: {filters.min_price || '0'} - {filters.max_price || 'Any'}
                      <button
                        onClick={() => handleFilter({ ...filters, min_price: '', max_price: '' })}
                        className="ml-3 hover:text-purple-200 transition-colors duration-200 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  
                  {filters.facilities.length > 0 && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                      Facilities: {filters.facilities.length}
                      <button
                        onClick={() => handleFilter({ ...filters, facilities: [] })}
                        className="ml-3 hover:text-yellow-200 transition-colors duration-200 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-8 py-8 rounded-2xl max-w-md mx-auto shadow-lg">
                  <div className="text-6xl mb-4">😔</div>
                  <p className="font-bold text-xl mb-2">Failed to load rooms</p>
                  <p className="text-sm mb-6">Please check your connection and try again</p>
                  <button
                    onClick={refetch}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : roomsData.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-8 py-8 rounded-2xl max-w-md mx-auto shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="font-bold text-xl mb-2">No rooms found</p>
                  <p className="text-sm mb-6">
                    {activeFiltersCount > 0 
                      ? 'Try adjusting your search filters' 
                      : 'All rooms are currently booked'
                    }
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-gold-500 to-yellow-400 hover:from-gold-600 hover:to-yellow-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {roomsData.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hotel Image Gallery Section */}
        <div className="mt-20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-10 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-800 dark:text-white mb-8 leading-tight">
                Experience Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-400">Luxury</span>
              </h3>
              <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-lg">
                <li className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                  <span className="text-2xl text-gold-500 mr-4 group-hover:scale-110 transition-transform duration-300">✓</span>
                  <span className="font-semibold">Luxurious rooms with premium amenities and smart technology</span>
                </li>
                <li className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                  <span className="text-2xl text-gold-500 mr-4 group-hover:scale-110 transition-transform duration-300">✓</span>
                  <span className="font-semibold">24/7 personalized concierge service and butler service</span>
                </li>
                <li className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                  <span className="text-2xl text-gold-500 mr-4 group-hover:scale-110 transition-transform duration-300">✓</span>
                  <span className="font-semibold">Free high-speed WiFi and premium entertainment systems</span>
                </li>
                <li className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                  <span className="text-2xl text-gold-500 mr-4 group-hover:scale-110 transition-transform duration-300">✓</span>
                  <span className="font-semibold">Complimentary gourmet breakfast and evening cocktails</span>
                </li>
                <li className="flex items-center p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group">
                  <span className="text-2xl text-gold-500 mr-4 group-hover:scale-110 transition-transform duration-300">✓</span>
                  <span className="font-semibold">Prime central location near top attractions and business districts</span>
                </li>
              </ul>
            </div>
            
            {/* Enhanced Image Gallery */}
            <div className="relative group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-all duration-700">
                <img 
                  src={hotelImages[currentImageIndex]} 
                  alt="Luxury Hotel Experience" 
                  className="w-full h-96 object-cover transition-all duration-700"
                  onError={(e) => {
                    e.target.src = '/placeholder-hotel.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Enhanced Navigation Buttons */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 group-hover:opacity-100 opacity-80"
              >
                <span className="text-2xl font-bold">‹</span>
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 group-hover:opacity-100 opacity-80"
              >
                <span className="text-2xl font-bold">›</span>
              </button>
              
              {/* Enhanced Image Indicators */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {hotelImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                      index === currentImageIndex 
                        ? 'bg-white shadow-lg scale-125' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute top-6 right-6 bg-black/60 text-white px-4 py-2 rounded-2xl text-sm font-semibold backdrop-blur-sm">
                {currentImageIndex + 1} / {hotelImages.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
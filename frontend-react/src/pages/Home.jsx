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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Banner dengan Traveloka-style */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-500 text-black px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                Luxury Collection
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              GRAND <span className="text-yellow-500">IMPERION</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Experience world-class luxury with premium amenities and exceptional service in the heart of the city
            </p>
            
            {/* Traveloka-style Quick Features */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-yellow-500/20">
                <span className="text-yellow-500 text-2xl mr-3">⭐</span>
                <span className="text-white font-semibold">5-Star Rating</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-yellow-500/20">
                <span className="text-yellow-500 text-2xl mr-3">🏆</span>
                <span className="text-white font-semibold">Best Service 2024</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-yellow-500/20">
                <span className="text-yellow-500 text-2xl mr-3">📍</span>
                <span className="text-white font-semibold">City Center</span>
              </div>
            </div>

            {/* CTA Button */}
            <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-12 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-yellow-500/25">
              Book Now & Save 20%
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="text-2xl text-yellow-500 font-bold mb-2">4.9/5</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Guest Rating</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="text-2xl text-yellow-500 font-bold mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Concierge</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="text-2xl text-yellow-500 font-bold mb-2">Free</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Breakfast</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
            <div className="text-2xl text-yellow-500 font-bold mb-2">WiFi</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">Premium</div>
          </div>
        </div>

        {/* Hotel Features - Traveloka Style */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-2 h-12 bg-yellow-500 rounded-full mr-4"></div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Hotel Facilities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-yellow-500/30">
              <div className="flex items-start mb-4">
                <div className="bg-yellow-500 text-black p-3 rounded-2xl text-2xl mr-4">🏊</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Infinity Pool</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Panoramic city view with luxury cabanas</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-yellow-500/30">
              <div className="flex items-start mb-4">
                <div className="bg-yellow-500 text-black p-3 rounded-2xl text-2xl mr-4">🍽️</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Fine Dining</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Award-winning restaurants & 24/7 service</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border-2 border-gray-100 dark:border-gray-700 hover:border-yellow-500/30">
              <div className="flex items-start mb-4">
                <div className="bg-yellow-500 text-black p-3 rounded-2xl text-2xl mr-4">💆</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Luxury Spa</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Full-service spa & wellness programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle - Traveloka Style */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300 hover:border-yellow-500"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 text-black p-2 rounded-xl">
                <span className="text-lg">⚡</span>
              </div>
              <span className="font-black text-lg text-gray-900 dark:text-white">
                FILTERS {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </span>
            </div>
            <span className={`transform transition-transform duration-300 text-xl ${showFilters ? 'rotate-180 text-yellow-500' : 'text-gray-400'}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Filters and Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
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
            {/* Header Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-12 bg-yellow-500 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                      AVAILABLE ROOMS
                    </h2>
                    {activeFiltersCount > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-semibold">
                        {activeFiltersCount} active filter(s)
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-bold text-lg">
                    {roomsData.length}
                  </span>
                  
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                    >
                      CLEAR ALL
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filters Display - Traveloka Style */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {filters.room_type && (
                    <span className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                      {filters.room_type}
                      <button
                        onClick={() => handleFilter({ ...filters, room_type: '' })}
                        className="ml-3 hover:text-gray-700 transition-colors duration-200 font-black"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  
                  {filters.capacity && (
                    <span className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                      Capacity: {filters.capacity}+
                      <button
                        onClick={() => handleFilter({ ...filters, capacity: '' })}
                        className="ml-3 hover:text-gray-700 transition-colors duration-200 font-black"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  
                  {(filters.min_price || filters.max_price) && (
                    <span className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                      {filters.min_price || '0'} - {filters.max_price || '∞'}
                      <button
                        onClick={() => handleFilter({ ...filters, min_price: '', max_price: '' })}
                        className="ml-3 hover:text-gray-700 transition-colors duration-200 font-black"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  
                  {filters.facilities.length > 0 && (
                    <span className="inline-flex items-center bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                      +{filters.facilities.length} Facilities
                      <button
                        onClick={() => handleFilter({ ...filters, facilities: [] })}
                        className="ml-3 hover:text-gray-700 transition-colors duration-200 font-black"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Rooms Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-8 py-12 rounded-2xl max-w-md mx-auto">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p className="font-black text-xl mb-3">Failed to Load Rooms</p>
                  <p className="text-sm mb-6 text-red-600 dark:text-red-400">Please check your connection</p>
                  <button
                    onClick={refetch}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    TRY AGAIN
                  </button>
                </div>
              </div>
            ) : roomsData.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-8 py-12 rounded-2xl max-w-md mx-auto">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="font-black text-xl mb-3">No Rooms Available</p>
                  <p className="text-sm mb-6 text-yellow-600 dark:text-yellow-400">
                    {activeFiltersCount > 0 
                      ? 'Try adjusting your filters' 
                      : 'All rooms are currently booked'
                    }
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                    >
                      CLEAR FILTERS
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {roomsData.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hotel Gallery Section - Traveloka Style */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-12 flex flex-col justify-center">
              <div className="mb-8">
                <div className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
                  WHY CHOOSE US
                </div>
                <h3 className="text-4xl font-black text-white mb-6 leading-tight">
                  Experience The <span className="text-yellow-500">Difference</span>
                </h3>
                <p className="text-gray-300 text-lg mb-8">
                  Discover why travelers choose Grand Imperion for their luxury stays
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
                  <div className="bg-yellow-500 text-black p-3 rounded-2xl mr-4">⭐</div>
                  <div>
                    <h4 className="font-black text-white text-lg">Premium Service</h4>
                    <p className="text-gray-400 text-sm">24/7 personalized concierge</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
                  <div className="bg-yellow-500 text-black p-3 rounded-2xl mr-4">🏙️</div>
                  <div>
                    <h4 className="font-black text-white text-lg">Prime Location</h4>
                    <p className="text-gray-400 text-sm">Heart of the city center</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
                  <div className="bg-yellow-500 text-black p-3 rounded-2xl mr-4">💎</div>
                  <div>
                    <h4 className="font-black text-white text-lg">Luxury Amenities</h4>
                    <p className="text-gray-400 text-sm">World-class facilities</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Gallery */}
            <div className="relative">
              <div className="relative h-full min-h-[500px]">
                <img 
                  src={hotelImages[currentImageIndex]} 
                  alt="Grand Imperion Luxury" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-hotel.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Navigation */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-yellow-500 p-3 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <span className="text-2xl font-bold">‹</span>
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 text-yellow-500 p-3 rounded-2xl transition-all duration-300 hover:scale-110"
                >
                  <span className="text-2xl font-bold">›</span>
                </button>
                
                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {hotelImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-yellow-500 scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Counter */}
                <div className="absolute top-6 right-6 bg-black/70 text-yellow-500 px-3 py-2 rounded-2xl text-sm font-bold">
                  {currentImageIndex + 1} / {hotelImages.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-black text-black mb-4">
              Ready to Experience Luxury?
            </h3>
            <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
              Book your stay now and enjoy exclusive benefits with our premium membership
            </p>
            <button className="bg-black hover:bg-gray-900 text-yellow-500 font-black px-12 py-4 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl">
              BOOK YOUR STAY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
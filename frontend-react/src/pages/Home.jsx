import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RoomCard } from '../components/RoomCard'
import { RoomFilter } from '../components/RoomFilter'
import { RoomCardSkeleton } from '../components/LoadingSkeleton'
import { roomsAPI } from '../api/rooms'

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get search parameter from URL
  const roomNumberSearch = searchParams.get('search') || ''
  
  const [filters, setFilters] = useState({
    room_type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    facilities: [],
    room_number: roomNumberSearch // Initialize with URL parameter
  })
  
  const [showFilters, setShowFilters] = useState(false)
  
  // Debug effect untuk monitor filters changes
  useEffect(() => {
    console.log('🔄 FILTERS UPDATED:', filters)
    console.log('🔍 room_number value:', filters.room_number)
    console.log('📊 Active filters count:', activeFiltersCount)
  }, [filters])

  const { data: roomsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => {
      console.log('🚀 API CALL with filters:', filters)
      
      // Clean the filters object - remove empty values
      const cleanFilters = {
        room_type: filters.room_type || undefined,
        min_price: filters.min_price || undefined,
        max_price: filters.max_price || undefined,
        capacity: filters.capacity || undefined,
        facilities: filters.facilities.length > 0 ? filters.facilities : undefined,
        room_number: filters.room_number || undefined,
        search: filters.room_number || undefined // Juga kirim sebagai search parameter
      }
      
      console.log('🧹 CLEANED FILTERS for API:', cleanFilters)
      
      return roomsAPI.getRooms(cleanFilters)
    },
    keepPreviousData: true,
    retry: 1
  })

  // FIX: Handle different response structures
  const roomsData = Array.isArray(roomsResponse?.data) ? roomsResponse.data : 
                   Array.isArray(roomsResponse) ? roomsResponse : 
                   []

  // Debug rooms data
  useEffect(() => {
    console.log('📦 ROOMS DATA RECEIVED:', roomsData)
    console.log('📦 Number of rooms:', roomsData.length)
    if (roomsData.length > 0) {
      console.log('📦 First room:', roomsData[0])
    }
  }, [roomsData])

  const handleFilter = (newFilters) => {
    console.log('🎯 HANDLE FILTER CALLED:', newFilters)
    setFilters(newFilters)
    
    // Update URL search parameter if room_number changes
    if (newFilters.room_number !== filters.room_number) {
      if (newFilters.room_number) {
        searchParams.set('search', newFilters.room_number)
      } else {
        searchParams.delete('search')
      }
      setSearchParams(searchParams)
    }
  }

  const clearFilters = () => {
    console.log('🧹 CLEARING ALL FILTERS')
    const clearedFilters = {
      room_type: '',
      min_price: '',
      max_price: '',
      capacity: '',
      facilities: [],
      room_number: ''
    }
    setFilters(clearedFilters)
    
    // Clear search parameter from URL
    searchParams.delete('search')
    setSearchParams(searchParams)
  }

  const handleRoomNumberSearch = (roomNumber) => {
    console.log('🔍 ROOM NUMBER SEARCH:', roomNumber)
    const newFilters = { ...filters, room_number: roomNumber }
    handleFilter(newFilters)
  }

  // Hitung jumlah filter aktif
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }).length

  // Manual refetch untuk debugging
  const manualRefetch = () => {
    console.log('🔄 MANUAL REFETCH TRIGGERED')
    refetch()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
            Welcome to <span className="text-gold-500">Grand Imperion</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Experience unparalleled comfort and luxury in the heart of the city
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by room number..."
                value={filters.room_number}
                onChange={(e) => handleRoomNumberSearch(e.target.value)}
                className="w-full px-6 py-4 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {filters.room_number && (
                <button
                  onClick={() => handleRoomNumberSearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {filters.room_number && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Searching for room number: <span className="font-semibold">{filters.room_number}</span>
              </p>
            )}
            
            {/* Debug Button */}
            <button
              onClick={manualRefetch}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Manual Refetch
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-gold-500 text-white px-6 py-3 rounded-lg font-semibold">
              🏆 Best Service Award 2024
            </div>
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold">
              ⭐ 5-Star Rating
            </div>
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold">
              📍 Prime Location
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-yellow-800">Debug Information:</h3>
          <p>Current Filters: {JSON.stringify(filters)}</p>
          <p>Active Filters Count: {activeFiltersCount}</p>
          <p>Rooms Found: {roomsData.length}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Error: {error ? error.message : 'None'}</p>
        </div>

        {/* Hotel Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🏊</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Swimming Pool</h3>
            <p className="text-gray-600 dark:text-gray-300">Infinity pool with city view</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Fine Dining</h3>
            <p className="text-gray-600 dark:text-gray-300">5-star restaurant & room service</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">💆</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Spa & Wellness</h3>
            <p className="text-gray-600 dark:text-gray-300">Full service spa and gym</p>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between shadow-sm"
          >
            <span className="font-semibold text-gray-800 dark:text-white">
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
            <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Available Rooms
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeFiltersCount} filter(s) applied
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {roomsData.length} rooms found
                </span>
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors duration-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.room_number && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    Room: {filters.room_number}
                    <button
                      onClick={() => handleRoomNumberSearch('')}
                      className="ml-2 hover:text-indigo-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {filters.room_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Type: {filters.room_type}
                    <button
                      onClick={() => handleFilter({ ...filters, room_type: '' })}
                      className="ml-2 hover:text-blue-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {filters.capacity && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Capacity: {filters.capacity}+
                    <button
                      onClick={() => handleFilter({ ...filters, capacity: '' })}
                      className="ml-2 hover:text-green-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {(filters.min_price || filters.max_price) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Price: {filters.min_price || '0'} - {filters.max_price || 'Any'}
                    <button
                      onClick={() => handleFilter({ ...filters, min_price: '', max_price: '' })}
                      className="ml-2 hover:text-purple-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
                
                {filters.facilities.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Facilities: {filters.facilities.length}
                    <button
                      onClick={() => handleFilter({ ...filters, facilities: [] })}
                      className="ml-2 hover:text-yellow-600"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg max-w-md mx-auto">
                  <p className="font-semibold">Failed to load rooms</p>
                  <p className="text-sm mt-1">Please try again later</p>
                  <p className="text-xs mt-2 text-red-600 dark:text-red-300">
                    Error: {error.message}
                  </p>
                  <button
                    onClick={manualRefetch}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : roomsData.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg max-w-md mx-auto">
                  <p className="font-semibold">No rooms found</p>
                  <p className="text-sm mt-1">
                    {activeFiltersCount > 0 
                      ? 'Try adjusting your filters' 
                      : 'All rooms are currently booked'
                    }
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300"
                    >
                      Clear all filters
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

        {/* Additional Info Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Why Choose Our Hotel?
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="text-gold-500 mr-3">✓</span>
                  Luxurious rooms with premium amenities
                </li>
                <li className="flex items-center">
                  <span className="text-gold-500 mr-3">✓</span>
                  24/7 concierge service
                </li>
                <li className="flex items-center">
                  <span className="text-gold-500 mr-3">✓</span>
                  Free high-speed WiFi
                </li>
                <li className="flex items-center">
                  <span className="text-gold-500 mr-3">✓</span>
                  Complimentary breakfast
                </li>
                <li className="flex items-center">
                  <span className="text-gold-500 mr-3">✓</span>
                  Central location near attractions
                </li>
              </ul>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-lg">
                Hotel Image Gallery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
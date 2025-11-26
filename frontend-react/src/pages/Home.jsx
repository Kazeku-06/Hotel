import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RoomCard } from '../components/RoomCard'
import { RoomFilter } from '../components/RoomFilter'
import { RoomCardSkeleton } from '../components/LoadingSkeleton'
import { roomsAPI } from '../api/rooms'

export const Home = () => {
  const [filters, setFilters] = useState({})
  
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => roomsAPI.getRooms(filters),
    keepPreviousData: true
  })

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
            Welcome to <span className="text-gold-500">Luxury Hotel</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Experience unparalleled comfort and luxury in the heart of the city
          </p>
          <div className="flex justify-center space-x-4">
            <div className="bg-gold-500 text-white px-6 py-3 rounded-lg font-semibold">
              🏆 Best Service Award 2024
            </div>
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold">
              ⭐ 5-Star Rating
            </div>
          </div>
        </div>

        {/* Filters and Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <RoomFilter onFilter={handleFilter} />
          </div>

          {/* Rooms Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Available Rooms
              </h2>
              <span className="text-gray-600 dark:text-gray-400">
                {rooms?.data?.length || 0} rooms found
              </span>
            </div>

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
                </div>
              </div>
            ) : rooms?.data.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg max-w-md mx-auto">
                  <p className="font-semibold">No rooms found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms?.data.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
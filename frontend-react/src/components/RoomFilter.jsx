import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { roomsAPI } from '../api/rooms'

export const RoomFilter = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    room_type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    ...initialFilters
  })

  const { data: roomsData } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getRooms()
  })

  const roomTypes = [...new Set(roomsData?.data?.map(room => room.room_type?.id).filter(Boolean))]

  useEffect(() => {
    onFilter(filters)
  }, [filters, onFilter])

  const handleChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      room_type: '',
      min_price: '',
      max_price: '',
      capacity: ''
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filter Rooms</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Room Type
          </label>
          <select
            value={filters.room_type}
            onChange={(e) => handleChange('room_type', e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
          >
            <option value="">All Types</option>
            {roomTypes.map(typeId => {
              const type = roomsData?.data?.find(room => room.room_type?.id === typeId)?.room_type
              return type ? (
                <option key={typeId} value={typeId}>
                  {type.name}
                </option>
              ) : null
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={filters.min_price}
              onChange={(e) => handleChange('min_price', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={filters.max_price}
              onChange={(e) => handleChange('max_price', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
              placeholder="1000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minimum Capacity
          </label>
          <input
            type="number"
            value={filters.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors duration-300"
            placeholder="1"
            min="1"
          />
        </div>

        <button
          onClick={clearFilters}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors duration-300 font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default RoomFilter